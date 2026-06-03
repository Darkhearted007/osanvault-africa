// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @title ComplianceManager - KYC/AML compliance layer for investor onboarding
contract ComplianceManager is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    enum KYCLevel { NONE, BASIC, ADVANCED, INSTITUTIONAL }
    enum InvestorType { RETAIL, CORPORATE, INSTITUTIONAL, GOVERNMENT }
    enum Status { PENDING, APPROVED, REJECTED, SUSPENDED }

    /// @notice Investor profile.
    struct Investor {
        address investorAddress;
        KYCLevel kycLevel;
        InvestorType investorType;
        Status status;
        uint256 investmentCap;
        bool whitelisted;
        uint256 lastUpdated;
    }

    mapping(address => Investor) private _investors;

    event KYCLevelUpdated(address indexed investor, KYCLevel indexed level, address indexed updatedBy);
    event InvestorTypeUpdated(address indexed investor, InvestorType indexed investorType, address indexed updatedBy);
    event InvestorApproved(address indexed investor, address indexed approvedBy);
    event InvestorRejected(address indexed investor, address indexed rejectedBy);
    event InvestorSuspended(address indexed investor, address indexed suspendedBy);
    event InvestmentCapUpdated(address indexed investor, uint256 cap, address indexed updatedBy);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, COMPLIANCE_ROLE, PAUSER_ROLE, and UPGRADER_ROLE.
    function initialize(address admin) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    /// @notice Set the KYC level for an investor.
    /// @param investor_ The investor's address.
    /// @param level_ The KYC level to assign.
    function setInvestorKYC(address investor_, KYCLevel level_)
        external onlyRole(COMPLIANCE_ROLE) whenNotPaused
    {
        require(investor_ != address(0), "invalid address");
        _investors[investor_].investorAddress = investor_;
        _investors[investor_].kycLevel = level_;
        _investors[investor_].lastUpdated = block.timestamp;
        emit KYCLevelUpdated(investor_, level_, msg.sender);
    }

    /// @notice Set the investor type.
    /// @param investor_ The investor's address.
    /// @param investorType_ The type to assign.
    function setInvestorType(address investor_, InvestorType investorType_)
        external onlyRole(COMPLIANCE_ROLE) whenNotPaused
    {
        require(investor_ != address(0), "invalid address");
        _investors[investor_].investorAddress = investor_;
        _investors[investor_].investorType = investorType_;
        _investors[investor_].lastUpdated = block.timestamp;
        emit InvestorTypeUpdated(investor_, investorType_, msg.sender);
    }

    /// @notice Approve an investor.
    /// @param investor_ The investor's address.
    function approveInvestor(address investor_)
        external onlyRole(COMPLIANCE_ROLE) whenNotPaused
    {
        require(investor_ != address(0), "invalid address");
        _investors[investor_].investorAddress = investor_;
        _investors[investor_].status = Status.APPROVED;
        _investors[investor_].whitelisted = true;
        _investors[investor_].lastUpdated = block.timestamp;
        emit InvestorApproved(investor_, msg.sender);
    }

    /// @notice Reject an investor.
    /// @param investor_ The investor's address.
    function rejectInvestor(address investor_)
        external onlyRole(COMPLIANCE_ROLE) whenNotPaused
    {
        require(investor_ != address(0), "invalid address");
        _investors[investor_].investorAddress = investor_;
        _investors[investor_].status = Status.REJECTED;
        _investors[investor_].whitelisted = false;
        _investors[investor_].lastUpdated = block.timestamp;
        emit InvestorRejected(investor_, msg.sender);
    }

    /// @notice Suspend an approved investor.
    /// @param investor_ The investor's address.
    function suspendInvestor(address investor_)
        external onlyRole(COMPLIANCE_ROLE) whenNotPaused
    {
        require(investor_ != address(0), "invalid address");
        _investors[investor_].investorAddress = investor_;
        _investors[investor_].status = Status.SUSPENDED;
        _investors[investor_].whitelisted = false;
        _investors[investor_].lastUpdated = block.timestamp;
        emit InvestorSuspended(investor_, msg.sender);
    }

    /// @notice Set the maximum investment cap for an investor.
    /// @param investor_ The investor's address.
    /// @param cap_ The maximum investment amount (in wei).
    function setInvestmentCap(address investor_, uint256 cap_)
        external onlyRole(COMPLIANCE_ROLE) whenNotPaused
    {
        require(investor_ != address(0), "invalid address");
        _investors[investor_].investorAddress = investor_;
        _investors[investor_].investmentCap = cap_;
        _investors[investor_].lastUpdated = block.timestamp;
        emit InvestmentCapUpdated(investor_, cap_, msg.sender);
    }

    /// @notice Check whether an investor is whitelisted.
    /// @param investor_ The investor's address.
    /// @return True if whitelisted, false otherwise.
    function isWhitelisted(address investor_) external view returns (bool) {
        return _investors[investor_].whitelisted;
    }

    /// @notice Check whether an investor can receive a given amount of property tokens.
    /// @param investor_ The investor's address.
    /// @param amount_ The amount to check.
    /// @return True if the investor is whitelisted, approved, and within their cap.
    function canReceivePropertyToken(address investor_, uint256 amount_) external view returns (bool) {
        Investor storage inv = _investors[investor_];
        return inv.whitelisted && inv.status == Status.APPROVED && amount_ <= inv.investmentCap;
    }

    /// @notice Get the full investor profile.
    /// @param investor_ The investor's address.
    /// @return The Investor struct.
    function getInvestorStatus(address investor_) external view returns (Investor memory) {
        return _investors[investor_];
    }

    /// @notice Pause the contract.
    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
