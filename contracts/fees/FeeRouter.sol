// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FeeRouter is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant CONFIGURER_ROLE = keccak256("CONFIGURER_ROLE");
    bytes32 public constant COLLECTOR_ROLE = keccak256("COLLECTOR_ROLE");

    uint256 public constant BASIS_POINTS = 10_000;

    struct FeeSplit {
        uint256 treasuryBps;
        uint256 burnBps;
        uint256 stakingBps;
        uint256 teamBps;
    }

    FeeSplit public feeSplit;

    address public treasuryVault;
    address public stakingVault;
    address public teamVesting;
    address public burnAddress;

    uint256 public totalFeesCollected;

    event FeeDistributed(
        address indexed token,
        uint256 totalAmount,
        uint256 treasuryAmount,
        uint256 burnAmount,
        uint256 stakingAmount,
        uint256 teamAmount
    );
    event FeeSplitUpdated(
        uint256 treasuryBps,
        uint256 burnBps,
        uint256 stakingBps,
        uint256 teamBps
    );
    event RecipientUpdated(
        string indexed recipientType,
        address indexed oldAddress,
        address indexed newAddress
    );

    constructor(
        address admin,
        address configurer,
        address collector,
        address _treasuryVault,
        address _stakingVault,
        address _teamVesting
    ) {
        require(admin != address(0), "invalid admin");
        require(configurer != address(0), "invalid configurer");
        require(collector != address(0), "invalid collector");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CONFIGURER_ROLE, configurer);
        _grantRole(COLLECTOR_ROLE, collector);

        treasuryVault = _treasuryVault;
        stakingVault = _stakingVault;
        teamVesting = _teamVesting;
        burnAddress = 0x000000000000000000000000000000000000dEaD;

        feeSplit = FeeSplit({
            treasuryBps: 3000,
            burnBps: 2000,
            stakingBps: 4000,
            teamBps: 1000
        });
    }

    function distributeFees(address token, uint256 amount)
        external
        onlyRole(COLLECTOR_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(amount > 0, "amount zero");
        require(
            treasuryVault != address(0) || stakingVault != address(0) || teamVesting != address(0),
            "no recipients"
        );

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        totalFeesCollected += amount;

        uint256 treasuryAmount = amount * feeSplit.treasuryBps / BASIS_POINTS;
        uint256 burnAmount = amount * feeSplit.burnBps / BASIS_POINTS;
        uint256 stakingAmount = amount * feeSplit.stakingBps / BASIS_POINTS;
        uint256 teamAmount = amount * feeSplit.teamBps / BASIS_POINTS;

        uint256 distributed = treasuryAmount + burnAmount + stakingAmount + teamAmount;

        if (distributed < amount) {
            treasuryAmount += amount - distributed;
        }

        if (treasuryAmount > 0 && treasuryVault != address(0)) {
            IERC20(token).safeTransfer(treasuryVault, treasuryAmount);
        }

        if (burnAmount > 0) {
            IERC20(token).safeTransfer(burnAddress, burnAmount);
        }

        if (stakingAmount > 0 && stakingVault != address(0)) {
            IERC20(token).safeTransfer(stakingVault, stakingAmount);
        }

        if (teamAmount > 0 && teamVesting != address(0)) {
            IERC20(token).safeTransfer(teamVesting, teamAmount);
        }

        emit FeeDistributed(
            token,
            amount,
            treasuryAmount,
            burnAmount,
            stakingAmount,
            teamAmount
        );
    }

    function setFeeSplit(
        uint256 treasuryBps,
        uint256 burnBps,
        uint256 stakingBps,
        uint256 teamBps
    )
        external
        onlyRole(CONFIGURER_ROLE)
    {
        require(treasuryBps + burnBps + stakingBps + teamBps == BASIS_POINTS, "must sum to 100%");
        require(burnBps <= 2000, "burn max 20%");

        feeSplit = FeeSplit({
            treasuryBps: treasuryBps,
            burnBps: burnBps,
            stakingBps: stakingBps,
            teamBps: teamBps
        });

        emit FeeSplitUpdated(treasuryBps, burnBps, stakingBps, teamBps);
    }

    function setRecipient(string calldata recipientType, address newAddress)
        external
        onlyRole(CONFIGURER_ROLE)
    {
        require(newAddress != address(0), "invalid address");

        address oldAddress;

        if (keccak256(bytes(recipientType)) == keccak256(bytes("treasury"))) {
            oldAddress = treasuryVault;
            treasuryVault = newAddress;
        } else if (keccak256(bytes(recipientType)) == keccak256(bytes("staking"))) {
            oldAddress = stakingVault;
            stakingVault = newAddress;
        } else if (keccak256(bytes(recipientType)) == keccak256(bytes("team"))) {
            oldAddress = teamVesting;
            teamVesting = newAddress;
        } else {
            revert("unknown recipient type");
        }

        emit RecipientUpdated(recipientType, oldAddress, newAddress);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
