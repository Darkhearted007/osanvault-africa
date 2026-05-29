// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IFeeRouter — interface for the OsanVault protocol fee distribution router
interface IFeeRouter {
    function routeFees(uint256 amount) external;
    function setReceivers(address treasury, address stakingVault, address team) external;
    function updateFeeSplits(
        uint256 treasuryBps,
        uint256 burnBps,
        uint256 stakingBps,
        uint256 teamBps
    ) external;
    function getTreasury() external view returns (address);
    function getStakingVault() external view returns (address);
}
