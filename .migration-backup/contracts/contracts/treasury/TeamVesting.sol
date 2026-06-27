// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../libraries/Errors.sol";

/// @title TeamVesting — institutional token vesting with cliff, linear schedule, and revocability
/// @notice Tokens vest linearly from `startTime` to `startTime + vestingDuration`.
///         No tokens can be released before `startTime + cliffDuration`.
///         Tokens that vested during the cliff period are immediately claimable once cliff passes.
///         Revocable schedules return unvested tokens to the admin treasury.
contract TeamVesting is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    // ─── Data ──────────────────────────────────────────────────────────────
    struct VestingSchedule {
        address beneficiary;
        address token;
        uint256 totalAmount;
        uint256 startTime;
        uint256 cliffDuration;    // seconds until first release is possible
        uint256 vestingDuration;  // total vesting period in seconds (must be >= cliffDuration)
        uint256 released;         // tokens already released to beneficiary
        bool    revocable;
        bool    revoked;
    }

    uint256 public scheduleCount;
    mapping(uint256 => VestingSchedule) private _schedules;
    mapping(address => uint256[])       private _beneficiarySchedules;

    address public revokedTokenRecipient; // address that receives unvested tokens on revocation

    // ─── Events ────────────────────────────────────────────────────────────
    event ScheduleCreated(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        address indexed token,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool    revocable
    );
    event TokensReleased(uint256 indexed scheduleId, address indexed beneficiary, uint256 amount);
    event ScheduleRevoked(uint256 indexed scheduleId, uint256 unvestedReturned);
    event RevokedRecipientUpdated(address indexed newRecipient);

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin, address revokedTokenRecipient_) public initializer {
        if (admin == address(0) || revokedTokenRecipient_ == address(0)) revert Errors.ZeroAddress();
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        revokedTokenRecipient = revokedTokenRecipient_;
    }

    // ─── Schedule Management ───────────────────────────────────────────────

    /// @notice Create a vesting schedule. Tokens must be approved for transfer before calling.
    function createSchedule(
        address beneficiary,
        address token,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool    revocable
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 scheduleId) {
        if (beneficiary == address(0) || token == address(0)) revert Errors.ZeroAddress();
        if (totalAmount == 0)                  revert Errors.ZeroAmount();
        if (vestingDuration == 0)              revert Errors.InvalidState();
        if (cliffDuration > vestingDuration)   revert Errors.InvalidState();

        // Pull tokens from admin
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        scheduleId = ++scheduleCount;
        _schedules[scheduleId] = VestingSchedule({
            beneficiary:     beneficiary,
            token:           token,
            totalAmount:     totalAmount,
            startTime:       startTime,
            cliffDuration:   cliffDuration,
            vestingDuration: vestingDuration,
            released:        0,
            revocable:       revocable,
            revoked:         false
        });
        _beneficiarySchedules[beneficiary].push(scheduleId);

        emit ScheduleCreated(
            scheduleId, beneficiary, token, totalAmount,
            startTime, cliffDuration, vestingDuration, revocable
        );
    }

    // ─── Release ───────────────────────────────────────────────────────────

    /// @notice Release vested tokens to the beneficiary
    function release(uint256 scheduleId) external nonReentrant {
        VestingSchedule storage s = _schedules[scheduleId];
        if (s.beneficiary == address(0))         revert Errors.VestingScheduleDoesNotExist();
        if (s.revoked)                           revert Errors.ScheduleRevoked();
        if (msg.sender != s.beneficiary &&
            !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert Errors.Unauthorized();

        uint256 releasableAmt = _releasableAmount(s);
        if (releasableAmt == 0) revert Errors.NothingToRelease();

        s.released += releasableAmt;
        IERC20(s.token).safeTransfer(s.beneficiary, releasableAmt);
        emit TokensReleased(scheduleId, s.beneficiary, releasableAmt);
    }

    // ─── Revocation ────────────────────────────────────────────────────────

    /// @notice Revoke a revocable schedule — vested portion stays claimable, rest returns to treasury
    function revoke(uint256 scheduleId) external nonReentrant onlyRole(DEFAULT_ADMIN_ROLE) {
        VestingSchedule storage s = _schedules[scheduleId];
        if (s.beneficiary == address(0)) revert Errors.VestingScheduleDoesNotExist();
        if (!s.revocable)                revert Errors.NotRevocable();
        if (s.revoked)                   revert Errors.ScheduleRevoked();

        uint256 vested       = _vestedAmount(s);
        uint256 releasableAmt = vested - s.released;
        uint256 unvested     = s.totalAmount - vested;

        s.revoked = true;

        // Send any remaining releasable amount to beneficiary
        if (releasableAmt > 0) {
            s.released += releasableAmt;
            IERC20(s.token).safeTransfer(s.beneficiary, releasableAmt);
        }
        // Return unvested to protocol treasury
        if (unvested > 0) {
            IERC20(s.token).safeTransfer(revokedTokenRecipient, unvested);
        }
        emit ScheduleRevoked(scheduleId, unvested);
    }

    // ─── Views ─────────────────────────────────────────────────────────────

    function releasable(uint256 scheduleId) external view returns (uint256) {
        VestingSchedule storage s = _schedules[scheduleId];
        if (s.revoked) return 0;
        return _releasableAmount(s);
    }

    function getSchedule(uint256 scheduleId) external view returns (VestingSchedule memory) {
        return _schedules[scheduleId];
    }

    function getSchedulesForBeneficiary(address beneficiary) external view returns (uint256[] memory) {
        return _beneficiarySchedules[beneficiary];
    }

    // ─── Internal ──────────────────────────────────────────────────────────

    function _vestedAmount(VestingSchedule storage s) internal view returns (uint256) {
        if (block.timestamp < s.startTime + s.cliffDuration) return 0;
        uint256 elapsed = block.timestamp - s.startTime;
        if (elapsed >= s.vestingDuration) return s.totalAmount;
        return (s.totalAmount * elapsed) / s.vestingDuration;
    }

    function _releasableAmount(VestingSchedule storage s) internal view returns (uint256) {
        return _vestedAmount(s) - s.released;
    }

    // ─── Admin ─────────────────────────────────────────────────────────────

    function setRevokedTokenRecipient(address newRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newRecipient == address(0)) revert Errors.ZeroAddress();
        revokedTokenRecipient = newRecipient;
        emit RevokedRecipientUpdated(newRecipient);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
