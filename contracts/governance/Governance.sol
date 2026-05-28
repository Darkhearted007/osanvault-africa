// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Governance is AccessControl, Pausable {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    IERC20 public votingToken;

    enum ProposalState { Pending, Active, Defeated, Succeeded, Queued, Executed, Cancelled }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        bytes[] calldatas;
        address[] targets;
        uint256 createdAt;
        uint256 voteStart;
        uint256 voteEnd;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 quorum;
        ProposalState state;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votePower;
    }

    uint256 public votingDelay;
    uint256 public votingPeriod;
    uint256 public proposalThreshold;
    uint256 public quorumThreshold;
    uint256 public timelockDuration;

    uint256 public proposalCount;

    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 voteStart,
        uint256 voteEnd
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 power,
        bool support
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event ProposalQueued(uint256 indexed proposalId);
    event ParametersUpdated(
        uint256 votingDelay,
        uint256 votingPeriod,
        uint256 proposalThreshold,
        uint256 quorumThreshold,
        uint256 timelockDuration
    );

    constructor(
        address admin,
        address proposer,
        address executor,
        address token
    ) {
        require(admin != address(0), "invalid admin");
        require(proposer != address(0), "invalid proposer");
        require(executor != address(0), "invalid executor");
        require(token != address(0), "invalid token");

        votingToken = IERC20(token);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROPOSER_ROLE, proposer);
        _grantRole(EXECUTOR_ROLE, executor);

        votingDelay = 1 days;
        votingPeriod = 7 days;
        proposalThreshold = 100_000 * 1e18;
        quorumThreshold = 5_000_000 * 1e18;
        timelockDuration = 2 days;
    }

    function propose(
        string calldata description,
        bytes[] calldata calldatas,
        address[] calldata targets
    )
        external
        onlyRole(PROPOSER_ROLE)
        whenNotPaused
        returns (uint256 proposalId)
    {
        require(targets.length > 0, "no targets");
        require(targets.length == calldatas.length, "length mismatch");
        require(bytes(description).length > 0, "empty description");

        uint256 proposerBalance = votingToken.balanceOf(msg.sender);
        require(proposerBalance >= proposalThreshold, "below threshold");

        proposalId = ++proposalCount;

        Proposal storage p = proposals[proposalId];
        p.id = proposalId;
        p.proposer = msg.sender;
        p.description = description;
        p.calldatas = calldatas;
        p.targets = targets;
        p.createdAt = block.timestamp;
        p.voteStart = block.timestamp + votingDelay;
        p.voteEnd = block.timestamp + votingDelay + votingPeriod;
        p.quorum = quorumThreshold;
        p.state = ProposalState.Pending;

        emit ProposalCreated(proposalId, msg.sender, description, p.voteStart, p.voteEnd);
    }

    function castVote(uint256 proposalId, bool support) external whenNotPaused {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Pending || p.state == ProposalState.Active, "not active");
        require(block.timestamp >= p.voteStart, "voting not started");
        require(block.timestamp < p.voteEnd, "voting ended");
        require(!p.hasVoted[msg.sender], "already voted");

        p.state = ProposalState.Active;

        uint256 power = votingToken.balanceOf(msg.sender);
        require(power > 0, "no voting power");

        p.hasVoted[msg.sender] = true;
        p.votePower[msg.sender] = power;

        if (support) {
            p.forVotes += power;
        } else {
            p.againstVotes += power;
        }

        emit VoteCast(proposalId, msg.sender, power, support);
    }

    function queue(uint256 proposalId) external onlyRole(PROPOSER_ROLE) {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Active || block.timestamp >= p.voteEnd, "voting not ended");
        require(block.timestamp >= p.voteEnd, "voting not ended");
        require(p.forVotes > p.againstVotes, "proposal defeated");
        require(p.forVotes >= p.quorum, "quorum not met");
        require(!p.executed, "already executed");

        p.state = ProposalState.Succeeded;
        p.state = ProposalState.Queued;

        emit ProposalQueued(proposalId);
    }

    function execute(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) whenNotPaused {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Queued, "not queued");
        require(
            block.timestamp >= p.voteEnd + timelockDuration,
            "timelock not expired"
        );
        require(!p.executed, "already executed");

        p.executed = true;
        p.state = ProposalState.Executed;

        for (uint256 i = 0; i < p.targets.length; i++) {
            (bool success,) = p.targets[i].call(p.calldatas[i]);
            require(success, "call failed");
        }

        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) external onlyRole(PROPOSER_ROLE) {
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "already executed");
        require(
            p.state != ProposalState.Executed && p.state != ProposalState.Cancelled,
            "invalid state"
        );

        p.state = ProposalState.Cancelled;
        emit ProposalCancelled(proposalId);
    }

    function updateParameters(
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumThreshold,
        uint256 _timelockDuration
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_votingPeriod >= 1 days, "period too short");
        require(_quorumThreshold > 0, "quorum zero");
        require(_timelockDuration >= 1 days, "timelock too short");

        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        proposalThreshold = _proposalThreshold;
        quorumThreshold = _quorumThreshold;
        timelockDuration = _timelockDuration;

        emit ParametersUpdated(
            _votingDelay,
            _votingPeriod,
            _proposalThreshold,
            _quorumThreshold,
            _timelockDuration
        );
    }

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            uint256 id,
            address proposer,
            string memory description,
            uint256 voteStart,
            uint256 voteEnd,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 quorum,
            ProposalState state,
            bool executed
        )
    {
        Proposal storage p = proposals[proposalId];
        return (
            p.id,
            p.proposer,
            p.description,
            p.voteStart,
            p.voteEnd,
            p.forVotes,
            p.againstVotes,
            p.quorum,
            p.state,
            p.executed
        );
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
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
