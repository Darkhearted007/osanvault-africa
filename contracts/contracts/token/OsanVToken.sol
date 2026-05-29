// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";

/// @title OsanVToken — OSANV ERC-20 governance and staking token
/// @notice 1 billion OSANV cap, ERC20Votes for on-chain governance, ERC20Permit for gasless approvals.
///         All token holders must self-delegate (delegate(self)) to activate voting power.
///         Allocations are minted at initialization: Treasury 20%, Ecosystem 30%, Community 20%,
///         Institutional 15%, Governance Reserve 10%, Team Vesting 5%.
contract OsanVToken is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable,
    ERC20CappedUpgradeable,
    UUPSUpgradeable
{
    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ─── Supply ────────────────────────────────────────────────────────────
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18;

    // ─── Allocation bps (10 000 = 100%) ────────────────────────────────────
    uint256 public constant TREASURY_BPS     = 2000; // 20% — 200 M
    uint256 public constant ECOSYSTEM_BPS    = 3000; // 30% — 300 M
    uint256 public constant COMMUNITY_BPS    = 2000; // 20% — 200 M
    uint256 public constant INSTITUTIONAL_BPS = 1500; // 15% — 150 M
    uint256 public constant GOVERNANCE_BPS   = 1000; // 10% — 100 M
    uint256 public constant TEAM_BPS         =  500; //  5% —  50 M

    // ─── Events ────────────────────────────────────────────────────────────
    event TokensAllocated(
        address treasury,
        address ecosystem,
        address community,
        address institutional,
        address governance,
        address teamVesting
    );

    // ─── Errors ────────────────────────────────────────────────────────────
    error ZeroAddress();
    error SupplyCapExceeded();

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @param admin         Protocol admin (DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE)
    /// @param treasury      Receives 20% treasury allocation
    /// @param ecosystem     Receives 30% ecosystem incentives allocation
    /// @param community     Receives 20% community allocation
    /// @param institutional Receives 15% institutional reserve allocation
    /// @param govReserve    Receives 10% governance reserve allocation
    /// @param teamVesting   Receives 5% team allocation (send to TeamVesting contract)
    function initialize(
        address admin,
        address treasury,
        address ecosystem,
        address community,
        address institutional,
        address govReserve,
        address teamVesting
    ) public initializer {
        if (admin == address(0) || treasury == address(0) || ecosystem == address(0) ||
            community == address(0) || institutional == address(0) ||
            govReserve == address(0) || teamVesting == address(0)) revert ZeroAddress();

        __ERC20_init("OsanVault Token", "OSANV");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __AccessControl_init();
        __ERC20Permit_init("OsanVault Token");
        __ERC20Votes_init();
        __ERC20Capped_init(MAX_SUPPLY);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        // Mint genesis allocations
        _mint(treasury,     (MAX_SUPPLY * TREASURY_BPS)     / 10_000);
        _mint(ecosystem,    (MAX_SUPPLY * ECOSYSTEM_BPS)    / 10_000);
        _mint(community,    (MAX_SUPPLY * COMMUNITY_BPS)    / 10_000);
        _mint(institutional,(MAX_SUPPLY * INSTITUTIONAL_BPS)/ 10_000);
        _mint(govReserve,   (MAX_SUPPLY * GOVERNANCE_BPS)   / 10_000);
        _mint(teamVesting,  (MAX_SUPPLY * TEAM_BPS)         / 10_000);

        emit TokensAllocated(treasury, ecosystem, community, institutional, govReserve, teamVesting);
    }

    // ─── Admin Functions ───────────────────────────────────────────────────

    /// @notice Mint additional tokens (only before cap, only MINTER_ROLE)
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ─── Required Overrides (OZ v5 multi-inheritance) ──────────────────────

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20VotesUpgradeable, ERC20CappedUpgradeable)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20PermitUpgradeable, NoncesUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
