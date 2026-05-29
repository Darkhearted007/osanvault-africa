// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract OSANVToken is ERC20Permit, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY = 500_000_000 * 1e18;
    uint256 public constant BURN_FLOOR = 250_000_000 * 1e18;

    event TreasuryBurn(address indexed caller, uint256 amount);

    constructor(address admin, address minter, address burner, address pauser)
        ERC20("OsanVault Africa", "OSANV")
        ERC20Permit("OsanVault Africa")
    {
        require(admin != address(0), "invalid admin");
        require(minter != address(0), "invalid minter");
        require(burner != address(0), "invalid burner");
        require(pauser != address(0), "invalid pauser");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(BURNER_ROLE, burner);
        _grantRole(PAUSER_ROLE, pauser);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "exceeds max supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) public override onlyRole(BURNER_ROLE) whenNotPaused {
        require(totalSupply() - amount >= BURN_FLOOR, "cannot burn below floor");
        _burn(_msgSender(), amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyRole(BURNER_ROLE) whenNotPaused {
        uint256 currentAllowance = allowance(account, _msgSender());
        require(currentAllowance >= amount, "insufficient allowance");
        _approve(account, _msgSender(), currentAllowance - amount);
        require(totalSupply() - amount >= BURN_FLOOR, "cannot burn below floor");
        _burn(account, amount);
    }

    function treasuryBurn(uint256 amount) external onlyRole(BURNER_ROLE) whenNotPaused {
        require(totalSupply() - amount >= BURN_FLOOR, "cannot burn below floor");
        _burn(_msgSender(), amount);
        emit TreasuryBurn(_msgSender(), amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20)
        whenNotPaused
    {
        super._update(from, to, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
