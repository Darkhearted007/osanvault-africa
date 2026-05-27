// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * OSANVault Treasury
 * Central financial routing layer
 */
contract TreasuryVault is Ownable {

    uint256 public totalFunds;

    uint256 public reserveRatio = 20; // 20% safety reserve
    uint256 public yieldPoolRatio = 60;
    uint256 public opsRatio = 20;

    mapping(address => uint256) public balances;

    event Deposit(address indexed from, uint256 amount);
    event Allocation(uint256 reserve, uint256 yieldPool, uint256 ops);

    /**
     * Receive funds (USDC / ETH / stablecoins later)
     */
    receive() external payable {
        deposit();
    }

    function deposit() public payable {
        require(msg.value > 0, "No funds");

        totalFunds += msg.value;
        balances[msg.sender] += msg.value;

        emit Deposit(msg.sender, msg.value);

        _allocate(msg.value);
    }

    function _allocate(uint256 amount) internal {
        uint256 reserve = (amount * reserveRatio) / 100;
        uint256 yieldPool = (amount * yieldPoolRatio) / 100;
        uint256 ops = (amount * opsRatio) / 100;

        emit Allocation(reserve, yieldPool, ops);

        // future: send to sub-vaults
    }

    function setRatios(
        uint256 _reserve,
        uint256 _yield,
        uint256 _ops
    ) external onlyOwner {
        require(_reserve + _yield + _ops == 100, "Invalid ratios");

        reserveRatio = _reserve;
        yieldPoolRatio = _yield;
        opsRatio = _ops;
    }
}
