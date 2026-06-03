// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @title CarbonRegistry - Carbon credit project registry
/// @notice Registers, verifies, and tracks carbon credit projects with issuance and retirement.
contract CarbonRegistry is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice Supported carbon credit verification standards.
    enum VerificationStandard { VCS, GoldStandard, PlanVivo, Other }

    /// @notice Full carbon project record.
    struct CarbonProject {
        uint256 projectId;
        string name;
        string methodology;
        string region;
        uint256 vintage;
        VerificationStandard standard;
        uint256 totalIssued;
        uint256 totalRetired;
        bool verified;
        uint256 linkedAssetId;
        uint256 createdAt;
        address verifier;
    }

    uint256 private _nextProjectId;
    mapping(uint256 => CarbonProject) private _projects;

    event ProjectRegistered(uint256 indexed projectId, string name, VerificationStandard indexed standard, address indexed verifier);
    event ProjectVerified(uint256 indexed projectId, address indexed verifier);
    event CreditsIssued(uint256 indexed projectId, uint256 amount, address indexed recipient);
    event CreditsRetired(uint256 indexed projectId, uint256 amount, address indexed retirer);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, REGISTRAR_ROLE, VERIFIER_ROLE, UPGRADER_ROLE.
    function initialize(address admin) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    /// @notice Register a new carbon credit project.
    /// @param name_ Human-readable project name.
    /// @param methodology_ Carbon standard methodology.
    /// @param region_ Geographic region of the project.
    /// @param vintage_ Credit vintage year.
    /// @param standard_ Verification standard (VCS, GoldStandard, PlanVivo, Other).
    /// @param linkedAssetId_ Associated asset ID in AssetRegistry (0 if none).
    /// @return projectId The newly assigned project ID.
    function registerProject(
        string calldata name_,
        string calldata methodology_,
        string calldata region_,
        uint256 vintage_,
        VerificationStandard standard_,
        uint256 linkedAssetId_
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused returns (uint256 projectId) {
        require(bytes(name_).length > 0, "empty name");
        projectId = ++_nextProjectId;
        _projects[projectId] = CarbonProject({
            projectId: projectId,
            name: name_,
            methodology: methodology_,
            region: region_,
            vintage: vintage_,
            standard: standard_,
            totalIssued: 0,
            totalRetired: 0,
            verified: false,
            linkedAssetId: linkedAssetId_,
            createdAt: block.timestamp,
            verifier: address(0)
        });
        emit ProjectRegistered(projectId, name_, standard_, msg.sender);
    }

    /// @notice Verify a registered project, making it eligible for credit issuance.
    /// @param projectId_ The project ID to verify.
    function verifyProject(uint256 projectId_) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(!_projects[projectId_].verified, "already verified");
        _projects[projectId_].verified = true;
        _projects[projectId_].verifier = msg.sender;
        emit ProjectVerified(projectId_, msg.sender);
    }

    /// @notice Issue carbon credits for a verified project.
    /// @param projectId_ The verified project ID.
    /// @param amount_ Amount of credits to issue.
    /// @param recipient_ Address receiving the credits.
    function issueCredits(uint256 projectId_, uint256 amount_, address recipient_)
        external onlyRole(VERIFIER_ROLE) whenNotPaused
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(_projects[projectId_].verified, "not verified");
        require(recipient_ != address(0), "invalid recipient");
        require(amount_ > 0, "amount zero");
        _projects[projectId_].totalIssued += amount_;
        emit CreditsIssued(projectId_, amount_, recipient_);
    }

    /// @notice Retire credits from the available pool.
    /// @param projectId_ The project ID.
    /// @param amount_ Number of credits to retire.
    function retireCredits(uint256 projectId_, uint256 amount_) external whenNotPaused {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(amount_ > 0, "amount zero");
        CarbonProject storage p = _projects[projectId_];
        uint256 available = p.totalIssued - p.totalRetired;
        require(amount_ <= available, "insufficient credits");
        p.totalRetired += amount_;
        emit CreditsRetired(projectId_, amount_, msg.sender);
    }

    /// @notice Get full project details.
    /// @param projectId_ The project ID.
    /// @return The CarbonProject struct.
    function getProject(uint256 projectId_) external view returns (CarbonProject memory) {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        return _projects[projectId_];
    }

    /// @notice Total number of projects registered.
    /// @return Project count.
    function getProjectCount() external view returns (uint256) { return _nextProjectId; }

    /// @notice Get the number of retireable credits remaining for a project.
    /// @param projectId_ The project ID.
    /// @return Available credits (issued minus retired).
    function getAvailableCredits(uint256 projectId_) external view returns (uint256) {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        return _projects[projectId_].totalIssued - _projects[projectId_].totalRetired;
    }

    /// @notice Pause the contract.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
