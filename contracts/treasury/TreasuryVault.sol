// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TreasuryVault is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    struct WithdrawalRequest {
        address recipient;
        address token;
        uint256 amount;
        uint256 timestamp;
        bool executed;
    }

    uint256 public withdrawalTimelock;
    uint256 public dailyWithdrawalLimit;
    uint256 public lastResetDay;
    uint256 public dailyWithdrawn;

    WithdrawalRequest[] public requests;

    uint256 public constant MAX_TIMELOCK = 14 days;
    uint256 public constant MIN_TIMELOCK = 1 days;

    mapping(address => bool) public supportedTokens;
    address[] public supportedTokenList;

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event WithdrawalRequested(
        uint256 indexed requestId,
        address indexed recipient,
        address indexed token,
        uint256 amount
    );
    event WithdrawalExecuted(
        uint256 indexed requestId,
        address indexed recipient,
        address indexed token,
        uint256 amount
    );
    event WithdrawalCancelled(uint256 indexed requestId);
    event TimelockUpdated(uint256 oldTimelock, uint256 newTimelock);
    event DailyLimitUpdated(uint256 oldLimit, uint256 newLimit);

    constructor(address admin, address executor, address guardian) {
        require(admin != address(0), "invalid admin");
        require(executor != address(0), "invalid executor");
        require(guardian != address(0), "invalid guardian");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EXECUTOR_ROLE, executor);
        _grantRole(GUARDIAN_ROLE, guardian);

        withdrawalTimelock = 2 days;
        dailyWithdrawalLimit = 50_000 * 1e18;
        lastResetDay = block.timestamp / 1 days;
    }

    modifier onlyExecutor() {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "not executor");
        _;
    }

    modifier onlyGuardian() {
        require(hasRole(GUARDIAN_ROLE, msg.sender), "not guardian");
        _;
    }

    function addSupportedToken(address token) external onlyGuardian {
        require(token != address(0), "invalid token");
        require(!supportedTokens[token], "already supported");
        supportedTokens[token] = true;
        supportedTokenList.push(token);
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyGuardian {
        require(supportedTokens[token], "not supported");
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function requestWithdrawal(address recipient, address token, uint256 amount)
        external
        onlyExecutor
        returns (uint256 requestId)
    {
        require(recipient != address(0), "invalid recipient");
        require(supportedTokens[token] || token == address(0), "unsupported token");
        require(amount > 0, "amount zero");

        if (token == address(0)) {
            require(address(this).balance >= amount, "insufficient native");
        } else {
            require(IERC20(token).balanceOf(address(this)) >= amount, "insufficient balance");
        }

        _resetDailyLimit();

        requestId = requests.length;
        requests.push(WithdrawalRequest({
            recipient: recipient,
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            executed: false
        }));

        emit WithdrawalRequested(requestId, recipient, token, amount);
    }

    function executeWithdrawal(uint256 requestId)
        external
        onlyExecutor
        nonReentrant
        whenNotPaused
    {
        require(requestId < requests.length, "invalid request");
        WithdrawalRequest storage req = requests[requestId];
        require(!req.executed, "already executed");
        require(
            block.timestamp >= req.timestamp + withdrawalTimelock,
            "timelock not expired"
        );

        _resetDailyLimit();

        uint256 newDailyTotal = dailyWithdrawn + req.amount;
        require(newDailyTotal <= dailyWithdrawalLimit, "exceeds daily limit");

        dailyWithdrawn = newDailyTotal;
        req.executed = true;

        if (req.token == address(0)) {
            (bool sent,) = req.recipient.call{value: req.amount}("");
            require(sent, "native transfer failed");
        } else {
            IERC20(req.token).safeTransfer(req.recipient, req.amount);
        }

        emit WithdrawalExecuted(requestId, req.recipient, req.token, req.amount);
    }

    function cancelWithdrawal(uint256 requestId) external onlyGuardian {
        require(requestId < requests.length, "invalid request");
        WithdrawalRequest storage req = requests[requestId];
        require(!req.executed, "already executed");
        req.executed = true;
        emit WithdrawalCancelled(requestId);
    }

    function setWithdrawalTimelock(uint256 newTimelock) external onlyGuardian {
        require(
            newTimelock >= MIN_TIMELOCK && newTimelock <= MAX_TIMELOCK,
            "timelock out of range"
        );
        emit TimelockUpdated(withdrawalTimelock, newTimelock);
        withdrawalTimelock = newTimelock;
    }

    function setDailyWithdrawalLimit(uint256 newLimit) external onlyGuardian {
        emit DailyLimitUpdated(dailyWithdrawalLimit, newLimit);
        dailyWithdrawalLimit = newLimit;
    }

    function _resetDailyLimit() internal {
        uint256 today = block.timestamp / 1 days;
        if (today > lastResetDay) {
            dailyWithdrawn = 0;
            lastResetDay = today;
        }
    }

    function getRequestCount() external view returns (uint256) {
        return requests.length;
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokenList;
    }

    receive() external payable {}

    function pause() external onlyGuardian { _pause(); }
    function unpause() external onlyGuardian { _unpause(); }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
