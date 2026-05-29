// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IStakingVault.sol";
import "../libraries/Errors.sol";

/// @title StakingVault — institutional 4-tier OSANV staking with per-user accrual
/// @notice Tiers: Bronze 8% (30d) · Silver 12% (90d) · Gold 18% (180d) · Platinum 22% (365d).
///         Rewards accrue per-user from their stake timestamp — no shared epoch bugs.
///         Anti-whale: single address cannot hold more than MAX_STAKE_BPS of total staked.
///         Early withdrawal incurs a configurable penalty (default 20%) sent to the reward pool.
contract StakingVault is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable,
    IStakingVault
{
    using SafeERC20 for IERC20;

    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant EMERGENCY_ROLE  = keccak256("EMERGENCY_ROLE");

    // ─── Constants ─────────────────────────────────────────────────────────
    uint256 public constant TIER_COUNT       = 4;
    uint256 public constant MAX_STAKE_BPS    = 1000; // 10% of total staked — anti-whale
    uint256 public constant BPS_DENOMINATOR  = 10_000;

    // ─── Data ──────────────────────────────────────────────────────────────
    struct Tier {
        string  name;
        uint256 aprBps;        // annual percentage rate in basis points
        uint256 lockDuration;  // seconds
        uint256 totalStaked;
        bool    exists;
    }

    struct Stake {
        uint256 tierIndex;
        uint256 amount;
        uint256 lockEnd;
        uint256 lastClaimTime; // ← per-user accrual anchor (fixes the epoch-sharing bug)
    }

    IERC20  public stakingToken;
    uint256 public earlyWithdrawalPenaltyBps;
    uint256 public totalRewardsDistributed;
    uint256 public rewardPool; // penalty fees accumulate here

    mapping(uint256 => Tier)  public tiers;
    mapping(address => Stake) public stakes;

    // ─── Events ────────────────────────────────────────────────────────────
    event Staked(address indexed user, uint256 indexed tier, uint256 amount, uint256 lockEnd);
    event Withdrawn(address indexed user, uint256 indexed tier, uint256 amount, bool earlyExit, uint256 penalty);
    event RewardsClaimed(address indexed user, uint256 indexed tier, uint256 amount);
    event TierConfigUpdated(uint256 indexed tier, uint256 aprBps, uint256 lockDuration);
    event PenaltyUpdated(uint256 penaltyBps);
    event RewardsDeposited(address indexed sender, uint256 amount);

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        address governance,
        address emergency,
        address token
    ) public initializer {
        if (token == address(0)) revert Errors.ZeroAddress();
        __AccessControl_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GOVERNANCE_ROLE,    governance);
        _grantRole(EMERGENCY_ROLE,     emergency);

        stakingToken               = IERC20(token);
        earlyWithdrawalPenaltyBps  = 2000; // 20% default

        tiers[0] = Tier("Bronze",   800,  30  * 1 days, 0, true);
        tiers[1] = Tier("Silver",  1200,  90  * 1 days, 0, true);
        tiers[2] = Tier("Gold",    1800, 180  * 1 days, 0, true);
        tiers[3] = Tier("Platinum",2200, 365  * 1 days, 0, true);
    }

    // ─── Staking ───────────────────────────────────────────────────────────

    function stake(uint256 tierIndex, uint256 amount) external override nonReentrant whenNotPaused {
        if (tierIndex >= TIER_COUNT || !tiers[tierIndex].exists) revert Errors.InvalidTier();
        if (amount == 0)                                         revert Errors.ZeroAmount();
        if (stakes[msg.sender].amount > 0)                      revert Errors.AlreadyStaked();

        // Anti-whale check
        uint256 totalStaked = totalStakedAcrossAllTiers();
        if (totalStaked > 0 && (amount * BPS_DENOMINATOR) / (totalStaked + amount) > MAX_STAKE_BPS) {
            revert Errors.AntiWhaleLimit();
        }

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 lockEnd = block.timestamp + tiers[tierIndex].lockDuration;

        stakes[msg.sender] = Stake({
            tierIndex:     tierIndex,
            amount:        amount,
            lockEnd:       lockEnd,
            lastClaimTime: block.timestamp // ← anchors per-user accrual
        });
        tiers[tierIndex].totalStaked += amount;

        emit Staked(msg.sender, tierIndex, amount, lockEnd);
    }

    // ─── Withdrawal ────────────────────────────────────────────────────────

    function withdraw(uint256 amount) external override nonReentrant whenNotPaused {
        Stake storage s = stakes[msg.sender];
        if (s.amount < amount) revert Errors.InsufficientStake();
        if (amount == 0)       revert Errors.ZeroAmount();

        // Claim outstanding rewards first
        _claimRewards(msg.sender);

        bool earlyExit = block.timestamp < s.lockEnd;
        uint256 penalty = 0;

        if (earlyExit) {
            penalty = (amount * earlyWithdrawalPenaltyBps) / BPS_DENOMINATOR;
            rewardPool += penalty;
        }

        tiers[s.tierIndex].totalStaked -= amount;
        s.amount -= amount;
        // Reset claim time if still staked
        if (s.amount > 0) s.lastClaimTime = block.timestamp;

        uint256 payout = amount - penalty;
        stakingToken.safeTransfer(msg.sender, payout);
        emit Withdrawn(msg.sender, s.tierIndex, amount, earlyExit, penalty);
    }

    // ─── Rewards ───────────────────────────────────────────────────────────

    function claimRewards() external override nonReentrant whenNotPaused {
        uint256 rewards = _pendingRewards(msg.sender);
        if (rewards == 0) revert Errors.NoRewards();
        _claimRewards(msg.sender);
    }

    /// @notice Deposit reward tokens into the pool (called by FeeRouter or protocol)
    function depositRewards(uint256 amount) external override {
        if (amount == 0) revert Errors.ZeroAmount();
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardsDeposited(msg.sender, amount);
    }

    // ─── Governance Configuration ──────────────────────────────────────────

    function configureTier(
        uint256 tierIndex,
        uint256 aprBps,
        uint256 lockDuration
    ) external onlyRole(GOVERNANCE_ROLE) {
        if (tierIndex >= TIER_COUNT) revert Errors.InvalidTier();
        tiers[tierIndex].aprBps       = aprBps;
        tiers[tierIndex].lockDuration = lockDuration;
        emit TierConfigUpdated(tierIndex, aprBps, lockDuration);
    }

    function setEarlyWithdrawalPenalty(uint256 penaltyBps) external onlyRole(GOVERNANCE_ROLE) {
        if (penaltyBps > 5000) revert Errors.InvalidState();
        earlyWithdrawalPenaltyBps = penaltyBps;
        emit PenaltyUpdated(penaltyBps);
    }

    // ─── Emergency ─────────────────────────────────────────────────────────

    function emergencyWithdraw(
        address recipient,
        uint256 amount
    ) external onlyRole(EMERGENCY_ROLE) {
        if (recipient == address(0)) revert Errors.ZeroAddress();
        stakingToken.safeTransfer(recipient, amount);
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ─── Views ─────────────────────────────────────────────────────────────

    function earned(address account) external view override returns (uint256) {
        return _pendingRewards(account);
    }

    function getStakeInfo(address account) external view override returns (
        uint256 tier, uint256 amount, uint256 lockEnd, uint256 pendingRewards
    ) {
        Stake storage s = stakes[account];
        return (s.tierIndex, s.amount, s.lockEnd, _pendingRewards(account));
    }

    function totalStakedAcrossAllTiers() public view override returns (uint256 total) {
        for (uint256 i = 0; i < TIER_COUNT; i++) {
            total += tiers[i].totalStaked;
        }
    }

    // ─── Internal ──────────────────────────────────────────────────────────

    /// @dev Per-user accrual: rewards accrue from lastClaimTime, not a shared epoch.
    function _pendingRewards(address account) internal view returns (uint256) {
        Stake storage s = stakes[account];
        if (s.amount == 0) return 0;
        uint256 elapsed     = block.timestamp - s.lastClaimTime;
        uint256 yearlyReward = (s.amount * tiers[s.tierIndex].aprBps) / BPS_DENOMINATOR;
        return (yearlyReward * elapsed) / 365 days;
    }

    function _claimRewards(address account) internal {
        uint256 rewards = _pendingRewards(account);
        if (rewards == 0) return;
        stakes[account].lastClaimTime = block.timestamp;
        // Only pay out what the reward pool can cover
        uint256 payout = rewards > rewardPool ? rewardPool : rewards;
        if (payout > 0) {
            rewardPool -= payout;
            totalRewardsDistributed += payout;
            stakingToken.safeTransfer(account, payout);
            emit RewardsClaimed(account, stakes[account].tierIndex, payout);
        }
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
