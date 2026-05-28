// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title OsanCarbon — Carbon Credit Tokenization
/// @notice ERC-1155 tokens representing verified carbon credits per project.
/// @dev Uses OpenZeppelin 5.x: ERC1155 + Supply + URIStorage + AccessControl + Pausable.
contract OsanCarbon is ERC1155, ERC1155Supply, ERC1155URIStorage, AccessControl, Pausable {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Hard cap of 10M tokens (1e18 decimals) per project.
    uint256 public constant MAX_SUPPLY_PER_PROJECT = 10_000_000 * 1e18;

    /// @notice Auto-incremented project counter. 0 = no projects.
    uint256 private _nextProjectId;

    /// @notice Project metadata storage.
    /// @dev The verifier is tracked separately in `projectVerifier` mapping to avoid struct padding waste.
    struct Project {
        string name;
        string methodology;
        string region;
        uint256 vintage;
        uint256 totalIssued;
        bool verified;
    }

    /// @notice projectId => Project
    mapping(uint256 => Project) public projects;

    /// @notice projectId => verifier address (single-owner per project)
    mapping(uint256 => address) public projectVerifier;

    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        string methodology,
        string region,
        uint256 vintage,
        address indexed verifier
    );
    event CreditsIssued(
        uint256 indexed projectId,
        uint256 amount,
        address indexed recipient
    );
    event CreditsRetired(
        uint256 indexed projectId,
        uint256 amount,
        address indexed retirer,
        string reason
    );
    event ProjectVerified(uint256 indexed projectId, address indexed verifier);

    /// @notice Emitted when admin reassigns a project's verifier (e.g. after compromise).
    event ProjectVerifierUpdated(uint256 indexed projectId, address indexed oldVerifier, address indexed newVerifier);

    /// @notice Constructs the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE and PAUSER_ROLE.
    /// @param verifier Address granted VERIFIER_ROLE.
    /// @param uri_ Base ERC-1155 URI (supports {id} substitution).
    constructor(address admin, address verifier, string memory uri_) ERC1155(uri_) {
        require(admin != address(0), "invalid admin");
        require(verifier != address(0), "invalid verifier");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, verifier);
        _grantRole(PAUSER_ROLE, admin);
    }

    /// @notice Create a new carbon credit project.
    /// @param name_ Human-readable project name.
    /// @param methodology_ Carbon standard methodology identifier.
    /// @param region_ Geographic region.
    /// @param vintage_ Credit vintage year.
    /// @param uri_ Per-project metadata URI.
    /// @return projectId The assigned project ID.
    function createProject(
        string calldata name_,
        string calldata methodology_,
        string calldata region_,
        uint256 vintage_,
        string calldata uri_
    )
        external
        onlyRole(VERIFIER_ROLE)
        whenNotPaused
        returns (uint256 projectId)
    {
        projectId = ++_nextProjectId;
        projects[projectId] = Project({
            name: name_,
            methodology: methodology_,
            region: region_,
            vintage: vintage_,
            totalIssued: 0,
            verified: false
        });
        projectVerifier[projectId] = msg.sender;

        _setURI(projectId, uri_);

        emit ProjectCreated(projectId, name_, methodology_, region_, vintage_, msg.sender);
    }

    /// @notice Verify a project, making it eligible for credit issuance.
    /// @dev Only the project's assigned verifier may call this.
    /// @param projectId_ The project to verify.
    function verifyProject(uint256 projectId_)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(!projects[projectId_].verified, "already verified");
        require(projectVerifier[projectId_] == msg.sender, "not project verifier");

        projects[projectId_].verified = true;
        emit ProjectVerified(projectId_, msg.sender);
    }

    /// @notice Issue carbon credits for a verified project.
    /// @param projectId_ The verified project ID.
    /// @param amount_ Amount of credits (in 1e18).
    /// @param recipient_ Address receiving the minted credits.
    function issueCredits(
        uint256 projectId_,
        uint256 amount_,
        address recipient_
    )
        external
        onlyRole(VERIFIER_ROLE)
        whenNotPaused
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(projects[projectId_].verified, "project not verified");
        require(recipient_ != address(0), "invalid recipient");
        require(amount_ > 0, "amount zero");

        uint256 newTotal = projects[projectId_].totalIssued + amount_;
        require(newTotal <= MAX_SUPPLY_PER_PROJECT, "exceeds project cap");

        projects[projectId_].totalIssued = newTotal;
        _mint(recipient_, projectId_, amount_, "");

        emit CreditsIssued(projectId_, amount_, recipient_);
    }

    /// @notice Retire (burn) credits from the caller's balance.
    /// @param projectId_ The project whose credits are being retired.
    /// @param amount_ Number of credits to retire.
    /// @param reason_ Optional reason for retirement (emitted in event).
    function retireCredits(
        uint256 projectId_,
        uint256 amount_,
        string calldata reason_
    )
        external
        whenNotPaused
    {
        require(amount_ > 0, "amount zero");
        require(balanceOf(msg.sender, projectId_) >= amount_, "insufficient balance");

        _burn(msg.sender, projectId_, amount_);

        emit CreditsRetired(projectId_, amount_, msg.sender, reason_);
    }

    /// @notice Update per-project metadata URI.
    /// @param projectId_ The project to update.
    /// @param uri_ New metadata URI.
    function setMetadata(uint256 projectId_, string calldata uri_)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(projectVerifier[projectId_] == msg.sender, "not project verifier");

        _setURI(projectId_, uri_);
    }

    /// @notice Admin-only: reassign a project's verifier (e.g. after key compromise).
    /// @param projectId_ The project to update.
    /// @param newVerifier_ The new verifier address.
    function updateProjectVerifier(uint256 projectId_, address newVerifier_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        require(newVerifier_ != address(0), "invalid verifier");
        require(newVerifier_ != projectVerifier[projectId_], "same verifier");

        address oldVerifier = projectVerifier[projectId_];
        projectVerifier[projectId_] = newVerifier_;
        emit ProjectVerifierUpdated(projectId_, oldVerifier, newVerifier_);
    }

    /// @notice Total number of projects created.
    /// @return count Number of projects.
    function getProjectCount() external view returns (uint256) {
        return _nextProjectId;
    }

    /// @notice Total credits issued for a project.
    /// @param projectId_ The project ID to query.
    /// @return totalIssued Amount issued so far.
    function getProjectTotalIssued(uint256 projectId_) external view returns (uint256) {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        return projects[projectId_].totalIssued;
    }

    /// @notice Remaining credits available for issuance before hitting cap.
    /// @param projectId_ The project ID to query.
    /// @return remaining Amount remaining.
    function getProjectRemainingCap(uint256 projectId_) external view returns (uint256) {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        return MAX_SUPPLY_PER_PROJECT - projects[projectId_].totalIssued;
    }

    /// @notice Get the verifier assigned to a project.
    /// @param projectId_ The project ID to query.
    /// @return verifier The project's verifier address.
    function getProjectVerifier(uint256 projectId_) external view returns (address) {
        require(projectId_ > 0 && projectId_ <= _nextProjectId, "project not found");
        return projectVerifier[projectId_];
    }

    /// @notice Pause all state-changing operations (creator only).
    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }

    /// @notice Unpause operations (creator only).
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    /// @inheritdoc ERC1155Supply
    /// @dev Paused contract prevents all transfers, minting, and burning.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    )
        internal
        override(ERC1155, ERC1155Supply)
        whenNotPaused
    {
        super._update(from, to, ids, values);
    }

    /// @inheritdoc ERC1155URIStorage
    function uri(uint256 tokenId)
        public
        view
        override(ERC1155, ERC1155URIStorage)
        returns (string memory)
    {
        return ERC1155URIStorage.uri(tokenId);
    }

    /// @inheritdoc ERC1155
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
