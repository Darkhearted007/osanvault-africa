// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IPropertyNFT — interface for the OsanVault fractional property token
interface IPropertyNFT {
    function createProperty(
        string calldata name,
        uint256 maxSupply,
        string calldata location,
        string calldata jurisdiction,
        string calldata metadataURI,
        string calldata legalDocCID
    ) external returns (uint256 propertyId);

    function mint(address to, uint256 propertyId, uint256 amount) external;
    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts) external;
    function pause() external;
    function unpause() external;
}
