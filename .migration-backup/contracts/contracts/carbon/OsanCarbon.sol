// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../libraries/Errors.sol";

/// @title OsanCarbon — ERC-1155 verified carbon credits linked to African climate projects
/// @notice Each token ID represents a distinct climate project. Token quantity = tonne CO₂e.
///         Credits are retired (burned) with an on-chain ESG record for institutional reporting.
///         Retirement fees are collected and forwarded to the configured FeeRouter.
contract OsanCarbon is
    Initializable,
    ERC1155Upgradeable,
    ERC1155SupplyUpgradeable,
    ERC1155PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    // ─── Constants ─────────────────────────────────────────────────────────
    uint256 public constant MAX_SUPPLY_PER_PROJECT = 10_000_000 * 1e18;

    // ─── Data ──────────────────────────────────────────────────────────────
    struct CarbonProject {
        string  name;
        string  methodology;  // e.g. "VCS", "Gold Standard", "Plan Vivo"
        string  region;
        uint256 vintage;      // year credits were generated
        uint256 linkedPropertyId; // 0 if not linked to a property SPV
        uint256 totalIssued;
        uint256 totalRetired;
        bool    verified;
        address verifier;
        bytes32 registryDocHash; // IPFS/Arweave hash of registry documentation
    }

    struct RetirementRecord {
        address retirer;
        address beneficiary;  // entity on whose behalf credits are retired
        uint256 amount;
        uint256 timestamp;
        string  reason;
        string  registrySerial;
    }

    uint256 public projectCount;
    mapping(uint256 => CarbonProject)     private _projects;
    mapping(uint256 => string)            private _uris;
    mapping(uint256 => RetirementRecord[]) private _retirements; // projectId => retirement log

    // Fee config
    address public feeRouter;
    IERC20  public feeToken;
    uint256 public retirementFeePerCredit; // fee in feeToken per 1e18 credits retired

    // ─── Events ────────────────────────────────────────────────────────────
    event ProjectCreated(
        uint256 indexed projectId, string name, string methodology,
        string region, uint256 vintage, uint256 linkedPropertyId
    );
    event ProjectVerified(uint256 indexed projectId, address indexed verifier, bytes32 registryDocHash);
    event CreditsIssued(uint256 indexed projectId, uint256 amount, address indexed recipient);
    event CreditsRetired(
        uint256 indexed projectId, uint256 amount,
        address indexed retirer, address indexed beneficiary,
        string reason, string registrySerial
    );
    event FeeConfigUpdated(address feeRouter, address feeToken, uint256 feePerCredit);

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        address verifier,
        string  calldata baseUri
    ) public initializer {
        __ERC1155_init(baseUri);
        __ERC1155Supply_init();
        __ERC1155Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE,      admin);
        _grantRole(VERIFIER_ROLE,      verifier);
        _grantRole(PAUSER_ROLE,        admin);
    }

    // ─── Project Management ────────────────────────────────────────────────

    function createProject(
        string calldata name,
        string calldata methodology,
        string calldata region,
        uint256         vintage,
        uint256         linkedPropertyId,
        string calldata uri_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 projectId) {
        projectId = ++projectCount;
        _projects[projectId] = CarbonProject({
            name:             name,
            methodology:      methodology,
            region:           region,
            vintage:          vintage,
            linkedPropertyId: linkedPropertyId,
            totalIssued:      0,
            totalRetired:     0,
            verified:         false,
            verifier:         address(0),
            registryDocHash:  bytes32(0)
        });
        _uris[projectId] = uri_;
        emit ProjectCreated(projectId, name, methodology, region, vintage, linkedPropertyId);
    }

    function verifyProject(
        uint256 projectId,
        bytes32 registryDocHash
    ) external onlyRole(VERIFIER_ROLE) {
        CarbonProject storage p = _projects[projectId];
        if (projectId == 0 || projectId > projectCount) revert Errors.DoesNotExist();
        p.verified        = true;
        p.verifier        = msg.sender;
        p.registryDocHash = registryDocHash;
        emit ProjectVerified(projectId, msg.sender, registryDocHash);
    }

    function issueCredits(
        uint256 projectId,
        uint256 amount,
        address recipient
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        CarbonProject storage p = _projects[projectId];
        if (!p.verified)                                          revert Errors.ProjectNotVerified();
        if (p.totalIssued + amount > MAX_SUPPLY_PER_PROJECT)     revert Errors.IssuanceCapExceeded();
        p.totalIssued += amount;
        _mint(recipient, projectId, amount, "");
        emit CreditsIssued(projectId, amount, recipient);
    }

    // ─── Retirement ────────────────────────────────────────────────────────

    /// @notice Retire credits from caller's balance with ESG record
    function retireCredits(
        uint256         projectId,
        uint256         amount,
        address         beneficiary,
        string calldata reason,
        string calldata registrySerial
    ) external whenNotPaused {
        if (balanceOf(msg.sender, projectId) < amount) revert Errors.InsufficientCarbonBalance();

        // Collect retirement fee if configured
        if (retirementFeePerCredit > 0 && address(feeToken) != address(0) && feeRouter != address(0)) {
            uint256 fee = (amount * retirementFeePerCredit) / 1e18;
            if (fee > 0) feeToken.safeTransferFrom(msg.sender, feeRouter, fee);
        }

        _burn(msg.sender, projectId, amount);
        _projects[projectId].totalRetired += amount;

        _retirements[projectId].push(RetirementRecord({
            retirer:        msg.sender,
            beneficiary:    beneficiary,
            amount:         amount,
            timestamp:      block.timestamp,
            reason:         reason,
            registrySerial: registrySerial
        }));
        emit CreditsRetired(projectId, amount, msg.sender, beneficiary, reason, registrySerial);
    }

    /// @notice Retire credits on behalf of an approved holder
    function retireCreditsFrom(
        address         holder,
        uint256         projectId,
        uint256         amount,
        address         beneficiary,
        string calldata reason,
        string calldata registrySerial
    ) external whenNotPaused {
        if (!isApprovedForAll(holder, msg.sender))     revert Errors.Unauthorized();
        if (balanceOf(holder, projectId) < amount)     revert Errors.InsufficientCarbonBalance();
        _burn(holder, projectId, amount);
        _projects[projectId].totalRetired += amount;
        _retirements[projectId].push(RetirementRecord({
            retirer:        msg.sender,
            beneficiary:    beneficiary,
            amount:         amount,
            timestamp:      block.timestamp,
            reason:         reason,
            registrySerial: registrySerial
        }));
        emit CreditsRetired(projectId, amount, msg.sender, beneficiary, reason, registrySerial);
    }

    // ─── Fee Config ────────────────────────────────────────────────────────

    function setFeeConfig(
        address feeRouter_,
        address feeToken_,
        uint256 feePerCredit_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeRouter             = feeRouter_;
        feeToken              = IERC20(feeToken_);
        retirementFeePerCredit = feePerCredit_;
        emit FeeConfigUpdated(feeRouter_, feeToken_, feePerCredit_);
    }

    // ─── Views ─────────────────────────────────────────────────────────────

    function getProject(uint256 projectId) external view returns (CarbonProject memory) {
        return _projects[projectId];
    }

    function getRetirements(uint256 projectId) external view returns (RetirementRecord[] memory) {
        return _retirements[projectId];
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenUri = _uris[tokenId];
        return bytes(tokenUri).length > 0 ? tokenUri : super.uri(tokenId);
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ─── Required Overrides ────────────────────────────────────────────────

    function _update(
        address from, address to,
        uint256[] memory ids, uint256[] memory values
    ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable, ERC1155PausableUpgradeable) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
