// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title PropertyNFT
 * @notice Copyright (c) 2025-2026 ÒsánVault Africa. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY
 * 
 * This smart contract is the exclusive property of ÒsánVault Africa.
 * Unauthorized copying, deployment, modification, or use of this contract,
 * via any medium, is strictly prohibited without explicit written
 * permission from ÒsánVault Africa.
 */

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../interfaces/ILandRegistry.sol";
import "../interfaces/IPropertyNFT.sol";
import "../libraries/Errors.sol";

/// @title PropertyNFT — ERC-1155 fractional property SPV tokens
/// @notice Each token ID represents one property SPV. Holders own fractions.
///         Minting is gated by LandRegistry: both government title and indigenous authority
///         must be verified before any fraction can be issued.
///         Implements ERC-2981 on-chain royalties for secondary market compliance.
contract PropertyNFT is
    Initializable,
    ERC1155Upgradeable,
    ERC1155SupplyUpgradeable,
    ERC1155PausableUpgradeable,
    ERC2981,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    IPropertyNFT
{
    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE       = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE      = keccak256("MINTER_ROLE");
    bytes32 public constant URI_MANAGER_ROLE = keccak256("URI_MANAGER_ROLE");

    // ─── Data ──────────────────────────────────────────────────────────────
    struct PropertyInfo {
        uint256 maxSupply;
        string  name;
        string  location;
        string  jurisdiction;
        string  legalDocCID;
        uint256 createdAt;
        bool    exists;
    }

    ILandRegistry public landRegistry;
    uint256 public propertyCount;
    mapping(uint256 => PropertyInfo) private _properties;
    mapping(uint256 => string)       private _tokenURIs;

    // ─── Events ────────────────────────────────────────────────────────────
    event PropertyCreated(
        uint256 indexed id,
        string  name,
        uint256 maxSupply,
        string  location,
        string  jurisdiction
    );
    event TokensMinted(uint256 indexed propertyId, address indexed to, uint256 amount);
    event MetadataUpdated(uint256 indexed propertyId, string newURI);
    event LandRegistryUpdated(address indexed newRegistry);
    event RoyaltySet(uint256 indexed propertyId, address receiver, uint96 feeBps);

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin, address landRegistry_) public initializer {
        if (landRegistry_ == address(0)) revert Errors.ZeroAddress();
        __ERC1155_init("");
        __ERC1155Supply_init();
        __ERC1155Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE,         admin);
        _grantRole(MINTER_ROLE,        admin);
        _grantRole(URI_MANAGER_ROLE,   admin);

        landRegistry = ILandRegistry(landRegistry_);
    }

    // ─── Property Management ───────────────────────────────────────────────

    /// @notice Register a new property SPV. Must have land registry entry first.
    function createProperty(
        string calldata name,
        uint256         maxSupply,
        string calldata location,
        string calldata jurisdiction,
        string calldata metadataURI,
        string calldata legalDocCID
    ) external override onlyRole(ADMIN_ROLE) returns (uint256 propertyId) {
        if (maxSupply == 0) revert Errors.ZeroAmount();
        propertyId = ++propertyCount;
        _properties[propertyId] = PropertyInfo({
            maxSupply:    maxSupply,
            name:         name,
            location:     location,
            jurisdiction: jurisdiction,
            legalDocCID:  legalDocCID,
            createdAt:    block.timestamp,
            exists:       true
        });
        _tokenURIs[propertyId] = metadataURI;
        emit PropertyCreated(propertyId, name, maxSupply, location, jurisdiction);
    }

    /// @notice Mint fraction tokens. Requires dual land verification.
    function mint(
        address to,
        uint256 propertyId,
        uint256 amount
    ) external override onlyRole(MINTER_ROLE) whenNotPaused {
        PropertyInfo storage p = _properties[propertyId];
        if (!p.exists) revert Errors.PropertyDoesNotExist();
        if (totalSupply(propertyId) + amount > p.maxSupply) revert Errors.MaxSupplyExceeded();
        if (!landRegistry.isFullyVerified(propertyId)) revert Errors.LandNotFullyVerified();
        _mint(to, propertyId, amount, "");
        emit TokensMinted(propertyId, to, amount);
    }

    /// @notice Batch-mint fractions across multiple properties.
    function mintBatch(
        address           to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external override onlyRole(MINTER_ROLE) whenNotPaused {
        if (ids.length != amounts.length) revert Errors.ArrayLengthMismatch();
        for (uint256 i = 0; i < ids.length; i++) {
            PropertyInfo storage p = _properties[ids[i]];
            if (!p.exists) revert Errors.PropertyDoesNotExist();
            if (totalSupply(ids[i]) + amounts[i] > p.maxSupply) revert Errors.MaxSupplyExceeded();
            if (!landRegistry.isFullyVerified(ids[i])) revert Errors.LandNotFullyVerified();
        }
        _mintBatch(to, ids, amounts, "");
    }

    // ─── Royalties ─────────────────────────────────────────────────────────

    /// @notice Set ERC-2981 royalty for a specific property token
    function setRoyalty(
        uint256  propertyId,
        address  receiver,
        uint96   feeBps
    ) external onlyRole(ADMIN_ROLE) {
        if (receiver == address(0)) revert Errors.ZeroAddress();
        _setTokenRoyalty(propertyId, receiver, feeBps);
        emit RoyaltySet(propertyId, receiver, feeBps);
    }

    function setDefaultRoyalty(
        address receiver,
        uint96  feeBps
    ) external onlyRole(ADMIN_ROLE) {
        _setDefaultRoyalty(receiver, feeBps);
    }

    // ─── URI Management ────────────────────────────────────────────────────

    function updatePropertyURI(
        uint256         propertyId,
        string calldata newURI
    ) external onlyRole(URI_MANAGER_ROLE) {
        if (!_properties[propertyId].exists) revert Errors.PropertyDoesNotExist();
        _tokenURIs[propertyId] = newURI;
        emit MetadataUpdated(propertyId, newURI);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // ─── Admin ─────────────────────────────────────────────────────────────

    function setLandRegistry(address newRegistry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newRegistry == address(0)) revert Errors.ZeroAddress();
        landRegistry = ILandRegistry(newRegistry);
        emit LandRegistryUpdated(newRegistry);
    }

    function getProperty(uint256 propertyId) external view returns (PropertyInfo memory) {
        return _properties[propertyId];
    }

    function pause()   external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    // ─── Required Overrides ────────────────────────────────────────────────

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable, ERC1155PausableUpgradeable) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public view
        override(ERC1155Upgradeable, ERC2981, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
