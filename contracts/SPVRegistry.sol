// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @title SPVRegistry - Legal ownership layer for Special Purpose Vehicles
contract SPVRegistry is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice SPV struct containing legal entity details.
    struct SPV {
        uint256 spvId;
        string name;
        string jurisdiction;
        string registrationNumber;
        string legalDocumentCID;
        bool verified;
        uint256 createdAt;
        address creator;
    }

    uint256 private _nextSPVId;
    mapping(uint256 => SPV) private _spvs;
    mapping(uint256 => uint256[]) private _assetsLinked;

    event SPVRegistered(uint256 indexed spvId, string name, string jurisdiction, address indexed creator);
    event SPVVerified(uint256 indexed spvId, address indexed verifier);
    event AssetLinkedToSPV(uint256 indexed spvId, uint256 indexed assetId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, REGISTRAR_ROLE, VERIFIER_ROLE, and UPGRADER_ROLE.
    function initialize(address admin) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    /// @notice Register a new SPV.
    /// @param name_ Legal name of the SPV.
    /// @param jurisdiction_ Jurisdiction where the SPV is incorporated.
    /// @param registrationNumber_ Official registration number.
    /// @param legalDocumentCID_ IPFS CID pointing to the legal incorporation documents.
    /// @return spvId The newly assigned SPV ID.
    function registerSPV(
        string calldata name_,
        string calldata jurisdiction_,
        string calldata registrationNumber_,
        string calldata legalDocumentCID_
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused returns (uint256 spvId) {
        spvId = ++_nextSPVId;
        _spvs[spvId] = SPV({
            spvId: spvId,
            name: name_,
            jurisdiction: jurisdiction_,
            registrationNumber: registrationNumber_,
            legalDocumentCID: legalDocumentCID_,
            verified: false,
            createdAt: block.timestamp,
            creator: msg.sender
        });
        emit SPVRegistered(spvId, name_, jurisdiction_, msg.sender);
    }

    /// @notice Verify an SPV, confirming its legal standing.
    /// @param spvId_ The ID of the SPV to verify.
    function verifySPV(uint256 spvId_) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(spvId_ > 0 && spvId_ <= _nextSPVId, "SPV not found");
        require(!_spvs[spvId_].verified, "already verified");
        _spvs[spvId_].verified = true;
        emit SPVVerified(spvId_, msg.sender);
    }

    /// @notice Link an asset to an SPV.
    /// @param spvId_ The SPV ID.
    /// @param assetId_ The asset ID to link.
    function linkAssetToSPV(uint256 spvId_, uint256 assetId_)
        external onlyRole(REGISTRAR_ROLE) whenNotPaused
    {
        require(spvId_ > 0 && spvId_ <= _nextSPVId, "SPV not found");
        _assetsLinked[spvId_].push(assetId_);
        emit AssetLinkedToSPV(spvId_, assetId_);
    }

    /// @notice Get full details of an SPV.
    /// @param spvId_ The ID of the SPV.
    /// @return The SPV struct.
    function getSPV(uint256 spvId_) external view returns (SPV memory) {
        require(spvId_ > 0 && spvId_ <= _nextSPVId, "SPV not found");
        return _spvs[spvId_];
    }

    /// @notice Get all asset IDs linked to an SPV.
    /// @param spvId_ The SPV ID.
    /// @return Array of linked asset IDs.
    function getLinkedAssets(uint256 spvId_) external view returns (uint256[] memory) {
        require(spvId_ > 0 && spvId_ <= _nextSPVId, "SPV not found");
        return _assetsLinked[spvId_];
    }

    /// @notice Get total number of SPVs registered.
    /// @return SPV count.
    function getSPVCount() external view returns (uint256) { return _nextSPVId; }

    /// @notice Pause the contract.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
