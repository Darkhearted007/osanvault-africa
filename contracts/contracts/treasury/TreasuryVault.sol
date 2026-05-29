// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ITreasuryVault.sol";
import "../libraries/Errors.sol";

/// @title TreasuryVault — institutional treasury with timelock, daily limits, and emergency controls
/// @notice Supports ERC-20 tokens and native ETH/MATIC. All withdrawals go through a 2-step
///         propose → execute cycle with a configurable timelock delay and daily withdrawal cap.
contract TreasuryVault is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable,
    ITreasuryVault
{
    using SafeERC20 for IERC20;

    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant PROPOSER_ROLE  = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE  = keccak256("EXECUTOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // ─── Data ──────────────────────────────────────────────────────────────
    struct Withdrawal {
        address token;        // address(0) for native ETH/MATIC
        address recipient;
        uint256 amount;
        uint256 executeAfter;
        bool    executed;
        bool    cancelled;
        string  memo;
    }

    uint256 public timelockDuration;
    uint256 public dailyLimit;
    bool    public frozen;

    uint256 public withdrawalCount;
    mapping(uint256 => Withdrawal) public withdrawals;
    mapping(uint256 => uint256)    public dailyWithdrawn; // day-bucket → total withdrawn

    // ─── Events ────────────────────────────────────────────────────────────
    event WithdrawalProposed(
        uint256 indexed id, address indexed token, address indexed recipient,
        uint256 amount, uint256 executeAfter, string memo
    );
    event WithdrawalExecuted(uint256 indexed id, address token, address recipient, uint256 amount);
    event WithdrawalCancelled(uint256 indexed id);
    event FundsReceived(address indexed token, address indexed from, uint256 amount);
    event EmergencyFrozen(address indexed by);
    event EmergencyUnfrozen(address indexed by);
    event TimelockUpdated(uint256 newDuration);
    event DailyLimitUpdated(uint256 newLimit);

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        uint256 timelockDuration_,
        uint256 dailyLimit_
    ) public initializer {
        if (admin == address(0)) revert Errors.ZeroAddress();
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROPOSER_ROLE,      admin);
        _grantRole(EXECUTOR_ROLE,      admin);
        _grantRole(EMERGENCY_ROLE,     admin);
        timelockDuration = timelockDuration_;
        dailyLimit       = dailyLimit_;
    }

    receive() external payable {
        emit FundsReceived(address(0), msg.sender, msg.value);
    }

    // ─── Withdrawal Flow ───────────────────────────────────────────────────

    function proposeWithdrawal(
        address token,
        address recipient,
        uint256 amount
    ) external override onlyRole(PROPOSER_ROLE) returns (uint256 id) {
        return proposeWithdrawalWithMemo(token, recipient, amount, "");
    }

    function proposeWithdrawalWithMemo(
        address token,
        address recipient,
        uint256 amount,
        string  memory memo
    ) public onlyRole(PROPOSER_ROLE) returns (uint256 id) {
        if (recipient == address(0)) revert Errors.ZeroAddress();
        if (amount == 0)             revert Errors.ZeroAmount();
        if (frozen)                  revert Errors.InvalidState();

        id = ++withdrawalCount;
        uint256 executeAfter = block.timestamp + timelockDuration;
        withdrawals[id] = Withdrawal({
            token:        token,
            recipient:    recipient,
            amount:       amount,
            executeAfter: executeAfter,
            executed:     false,
            cancelled:    false,
            memo:         memo
        });
        emit WithdrawalProposed(id, token, recipient, amount, executeAfter, memo);
    }

    function executeWithdrawal(uint256 id) external override nonReentrant onlyRole(EXECUTOR_ROLE) {
        Withdrawal storage w = withdrawals[id];
        if (w.executed)  revert Errors.WithdrawalAlreadyExecuted();
        if (w.cancelled) revert Errors.WithdrawalAlreadyCancelled();
        if (frozen)      revert Errors.InvalidState();
        if (block.timestamp < w.executeAfter) revert Errors.TimelockActive();

        uint256 day = block.timestamp / 1 days;
        if (dailyWithdrawn[day] + w.amount > dailyLimit) revert Errors.DailyLimitExceeded();

        dailyWithdrawn[day] += w.amount;
        w.executed = true;

        if (w.token == address(0)) {
            // Native ETH/MATIC
            (bool ok,) = payable(w.recipient).call{value: w.amount}("");
            require(ok, "TreasuryVault: ETH transfer failed");
        } else {
            IERC20(w.token).safeTransfer(w.recipient, w.amount);
        }
        emit WithdrawalExecuted(id, w.token, w.recipient, w.amount);
    }

    function cancelWithdrawal(uint256 id) external override onlyRole(PROPOSER_ROLE) {
        Withdrawal storage w = withdrawals[id];
        if (w.executed)  revert Errors.WithdrawalAlreadyExecuted();
        if (w.cancelled) revert Errors.WithdrawalAlreadyCancelled();
        w.cancelled = true;
        emit WithdrawalCancelled(id);
    }

    // ─── Emergency Controls ────────────────────────────────────────────────

    function emergencyFreeze() external override onlyRole(EMERGENCY_ROLE) {
        frozen = true;
        emit EmergencyFrozen(msg.sender);
    }

    function emergencyUnfreeze() external override onlyRole(EMERGENCY_ROLE) {
        frozen = false;
        emit EmergencyUnfrozen(msg.sender);
    }

    // ─── Governance-Configurable Parameters ────────────────────────────────

    function setTimelockDuration(uint256 newDuration) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        timelockDuration = newDuration;
        emit TimelockUpdated(newDuration);
    }

    function setDailyLimit(uint256 newLimit) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        dailyLimit = newLimit;
        emit DailyLimitUpdated(newLimit);
    }

    // ─── Views ─────────────────────────────────────────────────────────────

    function getBalance(address token) external view override returns (uint256) {
        if (token == address(0)) return address(this).balance;
        return IERC20(token).balanceOf(address(this));
    }

    function getDailyRemaining() external view returns (uint256) {
        uint256 day = block.timestamp / 1 days;
        uint256 used = dailyWithdrawn[day];
        return used >= dailyLimit ? 0 : dailyLimit - used;
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
