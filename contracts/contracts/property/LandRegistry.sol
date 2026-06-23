// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title LandRegistry
 * @notice Copyright (c) 2025-2026 ÒsánVault Africa. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY
 * 
 * This smart contract is the exclusive property of ÒsánVault Africa.
 * Unauthorized copying, deployment, modification, or use of this contract,
 * via any medium, is strictly prohibited without explicit written
 * permission from ÒsánVault Africa.
 */

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../interfaces/ILandRegistry.sol";
import "../libraries/Errors.sol";

/// @title LandRegistry — on-chain African land parcel registry with dual verification
/// @notice Full parcel registration: GIS coordinates, government title, indigenous authority.
///         Both verifications must be confirmed before PropertyNFT can mint tokens for a parcel.
///         Supports dispute flagging, regional authorities, and registry audit trail.
contract LandRegistry is Initializable, AccessControlUpgradeable, UUPSUpgradeable, ILandRegistry {
    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant REGISTRAR_ROLE        = keccak256("REGISTRAR_ROLE");
    bytes32 public constant VERIFIER_ROLE         = keccak256("VERIFIER_ROLE");
    bytes32 public constant DISPUTE_RESOLVER_ROLE = keccak256("DISPUTE_RESOLVER_ROLE");
    bytes32 public constant PROPERTY_NFT_ROLE     = keccak256("PROPERTY_NFT_ROLE");

    // ─── Data ──────────────────────────────────────────────────────────────
    struct LandParcel {
        // Identification
        string  parcelId;              // Official government parcel ID
        string  region;                // State / region (e.g. "Lagos", "Accra")
        string  coordinates;           // GIS coordinate string or what3words reference
        // Ownership
        address owner;
        // Document hashes
        bytes32 metadataHash;          // IPFS CID of full parcel metadata bundle
        bytes32 governmentTitleHash;   // Hash of government title document
        // Verification actors
        address indigenousAuthority;   // On-chain address of indigenous authority
        address governmentVerifier;    // Address that performed government verification
        // Status flags
        VerificationStatus verificationStatus;
        bool    hasDispute;
        bool    tokenized;
        bool    active;
        // Timestamps
        uint256 registeredAt;
        uint256 lastUpdatedAt;
    }

    mapping(uint256 => LandParcel)     private _parcels;
    mapping(uint256 => string[])       private _disputeLog;
    uint256 public parcelCount;

    // ─── Events ────────────────────────────────────────────────────────────
    event ParcelRegistered(
        uint256 indexed propertyId,
        string  parcelId,
        string  region,
        address indexed owner,
        bytes32 governmentTitleHash,
        address indigenousAuthority
    );
    event GovernmentVerified(uint256 indexed propertyId, address indexed verifier);
    event IndigenousVerified(uint256 indexed propertyId, address indexed authority);
    event FullyVerified(uint256 indexed propertyId);
    event DisputeFlagged(uint256 indexed propertyId, string reason, address indexed flaggedBy);
    event DisputeResolved(uint256 indexed propertyId, address indexed resolvedBy);
    event ParcelTokenized(uint256 indexed propertyId);
    event MetadataUpdated(uint256 indexed propertyId, bytes32 newHash);

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin) public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE,     admin);
        _grantRole(REGISTRAR_ROLE,         admin);
        _grantRole(VERIFIER_ROLE,          admin);
        _grantRole(DISPUTE_RESOLVER_ROLE,  admin);
    }

    // ─── Registration ──────────────────────────────────────────────────────

    function registerParcel(
        string calldata parcelId,
        string calldata region,
        string calldata coordinates,
        address         owner,
        bytes32         governmentTitleHash,
        address         indigenousAuthority,
        bytes32         metadataHash
    ) external override onlyRole(REGISTRAR_ROLE) returns (uint256 propertyId) {
        if (owner == address(0) || indigenousAuthority == address(0)) revert Errors.ZeroAddress();
        propertyId = ++parcelCount;
        _parcels[propertyId] = LandParcel({
            parcelId:             parcelId,
            region:               region,
            coordinates:          coordinates,
            owner:                owner,
            metadataHash:         metadataHash,
            governmentTitleHash:  governmentTitleHash,
            indigenousAuthority:  indigenousAuthority,
            governmentVerifier:   address(0),
            verificationStatus:   VerificationStatus.Unverified,
            hasDispute:           false,
            tokenized:            false,
            active:               true,
            registeredAt:         block.timestamp,
            lastUpdatedAt:        block.timestamp
        });
        emit ParcelRegistered(propertyId, parcelId, region, owner, governmentTitleHash, indigenousAuthority);
    }

    // ─── Verification ──────────────────────────────────────────────────────

    function verifyGovernment(uint256 propertyId) external override onlyRole(VERIFIER_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (!p.active) revert Errors.InvalidState();
        if (p.verificationStatus == VerificationStatus.GovernmentVerified ||
            p.verificationStatus == VerificationStatus.FullyVerified) revert Errors.AlreadyExists();
        
        p.governmentVerifier = msg.sender;
        if (p.verificationStatus == VerificationStatus.IndigenousVerified) {
            p.verificationStatus = VerificationStatus.FullyVerified;
            emit FullyVerified(propertyId);
        } else {
            p.verificationStatus = VerificationStatus.GovernmentVerified;
        }
        p.lastUpdatedAt = block.timestamp;
        emit GovernmentVerified(propertyId, msg.sender);
    }

    function verifyIndigenous(uint256 propertyId) external override {
        LandParcel storage p = _parcels[propertyId];
        if (!p.active) revert Errors.InvalidState();
        if (msg.sender != p.indigenousAuthority) revert Errors.Unauthorized();
        if (p.verificationStatus == VerificationStatus.IndigenousVerified ||
            p.verificationStatus == VerificationStatus.FullyVerified) revert Errors.AlreadyExists();
        
        if (p.verificationStatus == VerificationStatus.GovernmentVerified) {
            p.verificationStatus = VerificationStatus.FullyVerified;
            emit FullyVerified(propertyId);
        } else {
            p.verificationStatus = VerificationStatus.IndigenousVerified;
        }
        p.lastUpdatedAt = block.timestamp;
        emit IndigenousVerified(propertyId, msg.sender);
    }

    // ─── Disputes ──────────────────────────────────────────────────────────

    function flagDispute(
        uint256 propertyId,
        string calldata reason
    ) external override onlyRole(DISPUTE_RESOLVER_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (!p.active) revert Errors.InvalidState();
        p.hasDispute = true;
        p.lastUpdatedAt = block.timestamp;
        _disputeLog[propertyId].push(reason);
        emit DisputeFlagged(propertyId, reason, msg.sender);
    }

    function resolveDispute(uint256 propertyId) external override onlyRole(DISPUTE_RESOLVER_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (!p.hasDispute) revert Errors.InvalidState();
        p.hasDispute = false;
        p.lastUpdatedAt = block.timestamp;
        emit DisputeResolved(propertyId, msg.sender);
    }

    // ─── Tokenization Gate ─────────────────────────────────────────────────

    function markTokenized(uint256 propertyId) external override onlyRole(PROPERTY_NFT_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (p.tokenized) revert Errors.PropertyAlreadyTokenized();
        if (p.verificationStatus != VerificationStatus.FullyVerified) revert Errors.LandNotFullyVerified();
        p.tokenized = true;
        p.lastUpdatedAt = block.timestamp;
        emit ParcelTokenized(propertyId);
    }

    // ─── Views ─────────────────────────────────────────────────────────────

    function isFullyVerified(uint256 propertyId) external view override returns (bool) {
        return _parcels[propertyId].verificationStatus == VerificationStatus.FullyVerified &&
               !_parcels[propertyId].hasDispute;
    }

    function getParcel(uint256 propertyId) external view override returns (
        string memory parcelId,
        string memory region,
        address owner,
        VerificationStatus status,
        bool hasDispute,
        bool tokenized
    ) {
        LandParcel storage p = _parcels[propertyId];
        return (p.parcelId, p.region, p.owner, p.verificationStatus, p.hasDispute, p.tokenized);
    }

    function getDisputeLog(uint256 propertyId) external view returns (string[] memory) {
        return _disputeLog[propertyId];
    }

    // ─── Admin ─────────────────────────────────────────────────────────────

    function updateMetadata(uint256 propertyId, bytes32 newHash) external onlyRole(REGISTRAR_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (!p.active) revert Errors.InvalidState();
        p.metadataHash = newHash;
        p.lastUpdatedAt = block.timestamp;
        emit MetadataUpdated(propertyId, newHash);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
