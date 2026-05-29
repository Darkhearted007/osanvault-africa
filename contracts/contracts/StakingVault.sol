// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title StakingVault — 4-tier OSANV staking (Bronze/Silver/Gold/Platinum)
/// @notice APRs: 800/1200/1800/2200 bps. Lock: 30/90/180/365 days.
contract StakingVault is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant EMERGENCY_ROLE  = keccak256("EMERGENCY_ROLE");

    struct Tier {
        string  name;
        uint256 aprBps;
        uint256 lockDuration;
        uint256 totalStaked;
        uint256 accRewardPerShare;
        uint256 lastUpdateTime;
        bool    exists;
    }

    struct Stake {
        uint256 tier;
        uint256 amount;
        uint256 lockEnd;
        uint256 rewardDebt;
    }

    IERC20  public stakingToken;
    uint256 public earlyWithdrawalPenaltyBps = 2000; // 20% default
    uint256 public totalRewardsDistributed;

    mapping(uint256 => Tier)    public tiers;
    mapping(address => Stake)   public stakes;

    event Staked(address indexed user, uint256 indexed tier, uint256 amount, uint256 lockEnd);
    event Withdrawn(address indexed user, uint256 indexed tier, uint256 amount, bool early);
    event RewardsClaimed(address indexed user, uint256 indexed tier, uint256 amount);
    event TierConfigUpdated(uint256 indexed tier, uint256 aprBps, uint256 lockDuration);
    event EarlyWithdrawalPenaltyUpdated(uint256 penaltyBps);
    event TokensDeposited(address indexed sender, uint256 amount);
    event TokensWithdrawn(address indexed recipient, uint256 amount);

    constructor(
        address admin,
        address governance,
        address emergency,
        address token
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GOVERNANCE_ROLE,    governance);
        _grantRole(EMERGENCY_ROLE,     emergency);
        stakingToken = IERC20(token);

        tiers[0] = Tier("Bronze",   800,  30  * 1 days, 0, 0, block.timestamp, true);
        tiers[1] = Tier("Silver",   1200, 90  * 1 days, 0, 0, block.timestamp, true);
        tiers[2] = Tier("Gold",     1800, 180 * 1 days, 0, 0, block.timestamp, true);
        tiers[3] = Tier("Platinum", 2200, 365 * 1 days, 0, 0, block.timestamp, true);
    }

    function stake(uint256 tierIndex, uint256 amount) external whenNotPaused {
        require(tiers[tierIndex].exists,    "StakingVault: invalid tier");
        require(amount > 0,                 "StakingVault: zero amount");
        require(stakes[msg.sender].amount == 0, "StakingVault: already staked");

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 lockEnd = block.timestamp + tiers[tierIndex].lockDuration;

        stakes[msg.sender] = Stake({
            tier:       tierIndex,
            amount:     amount,
            lockEnd:    lockEnd,
            rewardDebt: 0
        });
        tiers[tierIndex].totalStaked += amount;
        emit Staked(msg.sender, tierIndex, amount, lockEnd);
    }

    function withdraw(uint256 amount) external whenNotPaused {
        Stake storage s = stakes[msg.sender];
        require(s.amount >= amount, "StakingVault: insufficient stake");

        bool early = block.timestamp < s.lockEnd;
        uint256 rewards = _pendingRewards(msg.sender);
        if (rewards > 0) {
            totalRewardsDistributed += rewards;
            stakingToken.safeTransfer(msg.sender, rewards);
            emit RewardsClaimed(msg.sender, s.tier, rewards);
        }

        tiers[s.tier].totalStaked -= amount;
        s.amount -= amount;
        tiers[s.tier].lastUpdateTime = block.timestamp;

        uint256 payout = amount;
        if (early) {
            uint256 penalty = (amount * earlyWithdrawalPenaltyBps) / 10000;
            payout -= penalty;
        }
        stakingToken.safeTransfer(msg.sender, payout);
        emit Withdrawn(msg.sender, s.tier, amount, early);
    }

    function claimRewards() external whenNotPaused {
        uint256 rewards = _pendingRewards(msg.sender);
        require(rewards > 0, "StakingVault: no rewards");
        totalRewardsDistributed += rewards;
        tiers[stakes[msg.sender].tier].lastUpdateTime = block.timestamp;
        stakingToken.safeTransfer(msg.sender, rewards);
        emit RewardsClaimed(msg.sender, stakes[msg.sender].tier, rewards);
    }

    function depositRewards(uint256 amount) external {
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit TokensDeposited(msg.sender, amount);
    }

    function configureTier(
        uint256 tierIndex,
        uint256 aprBps,
        uint256 lockDuration
    ) external onlyRole(GOVERNANCE_ROLE) {
        tiers[tierIndex].aprBps       = aprBps;
        tiers[tierIndex].lockDuration = lockDuration;
        emit TierConfigUpdated(tierIndex, aprBps, lockDuration);
    }

    function setEarlyWithdrawalPenalty(uint256 penaltyBps) external onlyRole(GOVERNANCE_ROLE) {
        require(penaltyBps <= 5000, "StakingVault: penalty too high");
        earlyWithdrawalPenaltyBps = penaltyBps;
        emit EarlyWithdrawalPenaltyUpdated(penaltyBps);
    }

    function withdrawTokens(address recipient, uint256 amount) external onlyRole(EMERGENCY_ROLE) {
        stakingToken.safeTransfer(recipient, amount);
        emit TokensWithdrawn(recipient, amount);
    }

    function earned(address account) external view returns (uint256) {
        return _pendingRewards(account);
    }

    function getStakeInfo(address account) external view returns (
        uint256 tier,
        uint256 amount,
        uint256 lockEnd,
        uint256 pendingRewards
    ) {
        Stake storage s = stakes[account];
        return (s.tier, s.amount, s.lockEnd, _pendingRewards(account));
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    function _pendingRewards(address account) internal view returns (uint256) {
        Stake storage s = stakes[account];
        if (s.amount == 0) return 0;
        uint256 elapsed     = block.timestamp - tiers[s.tier].lastUpdateTime;
        uint256 yearlyReward = (s.amount * tiers[s.tier].aprBps) / 10000;
        return (yearlyReward * elapsed) / 365 days;
    }
}
