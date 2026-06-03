// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @title LandRegistry - Land parcel registration with dual government + indigenous verification
/// @notice Tracks land parcels through a lifecycle from registration to tokenization.
/// @dev Dual verification model designed for African land rights contexts.
contract LandRegistry is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    bytes32 public constant INDIGENOUS_REP_ROLE = keccak256("INDIGENOUS_REP_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice Lifecycle state machine for parcels.
    /// @dev REGISTERED -> PENDING -> VERIFIED -> TOKENIZED.
    ///      Any state can transition to DISPUTED; DISPUTED resolves back to VERIFIED.
    enum ParcelStatus { REGISTERED, PENDING, VERIFIED, DISPUTED, TOKENIZED }

    /// @notice Full parcel record.
    struct Parcel {
        uint256 parcelId;
        string location;
        string jurisdiction;
        string titleDeedCID;
        uint256 area;
        string coordinates;
        ParcelStatus status;
        address owner;
        bool governmentVerified;
        bool indigenousVerified;
        address verifiedBy;
        uint256 spvId;
        uint256 createdAt;
    }

    uint256 private _nextParcelId;
    mapping(uint256 => Parcel) private _parcels;
    mapping(uint256 => string) private _disputeReasons;

    event ParcelRegistered(uint256 indexed parcelId, string location, string jurisdiction, address indexed registrar);
    event ParcelVerificationApplied(uint256 indexed parcelId, address indexed registrar);
    event GovernmentVerified(uint256 indexed parcelId, address indexed verifier);
    event IndigenousVerified(uint256 indexed parcelId, address indexed verifier);
    event ParcelStatusChanged(uint256 indexed parcelId, ParcelStatus oldStatus, ParcelStatus newStatus);
    event ParcelDisputed(uint256 indexed parcelId, string reason, address indexed disputer);
    event ParcelDisputeResolved(uint256 indexed parcelId, address indexed resolver);
    event SPVAssigned(uint256 indexed parcelId, uint256 spvId, address indexed registrar);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, REGISTRAR_ROLE, GOVERNMENT_ROLE, INDIGENOUS_REP_ROLE, UPGRADER_ROLE.
    function initialize(address admin) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(GOVERNMENT_ROLE, admin);
        _grantRole(INDIGENOUS_REP_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    /// @notice Register a new land parcel.
    /// @param location_ Geographic location description.
    /// @param jurisdiction_ Governing jurisdiction.
    /// @param titleDeedCID_ IPFS CID for the title deed document.
    /// @param area_ Land area in square meters.
    /// @param coordinates_ Geospatial coordinates.
    /// @return parcelId The newly assigned parcel ID.
    function registerParcel(
        string calldata location_,
        string calldata jurisdiction_,
        string calldata titleDeedCID_,
        uint256 area_,
        string calldata coordinates_
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused returns (uint256 parcelId) {
        require(area_ > 0, "area zero");
        require(bytes(location_).length > 0, "empty location");
        require(bytes(jurisdiction_).length > 0, "empty jurisdiction");
        parcelId = ++_nextParcelId;
        _parcels[parcelId] = Parcel({
            parcelId: parcelId,
            location: location_,
            jurisdiction: jurisdiction_,
            titleDeedCID: titleDeedCID_,
            area: area_,
            coordinates: coordinates_,
            status: ParcelStatus.REGISTERED,
            owner: address(0),
            governmentVerified: false,
            indigenousVerified: false,
            verifiedBy: address(0),
            spvId: 0,
            createdAt: block.timestamp
        });
        emit ParcelRegistered(parcelId, location_, jurisdiction_, msg.sender);
    }

    /// @notice Submit a registered parcel for verification.
    /// @param parcelId_ The parcel ID to submit.
    function applyForVerification(uint256 parcelId_) external onlyRole(REGISTRAR_ROLE) whenNotPaused {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        Parcel storage p = _parcels[parcelId_];
        require(p.status == ParcelStatus.REGISTERED, "not registered");
        _setStatus(parcelId_, p, ParcelStatus.PENDING);
        emit ParcelVerificationApplied(parcelId_, msg.sender);
    }

    /// @notice Government approval of a parcel.
    /// @param parcelId_ The parcel ID to verify.
    function verifyGovernment(uint256 parcelId_) external onlyRole(GOVERNMENT_ROLE) whenNotPaused {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        Parcel storage p = _parcels[parcelId_];
        require(p.status == ParcelStatus.PENDING, "not pending");
        require(!p.governmentVerified, "gov already verified");
        p.governmentVerified = true;
        p.verifiedBy = msg.sender;
        emit GovernmentVerified(parcelId_, msg.sender);
        _checkDualVerification(parcelId_, p);
    }

    /// @notice Indigenous representative approval of a parcel.
    /// @param parcelId_ The parcel ID to verify.
    function verifyIndigenous(uint256 parcelId_) external onlyRole(INDIGENOUS_REP_ROLE) whenNotPaused {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        Parcel storage p = _parcels[parcelId_];
        require(p.status == ParcelStatus.PENDING, "not pending");
        require(!p.indigenousVerified, "indigenous already verified");
        p.indigenousVerified = true;
        p.verifiedBy = msg.sender;
        emit IndigenousVerified(parcelId_, msg.sender);
        _checkDualVerification(parcelId_, p);
    }

    /// @notice Raise a dispute on any parcel.
    /// @param parcelId_ The parcel ID to dispute.
    /// @param reason_ Reason for the dispute.
    function raiseDispute(uint256 parcelId_, string calldata reason_) external whenNotPaused {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        Parcel storage p = _parcels[parcelId_];
        require(p.status != ParcelStatus.DISPUTED, "already disputed");
        require(p.status != ParcelStatus.TOKENIZED, "already tokenized");
        _disputeReasons[parcelId_] = reason_;
        _setStatus(parcelId_, p, ParcelStatus.DISPUTED);
        emit ParcelDisputed(parcelId_, reason_, msg.sender);
    }

    /// @notice Resolve a dispute and return parcel to VERIFIED.
    /// @param parcelId_ The parcel ID to resolve.
    function resolveDispute(uint256 parcelId_) external onlyRole(GOVERNMENT_ROLE) whenNotPaused {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        Parcel storage p = _parcels[parcelId_];
        require(p.status == ParcelStatus.DISPUTED, "not disputed");
        require(p.governmentVerified && p.indigenousVerified, "dual verification missing");
        _setStatus(parcelId_, p, ParcelStatus.VERIFIED);
        emit ParcelDisputeResolved(parcelId_, msg.sender);
    }

    /// @notice Assign an SPV to a verified parcel and mark as TOKENIZED.
    /// @param parcelId_ The parcel ID to assign.
    /// @param spvId_ The SPV ID to link.
    function assignSPV(uint256 parcelId_, uint256 spvId_) external onlyRole(REGISTRAR_ROLE) whenNotPaused {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        Parcel storage p = _parcels[parcelId_];
        require(p.status == ParcelStatus.VERIFIED, "not verified");
        require(spvId_ > 0, "invalid spv");
        p.spvId = spvId_;
        _setStatus(parcelId_, p, ParcelStatus.TOKENIZED);
        emit SPVAssigned(parcelId_, spvId_, msg.sender);
    }

    /// @notice Get full parcel details.
    /// @param parcelId_ The parcel ID.
    /// @return The Parcel struct.
    function getParcel(uint256 parcelId_) external view returns (Parcel memory) {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        return _parcels[parcelId_];
    }

    /// @notice Get the dispute reason for a parcel.
    /// @param parcelId_ The parcel ID.
    /// @return The dispute reason string.
    function getDisputeReason(uint256 parcelId_) external view returns (string memory) {
        return _disputeReasons[parcelId_];
    }

    /// @notice Total number of parcels registered.
    /// @return Parcel count.
    function getParcelCount() external view returns (uint256) {
        return _nextParcelId;
    }

    /// @notice Get the status of a parcel.
    /// @param parcelId_ The parcel ID.
    /// @return The ParcelStatus enum value.
    function getParcelStatus(uint256 parcelId_) external view returns (ParcelStatus) {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        return _parcels[parcelId_].status;
    }

    /// @notice Get the jurisdiction of a parcel.
    /// @param parcelId_ The parcel ID.
    /// @return The jurisdiction string.
    function getParcelJurisdiction(uint256 parcelId_) external view returns (string memory) {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        return _parcels[parcelId_].jurisdiction;
    }

    /// @notice Get the SPV ID linked to a parcel.
    /// @param parcelId_ The parcel ID.
    /// @return The SPV ID (0 if none).
    function getParcelSPVId(uint256 parcelId_) external view returns (uint256) {
        require(parcelId_ > 0 && parcelId_ <= _nextParcelId, "parcel not found");
        return _parcels[parcelId_].spvId;
    }

    /// @notice Pause the contract.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @notice Transition parcel status and emit event.
    /// @param parcelId_ The parcel ID.
    /// @param p_ Storage reference to the parcel.
    /// @param newStatus_ Target status.
    function _setStatus(uint256 parcelId_, Parcel storage p_, ParcelStatus newStatus_) internal {
        ParcelStatus oldStatus = p_.status;
        p_.status = newStatus_;
        emit ParcelStatusChanged(parcelId_, oldStatus, newStatus_);
    }

    /// @notice If both government and indigenous have verified, promote to VERIFIED.
    /// @param parcelId_ The parcel ID.
    /// @param p_ Storage reference to the parcel.
    function _checkDualVerification(uint256 parcelId_, Parcel storage p_) internal {
        if (p_.governmentVerified && p_.indigenousVerified) {
            _setStatus(parcelId_, p_, ParcelStatus.VERIFIED);
        }
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
