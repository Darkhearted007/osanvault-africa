// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingVault is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    IERC20 public stakingToken;

    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant SHARE_MULTIPLIER = 1e18;
    uint256 public constant YEAR = 365 days;

    enum TierIndex { Bronze, Silver, Gold, Platinum }

    struct TierConfig {
        string name;
        uint256 aprBps;
        uint256 lockDuration;
        uint256 totalStaked;
        uint256 accRewardPerShare;
        uint256 lastUpdateTime;
        bool exists;
    }

    struct StakeInfo {
        uint256 tier;
        uint256 amount;
        uint256 lockEnd;
        uint256 rewardDebt;
    }

    TierConfig[4] public tiers;
    mapping(address => StakeInfo) public stakes;

    uint256 public earlyWithdrawalPenaltyBps;
    uint256 public totalRewardsDistributed;

    event Staked(
        address indexed user,
        uint256 indexed tier,
        uint256 amount,
        uint256 lockEnd
    );
    event Withdrawn(
        address indexed user,
        uint256 indexed tier,
        uint256 amount,
        bool early
    );
    event RewardsClaimed(
        address indexed user,
        uint256 indexed tier,
        uint256 amount
    );
    event TierConfigUpdated(
        uint256 indexed tier,
        uint256 aprBps,
        uint256 lockDuration
    );
    event EarlyWithdrawalPenaltyUpdated(uint256 penaltyBps);
    event TokensDeposited(address indexed sender, uint256 amount);
    event TokensWithdrawn(address indexed recipient, uint256 amount);

    constructor(
        address admin,
        address governance,
        address emergency,
        address token
    ) {
        require(admin != address(0), "invalid admin");
        require(governance != address(0), "invalid governance");
        require(emergency != address(0), "invalid emergency");
        require(token != address(0), "invalid token");

        stakingToken = IERC20(token);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GOVERNANCE_ROLE, governance);
        _grantRole(EMERGENCY_ROLE, emergency);

        earlyWithdrawalPenaltyBps = 1000;

        tiers[0] = TierConfig("Bronze", 800, 30 days, 0, 0, block.timestamp, true);
        tiers[1] = TierConfig("Silver", 1200, 90 days, 0, 0, block.timestamp, true);
        tiers[2] = TierConfig("Gold", 1800, 180 days, 0, 0, block.timestamp, true);
        tiers[3] = TierConfig("Platinum", 2200, 365 days, 0, 0, block.timestamp, true);
    }

    modifier updateReward(address account) {
        for (uint256 i = 0; i < 4; i++) {
            _updateRewardPool(i);
        }
        if (account != address(0)) {
            StakeInfo storage userStake = stakes[account];
            if (userStake.amount > 0) {
                uint256 pendingReward = _earned(account, userStake.tier);
                if (pendingReward > 0) {
                    userStake.rewardDebt = tiers[userStake.tier].accRewardPerShare * userStake.amount / SHARE_MULTIPLIER;
                    _claim(account, pendingReward);
                }
            }
        }
        _;
    }

    function stake(uint256 tierIndex, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        updateReward(msg.sender)
    {
        require(tierIndex < 4 && tiers[tierIndex].exists, "invalid tier");
        require(amount > 0, "amount zero");
        require(stakes[msg.sender].amount == 0, "already staked");

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        TierConfig storage tier = tiers[tierIndex];
        StakeInfo storage userStake = stakes[msg.sender];

        tier.totalStaked += amount;
        userStake.tier = tierIndex;
        userStake.amount = amount;
        userStake.lockEnd = block.timestamp + tier.lockDuration;
        userStake.rewardDebt = tier.accRewardPerShare * amount / SHARE_MULTIPLIER;

        emit Staked(msg.sender, tierIndex, amount, userStake.lockEnd);
    }

    function withdraw(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        updateReward(msg.sender)
    {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "no stake");
        require(amount > 0 && amount <= userStake.amount, "invalid amount");

        uint256 penalty = 0;
        bool early = block.timestamp < userStake.lockEnd;

        if (early) {
            penalty = amount * earlyWithdrawalPenaltyBps / BASIS_POINTS;
        }

        uint256 withdrawAmount = amount - penalty;

        TierConfig storage tier = tiers[userStake.tier];

        userStake.amount -= amount;
        tier.totalStaked -= amount;

        if (penalty > 0) {
            stakingToken.safeTransfer(address(this), 0);
        }

        stakingToken.safeTransfer(msg.sender, withdrawAmount);

        if (userStake.amount == 0) {
            delete stakes[msg.sender];
        } else {
            userStake.rewardDebt = tier.accRewardPerShare * userStake.amount / SHARE_MULTIPLIER;
        }

        emit Withdrawn(msg.sender, userStake.tier, withdrawAmount, early);
    }

    function claimRewards()
        external
        nonReentrant
        whenNotPaused
        updateReward(msg.sender)
    {}

    function _claim(address account, uint256 amount) internal {
        if (amount == 0) return;
        totalRewardsDistributed += amount;
        stakingToken.safeTransfer(account, amount);
        emit RewardsClaimed(account, stakes[account].tier, amount);
    }

    function _earned(address account, uint256 tierIndex) internal view returns (uint256) {
        StakeInfo storage userStake = stakes[account];
        if (userStake.amount == 0) return 0;
        TierConfig storage tier = tiers[tierIndex];
        uint256 gross = tier.accRewardPerShare * userStake.amount / SHARE_MULTIPLIER;
        if (gross <= userStake.rewardDebt) return 0;
        return gross - userStake.rewardDebt;
    }

    function _updateRewardPool(uint256 tierIndex) internal {
        TierConfig storage tier = tiers[tierIndex];
        if (!tier.exists) return;
        if (block.timestamp <= tier.lastUpdateTime) return;
        if (tier.totalStaked == 0) {
            tier.lastUpdateTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - tier.lastUpdateTime;
        uint256 annualReward = tier.totalStaked * tier.aprBps / BASIS_POINTS;
        uint256 reward = annualReward * timeElapsed / YEAR;
        uint256 contractBalance = stakingToken.balanceOf(address(this));

        if (reward > contractBalance) {
            reward = contractBalance;
        }

        if (reward > 0) {
            tier.accRewardPerShare += reward * SHARE_MULTIPLIER / tier.totalStaked;
        }

        tier.lastUpdateTime = block.timestamp;
    }

    function earned(address account) external view returns (uint256) {
        StakeInfo storage userStake = stakes[account];
        if (userStake.amount == 0) return 0;

        TierConfig storage tier = tiers[userStake.tier];
        uint256 _accRewardPerShare = tier.accRewardPerShare;

        if (block.timestamp > tier.lastUpdateTime && tier.totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - tier.lastUpdateTime;
            uint256 annualReward = tier.totalStaked * tier.aprBps / BASIS_POINTS;
            uint256 reward = annualReward * timeElapsed / YEAR;
            uint256 contractBalance = stakingToken.balanceOf(address(this));
            if (reward > contractBalance) reward = contractBalance;
            _accRewardPerShare += reward * SHARE_MULTIPLIER / tier.totalStaked;
        }

        uint256 gross = _accRewardPerShare * userStake.amount / SHARE_MULTIPLIER;
        if (gross <= userStake.rewardDebt) return 0;
        return gross - userStake.rewardDebt;
    }

    function getStakeInfo(address account)
        external
        view
        returns (uint256 tier, uint256 amount, uint256 lockEnd, uint256 pendingRewards)
    {
        StakeInfo storage userStake = stakes[account];
        if (userStake.amount == 0) return (0, 0, 0, 0);
        return (
            userStake.tier,
            userStake.amount,
            userStake.lockEnd,
            this.earned(account)
        );
    }

    function configureTier(
        uint256 tierIndex,
        uint256 aprBps,
        uint256 lockDuration
    )
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        require(tierIndex < 4, "invalid tier");
        require(aprBps > 0 && aprBps <= 10_000, "apr out of range");
        require(lockDuration >= 1 days, "lock too short");

        tiers[tierIndex].aprBps = aprBps;
        tiers[tierIndex].lockDuration = lockDuration;

        emit TierConfigUpdated(tierIndex, aprBps, lockDuration);
    }

    function setEarlyWithdrawalPenalty(uint256 penaltyBps)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        require(penaltyBps <= 5000, "penalty too high");
        earlyWithdrawalPenaltyBps = penaltyBps;
        emit EarlyWithdrawalPenaltyUpdated(penaltyBps);
    }

    function depositRewards(uint256 amount) external {
        require(amount > 0, "amount zero");
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit TokensDeposited(msg.sender, amount);
    }

    function withdrawTokens(address recipient, uint256 amount)
        external
        onlyRole(EMERGENCY_ROLE)
    {
        require(recipient != address(0), "invalid recipient");
        require(amount > 0, "amount zero");
        stakingToken.safeTransfer(recipient, amount);
        emit TokensWithdrawn(recipient, amount);
    }

    function pause() external onlyRole(EMERGENCY_ROLE) { _pause(); }
    function unpause() external onlyRole(EMERGENCY_ROLE) { _unpause(); }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
