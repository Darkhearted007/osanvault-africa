// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TeamVesting is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    struct Beneficiary {
        uint256 totalAllocation;
        uint256 released;
        uint256 cliffDuration;
        uint256 cliffEnd;
        bool exists;
    }

    address[] public beneficiaries;
    mapping(address => Beneficiary) public beneficiariesInfo;
    uint256 public immutable start;
    uint256 public immutable duration;

    event BeneficiaryAdded(address indexed beneficiary, uint256 allocation, uint256 cliffDuration);
    event BeneficiaryRemoved(address indexed beneficiary);
    event TokensReleased(address indexed beneficiary, uint256 amount);

    constructor(
        address tokenAddress,
        uint256 vestingDuration,
        address owner_
    ) Ownable(owner_) {
        require(tokenAddress != address(0), "invalid token");
        require(vestingDuration > 0, "duration zero");
        require(owner_ != address(0), "invalid owner");
        token = IERC20(tokenAddress);
        duration = vestingDuration;
        start = block.timestamp;
    }

    function addBeneficiary(address beneficiary, uint256 allocation, uint256 cliffDuration) external onlyOwner {
        require(beneficiary != address(0), "invalid beneficiary");
        require(allocation > 0, "allocation zero");
        require(!beneficiariesInfo[beneficiary].exists, "already added");
        require(cliffDuration <= duration, "cliff exceeds duration");
        beneficiariesInfo[beneficiary] = Beneficiary({
            totalAllocation: allocation,
            released: 0,
            cliffDuration: cliffDuration,
            cliffEnd: block.timestamp + cliffDuration,
            exists: true
        });
        beneficiaries.push(beneficiary);
        emit BeneficiaryAdded(beneficiary, allocation, cliffDuration);
    }

    function removeBeneficiary(address beneficiary) external onlyOwner {
        require(beneficiariesInfo[beneficiary].exists, "not found");
        require(beneficiariesInfo[beneficiary].released == 0, "already released");
        delete beneficiariesInfo[beneficiary];
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i] == beneficiary) {
                beneficiaries[i] = beneficiaries[beneficiaries.length - 1];
                beneficiaries.pop();
                break;
            }
        }
        emit BeneficiaryRemoved(beneficiary);
    }

    function releasable(address beneficiary) public view returns (uint256) {
        Beneficiary memory b = beneficiariesInfo[beneficiary];
        if (!b.exists) return 0;
        if (block.timestamp < b.cliffEnd) return 0;
        uint256 elapsed = block.timestamp - start;
        if (elapsed >= duration) return b.totalAllocation - b.released;
        uint256 vested = (b.totalAllocation * elapsed) / duration;
        return vested - b.released;
    }

    function release(address beneficiary) external {
        Beneficiary storage b = beneficiariesInfo[beneficiary];
        require(b.exists, "not found");
        uint256 amount = releasable(beneficiary);
        require(amount > 0, "nothing to release");
        b.released += amount;
        token.safeTransfer(beneficiary, amount);
        emit TokensReleased(beneficiary, amount);
    }

    function releaseAll() external {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            address beneficiary = beneficiaries[i];
            uint256 amount = releasable(beneficiary);
            if (amount > 0) {
                Beneficiary storage b = beneficiariesInfo[beneficiary];
                b.released += amount;
                token.safeTransfer(beneficiary, amount);
                emit TokensReleased(beneficiary, amount);
            }
        }
    }

    function getBeneficiaries() external view returns (address[] memory) { return beneficiaries; }
    function getBeneficiaryCount() external view returns (uint256) { return beneficiaries.length; }
}