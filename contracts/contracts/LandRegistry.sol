// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title LandRegistry — dual verification: government title + indigenous authority
/// @notice Both verifications must pass before PropertyNFT can mint for a property
contract LandRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant VERIFIER_ROLE  = keccak256("VERIFIER_ROLE");

    struct LandTitle {
        bytes32 governmentTitleHash;
        address indigenousAuthority;
        bool    governmentVerified;
        bool    indigenousVerified;
        bool    exists;
    }

    mapping(uint256 => LandTitle) public titles;

    event TitleRegistered(
        uint256 indexed propertyId,
        bytes32         governmentTitleHash,
        address         indigenousAuthority
    );
    event GovernmentVerified(uint256 indexed propertyId, address indexed verifier);
    event IndigenousVerified(uint256 indexed propertyId, address indexed authority);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(VERIFIER_ROLE,  admin);
    }

    function registerTitle(
        uint256 propertyId,
        bytes32 governmentTitleHash,
        address indigenousAuthority
    ) external onlyRole(REGISTRAR_ROLE) {
        require(!titles[propertyId].exists, "LandRegistry: already registered");
        titles[propertyId] = LandTitle({
            governmentTitleHash: governmentTitleHash,
            indigenousAuthority: indigenousAuthority,
            governmentVerified:  false,
            indigenousVerified:  false,
            exists:              true
        });
        emit TitleRegistered(propertyId, governmentTitleHash, indigenousAuthority);
    }

    function verifyGovernment(uint256 propertyId) external onlyRole(VERIFIER_ROLE) {
        require(titles[propertyId].exists, "LandRegistry: not registered");
        titles[propertyId].governmentVerified = true;
        emit GovernmentVerified(propertyId, msg.sender);
    }

    function verifyIndigenous(uint256 propertyId) external {
        LandTitle storage t = titles[propertyId];
        require(t.exists, "LandRegistry: not registered");
        require(msg.sender == t.indigenousAuthority, "LandRegistry: not indigenous authority");
        t.indigenousVerified = true;
        emit IndigenousVerified(propertyId, msg.sender);
    }

    function isFullyVerified(uint256 propertyId) external view returns (bool) {
        LandTitle storage t = titles[propertyId];
        return t.exists && t.governmentVerified && t.indigenousVerified;
    }

    function getTitle(uint256 propertyId) external view returns (
        bytes32 governmentTitleHash,
        address indigenousAuthority,
        bool    governmentVerified,
        bool    indigenousVerified
    ) {
        LandTitle storage t = titles[propertyId];
        return (t.governmentTitleHash, t.indigenousAuthority, t.governmentVerified, t.indigenousVerified);
    }
}
