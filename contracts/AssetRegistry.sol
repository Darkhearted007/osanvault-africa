// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
/// @title AssetRegistry - Single source of truth for every asset
contract AssetRegistry is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    enum AssetType { REAL_ESTATE, LAND, CARBON, MINERAL, REIT }
    enum AssetStatus { ACTIVE, INACTIVE }

    struct Asset {
        uint256 assetId;
        AssetType assetType;
        string metadataURI;
        uint256 linkedSPV;
        AssetStatus status;
        uint256 createdAt;
        address registrar;
    }

    uint256 private _nextAssetId;
    mapping(uint256 => Asset) private _assets;
    mapping(AssetType => uint256[]) private _assetsByType;

    event AssetRegistered(uint256 indexed assetId, AssetType indexed assetType, address indexed registrar);
    event AssetUpdated(uint256 indexed assetId, string newMetadataURI);
    event AssetDeactivated(uint256 indexed assetId);
    event AssetActivated(uint256 indexed assetId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, REGISTRAR_ROLE, and UPGRADER_ROLE.
    function initialize(address admin) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    /// @notice Register a new asset in the protocol.
    /// @param assetType_ The type of asset (REAL_ESTATE, LAND, CARBON, MINERAL, REIT).
    /// @param metadataURI_ URI pointing to the asset's metadata.
    /// @param linkedSPV_ The SPV ID this asset is linked to (0 if none).
    /// @return assetId The newly assigned asset ID.
    function registerAsset(AssetType assetType_, string calldata metadataURI_, uint256 linkedSPV_)
        external onlyRole(REGISTRAR_ROLE) whenNotPaused returns (uint256 assetId)
    {
        assetId = ++_nextAssetId;
        _assets[assetId] = Asset({
            assetId: assetId,
            assetType: assetType_,
            metadataURI: metadataURI_,
            linkedSPV: linkedSPV_,
            status: AssetStatus.ACTIVE,
            createdAt: block.timestamp,
            registrar: msg.sender
        });
        _assetsByType[assetType_].push(assetId);
        emit AssetRegistered(assetId, assetType_, msg.sender);
    }

    /// @notice Update an existing asset's metadata URI.
    /// @param assetId_ The ID of the asset to update.
    /// @param metadataURI_ New metadata URI.
    function updateAsset(uint256 assetId_, string calldata metadataURI_)
        external onlyRole(REGISTRAR_ROLE) whenNotPaused
    {
        require(assetId_ > 0 && assetId_ <= _nextAssetId, "asset not found");
        _assets[assetId_].metadataURI = metadataURI_;
        emit AssetUpdated(assetId_, metadataURI_);
    }

    /// @notice Deactivate an asset, marking it INACTIVE.
    /// @param assetId_ The ID of the asset to deactivate.
    function deactivateAsset(uint256 assetId_)
        external onlyRole(REGISTRAR_ROLE) whenNotPaused
    {
        require(assetId_ > 0 && assetId_ <= _nextAssetId, "asset not found");
        require(_assets[assetId_].status == AssetStatus.ACTIVE, "already inactive");
        _assets[assetId_].status = AssetStatus.INACTIVE;
        emit AssetDeactivated(assetId_);
    }

    /// @notice Reactivate a previously deactivated asset.
    /// @param assetId_ The ID of the asset to activate.
    function activateAsset(uint256 assetId_)
        external onlyRole(REGISTRAR_ROLE) whenNotPaused
    {
        require(assetId_ > 0 && assetId_ <= _nextAssetId, "asset not found");
        require(_assets[assetId_].status == AssetStatus.INACTIVE, "already active");
        _assets[assetId_].status = AssetStatus.ACTIVE;
        emit AssetActivated(assetId_);
    }

    /// @notice Get full details of an asset.
    /// @param assetId_ The ID of the asset.
    /// @return The Asset struct.
    function getAsset(uint256 assetId_) external view returns (Asset memory) {
        require(assetId_ > 0 && assetId_ <= _nextAssetId, "asset not found");
        return _assets[assetId_];
    }

    /// @notice Get all asset IDs of a given type.
    /// @param assetType_ The asset type to filter by.
    /// @return Array of asset IDs.
    function getAssetsByType(AssetType assetType_) external view returns (uint256[] memory) {
        return _assetsByType[assetType_];
    }

    /// @notice Get total number of assets registered.
    /// @return Asset count.
    function getAssetCount() external view returns (uint256) {
        return _nextAssetId;
    }

    /// @notice Pause the contract.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
