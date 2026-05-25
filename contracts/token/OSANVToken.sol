// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract OSANVToken is ERC20, ERC20Burnable, ERC20Permit, AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public constant MAX_SUPPLY = 500_000_000 * 1e18;
    uint256 public constant BURN_FLOOR = 250_000_000 * 1e18;

    event QuarterlyBurn(uint256 amount, uint256 newSupply);
    event TreasuryAllocation(address indexed treasury, uint256 amount);

    constructor(
        address admin,
        address treasury,
        address ecosystem,
        address liquidity,
        address publicSale,
        address teamVesting
    )
        ERC20("OSANV", "OSANV")
        ERC20Permit("OSANV")
    {
        require(admin != address(0), "invalid admin");
        require(treasury != address(0), "invalid treasury");
        require(ecosystem != address(0), "invalid ecosystem");
        require(liquidity != address(0), "invalid liquidity");
        require(publicSale != address(0), "invalid publicSale");
        require(teamVesting != address(0), "invalid teamVesting");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(TREASURY_ROLE, treasury);
        _grantRole(BURNER_ROLE, treasury);

        _mint(publicSale, 125_000_000 * 1e18);
        _mint(ecosystem, 100_000_000 * 1e18);
        _mint(teamVesting, 75_000_000 * 1e18);
        _mint(treasury, 75_000_000 * 1e18);
        _mint(liquidity, 50_000_000 * 1e18);
        _mint(admin, 75_000_000 * 1e18);

        require(totalSupply() == MAX_SUPPLY, "supply mismatch");

        emit TreasuryAllocation(treasury, 75_000_000 * 1e18);
    }

    function quarterlyBurn(uint256 amount)
        external
        onlyRole(TREASURY_ROLE)
    {
        require(amount > 0, "amount zero");
        uint256 supplyAfterBurn = totalSupply() - amount;
        require(supplyAfterBurn >= BURN_FLOOR, "below burn floor");
        _burn(msg.sender, amount);
        emit QuarterlyBurn(amount, supplyAfterBurn);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }
}