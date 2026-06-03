// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Marketplace - Property token marketplace for ERC-1155 tokens
/// @notice Enables listing and trading of tokenized assets with fee collection.
/// @dev Supports ERC-1155 tokens with ERC-20 payment. Uses UUPS upgradeable pattern.
contract Marketplace is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant MARKET_ADMIN_ROLE = keccak256("MARKET_ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice A fixed-price listing for ERC-1155 tokens.
    struct Listing {
        uint256 listingId;
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 amount;
        address currency;
        uint256 pricePerUnit;
        uint256 totalPrice;
        bool active;
        uint256 createdAt;
    }

    uint256 private _nextListingId;
    uint256 public marketplaceFee;
    address public treasuryVault;
    address public complianceManager;
    address public riskEngine;
    uint16 public riskThreshold;
    mapping(uint256 => Listing) private _listings;

    event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed tokenAddress, uint256 tokenId, uint256 amount, uint256 pricePerUnit);
    event ListingCancelled(uint256 indexed listingId);
    event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryVaultUpdated(address indexed oldVault, address indexed newVault);
    event ComplianceManagerUpdated(address indexed oldManager, address indexed newManager);
    event RiskEngineUpdated(address indexed oldEngine, address indexed newEngine);
    event HighRiskAssetPurchase(uint256 indexed listingId, address indexed buyer, uint16 riskScore);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, MARKET_ADMIN_ROLE, UPGRADER_ROLE.
    /// @param treasuryVault_ Address receiving marketplace fees.
    /// @param complianceManager_ Address of the compliance manager contract.
    /// @param marketplaceFee_ Fee in basis points (e.g., 250 = 2.5%).
    function initialize(
        address admin,
        address treasuryVault_,
        address complianceManager_,
        uint256 marketplaceFee_
    ) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MARKET_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        require(treasuryVault_ != address(0), "invalid vault");
        require(complianceManager_ != address(0), "invalid manager");
        treasuryVault = treasuryVault_;
        complianceManager = complianceManager_;
        marketplaceFee = marketplaceFee_;
        riskThreshold = 700;
    }

    /// @notice Create a new fixed-price listing.
    /// @param tokenAddress_ ERC-1155 token contract address.
    /// @param tokenId_ Token ID to sell.
    /// @param amount_ Number of tokens to list.
    /// @param currency_ ERC-20 payment token address.
    /// @param pricePerUnit_ Price per token unit in `currency_`.
    /// @return listingId The newly created listing ID.
    function createListing(
        address tokenAddress_,
        uint256 tokenId_,
        uint256 amount_,
        address currency_,
        uint256 pricePerUnit_
    ) external whenNotPaused returns (uint256 listingId) {
        require(tokenAddress_ != address(0), "invalid token");
        require(currency_ != address(0), "invalid currency");
        require(amount_ > 0, "amount zero");
        require(pricePerUnit_ > 0, "price zero");
        IERC1155 token = IERC1155(tokenAddress_);
        require(token.balanceOf(msg.sender, tokenId_) >= amount_, "insufficient balance");
        listingId = ++_nextListingId;
        _listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            tokenAddress: tokenAddress_,
            tokenId: tokenId_,
            amount: amount_,
            currency: currency_,
            pricePerUnit: pricePerUnit_,
            totalPrice: amount_ * pricePerUnit_,
            active: true,
            createdAt: block.timestamp
        });
        emit ListingCreated(listingId, msg.sender, tokenAddress_, tokenId_, amount_, pricePerUnit_);
    }

    /// @notice Cancel an active listing.
    /// @param listingId_ The listing ID to cancel.
    function cancelListing(uint256 listingId_) external whenNotPaused {
        require(listingId_ > 0 && listingId_ <= _nextListingId, "listing not found");
        Listing storage l = _listings[listingId_];
        require(l.seller == msg.sender || hasRole(MARKET_ADMIN_ROLE, msg.sender), "not authorized");
        require(l.active, "not active");
        l.active = false;
        emit ListingCancelled(listingId_);
    }

    /// @notice Buy tokens from an active listing.
    /// @param listingId_ The listing ID to buy from.
    /// @param amount_ Number of tokens to purchase.
    function buyListing(uint256 listingId_, uint256 amount_) external whenNotPaused nonReentrant {
        require(listingId_ > 0 && listingId_ <= _nextListingId, "listing not found");
        Listing storage l = _listings[listingId_];
        require(l.active, "not active");
        require(amount_ > 0 && amount_ <= l.amount, "invalid amount");

        if (riskEngine != address(0)) {
            _checkAssetRisk(l.tokenId, l.seller, msg.sender);
        }

        uint256 totalPrice = amount_ * l.pricePerUnit;
        uint256 fee = (totalPrice * marketplaceFee) / 10000;
        uint256 sellerProceeds = totalPrice - fee;
        IERC20 currency = IERC20(l.currency);
        currency.safeTransferFrom(msg.sender, address(this), totalPrice);
        currency.safeTransfer(l.seller, sellerProceeds);
        currency.safeTransfer(treasuryVault, fee);
        IERC1155(l.tokenAddress).safeTransferFrom(l.seller, msg.sender, l.tokenId, amount_, "");
        l.amount -= amount_;
        if (l.amount == 0) l.active = false;
        emit ListingSold(listingId_, msg.sender, amount_, totalPrice);
    }

    /// @notice Internal: check asset risk and emit warning if high-risk
    /// @param tokenId_ Token ID of the asset
    /// @param seller_ Seller address
    /// @param buyer_ Buyer address
    function _checkAssetRisk(uint256 tokenId_, address seller_, address buyer_) internal {
        (bool success, bytes memory data) = riskEngine.staticcall(
            abi.encodeWithSignature("getRiskScore(uint256,address)", tokenId_, seller_)
        );
        if (success && data.length > 0) {
            (uint16 riskScore) = abi.decode(data, (uint16));
            if (riskScore < riskThreshold) {
                emit HighRiskAssetPurchase(0, buyer_, riskScore);
            }
        }
    }

    /// @notice Get full listing details.
    /// @param listingId_ The listing ID.
    /// @return The Listing struct.
    function getListing(uint256 listingId_) external view returns (Listing memory) {
        require(listingId_ > 0 && listingId_ <= _nextListingId, "listing not found");
        return _listings[listingId_];
    }

    /// @notice Total number of listings created.
    /// @return Listing count.
    function getListingCount() external view returns (uint256) { return _nextListingId; }

    /// @notice Update the marketplace fee.
    /// @param newFee_ New fee in basis points (max 1000 = 10%).
    function updateMarketplaceFee(uint256 newFee_) external onlyRole(MARKET_ADMIN_ROLE) {
        require(newFee_ <= 1000, "fee too high");
        emit MarketplaceFeeUpdated(marketplaceFee, newFee_);
        marketplaceFee = newFee_;
    }

    /// @notice Set the treasury vault address.
    /// @param newVault_ New treasury vault address.
    function setTreasuryVault(address newVault_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newVault_ != address(0), "invalid vault");
        emit TreasuryVaultUpdated(treasuryVault, newVault_);
        treasuryVault = newVault_;
    }

    /// @notice Set the compliance manager address.
    /// @param newManager_ New compliance manager address.
    function setComplianceManager(address newManager_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newManager_ != address(0), "invalid manager");
        emit ComplianceManagerUpdated(complianceManager, newManager_);
        complianceManager = newManager_;
    }

    /// @notice Set the risk engine address.
    /// @param newEngine_ New risk engine address.
    function setRiskEngine(address newEngine_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit RiskEngineUpdated(riskEngine, newEngine_);
        riskEngine = newEngine_;
    }

    /// @notice Set the risk threshold (below this = high risk warning).
    /// @param threshold_ Risk score threshold (0-1000).
    function setRiskThreshold(uint16 threshold_) external onlyRole(MARKET_ADMIN_ROLE) {
        require(threshold_ <= 1000, "invalid threshold");
        riskThreshold = threshold_;
    }

    /// @notice Pause the contract.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
