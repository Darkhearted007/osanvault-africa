// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title OsanCarbon — ERC-1155 verified carbon credits linked to African climate projects
contract OsanCarbon is ERC1155, AccessControl, Pausable {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY_PER_PROJECT = 1_000_000 * 1e18;

    struct CarbonProject {
        string  name;
        string  methodology;
        string  region;
        uint256 vintage;
        uint256 totalIssued;
        bool    verified;
        address verifier;
    }

    uint256 private _projectCount;
    mapping(uint256 => CarbonProject) private _projects;
    mapping(uint256 => string)        private _uris;

    address public feeRouter;
    address public feeToken;
    uint256 public retirementFeePerCredit;

    event ProjectCreated(
        uint256 indexed projectId,
        string  name,
        string  methodology,
        string  region,
        uint256 vintage,
        address indexed verifier
    );
    event CreditsIssued(uint256 indexed projectId, uint256 amount, address indexed recipient);
    event CreditsRetired(
        uint256 indexed projectId,
        uint256 amount,
        address indexed retirer,
        address indexed holder,
        string  reason
    );
    event ProjectVerified(uint256 indexed projectId, address indexed verifier);
    event FeeConfigUpdated(address indexed feeRouter, address indexed feeToken, uint256 feePerCredit);

    constructor(address admin, address verifier, string memory uri_) ERC1155(uri_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE,      admin);
        _grantRole(VERIFIER_ROLE,      verifier);
        _grantRole(PAUSER_ROLE,        admin);
    }

    function createProject(
        string calldata name_,
        string calldata methodology_,
        string calldata region_,
        uint256         vintage_,
        string calldata uri_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 projectId) {
        projectId = ++_projectCount;
        _projects[projectId] = CarbonProject({
            name:        name_,
            methodology: methodology_,
            region:      region_,
            vintage:     vintage_,
            totalIssued: 0,
            verified:    false,
            verifier:    address(0)
        });
        _uris[projectId] = uri_;
        emit ProjectCreated(projectId, name_, methodology_, region_, vintage_, address(0));
    }

    function verifyProject(uint256 projectId_) external onlyRole(VERIFIER_ROLE) {
        _projects[projectId_].verified = true;
        _projects[projectId_].verifier = msg.sender;
        emit ProjectVerified(projectId_, msg.sender);
    }

    function issueCredits(
        uint256 projectId_,
        uint256 amount_,
        address recipient_
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        CarbonProject storage p = _projects[projectId_];
        require(p.verified, "OsanCarbon: project not verified");
        require(p.totalIssued + amount_ <= MAX_SUPPLY_PER_PROJECT, "OsanCarbon: exceeds cap");
        p.totalIssued += amount_;
        _mint(recipient_, projectId_, amount_, "");
        emit CreditsIssued(projectId_, amount_, recipient_);
    }

    function retireCredits(
        uint256         projectId_,
        uint256         amount_,
        string calldata reason_
    ) external whenNotPaused {
        require(balanceOf(msg.sender, projectId_) >= amount_, "OsanCarbon: insufficient balance");
        _burn(msg.sender, projectId_, amount_);
        emit CreditsRetired(projectId_, amount_, msg.sender, msg.sender, reason_);
    }

    function retireCreditsFrom(
        address         holder_,
        uint256         projectId_,
        uint256         amount_,
        string calldata reason_
    ) external whenNotPaused {
        require(isApprovedForAll(holder_, msg.sender), "OsanCarbon: not approved");
        require(balanceOf(holder_, projectId_) >= amount_, "OsanCarbon: insufficient balance");
        _burn(holder_, projectId_, amount_);
        emit CreditsRetired(projectId_, amount_, msg.sender, holder_, reason_);
    }

    function setMetadata(uint256 projectId_, string calldata uri_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _uris[projectId_] = uri_;
    }

    function setFeeConfig(
        address feeRouter_,
        address feeToken_,
        uint256 feePerCredit_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeRouter             = feeRouter_;
        feeToken              = feeToken_;
        retirementFeePerCredit = feePerCredit_;
        emit FeeConfigUpdated(feeRouter_, feeToken_, feePerCredit_);
    }

    function getProjectCount() external view returns (uint256) {
        return _projectCount;
    }

    function getProject(uint256 projectId_) external view returns (CarbonProject memory) {
        return _projects[projectId_];
    }

    function getProjectRemainingCap(uint256 projectId_) external view returns (uint256) {
        return MAX_SUPPLY_PER_PROJECT - _projects[projectId_].totalIssued;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenUri = _uris[tokenId];
        if (bytes(tokenUri).length > 0) return tokenUri;
        return super.uri(tokenId);
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
