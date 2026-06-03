// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @title PPPRegistry - Government Public-Private Partnership registry for ÒsánVault Africa
/// @notice Registers government partners and tracks PPP projects for carbon and infrastructure initiatives
/// @dev UUPS upgradeable contract with role-based access control
contract PPPRegistry is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    bytes32 public constant PPP_ADMIN_ROLE = keccak256("PPP_ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice Represents a government partner entity
    struct GovernmentPartner {
        uint256 partnerId;
        string name;
        string country;
        string region;
        string department;
        string walletAddress;
        bool verified;
        string agreementCID;
        uint256 createdAt;
        address registeredBy;
    }

    /// @notice Represents a PPP project linked to a government partner
    struct PPPProject {
        uint256 projectId;
        uint256 partnerId;
        string name;
        string description;
        uint256 totalInvestment;
        uint256 carbonTarget;
        uint256 carbonAchieved;
        uint256 startDate;
        uint256 endDate;
        bool active;
        uint256 createdAt;
    }

    uint256 private _nextPartnerId;
    uint256 private _nextProjectId;
    mapping(uint256 => GovernmentPartner) private _partners;
    mapping(uint256 => PPPProject) private _projects;

    event PartnerRegistered(uint256 indexed partnerId, string name, string country, address indexed registeredBy);
    event PartnerVerified(uint256 indexed partnerId, address indexed verifier);
    event PPPProjectRegistered(uint256 indexed projectId, string name, uint256 indexed partnerId);
    event InvestmentRecorded(uint256 indexed projectId, uint256 amount);
    event CarbonOutputRecorded(uint256 indexed projectId, uint256 amount);

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
        _grantRole(PPP_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    /// @notice Registers a new government partner
    /// @param name_ Name of the government partner
    /// @param country_ Country of the partner
    /// @param region_ Region within the country
    /// @param department_ Department or ministry name
    /// @param walletAddress_ Wallet address for fund distribution
    /// @param agreementCID_ IPFS CID of the legal agreement
    /// @return partnerId The ID of the newly registered partner
    function registerPartner(
        string calldata name_,
        string calldata country_,
        string calldata region_,
        string calldata department_,
        string calldata walletAddress_,
        string calldata agreementCID_
    ) external onlyRole(PPP_ADMIN_ROLE) whenNotPaused returns (uint256 partnerId) {
        partnerId = ++_nextPartnerId;
        _partners[partnerId] = GovernmentPartner({
            partnerId: partnerId,
            name: name_,
            country: country_,
            region: region_,
            department: department_,
            walletAddress: walletAddress_,
            verified: false,
            agreementCID: agreementCID_,
            createdAt: block.timestamp,
            registeredBy: msg.sender
        });
        emit PartnerRegistered(partnerId, name_, country_, msg.sender);
    }

    /// @notice Verifies an existing government partner
    /// @param partnerId_ The ID of the partner to verify
    function verifyPartner(uint256 partnerId_) external onlyRole(PPP_ADMIN_ROLE) whenNotPaused {
        require(partnerId_ > 0 && partnerId_ <= _nextPartnerId, "partner not found");
        require(!_partners[partnerId_].verified, "already verified");
        _partners[partnerId_].verified = true;
        emit PartnerVerified(partnerId_, msg.sender);
    }

    /// @notice Registers a new PPP project under a verified government partner
    /// @param partnerId_ The ID of the partner
    /// @param name_ Project name
    /// @param description_ Project description
    /// @param totalInvestment_ Total investment amount in USDC (1e6)
    /// @param carbonTarget_ Carbon reduction target
    /// @param startDate_ Project start timestamp
    /// @param endDate_ Project end timestamp
    /// @return projectId The ID of the newly registered project
    function registerProject(
        uint256 partnerId_,
        string calldata name_,
        string calldata description_,
        uint256 totalInvestment_,
        uint256 carbonTarget_,
        uint256 startDate_,
        uint256 endDate_
    ) external onlyRole(PPP_ADMIN_ROLE) whenNotPaused returns (uint256 projectId) {
        require(partnerId_ > 0 && partnerId_ <= _nextPartnerId, "partner not found");
        require(_partners[partnerId_].verified, "partner not verified");
        projectId = ++_nextProjectId;
        _projects[projectId] = PPPProject({
            projectId: projectId,
            partnerId: partnerId_,
            name: name_,
            description: description_,
            totalInvestment: totalInvestment_,
            carbonTarget: carbonTarget_,
            carbonAchieved: 0,
            startDate: startDate_,
            endDate: endDate_,
            active: true,
            createdAt: block.timestamp
        });
        emit PPPProjectRegistered(projectId, name_, partnerId_);
    }

    /// @notice Records additional investment for a project
    /// @param projectId_ The ID of the project
    /// @param amount_ Amount to add
    function recordInvestment(uint256 projectId_, uint256 amount_) external onlyRole(PPP_ADMIN_ROLE) whenNotPaused {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        _projects[projectId_].totalInvestment += amount_;
        emit InvestmentRecorded(projectId_, amount_);
    }

    /// @notice Records carbon output achieved for a project
    /// @param projectId_ The ID of the project
    /// @param amount_ Carbon amount achieved
    function recordCarbonOutput(uint256 projectId_, uint256 amount_) external onlyRole(PPP_ADMIN_ROLE) whenNotPaused {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        _projects[projectId_].carbonAchieved += amount_;
        emit CarbonOutputRecorded(projectId_, amount_);
    }

    /// @notice Returns details of a government partner
    /// @param partnerId_ The ID of the partner
    /// @return GovernmentPartner struct
    function getPartner(uint256 partnerId_) external view returns (GovernmentPartner memory) {
        require(partnerId_ > 0 && partnerId_ <= _nextPartnerId, "partner not found");
        return _partners[partnerId_];
    }

    /// @notice Returns details of a PPP project
    /// @param projectId_ The ID of the project
    /// @return PPPProject struct
    function getProject(uint256 projectId_) external view returns (PPPProject memory) {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        return _projects[projectId_];
    }

    /// @notice Returns the total number of registered partners
    function getPartnerCount() external view returns (uint256) {
        return _nextPartnerId;
    }

    /// @notice Returns the total number of registered projects
    function getProjectCount() external view returns (uint256) {
        return _nextProjectId;
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
