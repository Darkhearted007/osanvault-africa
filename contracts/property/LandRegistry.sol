// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LandRegistry is Ownable {

    // -----------------------------
    // DATA STRUCTURES
    // -----------------------------

    struct LandParcel {
        uint256 id;

        string location;
        string geoHash;

        // Indigenous/community authority (critical for Africa RWA)
        address indigenousAuthority;

        // Legal/government proof (stored as hash of document)
        bytes32 governmentTitleHash;

        // Ownership state
        address currentOwner;

        // Verification flags
        bool indigenousVerified;
        bool governmentVerified;
        bool isFinalized;
        bool isDisputed;

        // Governance approvals
        uint256 approvalCount;
        uint256 rejectionCount;
    }

    // -----------------------------
    // STORAGE
    // -----------------------------

    uint256 public parcelCount;

    mapping(uint256 => LandParcel) public parcels;

    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // -----------------------------
    // EVENTS
    // -----------------------------

    event LandRegistered(uint256 indexed id, string location);
    event OwnershipClaimed(uint256 indexed id, address indexed claimant);
    event LandApproved(uint256 indexed id, address indexed voter);
    event LandRejected(uint256 indexed id, address indexed voter);
    event DisputeRaised(uint256 indexed id, address indexed reporter);
    event LandFinalized(uint256 indexed id, address owner);

    // -----------------------------
    // CORE FUNCTIONS
    // -----------------------------

    constructor() Ownable(msg.sender) {}

    /// @notice Register land with indigenous + government proof
    function registerLand(
        string memory location,
        string memory geoHash,
        address indigenousAuthority,
        bytes32 governmentTitleHash
    ) external onlyOwner returns (uint256) {

        parcelCount++;

        parcels[parcelCount] = LandParcel({
            id: parcelCount,
            location: location,
            geoHash: geoHash,
            indigenousAuthority: indigenousAuthority,
            governmentTitleHash: governmentTitleHash,
            currentOwner: address(0),
            indigenousVerified: false,
            governmentVerified: false,
            isFinalized: false,
            isDisputed: false,
            approvalCount: 0,
            rejectionCount: 0
        });

        emit LandRegistered(parcelCount, location);

        return parcelCount;
    }

    /// @notice Claim ownership (must be validated later)
    function claimOwnership(uint256 id) external {
        require(!parcels[id].isFinalized, "Already finalized");
        require(!parcels[id].isDisputed, "Land disputed");

        parcels[id].currentOwner = msg.sender;

        emit OwnershipClaimed(id, msg.sender);
    }

    /// @notice Governance approval (DAO / validators / admins)
    function approveLand(uint256 id) external {
        require(!hasVoted[id][msg.sender], "Already voted");
        require(!parcels[id].isFinalized, "Already finalized");

        parcels[id].approvalCount++;
        hasVoted[id][msg.sender] = true;

        emit LandApproved(id, msg.sender);
    }

    /// @notice Governance rejection
    function rejectLand(uint256 id) external {
        require(!hasVoted[id][msg.sender], "Already voted");
        require(!parcels[id].isFinalized, "Already finalized");

        parcels[id].rejectionCount++;
        hasVoted[id][msg.sender] = true;

        emit LandRejected(id, msg.sender);
    }

    /// @notice Flag dispute (freezes asset)
    function raiseDispute(uint256 id) external {
        parcels[id].isDisputed = true;
        emit DisputeRaised(id, msg.sender);
    }

    /// @notice Finalize land (ready for NFT minting)
    function finalizeLand(uint256 id) external onlyOwner {

        LandParcel storage land = parcels[id];

        require(!land.isDisputed, "Disputed land cannot finalize");
        require(land.approvalCount > land.rejectionCount, "Not approved");
        require(land.currentOwner != address(0), "No owner");

        land.isFinalized = true;

        emit LandFinalized(id, land.currentOwner);
    }
}
