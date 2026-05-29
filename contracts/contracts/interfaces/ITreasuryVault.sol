// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ITreasuryVault — interface for the OsanVault timelocked treasury
interface ITreasuryVault {
    function proposeWithdrawal(
        address token,
        address recipient,
        uint256 amount
    ) external returns (uint256 id);

    function executeWithdrawal(uint256 id) external;
    function cancelWithdrawal(uint256 id) external;
    function getBalance(address token) external view returns (uint256);
    function emergencyFreeze() external;
    function emergencyUnfreeze() external;
    function setDailyLimit(uint256 newLimit) external;
    function setTimelockDuration(uint256 newDuration) external;
}
