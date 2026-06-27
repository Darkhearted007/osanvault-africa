// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IFeeRouter.sol";
import "../libraries/Errors.sol";

/// @title FeeRouter — configurable protocol fee distribution router
/// @notice Splits incoming OSANV fees across: Treasury · Burn · Staking rewards · Operations.
///         All four basis-point values are governance-configurable and must sum to 10 000.
///         Default split: 30% treasury · 20% burn · 40% staking · 10% operations.
contract FeeRouter is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable,
    IFeeRouter
{
    using SafeERC20 for IERC20;

    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    // ─── Data ──────────────────────────────────────────────────────────────
    IERC20  public osanvToken;
    address public treasury;
    address public stakingVault;
    address public operations;

    uint256 public treasuryBps;  // portion to treasury
    uint256 public burnBps;      // portion burned (sent to address(0xdead))
    uint256 public stakingBps;   // portion to staking reward pool
    uint256 public teamBps;      // portion to operations multi-sig

    uint256 public totalFeesRouted;

    // ─── Events ────────────────────────────────────────────────────────────
    event FeesRouted(
        uint256 indexed totalAmount,
        uint256 toTreasury,
        uint256 burned,
        uint256 toStaking,
        uint256 toOps
    );
    event ReceiversUpdated(address treasury, address stakingVault, address operations);
    event FeeSplitsUpdated(uint256 treasuryBps, uint256 burnBps, uint256 stakingBps, uint256 teamBps);

    // ─── Errors ────────────────────────────────────────────────────────────
    error SplitsDoNotSumTo10000();

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        address token,
        address treasury_,
        address stakingVault_,
        address operations_
    ) public initializer {
        if (token == address(0) || treasury_ == address(0) ||
            stakingVault_ == address(0) || operations_ == address(0)) revert Errors.ZeroAddress();

        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GOVERNANCE_ROLE,    admin);

        osanvToken   = IERC20(token);
        treasury     = treasury_;
        stakingVault = stakingVault_;
        operations   = operations_;

        // Default split: 30 / 20 / 40 / 10
        treasuryBps = 3000;
        burnBps     = 2000;
        stakingBps  = 4000;
        teamBps     = 1000;
    }

    // ─── Core Fee Distribution ─────────────────────────────────────────────

    /// @notice Pull `amount` OSANV from caller and distribute per configured splits
    function routeFees(uint256 amount) external override nonReentrant {
        if (amount == 0) revert Errors.ZeroAmount();
        osanvToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 toTreasury = (amount * treasuryBps) / 10_000;
        uint256 toBurn     = (amount * burnBps)     / 10_000;
        uint256 toStaking  = (amount * stakingBps)  / 10_000;
        uint256 toOps      = amount - toTreasury - toBurn - toStaking; // remainder prevents dust

        if (toTreasury > 0) osanvToken.safeTransfer(treasury, toTreasury);
        if (toBurn     > 0) osanvToken.safeTransfer(address(0xdead), toBurn); // deflationary burn
        if (toStaking  > 0) osanvToken.safeTransfer(stakingVault, toStaking);
        if (toOps      > 0) osanvToken.safeTransfer(operations, toOps);

        totalFeesRouted += amount;
        emit FeesRouted(amount, toTreasury, toBurn, toStaking, toOps);
    }

    // ─── Governance Configuration ──────────────────────────────────────────

    function setReceivers(
        address treasury_,
        address stakingVault_,
        address operations_
    ) external override onlyRole(GOVERNANCE_ROLE) {
        if (treasury_ == address(0) || stakingVault_ == address(0) || operations_ == address(0)) {
            revert Errors.ZeroAddress();
        }
        treasury     = treasury_;
        stakingVault = stakingVault_;
        operations   = operations_;
        emit ReceiversUpdated(treasury_, stakingVault_, operations_);
    }

    /// @notice Update fee splits — must sum to exactly 10 000 bps
    function updateFeeSplits(
        uint256 treasuryBps_,
        uint256 burnBps_,
        uint256 stakingBps_,
        uint256 teamBps_
    ) external override onlyRole(GOVERNANCE_ROLE) {
        if (treasuryBps_ + burnBps_ + stakingBps_ + teamBps_ != 10_000) {
            revert SplitsDoNotSumTo10000();
        }
        treasuryBps = treasuryBps_;
        burnBps     = burnBps_;
        stakingBps  = stakingBps_;
        teamBps     = teamBps_;
        emit FeeSplitsUpdated(treasuryBps_, burnBps_, stakingBps_, teamBps_);
    }

    // ─── Views ─────────────────────────────────────────────────────────────

    function getTreasury()     external view override returns (address) { return treasury;     }
    function getStakingVault() external view override returns (address) { return stakingVault; }

    function getFeeSplits() external view returns (
        uint256 _treasuryBps,
        uint256 _burnBps,
        uint256 _stakingBps,
        uint256 _teamBps
    ) {
        return (treasuryBps, burnBps, stakingBps, teamBps);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
