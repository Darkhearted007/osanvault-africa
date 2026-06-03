// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract MineralsModule is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant MINERAL_ADMIN_ROLE = keccak256("MINERAL_ADMIN_ROLE");
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    enum MineralType { GOLD, LITHIUM, OIL, GAS, QUARRY, COPPER, COBALT, OTHER }

    struct MineralAsset {
        uint256 assetId;
        string name;
        MineralType mineralType;
        string location;
        string jurisdiction;
        string licenseCID;
        uint256 estimatedReserves;
        uint256 linkedAssetId;
        bool verified;
        uint256 createdAt;
        address owner;
    }

    struct ProductionRecord {
        uint256 recordId;
        uint256 assetId;
        uint256 amount;
        uint256 timestamp;
    }

    struct RoyaltyRevenue {
        uint256 assetId;
        uint256 totalRevenue;
        uint256 lastDistribution;
        uint256 distributionPeriod;
    }

    uint256 private _nextAssetId;
    uint256 private _nextProductionId;
    mapping(uint256 => MineralAsset) private _assets;
    mapping(uint256 => ProductionRecord[]) private _production;
    mapping(uint256 => RoyaltyRevenue) private _royalties;
    address public revenueDistributionEngine;

    event MineralAssetRegistered(uint256 indexed assetId, string name, MineralType indexed mineralType, address indexed owner);
    event MineralAssetVerified(uint256 indexed assetId, address indexed verifier);
    event ProductionRecorded(uint256 indexed assetId, uint256 amount, uint256 indexed recordId);
    event RoyaltyRevenueRecorded(uint256 indexed assetId, uint256 amount);
    event RevenueEngineUpdated(address indexed oldEngine, address indexed newEngine);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin, address revenueDistributionEngine_) external initializer {

        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINERAL_ADMIN_ROLE, admin);
        _grantRole(PRODUCER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        revenueDistributionEngine = revenueDistributionEngine_;
    }
    function registerMineralAsset(string calldata name_, MineralType mineralType_, string calldata location_, string calldata jurisdiction_, string calldata licenseCID_, uint256 estimatedReserves_, uint256 linkedAssetId_) external onlyRole(MINERAL_ADMIN_ROLE) whenNotPaused returns (uint256 assetId) {
        assetId = ++_nextAssetId;
        _assets[assetId] = MineralAsset(assetId, name_, mineralType_, location_, jurisdiction_, licenseCID_, estimatedReserves_, linkedAssetId_, false, block.timestamp, msg.sender);
        emit MineralAssetRegistered(assetId, name_, mineralType_, msg.sender);
    }
    function verifyMineralAsset(uint256 assetId_) external onlyRole(MINERAL_ADMIN_ROLE) whenNotPaused {
        require(assetId_ > 0 && assetId_ <= _nextAssetId, "not found");
        require(!_assets[assetId_].verified, "verified");
        _assets[assetId_].verified = true;
        emit MineralAssetVerified(assetId_, msg.sender);
    }
    function recordProduction(uint256 assetId_, uint256 amount_) external onlyRole(PRODUCER_ROLE) whenNotPaused {
        require(assetId_ > 0 && assetId_ <= _nextAssetId, "not found");
        require(_assets[assetId_].verified, "not verified");
        _production[assetId_].push(ProductionRecord(++_nextProductionId, assetId_, amount_, block.timestamp));
        emit ProductionRecorded(assetId_, amount_, _nextProductionId);
    }
    function recordRoyaltyRevenue(uint256 assetId_, uint256 amount_) external onlyRole(MINERAL_ADMIN_ROLE) whenNotPaused {
        require(assetId_ > 0 && assetId_ <= _nextAssetId, "not found");
        _royalties[assetId_].totalRevenue += amount_;
        _royalties[assetId_].lastDistribution = block.timestamp;
        emit RoyaltyRevenueRecorded(assetId_, amount_);
    }
    function getMineralAsset(uint256 assetId_) external view returns (MineralAsset memory) { require(assetId_ > 0 && assetId_ <= _nextAssetId, "not found"); return _assets[assetId_]; }
    function getProductionHistory(uint256 assetId_) external view returns (ProductionRecord[] memory) { return _production[assetId_]; }
    function getRoyaltyRevenue(uint256 assetId_) external view returns (RoyaltyRevenue memory) { return _royalties[assetId_]; }
    function getMineralAssetCount() external view returns (uint256) { return _nextAssetId; }
    function getProductionCount() external view returns (uint256) { return _nextProductionId; }
    function setRevenueDistributionEngine(address newEngine_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newEngine_ != address(0), "invalid");
        emit RevenueEngineUpdated(revenueDistributionEngine, newEngine_);
        revenueDistributionEngine = newEngine_;
    }
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
    uint256[50] private __gap;
}
