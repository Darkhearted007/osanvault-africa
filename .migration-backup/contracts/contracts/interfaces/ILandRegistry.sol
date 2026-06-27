// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ILandRegistry — interface for the OsanVault land parcel registry
interface ILandRegistry {
    enum VerificationStatus {
        Pending,
        GovernmentVerified,
        IndigenousVerified,
        FullyVerified,
        Disputed
    }

    function registerParcel(
        uint256 propertyId,
        string calldata parcelId,
        string calldata region,
        string calldata coordinates,
        bytes32 metadataHash,
        bytes32 governmentTitleHash,
        address indigenousAuthority
    ) external;

    function verifyGovernment(uint256 propertyId) external;
    function verifyIndigenous(uint256 propertyId) external;
    function isFullyVerified(uint256 propertyId) external view returns (bool);
    function getVerificationStatus(uint256 propertyId) external view returns (VerificationStatus);
    function flagDispute(uint256 propertyId, string calldata reason) external;
    function resolveDispute(uint256 propertyId) external;
    function markTokenized(uint256 propertyId) external;
}
