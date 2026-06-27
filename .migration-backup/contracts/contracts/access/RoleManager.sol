// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @title RoleManager — centralized role registry for the OsanVault protocol
/// @notice Deploy this contract first. All other contracts share these role constants.
///         Granting a role here does NOT propagate to individual contracts automatically;
///         each contract manages its own AccessControl state. This contract serves as
///         the canonical source of role identifiers and a convenient batch-grant helper.
contract RoleManager is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    // ─── Protocol Role Constants ───────────────────────────────────────────
    bytes32 public constant TREASURY_ROLE   = keccak256("TREASURY_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant REGISTRY_ROLE   = keccak256("REGISTRY_ROLE");
    bytes32 public constant VERIFIER_ROLE   = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE     = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE     = keccak256("MINTER_ROLE");
    bytes32 public constant ORACLE_ROLE     = keccak256("ORACLE_ROLE");
    bytes32 public constant EMERGENCY_ROLE  = keccak256("EMERGENCY_ROLE");
    bytes32 public constant BURNER_ROLE     = keccak256("BURNER_ROLE");
    bytes32 public constant PROPOSER_ROLE   = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE   = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE  = keccak256("CANCELLER_ROLE");

    // ─── Events ────────────────────────────────────────────────────────────
    event RolesBatchGranted(bytes32[] roles, address[] accounts);

    // ─── Errors ────────────────────────────────────────────────────────────
    error ArrayLengthMismatch();

    // ─── Initializer ───────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address admin) public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    // ─── Admin Functions ───────────────────────────────────────────────────

    /// @notice Batch-grant multiple roles to multiple accounts in one transaction
    function grantRoles(
        bytes32[] calldata roles,
        address[] calldata accounts
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (roles.length != accounts.length) revert ArrayLengthMismatch();
        for (uint256 i = 0; i < roles.length; i++) {
            _grantRole(roles[i], accounts[i]);
        }
        emit RolesBatchGranted(roles, accounts);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
