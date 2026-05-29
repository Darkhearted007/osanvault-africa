// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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

    /// @notice Register a new land parcel linked to a property ID
    function registerParcel(
        uint256 propertyId,
        string  calldata parcelId,
        string  calldata region,
        string  calldata coordinates,
        bytes32 metadataHash,
        bytes32 governmentTitleHash,
        address indigenousAuthority
    ) external override onlyRole(REGISTRAR_ROLE) {
        if (_parcels[propertyId].registeredAt != 0) revert Errors.AlreadyExists();
        if (indigenousAuthority == address(0)) revert Errors.ZeroAddress();

        _parcels[propertyId] = LandParcel({
            parcelId:             parcelId,
            region:               region,
            coordinates:          coordinates,
            owner:                msg.sender,
            metadataHash:         metadataHash,
            governmentTitleHash:  governmentTitleHash,
            indigenousAuthority:  indigenousAuthority,
            governmentVerifier:   address(0),
            verificationStatus:   VerificationStatus.Pending,
            hasDispute:           false,
            tokenized:            false,
            active:               true,
            registeredAt:         block.timestamp,
            lastUpdatedAt:        block.timestamp
        });
        parcelCount++;

        emit ParcelRegistered(
            propertyId, parcelId, region, msg.sender, governmentTitleHash, indigenousAuthority
        );
    }

    // ─── Verification ──────────────────────────────────────────────────────

    /// @notice Government authority confirms title validity
    function verifyGovernment(uint256 propertyId) external override onlyRole(VERIFIER_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (p.registeredAt == 0) revert Errors.DoesNotExist();
        if (p.hasDispute)        revert Errors.InvalidState();

        p.governmentVerifier  = msg.sender;
        p.lastUpdatedAt       = block.timestamp;

        if (p.verificationStatus == VerificationStatus.IndigenousVerified) {
            p.verificationStatus = VerificationStatus.FullyVerified;
            emit FullyVerified(propertyId);
        } else {
            p.verificationStatus = VerificationStatus.GovernmentVerified;
        }
        emit GovernmentVerified(propertyId, msg.sender);
    }

    /// @notice Indigenous authority self-verifies their approval
    function verifyIndigenous(uint256 propertyId) external override {
        LandParcel storage p = _parcels[propertyId];
        if (p.registeredAt == 0)                          revert Errors.DoesNotExist();
        if (msg.sender != p.indigenousAuthority)          revert Errors.Unauthorized();
        if (p.hasDispute)                                 revert Errors.InvalidState();

        p.lastUpdatedAt = block.timestamp;

        if (p.verificationStatus == VerificationStatus.GovernmentVerified) {
            p.verificationStatus = VerificationStatus.FullyVerified;
            emit FullyVerified(propertyId);
        } else {
            p.verificationStatus = VerificationStatus.IndigenousVerified;
        }
        emit IndigenousVerified(propertyId, msg.sender);
    }

    // ─── Dispute Handling ──────────────────────────────────────────────────

    function flagDispute(
        uint256 propertyId,
        string calldata reason
    ) external override onlyRole(DISPUTE_RESOLVER_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (p.registeredAt == 0) revert Errors.DoesNotExist();
        p.hasDispute          = true;
        p.verificationStatus  = VerificationStatus.Disputed;
        p.lastUpdatedAt       = block.timestamp;
        _disputeLog[propertyId].push(reason);
        emit DisputeFlagged(propertyId, reason, msg.sender);
    }

    function resolveDispute(uint256 propertyId) external override onlyRole(DISPUTE_RESOLVER_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (p.registeredAt == 0) revert Errors.DoesNotExist();
        p.hasDispute          = false;
        p.verificationStatus  = VerificationStatus.Pending;
        p.lastUpdatedAt       = block.timestamp;
        emit DisputeResolved(propertyId, msg.sender);
    }

    // ─── Tokenization Gate ─────────────────────────────────────────────────

    /// @notice Called by PropertyNFT after first mint to mark parcel as tokenized
    function markTokenized(uint256 propertyId) external override onlyRole(PROPERTY_NFT_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (p.registeredAt == 0) revert Errors.DoesNotExist();
        p.tokenized     = true;
        p.lastUpdatedAt = block.timestamp;
        emit ParcelTokenized(propertyId);
    }

    // ─── Admin ─────────────────────────────────────────────────────────────

    function updateMetadata(
        uint256 propertyId,
        bytes32 newHash
    ) external onlyRole(REGISTRAR_ROLE) {
        LandParcel storage p = _parcels[propertyId];
        if (p.registeredAt == 0) revert Errors.DoesNotExist();
        p.metadataHash  = newHash;
        p.lastUpdatedAt = block.timestamp;
        emit MetadataUpdated(propertyId, newHash);
    }

    // ─── Views ─────────────────────────────────────────────────────────────

    function isFullyVerified(uint256 propertyId) external view override returns (bool) {
        return _parcels[propertyId].verificationStatus == VerificationStatus.FullyVerified;
    }

    function getVerificationStatus(uint256 propertyId)
        external view override returns (VerificationStatus)
    {
        return _parcels[propertyId].verificationStatus;
    }

    function getParcel(uint256 propertyId) external view returns (LandParcel memory) {
        return _parcels[propertyId];
    }

    function getDisputeLog(uint256 propertyId) external view returns (string[] memory) {
        return _disputeLog[propertyId];
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
