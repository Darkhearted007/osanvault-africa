// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title TreasuryVault — timelocked treasury with 2-day delay and 50K daily limit
contract TreasuryVault is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    uint256 public constant TIMELOCK_DURATION = 2 days;
    uint256 public constant DAILY_LIMIT       = 50_000 * 1e18;

    struct Withdrawal {
        address token;
        address recipient;
        uint256 amount;
        uint256 executeAfter;
        bool    executed;
        bool    cancelled;
    }

    mapping(uint256 => Withdrawal) public withdrawals;
    uint256 public withdrawalCount;
    mapping(uint256 => uint256)    public dailyWithdrawn; // day bucket => cumulative

    event WithdrawalProposed(
        uint256 indexed id,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 executeAfter
    );
    event WithdrawalExecuted(uint256 indexed id);
    event WithdrawalCancelled(uint256 indexed id);
    event FundsReceived(address indexed token, address indexed from, uint256 amount);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROPOSER_ROLE,      admin);
        _grantRole(EXECUTOR_ROLE,      admin);
    }

    receive() external payable {}

    function proposeWithdrawal(
        address token,
        address recipient,
        uint256 amount
    ) external onlyRole(PROPOSER_ROLE) returns (uint256 id) {
        id = ++withdrawalCount;
        uint256 executeAfter = block.timestamp + TIMELOCK_DURATION;
        withdrawals[id] = Withdrawal({
            token:        token,
            recipient:    recipient,
            amount:       amount,
            executeAfter: executeAfter,
            executed:     false,
            cancelled:    false
        });
        emit WithdrawalProposed(id, token, recipient, amount, executeAfter);
    }

    function executeWithdrawal(uint256 id) external onlyRole(EXECUTOR_ROLE) {
        Withdrawal storage w = withdrawals[id];
        require(!w.executed && !w.cancelled, "TreasuryVault: invalid state");
        require(block.timestamp >= w.executeAfter, "TreasuryVault: timelock active");

        uint256 day = block.timestamp / 1 days;
        require(dailyWithdrawn[day] + w.amount <= DAILY_LIMIT, "TreasuryVault: daily limit exceeded");

        dailyWithdrawn[day] += w.amount;
        w.executed = true;
        IERC20(w.token).safeTransfer(w.recipient, w.amount);
        emit WithdrawalExecuted(id);
    }

    function cancelWithdrawal(uint256 id) external onlyRole(PROPOSER_ROLE) {
        Withdrawal storage w = withdrawals[id];
        require(!w.executed && !w.cancelled, "TreasuryVault: invalid state");
        w.cancelled = true;
        emit WithdrawalCancelled(id);
    }

    function getBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
