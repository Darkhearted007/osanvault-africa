// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC - Simple ERC20 mock for testing
/// @notice Provides mint/burn capabilities for local development and test suites
/// @dev Non-upgradeable ERC20 with configurable decimals
contract MockUSDC is ERC20 {
    uint8 private _decimalsValue;

    /// @notice Creates a new MockUSDC token
    /// @param name_ Token name
    /// @param symbol_ Token symbol
    /// @param decimals_ Number of decimals
    constructor(string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_) {
        _decimalsValue = decimals_;
    }

    /// @notice Returns the number of decimals used
    /// @return Token decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimalsValue;
    }

    /// @notice Mints tokens to an address
    /// @param to Recipient address
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Burns tokens from an address
    /// @param from Address to burn from
    /// @param amount Amount to burn
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
