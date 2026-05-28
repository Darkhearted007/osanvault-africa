// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TeamVesting is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    IERC20 public vestingToken;

    struct Beneficiary {
        uint256 totalAllocation;
        uint256 released;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        bool initialized;
    }

    mapping(address => Beneficiary) public beneficiaries;
    address[] public beneficiaryList;

    uint256 public totalAllocated;

    event BeneficiaryAdded(
        address indexed beneficiary,
        uint256 totalAllocation,
        uint256 cliffDuration,
        uint256 vestingDuration
    );
    event TokensReleased(
        address indexed beneficiary,
        uint256 amount
    );
    event BeneficiaryRemoved(address indexed beneficiary);

    constructor(address admin, address manager, address token) {
        require(admin != address(0), "invalid admin");
        require(manager != address(0), "invalid manager");
        require(token != address(0), "invalid token");

        vestingToken = IERC20(token);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, manager);
    }

    function addBeneficiary(
        address beneficiary,
        uint256 totalAllocation,
        uint256 cliffDuration,
        uint256 vestingDuration
    )
        external
        onlyRole(MANAGER_ROLE)
    {
        require(beneficiary != address(0), "invalid beneficiary");
        require(totalAllocation > 0, "zero allocation");
        require(!beneficiaries[beneficiary].initialized, "already added");
        require(cliffDuration <= vestingDuration, "cliff > vesting");
        require(vestingDuration > 0, "zero vesting");

        uint256 balance = vestingToken.balanceOf(address(this));
        require(balance >= totalAllocation, "insufficient balance");

        beneficiaries[beneficiary] = Beneficiary({
            totalAllocation: totalAllocation,
            released: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            initialized: true
        });

        beneficiaryList.push(beneficiary);
        totalAllocated += totalAllocation;

        emit BeneficiaryAdded(beneficiary, totalAllocation, cliffDuration, vestingDuration);
    }

    function release() external nonReentrant {
        Beneficiary storage b = beneficiaries[msg.sender];
        require(b.initialized, "not a beneficiary");

        uint256 releasable = _releasableAmount(msg.sender);
        require(releasable > 0, "nothing to release");

        b.released += releasable;
        vestingToken.safeTransfer(msg.sender, releasable);

        emit TokensReleased(msg.sender, releasable);
    }

    function releaseFor(address beneficiary) external nonReentrant onlyRole(MANAGER_ROLE) {
        Beneficiary storage b = beneficiaries[beneficiary];
        require(b.initialized, "not a beneficiary");

        uint256 releasable = _releasableAmount(beneficiary);
        require(releasable > 0, "nothing to release");

        b.released += releasable;
        vestingToken.safeTransfer(beneficiary, releasable);

        emit TokensReleased(beneficiary, releasable);
    }

    function _releasableAmount(address beneficiary) internal view returns (uint256) {
        Beneficiary storage b = beneficiaries[beneficiary];

        if (block.timestamp < b.startTime + b.cliffDuration) {
            return 0;
        }

        if (block.timestamp >= b.startTime + b.vestingDuration) {
            return b.totalAllocation - b.released;
        }

        uint256 elapsed = block.timestamp - b.startTime;
        uint256 vested = (b.totalAllocation * elapsed) / b.vestingDuration;

        if (vested <= b.released) return 0;
        return vested - b.released;
    }

    function releasableAmount(address beneficiary) external view returns (uint256) {
        return _releasableAmount(beneficiary);
    }

    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaryList.length;
    }

    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaryList;
    }

    function emergencyWithdraw(address to, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(to != address(0), "invalid recipient");
        uint256 maxWithdraw = vestingToken.balanceOf(address(this)) - (totalAllocated - _totalReleased());
        require(amount <= maxWithdraw, "exceeds unallocated");
        vestingToken.safeTransfer(to, amount);
    }

    function _totalReleased() internal view returns (uint256) {
        uint256 total;
        for (uint256 i = 0; i < beneficiaryList.length; i++) {
            total += beneficiaries[beneficiaryList[i]].released;
        }
        return total;
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
