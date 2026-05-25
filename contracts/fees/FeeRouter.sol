// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract FeeRouter is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    IERC20 public immutable osanvToken;

    struct FeeDistribution {
        uint256 burnPercentage;
        uint256 treasuryPercentage;
        uint256 stakingRewardPercentage;
        uint256 protocolReservePercentage;
    }

    FeeDistribution public feeDistribution;
    address public treasuryWallet;
    address public stakingVault;
    address public protocolReserveWallet;
    uint256 public constant MAX_PERCENTAGE = 1000;
    uint256 public constant MIN_BURN_PERCENTAGE = 50;

    event FeesDistributed(uint256 amount, uint256 burned, uint256 toTreasury, uint256 toStaking, uint256 toReserve);
    event FeeDistributionUpdated(uint256 burnPct, uint256 treasuryPct, uint256 stakingPct, uint256 reservePct);
    event TreasuryWalletUpdated(address indexed wallet);
    event StakingVaultUpdated(address indexed vault);

    constructor(
        address _osanvToken,
        address _treasuryWallet,
        address _stakingVault,
        address _protocolReserveWallet,
        address admin
    ) {
        require(_osanvToken != address(0), "invalid token");
        require(_treasuryWallet != address(0), "invalid treasury");
        require(_stakingVault != address(0), "invalid staking vault");
        require(_protocolReserveWallet != address(0), "invalid reserve");
        require(admin != address(0), "invalid admin");

        osanvToken = IERC20(_osanvToken);
        treasuryWallet = _treasuryWallet;
        stakingVault = _stakingVault;
        protocolReserveWallet = _protocolReserveWallet;
        feeDistribution = FeeDistribution(200, 300, 400, 100);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function distribute(uint256 amount) external whenNotPaused {
        require(amount > 0, "amount zero");
        uint256 sum = feeDistribution.burnPercentage + feeDistribution.treasuryPercentage + feeDistribution.stakingRewardPercentage + feeDistribution.protocolReservePercentage;
        require(sum == MAX_PERCENTAGE, "invalid distribution");

        uint256 burnAmt = amount * feeDistribution.burnPercentage / MAX_PERCENTAGE;
        uint256 treasuryAmt = amount * feeDistribution.treasuryPercentage / MAX_PERCENTAGE;
        uint256 stakingAmt = amount * feeDistribution.stakingRewardPercentage / MAX_PERCENTAGE;
        uint256 reserveAmt = amount * feeDistribution.protocolReservePercentage / MAX_PERCENTAGE;

        osanvToken.safeTransferFrom(msg.sender, address(this), amount);
        if (burnAmt > 0) { osanvToken.approve(address(this), burnAmt); _burn(burnAmt); }
        if (treasuryAmt > 0) osanvToken.safeTransfer(treasuryWallet, treasuryAmt);
        if (stakingAmt > 0) osanvToken.safeTransfer(stakingVault, stakingAmt);
        if (reserveAmt > 0) osanvToken.safeTransfer(protocolReserveWallet, reserveAmt);

        emit FeesDistributed(amount, burnAmt, treasuryAmt, stakingAmt, reserveAmt);
    }

    function _burn(uint256 amount) internal {
        (bool success, ) = address(osanvToken).call(abi.encodeWithSignature("burn(uint256)", amount));
        require(success, "burn failed");
    }

    function updateFeeDistribution(uint256 burnPct, uint256 treasuryPct, uint256 stakingPct, uint256 reservePct) external onlyRole(ADMIN_ROLE) {
        require(burnPct >= MIN_BURN_PERCENTAGE, "burn too low");
        require(burnPct + treasuryPct + stakingPct + reservePct == MAX_PERCENTAGE, "must sum to 1000");
        feeDistribution = FeeDistribution(burnPct, treasuryPct, stakingPct, reservePct);
        emit FeeDistributionUpdated(burnPct, treasuryPct, stakingPct, reservePct);
    }

    function setTreasuryWallet(address w) external onlyRole(ADMIN_ROLE) { require(w != address(0), "invalid"); treasuryWallet = w; emit TreasuryWalletUpdated(w); }
    function setStakingVault(address v) external onlyRole(ADMIN_ROLE) { require(v != address(0), "invalid"); stakingVault = v; emit StakingVaultUpdated(v); }
    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}