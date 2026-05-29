// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * OSANVault Land Registry Interface
 * Source of truth for real-world land / parcel assets
 */
interface ILandRegistry {

    struct ParcelView {
        uint256 id;
        string location;
        string metadataURI;
        address owner;
        bytes32 geoHash;
        address verifiedBy;
        bool exists;
        bool isLocked;
        bool isCollateralized;
        bool isTokenized;
        uint256 valuation;
        uint256 lastUpdated;
    }

    function parcels(uint256 id)
        external
        view
        returns (
            uint256 id_,
            string memory location,
            string memory metadataURI,
            address owner,
            bytes32 geoHash,
            address verifiedBy,
            bool exists,
            bool isLocked,
            bool isCollateralized,
            bool isTokenized,
            uint256 valuation,
            uint256 lastUpdated
        );

    function isParcelValid(uint256 id) external view returns (bool);

    function getParcelOwner(uint256 id) external view returns (address);

    function getParcelValue(uint256 id) external view returns (uint256);
}
