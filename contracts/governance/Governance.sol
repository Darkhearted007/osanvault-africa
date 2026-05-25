// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Governance is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    IERC20 public immutable governanceToken;
    uint256 public proposalCount;
    uint256 public quorumPercentage;
    uint256 public votingDelay;
    uint256 public votingPeriod;
    uint256 public executionDelay;
    uint256 public proposalThreshold;

    enum ProposalState { Pending, Active, Defeated, Succeeded, Queued, Executed, Cancelled }

    struct Proposal {
        address proposer;
        string description;
        address[] targets;
        bytes[] calldatas;
        uint256 value;
        uint256 createdAt;
        uint256 votingStart;
        uint256 votingEnd;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool cancelled;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, address indexed proposer, string description, uint256 votingStart, uint256 votingEnd);
    event VoteCast(uint256 indexed id, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCancelled(uint256 indexed id);
    event QuorumUpdated(uint256 oldQ, uint256 newQ);
    event VotingPeriodUpdated(uint256 oldP, uint256 newP);
    event ExecutionDelayUpdated(uint256 oldD, uint256 newD);

    constructor(
        address _governanceToken, address admin,
        uint256 _quorumPercentage, uint256 _votingDelay, uint256 _votingPeriod, uint256 _executionDelay, uint256 _proposalThreshold
    ) {
        require(_governanceToken != address(0), "invalid token");
        require(admin != address(0), "invalid admin");
        require(_quorumPercentage > 0 && _quorumPercentage <= 200, "invalid quorum");
        governanceToken = IERC20(_governanceToken);
        quorumPercentage = _quorumPercentage;
        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        executionDelay = _executionDelay;
        proposalThreshold = _proposalThreshold;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(EXECUTOR_ROLE, admin);
    }

    function propose(address[] calldata targets, bytes[] calldata calldatas, uint256 value, string calldata description)
        external whenNotPaused returns (uint256)
    {
        require(targets.length > 0, "no targets");
        require(targets.length == calldatas.length, "length mismatch");
        require(bytes(description).length > 0, "empty description");
        require(governanceToken.balanceOf(msg.sender) >= proposalThreshold, "insufficient voting power");
        proposalCount++;
        uint256 vs = block.timestamp + votingDelay;
        uint256 ve = vs + votingPeriod;
        Proposal storage p = proposals[proposalCount];
        p.proposer = msg.sender;
        p.description = description;
        p.targets = targets;
        p.calldatas = calldatas;
        p.value = value;
        p.createdAt = block.timestamp;
        p.votingStart = vs;
        p.votingEnd = ve;
        emit ProposalCreated(proposalCount, msg.sender, description, vs, ve);
        return proposalCount;
    }

    function vote(uint256 proposalId, bool support) external whenNotPaused {
        Proposal storage p = proposals[proposalId];
        require(p.createdAt != 0, "not found");
        require(block.timestamp >= p.votingStart, "voting not started");
        require(block.timestamp <= p.votingEnd, "voting ended");
        require(!hasVoted[proposalId][msg.sender], "already voted");
        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "no voting power");
        hasVoted[proposalId][msg.sender] = true;
        if (support) p.forVotes += weight; else p.againstVotes += weight;
        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function execute(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(p.createdAt != 0, "not found");
        require(!p.executed && !p.cancelled, "already executed/cancelled");
        require(block.timestamp >= p.votingEnd, "voting not ended");
        require(block.timestamp >= p.votingEnd + executionDelay, "execution delay not met");
        require(p.forVotes > p.againstVotes, "defeated");
        uint256 totalSupply = governanceToken.totalSupply();
        require(p.forVotes + p.againstVotes >= totalSupply * quorumPercentage / 100, "quorum not met");
        p.executed = true;
        for (uint256 i = 0; i < p.targets.length; i++) {
            (bool success, ) = p.targets[i].call{value: p.value}(p.calldatas[i]);
            require(success, "execution failed");
        }
        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) external onlyRole(ADMIN_ROLE) {
        Proposal storage p = proposals[proposalId];
        require(p.createdAt != 0 && !p.executed && !p.cancelled, "invalid state");
        p.cancelled = true;
        emit ProposalCancelled(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (ProposalState) {
        Proposal storage p = proposals[proposalId];
        require(p.createdAt != 0, "not found");
        if (p.executed) return ProposalState.Executed;
        if (p.cancelled) return ProposalState.Cancelled;
        if (block.timestamp < p.votingStart) return ProposalState.Pending;
        if (block.timestamp <= p.votingEnd) return ProposalState.Active;
        if (p.forVotes > p.againstVotes) {
            uint256 totalSupply = governanceToken.totalSupply();
            if (p.forVotes + p.againstVotes >= totalSupply * quorumPercentage / 100) {
                return block.timestamp >= p.votingEnd + executionDelay ? ProposalState.Queued : ProposalState.Succeeded;
            }
        }
        return ProposalState.Defeated;
    }

    function setQuorum(uint256 q) external onlyRole(ADMIN_ROLE) { require(q > 0 && q <= 200, "invalid"); emit QuorumUpdated(quorumPercentage, q); quorumPercentage = q; }
    function setVotingPeriod(uint256 vp) external onlyRole(ADMIN_ROLE) { emit VotingPeriodUpdated(votingPeriod, vp); votingPeriod = vp; }
    function setExecutionDelay(uint256 ed) external onlyRole(ADMIN_ROLE) { emit ExecutionDelayUpdated(executionDelay, ed); executionDelay = ed; }
    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}