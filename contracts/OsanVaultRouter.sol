// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title OsanVaultRouter - Unified frontend interface for ÒsánVault protocol
/// @notice Provides a stable entry point that delegates calls to upgradeable sub-contracts
/// @dev Prevents frontend breakage when sub-contracts are upgraded. UUPS upgradeable with reentrancy protection.
contract OsanVaultRouter is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant CONFIG_ROLE = keccak256("CONFIG_ROLE");

    address public assetRegistry;
    address public spvRegistry;
    address public complianceManager;
    address public revenueDistributionEngine;
    address public payoutManager;
    address public landRegistry;
    address public carbonRegistry;
    address public carbonRetirement;
    address public marketplace;
    address public pppRegistry;
    address public mineralsModule;
    address public riskEngine;
    address public treasuryVault;
    address public osanCarbon;

    event ContractUpdated(string indexed name, address indexed oldAddress, address indexed newAddress);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract
    /// @param admin Address to receive admin roles
    function initialize(address admin) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CONFIG_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    // ---- Configuration ----

    /// @notice Sets or updates the address of a sub-contract
    /// @param name_ Contract name identifier (e.g. "AssetRegistry", "SPVRegistry")
    /// @param address_ New contract address
    function setContract(string calldata name_, address address_) external onlyRole(CONFIG_ROLE) {
        require(address_ != address(0), "invalid address");
        if (keccak256(bytes(name_)) == keccak256(bytes("AssetRegistry"))) {
            emit ContractUpdated(name_, assetRegistry, address_);
            assetRegistry = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("SPVRegistry"))) {
            emit ContractUpdated(name_, spvRegistry, address_);
            spvRegistry = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("ComplianceManager"))) {
            emit ContractUpdated(name_, complianceManager, address_);
            complianceManager = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("RevenueDistributionEngine"))) {
            emit ContractUpdated(name_, revenueDistributionEngine, address_);
            revenueDistributionEngine = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("PayoutManager"))) {
            emit ContractUpdated(name_, payoutManager, address_);
            payoutManager = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("LandRegistry"))) {
            emit ContractUpdated(name_, landRegistry, address_);
            landRegistry = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("CarbonRegistry"))) {
            emit ContractUpdated(name_, carbonRegistry, address_);
            carbonRegistry = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("CarbonRetirement"))) {
            emit ContractUpdated(name_, carbonRetirement, address_);
            carbonRetirement = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("Marketplace"))) {
            emit ContractUpdated(name_, marketplace, address_);
            marketplace = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("PPPRegistry"))) {
            emit ContractUpdated(name_, pppRegistry, address_);
            pppRegistry = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("MineralsModule"))) {
            emit ContractUpdated(name_, mineralsModule, address_);
            mineralsModule = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("RiskEngine"))) {
            emit ContractUpdated(name_, riskEngine, address_);
            riskEngine = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("TreasuryVault"))) {
            emit ContractUpdated(name_, treasuryVault, address_);
            treasuryVault = address_;
        } else if (keccak256(bytes(name_)) == keccak256(bytes("OsanCarbon"))) {
            emit ContractUpdated(name_, osanCarbon, address_);
            osanCarbon = address_;
        } else {
            revert("unknown contract name");
        }
    }

    // ---- User-facing functions ----

    /// @notice Buys a property listing via the marketplace
    /// @param marketplace_ Marketplace contract address
    /// @param listingId_ Listing identifier
    /// @param amount_ Amount to purchase
    function buyProperty(
        address marketplace_,
        uint256 listingId_,
        uint256 amount_,
        address, // paymentToken_ (deprecated)
        uint256  // maxTotal_ (deprecated)
    ) external whenNotPaused nonReentrant {
        require(marketplace_ != address(0), "invalid marketplace");
        require(listingId_ > 0, "invalid listing");
        require(amount_ > 0, "invalid amount");

        (bool success, bytes memory data) = marketplace_.call(
            abi.encodeWithSignature("buyListing(uint256,uint256)", listingId_, amount_)
        );
        require(success, "buy failed");
        if (data.length > 0) {
            (bool result) = abi.decode(data, (bool));
            require(result, "marketplace operation failed");
        }
    }

    /// @notice Claims yield for a revenue stream
    /// @param revenueId_ Revenue stream identifier
    function claimYield(bytes32 revenueId_) external whenNotPaused nonReentrant {
        require(revenueDistributionEngine != address(0), "RDE not set");
        require(revenueId_ != bytes32(0), "invalid revenue id");

        (bool success, bytes memory data) = revenueDistributionEngine.call(
            abi.encodeWithSignature("claimRevenue(bytes32)", revenueId_)
        );
        require(success, "claim failed");
        if (data.length > 0) {
            (bool result) = abi.decode(data, (bool));
            require(result, "revenue claim operation failed");
        }
    }


    /// @notice Retires carbon credits on behalf of the caller
    /// @param projectId_ Carbon project identifier
    /// @param amount_ Credits to retire
    /// @param beneficiary_ Beneficiary name or identifier
    /// @param reason_ Reason for retirement
    function retireCarbonCredits(
        uint256 projectId_,
        uint256 amount_,
        string calldata beneficiary_,
        string calldata reason_
    ) external whenNotPaused nonReentrant {
        require(carbonRetirement != address(0), "CR not set");
        require(projectId_ > 0, "invalid project");
        require(amount_ > 0, "invalid amount");
        require(bytes(reason_).length > 0, "reason required");

        (bool success, bytes memory data) = carbonRetirement.call(
            abi.encodeWithSignature(
                "retireCredits(uint256,uint256,string,string)",
                projectId_, amount_, beneficiary_, reason_
            )
        );
        require(success, "retirement failed");
        if (data.length > 0) {
            (bool result) = abi.decode(data, (bool));
            require(result, "carbon retirement operation failed");
        }
    }

    /// @notice Pauses the contract
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses the contract
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
