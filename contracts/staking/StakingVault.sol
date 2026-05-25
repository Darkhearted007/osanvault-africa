// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingVault is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public totalStaked;
    uint256 public rewardPool;
    uint256 public rewardRatePerSecond;
    uint256 public lastUpdateTimestamp;
    uint256 public accumulatedRewardPerToken;

    struct Tier {
        string name;
        uint256 apr;
        uint256 lockDuration;
        uint256 minStake;
        uint256 maxStake;
        bool active;
    }

    struct Stake {
        uint256 amount;
        uint256 tierId;
        uint256 lockedUntil;
        uint256 rewardDebt;
        uint256 stakedAt;
    }

    Tier[] public tiers;
    mapping(address => Stake) public stakes;
    mapping(uint256 => uint256) public tierTotalStaked;

    event Staked(address indexed user, uint256 amount, uint256 tierId, uint256 lockedUntil);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 amount);
    event TierAdded(uint256 indexed tierId, string name);
    event TierUpdated(uint256 indexed tierId, uint256 apr, bool active);
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _stakingToken, address _rewardToken, address admin) {
        require(_stakingToken != address(0), "invalid staking token");
        require(_rewardToken != address(0), "invalid reward token");
        require(admin != address(0), "invalid admin");

        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        _grantRole(REWARD_MANAGER_ROLE, admin);

        lastUpdateTimestamp = block.timestamp;

        tiers.push(Tier("Bronze", 800, 30 days, 1_000 * 1e18, 50_000 * 1e18, true));
        tiers.push(Tier("Silver", 1200, 90 days, 5_000 * 1e18, 200_000 * 1e18, true));
        tiers.push(Tier("Gold", 1800, 180 days, 20_000 * 1e18, 1_000_000 * 1e18, true));
        tiers.push(Tier("Platinum", 2200, 365 days, 100_000 * 1e18, type(uint256).max, true));
    }

    modifier updateRewards() {
        if (totalStaked > 0) {
            uint256 elapsed = block.timestamp - lastUpdateTimestamp;
            if (elapsed > 0) {
                uint256 rewardsAccrued = elapsed * rewardRatePerSecond;
                if (rewardsAccrued > rewardPool) rewardsAccrued = rewardPool;
                if (rewardsAccrued > 0) {
                    accumulatedRewardPerToken += (rewardsAccrued * 1e18) / totalStaked;
                    rewardPool -= rewardsAccrued;
                }
            }
        }
        lastUpdateTimestamp = block.timestamp;
        _;
    }

    function stake(uint256 amount, uint256 tierId) external whenNotPaused nonReentrant updateRewards {
        require(amount > 0, "amount zero");
        require(tierId < tiers.length, "invalid tier");
        require(tiers[tierId].active, "tier inactive");
        require(stakes[msg.sender].amount == 0, "already staked");
        require(amount >= tiers[tierId].minStake, "below min");
        require(amount <= tiers[tierId].maxStake, "above max");

        uint256 lockedUntil = block.timestamp + tiers[tierId].lockDuration;
        stakes[msg.sender] = Stake({
            amount: amount,
            tierId: tierId,
            lockedUntil: lockedUntil,
            rewardDebt: (amount * accumulatedRewardPerToken) / 1e18,
            stakedAt: block.timestamp
        });
        totalStaked += amount;
        tierTotalStaked[tierId] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount, tierId, lockedUntil);
    }

    function unstake() external nonReentrant updateRewards {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "no stake");
        require(block.timestamp >= userStake.lockedUntil, "still locked");
        require(!paused(), "contract paused");

        uint256 amount = userStake.amount;
        uint256 earned = (amount * accumulatedRewardPerToken) / 1e18 - userStake.rewardDebt;
        if (earned > rewardPool) earned = rewardPool;

        delete stakes[msg.sender];
        totalStaked -= amount;
        tierTotalStaked[userStake.tierId] -= amount;

        if (earned > 0) { rewardPool -= earned; rewardToken.safeTransfer(msg.sender, earned); }
        stakingToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount, earned);
    }

    function claimReward() external nonReentrant updateRewards {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "no stake");
        uint256 earned = (userStake.amount * accumulatedRewardPerToken) / 1e18 - userStake.rewardDebt;
        require(earned > 0, "no reward");
        if (earned > rewardPool) earned = rewardPool;
        userStake.rewardDebt = (userStake.amount * accumulatedRewardPerToken) / 1e18;
        rewardPool -= earned;
        rewardToken.safeTransfer(msg.sender, earned);
        emit RewardClaimed(msg.sender, earned);
    }

    function pendingReward(address user) external view returns (uint256) {
        Stake memory s = stakes[user];
        if (s.amount == 0) return 0;
        uint256 _acc = accumulatedRewardPerToken;
        if (totalStaked > 0) {
            uint256 elapsed = block.timestamp - lastUpdateTimestamp;
            uint256 accrued = elapsed * rewardRatePerSecond;
            if (accrued > rewardPool) accrued = rewardPool;
            _acc += (accrued * 1e18) / totalStaked;
        }
        return (s.amount * _acc) / 1e18 - s.rewardDebt;
    }

    function fundRewardPool(uint256 amount) external {
        require(amount > 0, "amount zero");
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(msg.sender, amount);
    }

    function setRewardRate(uint256 rate) external onlyRole(REWARD_MANAGER_ROLE) {
        rewardRatePerSecond = rate;
        emit RewardRateUpdated(rate);
    }

    function addTier(string calldata name, uint256 apr, uint256 lockDuration, uint256 minStake, uint256 maxStake) external onlyRole(ADMIN_ROLE) {
        tiers.push(Tier(name, apr, lockDuration, minStake, maxStake, true));
        emit TierAdded(tiers.length - 1, name);
    }

    function updateTier(uint256 tierId, uint256 apr, bool active) external onlyRole(ADMIN_ROLE) {
        require(tierId < tiers.length, "invalid tier");
        tiers[tierId].apr = apr;
        tiers[tierId].active = active;
        emit TierUpdated(tierId, apr, active);
    }

    function getTierCount() external view returns (uint256) { return tiers.length; }
    function getTier(uint256 tierId) external view returns (Tier memory) { require(tierId < tiers.length, "invalid tier"); return tiers[tierId]; }
    function pause() external onlyRole(EMERGENCY_ROLE) { _pause(); }
    function unpause() external onlyRole(EMERGENCY_ROLE) { _unpause(); }
}