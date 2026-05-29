// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/ILandRegistry.sol";

/**
 * OSANVault Property NFT
 * Real-world asset-backed NFT system
 */
contract PropertyNFT is ERC721, Ownable {

    ILandRegistry public landRegistry;

    uint256 public nextTokenId;

    // parcelId => tokenId
    mapping(uint256 => uint256) public parcelToToken;

    // tokenId => parcelId
    mapping(uint256 => uint256) public tokenToParcel;

    constructor(address _landRegistry) ERC721("OSANVault Property", "OSANP") {
        landRegistry = ILandRegistry(_landRegistry);
    }

    /**
     * Mint NFT ONLY if parcel is valid in registry
     */
    function mintFromParcel(uint256 parcelId, address to) external onlyOwner returns (uint256) {

        require(landRegistry.isParcelValid(parcelId), "Invalid parcel");
        require(parcelToToken[parcelId] == 0, "Already tokenized");

        (
            ,
            ,
            ,
            address owner,
            ,
            ,
            bool exists,
            ,
            ,
            ,
            ,
        ) = landRegistry.parcels(parcelId);

        require(exists, "Parcel does not exist");
        require(owner != address(0), "Invalid owner");

        uint256 tokenId = ++nextTokenId;

        parcelToToken[parcelId] = tokenId;
        tokenToParcel[tokenId] = parcelId;

        _safeMint(to, tokenId);

        return tokenId;
    }

    /**
     * Get linked parcel ID
     */
    function getParcelId(uint256 tokenId) external view returns (uint256) {
        return tokenToParcel[tokenId];
    }

    /**
     * Override transfer rules later (optional compliance layer)
     */
}
