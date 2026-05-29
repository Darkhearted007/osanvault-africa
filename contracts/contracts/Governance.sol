// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Governance — DAO voting
/// @notice 100K OSANV proposal threshold, 5M quorum, 7-day voting, 2-day timelock
/// @notice ProposalState: 0=Pending, 1=Active, 2=Defeated, 3=Succeeded, 4=Queued, 5=Executed, 6=Cancelled
contract Governance is AccessControl, Pausable {
    bytes32 public constant PROPOSER_ROLE  = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE  = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");

    IERC20  public votingToken;
    uint256 public votingPeriod       = 7 days;
    uint256 public timelockDelay      = 2 days;
    uint256 public quorumAmount       = 5_000_000 * 1e18;  // 5M OSANV
    uint256 public proposalThreshold  = 100_000   * 1e18;  // 100K OSANV

    struct Proposal {
        uint256 id;
        address proposer;
        string  description;
        uint256 voteStart;
        uint256 voteEnd;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 quorum;
        uint8   state;
        bool    executed;
    }

    uint256 private _proposalCount;
    mapping(uint256 => Proposal)                   private _proposals;
    mapping(uint256 => mapping(address => bool))   private _hasVoted;
    mapping(uint256 => uint256)                    private _queuedAt;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string  description,
        uint256 voteStart,
        uint256 voteEnd
    );
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        bool    support,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event ProposalQueued(uint256 indexed proposalId);
    event ParametersUpdated(uint256 votingPeriod, uint256 quorum, uint256 proposalThreshold);

    constructor(
        address admin,
        address proposer,
        address executor,
        address token
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROPOSER_ROLE,      proposer);
        _grantRole(EXECUTOR_ROLE,      executor);
        _grantRole(CANCELLER_ROLE,     admin);
        votingToken = IERC20(token);
    }

    function createProposal(string calldata description)
        external
        whenNotPaused
        returns (uint256 proposalId)
    {
        require(
            votingToken.balanceOf(msg.sender) >= proposalThreshold,
            "Governance: below threshold"
        );
        proposalId = ++_proposalCount;
        uint256 voteStart = block.timestamp;
        uint256 voteEnd   = voteStart + votingPeriod;

        _proposals[proposalId] = Proposal({
            id:           proposalId,
            proposer:     msg.sender,
            description:  description,
            voteStart:    voteStart,
            voteEnd:      voteEnd,
            forVotes:     0,
            againstVotes: 0,
            quorum:       quorumAmount,
            state:        1, // Active
            executed:     false
        });
        emit ProposalCreated(proposalId, msg.sender, description, voteStart, voteEnd);
    }

    function vote(uint256 proposalId, bool support) external whenNotPaused {
        Proposal storage p = _proposals[proposalId];
        require(p.state == 1,                                    "Governance: not active");
        require(block.timestamp <= p.voteEnd,                    "Governance: voting ended");
        require(!_hasVoted[proposalId][msg.sender],              "Governance: already voted");
        uint256 weight = votingToken.balanceOf(msg.sender);
        require(weight > 0,                                       "Governance: no voting power");

        _hasVoted[proposalId][msg.sender] = true;
        if (support) p.forVotes += weight;
        else         p.againstVotes += weight;
        emit VoteCast(msg.sender, proposalId, support, weight);
    }

    function queueProposal(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) {
        Proposal storage p = _proposals[proposalId];
        require(block.timestamp > p.voteEnd,                              "Governance: voting ongoing");
        require(p.forVotes > p.againstVotes && p.forVotes >= quorumAmount, "Governance: did not pass");
        p.state = 4; // Queued
        _queuedAt[proposalId] = block.timestamp;
        emit ProposalQueued(proposalId);
    }

    function executeProposal(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) {
        Proposal storage p = _proposals[proposalId];
        require(p.state == 4,                                              "Governance: not queued");
        require(block.timestamp >= _queuedAt[proposalId] + timelockDelay, "Governance: timelock active");
        p.state    = 5; // Executed
        p.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function cancelProposal(uint256 proposalId) external onlyRole(CANCELLER_ROLE) {
        _proposals[proposalId].state = 6; // Cancelled
        emit ProposalCancelled(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string  memory description,
        uint256 voteStart,
        uint256 voteEnd,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 quorum,
        uint8   state,
        bool    executed
    ) {
        Proposal storage p = _proposals[proposalId];
        return (
            p.id, p.proposer, p.description,
            p.voteStart, p.voteEnd,
            p.forVotes, p.againstVotes,
            p.quorum, p.state, p.executed
        );
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return _hasVoted[proposalId][voter];
    }

    function updateParameters(
        uint256 votingPeriod_,
        uint256 quorum_,
        uint256 threshold_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        votingPeriod      = votingPeriod_;
        quorumAmount      = quorum_;
        proposalThreshold = threshold_;
        emit ParametersUpdated(votingPeriod_, quorum_, threshold_);
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
