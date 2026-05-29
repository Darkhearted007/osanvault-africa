// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IBurnable {
    function burn(uint256 amount) external;
}

/// @title FeeRouter — splits protocol fees: 30% treasury / 20% burn / 40% staking / 10% team
contract FeeRouter is AccessControl {
    using SafeERC20 for IERC20;

    uint256 public constant TREASURY_BPS = 3000;
    uint256 public constant BURN_BPS     = 2000;
    uint256 public constant STAKING_BPS  = 4000;
    uint256 public constant TEAM_BPS     = 1000;

    address public treasury;
    address public stakingVault;
    address public team;
    address public osanvToken;

    event FeesRouted(
        uint256 total,
        uint256 toTreasury,
        uint256 burned,
        uint256 toStaking,
        uint256 toTeam
    );
    event ReceiversUpdated(address indexed treasury, address indexed stakingVault, address indexed team);

    constructor(
        address admin,
        address treasury_,
        address stakingVault_,
        address team_,
        address osanvToken_
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        treasury     = treasury_;
        stakingVault = stakingVault_;
        team         = team_;
        osanvToken   = osanvToken_;
    }

    function routeFees(uint256 amount) external {
        IERC20 token = IERC20(osanvToken);
        token.safeTransferFrom(msg.sender, address(this), amount);

        uint256 toTreasury = (amount * TREASURY_BPS) / 10000;
        uint256 toBurn     = (amount * BURN_BPS)     / 10000;
        uint256 toStaking  = (amount * STAKING_BPS)  / 10000;
        uint256 toTeam     = amount - toTreasury - toBurn - toStaking;

        token.safeTransfer(treasury, toTreasury);

        // Transfer to this contract first so the token can burn from address(this)
        IBurnable(osanvToken).burn(toBurn);

        token.safeTransfer(stakingVault, toStaking);
        token.safeTransfer(team, toTeam);

        emit FeesRouted(amount, toTreasury, toBurn, toStaking, toTeam);
    }

    function setReceivers(
        address treasury_,
        address stakingVault_,
        address team_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        treasury     = treasury_;
        stakingVault = stakingVault_;
        team         = team_;
        emit ReceiversUpdated(treasury_, stakingVault_, team_);
    }
}
