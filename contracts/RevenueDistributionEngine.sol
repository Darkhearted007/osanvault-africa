// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title RevenueDistributionEngine - Distribute revenue from properties, carbon credits, and minerals to token holders
contract RevenueDistributionEngine is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable, ReentrancyGuard {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    enum RevenueSource { PROPERTY, CARBON, MINERAL }

    /// @notice Revenue deposit data.
    struct Revenue {
        RevenueSource source;
        uint256 sourceId;
        uint256 totalAmount;
        uint256 distributedAmount;
        uint256 totalSupplyAtDeposit;
        uint256 periodStart;
        uint256 periodEnd;
        bool claimed;
    }

    /// @notice Per-user claim tracking for a given revenue bucket.
    struct UserClaim {
        uint256 totalEarned;
        uint256 claimedAmount;
    }

    address private _propertyToken;
    address private _treasury;

    mapping(bytes32 => Revenue) private _revenuePerSource;
    mapping(address => mapping(bytes32 => UserClaim)) private _userClaims;

    event RevenueDeposited(bytes32 indexed revenueId, RevenueSource indexed source, uint256 indexed sourceId, uint256 amount, uint256 periodStart, uint256 periodEnd);
    event RevenueClaimed(bytes32 indexed revenueId, address indexed user, uint256 amount);
    event RevenueDistributed(bytes32 indexed revenueId, uint256 totalAmount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event PropertyTokenUpdated(address indexed oldToken, address indexed newToken);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, DISTRIBUTOR_ROLE, and UPGRADER_ROLE.
    /// @param treasury_ Address of the protocol treasury.
    function initialize(address admin, address treasury_) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        _treasury = treasury_;
    }

    /// @notice Deposit revenue for distribution to token holders.
    /// @param source_ The revenue source type.
    /// @param sourceId_ Identifier for the source (e.g. property ID, project ID).
    /// @param amount_ The amount of revenue being deposited in underlying token.
    /// @param periodStart_ Start of the revenue period (unix timestamp).
    /// @param periodEnd_ End of the revenue period (unix timestamp).
    /// @return revenueId The unique identifier for this revenue bucket.
    function depositRevenue(
        RevenueSource source_,
        uint256 sourceId_,
        uint256 amount_,
        uint256 periodStart_,
        uint256 periodEnd_
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused returns (bytes32 revenueId) {
        require(amount_ > 0, "amount zero");
        require(periodEnd_ > periodStart_, "invalid period");
        require(_propertyToken != address(0), "token not set");

        revenueId = keccak256(abi.encodePacked(source_, sourceId_, periodStart_));
        require(!_revenuePerSource[revenueId].claimed, "already deposited");

        IERC20 token = IERC20(_propertyToken);
        require(token.transferFrom(msg.sender, address(this), amount_), "transfer failed");

        uint256 totalSupply = token.totalSupply();

        _revenuePerSource[revenueId] = Revenue({
            source: source_,
            sourceId: sourceId_,
            totalAmount: amount_,
            distributedAmount: 0,
            totalSupplyAtDeposit: totalSupply,
            periodStart: periodStart_,
            periodEnd: periodEnd_,
            claimed: false
        });

        emit RevenueDeposited(revenueId, source_, sourceId_, amount_, periodStart_, periodEnd_);
    }

    /// @notice Calculate the amount of revenue a user can claim for a given revenue bucket.
    /// @param user_ The user's address.
    /// @param revenueId_ The revenue bucket ID.
    /// @return The claimable amount.
    function calculateClaimable(address user_, bytes32 revenueId_) external view returns (uint256) {
        Revenue storage rev = _revenuePerSource[revenueId_];
        if (rev.totalAmount == 0) return 0;

        IERC20 token = IERC20(_propertyToken);
        uint256 userBalance = token.balanceOf(user_);
        if (userBalance == 0) return 0;

        uint256 earned = (userBalance * rev.totalAmount) / rev.totalSupplyAtDeposit;
        uint256 claimed = _userClaims[user_][revenueId_].claimedAmount;

        if (earned <= claimed) return 0;
        return earned - claimed;
    }

    /// @notice Claim revenue from a specific revenue bucket.
    /// @param revenueId_ The revenue bucket ID to claim from.
    function claimRevenue(bytes32 revenueId_) external whenNotPaused nonReentrant {
        Revenue storage rev = _revenuePerSource[revenueId_];
        require(rev.totalAmount > 0, "not found");
        require(!rev.claimed, "already fully distributed");

        IERC20 token = IERC20(_propertyToken);
        uint256 userBalance = token.balanceOf(msg.sender);
        require(userBalance > 0, "zero balance");

        uint256 earned = (userBalance * rev.totalAmount) / rev.totalSupplyAtDeposit;
        UserClaim storage claim = _userClaims[msg.sender][revenueId_];

        uint256 claimable = earned - claim.claimedAmount;
        require(claimable > 0, "nothing to claim");

        uint256 remaining = rev.totalAmount - rev.distributedAmount;
        if (claimable > remaining) claimable = remaining;

        claim.claimedAmount += claimable;
        claim.totalEarned = earned;
        rev.distributedAmount += claimable;

        if (rev.distributedAmount >= rev.totalAmount) {
            rev.claimed = true;
        }

        require(token.transfer(msg.sender, claimable), "transfer failed");
        emit RevenueClaimed(revenueId_, msg.sender, claimable);
    }

    /// @notice Batch distribute remaining revenue back to treasury after all claims are exhausted or deadline passed.
    /// @param revenueIds_ Array of revenue bucket IDs to distribute.
    function batchDistribute(bytes32[] calldata revenueIds_) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused {
        IERC20 token = IERC20(_propertyToken);
        for (uint256 i = 0; i < revenueIds_.length; i++) {
            Revenue storage rev = _revenuePerSource[revenueIds_[i]];
            if (rev.claimed) continue;

            uint256 undistributed = rev.totalAmount - rev.distributedAmount;
            if (undistributed > 0) {
                rev.claimed = true;
                rev.distributedAmount = rev.totalAmount;
                require(token.transfer(_treasury, undistributed), "transfer failed");
            }

            emit RevenueDistributed(revenueIds_[i], rev.totalAmount);
        }
    }

    /// @notice Set the property token address used for pro-rata claim calculations.
    /// @param token_ The ERC20 token address.
    function setPropertyToken(address token_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token_ != address(0), "invalid address");
        emit PropertyTokenUpdated(_propertyToken, token_);
        _propertyToken = token_;
    }

    /// @notice Set the treasury address.
    /// @param treasury_ The new treasury address.
    function setTreasury(address treasury_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(treasury_ != address(0), "invalid address");
        emit TreasuryUpdated(_treasury, treasury_);
        _treasury = treasury_;
    }

    /// @notice Get a revenue bucket by ID.
    /// @param revenueId_ The revenue bucket ID.
    /// @return The Revenue struct.
    function getRevenue(bytes32 revenueId_) external view returns (Revenue memory) {
        return _revenuePerSource[revenueId_];
    }

    /// @notice Get the user claim data for a specific revenue bucket.
    /// @param user_ The user's address.
    /// @param revenueId_ The revenue bucket ID.
    /// @return The UserClaim struct.
    function getUserClaim(address user_, bytes32 revenueId_) external view returns (UserClaim memory) {
        return _userClaims[user_][revenueId_];
    }

    /// @notice Get the current property token address.
    /// @return The ERC20 token address.
    function getPropertyToken() external view returns (address) { return _propertyToken; }

    /// @notice Get the current treasury address.
    /// @return The treasury address.
    function getTreasury() external view returns (address) { return _treasury; }

    /// @notice Pause the contract.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
