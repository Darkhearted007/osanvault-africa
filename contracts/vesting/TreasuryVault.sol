// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TreasuryVault is Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public dailyWithdrawalLimit;
    uint256 public lastWithdrawalReset;
    uint256 public withdrawnToday;

    event Withdrawal(address indexed to, uint256 amount, address indexed caller);
    event DailyLimitUpdated(uint256 oldLimit, uint256 newLimit);

    constructor(address tokenAddress, address ownerAddress, uint256 withdrawalLimit) Ownable(ownerAddress) {
        require(tokenAddress != address(0), "invalid token");
        require(ownerAddress != address(0), "invalid owner");
        require(withdrawalLimit > 0, "limit zero");
        token = IERC20(tokenAddress);
        dailyWithdrawalLimit = withdrawalLimit;
        lastWithdrawalReset = block.timestamp;
    }

    function withdraw(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(to != address(0), "invalid recipient");
        require(amount > 0, "amount zero");
        require(amount <= token.balanceOf(address(this)), "insufficient balance");
        _resetDailyLimitIfNeeded();
        require(amount <= dailyWithdrawalLimit, "exceeds daily limit");
        withdrawnToday += amount;
        token.safeTransfer(to, amount);
        emit Withdrawal(to, amount, msg.sender);
    }

    function setDailyLimit(uint256 newLimit) external onlyOwner {
        require(newLimit > 0, "limit zero");
        uint256 oldLimit = dailyWithdrawalLimit;
        dailyWithdrawalLimit = newLimit;
        emit DailyLimitUpdated(oldLimit, newLimit);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _resetDailyLimitIfNeeded() internal {
        if (block.timestamp >= lastWithdrawalReset + 1 days) {
            withdrawnToday = 0;
            lastWithdrawalReset = block.timestamp;
        }
    }
}