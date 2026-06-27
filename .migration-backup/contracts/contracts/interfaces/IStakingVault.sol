// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IStakingVault — interface for the OsanVault OSANV staking system
interface IStakingVault {
    function stake(uint256 tierIndex, uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claimRewards() external;
    function depositRewards(uint256 amount) external;

    function earned(address account) external view returns (uint256);
    function getStakeInfo(address account) external view returns (
        uint256 tier,
        uint256 amount,
        uint256 lockEnd,
        uint256 pendingRewards
    );
    function totalStakedAcrossAllTiers() external view returns (uint256);
}
