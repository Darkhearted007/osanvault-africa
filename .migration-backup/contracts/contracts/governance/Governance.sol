// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../interfaces/IOSANVToken.sol";
import "../libraries/Errors.sol";

/// @title Governance — DAO-lite on-chain voting with ERC20Votes snapshots
/// @notice Vote weight is read from a snapshot taken at proposal creation block (getPastVotes).
///         This prevents flash-loan vote manipulation present in live-balance systems.
///         IMPORTANT: Token holders must call osanvToken.delegate(self) to activate voting power.
///         Parameters: 100K OSANV to propose · 5M quorum · 7-day voting · 1-block delay · 2-day timelock.
///
///         Proposal states: 0=Pending · 1=Active · 2=Defeated · 3=Succeeded · 4=Queued · 5=Executed · 6=Cancelled
contract Governance is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    // ─── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant EXECUTOR_ROLE  = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");

    // ─── Parameters ────────────────────────────────────────────────────────
    IOSANVToken public votingToken;
    uint256 public votingDelay;       // blocks between proposal creation and voting start
    uint256 public votingPeriod;      // seconds for active voting window
    uint256 public timelockDelay;     // seconds between queue and execute
    uint256 public quorumAmount;      // minimum forVotes to pass
    uint256 public proposalThreshold; // minimum OSANV to create a proposal

    // ─── Data ──────────────────────────────────────────────────────────────
    struct Proposal {
        uint256 id;
        address proposer;
        string  description;
        uint256 snapshotBlock;  // block.number at creation — getPastVotes reads from here
        uint256 voteStart;      // block.timestamp when voting opens
        uint256 voteEnd;        // block.timestamp when voting closes
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint8   state;          // see state enum above
        bool    executed;
    }

    uint256 private _proposalCount;
    mapping(uint256 => Proposal)                 private _proposals;
    mapping(uint256 => mapping(address => bool)) private _hasVoted;
    mapping(uint256 => uint256)                  private _queuedAt;

    // ─── Events ────────────────────────────────────────────────────────────
    event ProposalCreated(
        uint256 indexed proposalId, address indexed proposer,
        string description, uint256 snapshotBlock, uint256 voteStart, uint256 voteEnd
    );
    event VoteCast(
        address indexed voter, uint256 indexed proposalId,
        uint8 support, uint256 weight
    );
    event ProposalQueued(uint256 indexed proposalId, uint256 executeAfter);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event ParametersUpdated(
        uint256 votingDelay, uint256 votingPeriod, uint256 timelockDelay,
        uint256 quorum, uint256 threshold
    );

    // ─── Init ──────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address admin,
        address executor,
        address token
    ) public initializer {
        if (token == address(0)) revert Errors.ZeroAddress();
        __AccessControl_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EXECUTOR_ROLE,      executor);
        _grantRole(CANCELLER_ROLE,     admin);

        votingToken        = IOSANVToken(token);
        votingDelay        = 1;                         // 1 block
        votingPeriod       = 7 days;
        timelockDelay      = 2 days;
        quorumAmount       = 5_000_000  * 1e18;
        proposalThreshold  = 100_000    * 1e18;
    }

    // ─── Proposal Lifecycle ────────────────────────────────────────────────

    /// @notice Create a proposal. Caller needs ≥ proposalThreshold past votes (delegated).
    function createProposal(
        string calldata description
    ) external whenNotPaused returns (uint256 proposalId) {
        // Use snapshot block for threshold check too — prevents same-block manipulation
        uint256 snapshot = block.number;
        if (votingToken.getPastVotes(msg.sender, snapshot > 0 ? snapshot - 1 : 0) < proposalThreshold) {
            revert Errors.BelowProposalThreshold();
        }

        proposalId = ++_proposalCount;
        uint256 voteStart = block.timestamp + (votingDelay * 2 seconds); // ~2s/block on Polygon
        uint256 voteEnd   = voteStart + votingPeriod;

        _proposals[proposalId] = Proposal({
            id:            proposalId,
            proposer:      msg.sender,
            description:   description,
            snapshotBlock: snapshot,
            voteStart:     voteStart,
            voteEnd:       voteEnd,
            forVotes:      0,
            againstVotes:  0,
            abstainVotes:  0,
            state:         1, // Active
            executed:      false
        });
        emit ProposalCreated(proposalId, msg.sender, description, snapshot, voteStart, voteEnd);
    }

    // ─── Voting ────────────────────────────────────────────────────────────

    /// @param support  0 = Against · 1 = For · 2 = Abstain
    function vote(
        uint256 proposalId,
        uint8   support
    ) external whenNotPaused {
        Proposal storage p = _proposals[proposalId];
        if (p.state != 1)                         revert Errors.ProposalNotActive();
        if (block.timestamp < p.voteStart)        revert Errors.ProposalNotActive();
        if (block.timestamp > p.voteEnd)          revert Errors.VotingPeriodEnded();
        if (_hasVoted[proposalId][msg.sender])    revert Errors.AlreadyVoted();
        if (support > 2)                          revert Errors.InvalidState();

        // Read votes at snapshot block — immune to flash loans
        uint256 weight = votingToken.getPastVotes(msg.sender, p.snapshotBlock);
        if (weight == 0) revert Errors.InsufficientVotingPower();

        _hasVoted[proposalId][msg.sender] = true;
        if      (support == 1) p.forVotes     += weight;
        else if (support == 0) p.againstVotes += weight;
        else                   p.abstainVotes += weight;

        emit VoteCast(msg.sender, proposalId, support, weight);
    }

    // ─── Queue & Execute ───────────────────────────────────────────────────

    function queueProposal(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) {
        Proposal storage p = _proposals[proposalId];
        if (p.state != 1)                    revert Errors.ProposalNotActive();
        if (block.timestamp <= p.voteEnd)    revert Errors.VotingPeriodEnded();
        if (p.forVotes < quorumAmount)       revert Errors.QuorumNotMet();
        if (p.forVotes <= p.againstVotes)    revert Errors.QuorumNotMet();

        p.state = 4; // Queued
        _queuedAt[proposalId] = block.timestamp;
        emit ProposalQueued(proposalId, block.timestamp + timelockDelay);
    }

    function executeProposal(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) {
        Proposal storage p = _proposals[proposalId];
        if (p.state != 4) revert Errors.ProposalNotQueued();
        if (block.timestamp < _queuedAt[proposalId] + timelockDelay) {
            revert Errors.TimelockNotExpired();
        }
        p.state    = 5; // Executed
        p.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function cancelProposal(uint256 proposalId) external onlyRole(CANCELLER_ROLE) {
        if (_proposals[proposalId].state == 5) revert Errors.InvalidState();
        _proposals[proposalId].state = 6; // Cancelled
        emit ProposalCancelled(proposalId);
    }

    // ─── Parameter Updates ─────────────────────────────────────────────────

    function updateParameters(
        uint256 votingDelay_,
        uint256 votingPeriod_,
        uint256 timelockDelay_,
        uint256 quorum_,
        uint256 threshold_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        votingDelay       = votingDelay_;
        votingPeriod      = votingPeriod_;
        timelockDelay     = timelockDelay_;
        quorumAmount      = quorum_;
        proposalThreshold = threshold_;
        emit ParametersUpdated(votingDelay_, votingPeriod_, timelockDelay_, quorum_, threshold_);
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ─── Views ─────────────────────────────────────────────────────────────

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return _proposals[proposalId];
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return _hasVoted[proposalId][voter];
    }

    function proposalCount() external view returns (uint256) {
        return _proposalCount;
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[50] private __gap;
}
