// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PayoutManager - Treasury payout management with timelock and multi-signature approval
/// @notice Manages payouts from the treasury vault with an approval workflow and timelock.
/// @dev Uses UUPS upgradeable pattern. Inherits AccessControl, Pausable, ReentrancyGuard.
contract PayoutManager is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant PAYOUT_APPROVER_ROLE = keccak256("PAYOUT_APPROVER_ROLE");
    bytes32 public constant PAYOUT_CREATOR_ROLE = keccak256("PAYOUT_CREATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice Status lifecycle of a payout.
    enum PayoutStatus { PENDING, APPROVED, REJECTED, EXECUTED, CANCELLED }

    /// @notice Full payout record.
    struct Payout {
        uint256 payoutId;
        address recipient;
        address token;
        uint256 amount;
        PayoutStatus status;
        uint256 timelockEnd;
        uint256 createdAt;
        address creator;
        uint256 approvalCount;
    }

    uint256 private _nextPayoutId;
    uint256 public timelockDuration;
    address public treasuryVault;
    uint256 public approvalThreshold;

    mapping(uint256 => Payout) private _payouts;
    mapping(uint256 => mapping(address => bool)) private _approvals;

    event PayoutSubmitted(uint256 indexed payoutId, address indexed recipient, uint256 amount, address indexed creator);
    event PayoutApproved(uint256 indexed payoutId, address indexed approver);
    event PayoutRejected(uint256 indexed payoutId, address indexed rejector);
    event PayoutExecuted(uint256 indexed payoutId, address indexed recipient, uint256 amount);
    event PayoutCancelled(uint256 indexed payoutId);
    event TimelockDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event TreasuryVaultUpdated(address indexed oldVault, address indexed newVault);
    event ApprovalThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @notice Initialize the contract.
    /// @param admin Address granted DEFAULT_ADMIN_ROLE, PAYOUT_CREATOR_ROLE, PAYOUT_APPROVER_ROLE, UPGRADER_ROLE.
    /// @param treasuryVault_ Address holding treasury funds.
    /// @param timelockDuration_ Seconds after approval before payout can execute.
    /// @param approvalThreshold_ Number of approvals required to approve a payout.
    function initialize(
        address admin,
        address treasuryVault_,
        uint256 timelockDuration_,
        uint256 approvalThreshold_
    ) external initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAYOUT_CREATOR_ROLE, admin);
        _grantRole(PAYOUT_APPROVER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        require(treasuryVault_ != address(0), "invalid vault");
        treasuryVault = treasuryVault_;
        timelockDuration = timelockDuration_;
        approvalThreshold = approvalThreshold_;
    }

    /// @notice Submit a new payout proposal.
    /// @param recipient_ Address receiving the funds.
    /// @param token_ ERC-20 token address.
    /// @param amount_ Amount to transfer.
    /// @return payoutId The newly created payout ID.
    function submitPayout(address recipient_, address token_, uint256 amount_)
        external onlyRole(PAYOUT_CREATOR_ROLE) whenNotPaused returns (uint256 payoutId)
    {
        require(recipient_ != address(0), "invalid recipient");
        require(token_ != address(0), "invalid token");
        require(amount_ > 0, "amount zero");
        payoutId = ++_nextPayoutId;
        _payouts[payoutId] = Payout({
            payoutId: payoutId,
            recipient: recipient_,
            token: token_,
            amount: amount_,
            status: PayoutStatus.PENDING,
            timelockEnd: block.timestamp + timelockDuration,
            createdAt: block.timestamp,
            creator: msg.sender,
            approvalCount: 0
        });
        emit PayoutSubmitted(payoutId, recipient_, amount_, msg.sender);
    }

    /// @notice Approve a pending payout.
    /// @param payoutId_ The payout ID to approve.
    function approvePayout(uint256 payoutId_) external onlyRole(PAYOUT_APPROVER_ROLE) whenNotPaused {
        require(payoutId_ > 0 && payoutId_ <= _nextPayoutId, "payout not found");
        Payout storage p = _payouts[payoutId_];
        require(p.status == PayoutStatus.PENDING, "not pending");
        require(!_approvals[payoutId_][msg.sender], "already approved");
        _approvals[payoutId_][msg.sender] = true;
        p.approvalCount++;
        emit PayoutApproved(payoutId_, msg.sender);
        if (p.approvalCount >= approvalThreshold) {
            p.status = PayoutStatus.APPROVED;
        }
    }

    /// @notice Reject a pending payout.
    /// @param payoutId_ The payout ID to reject.
    function rejectPayout(uint256 payoutId_) external onlyRole(PAYOUT_APPROVER_ROLE) whenNotPaused {
        require(payoutId_ > 0 && payoutId_ <= _nextPayoutId, "payout not found");
        Payout storage p = _payouts[payoutId_];
        require(p.status == PayoutStatus.PENDING, "not pending");
        p.status = PayoutStatus.REJECTED;
        emit PayoutRejected(payoutId_, msg.sender);
    }

    /// @notice Execute an approved payout after timelock has elapsed.
    /// @param payoutId_ The payout ID to execute.
    function executePayout(uint256 payoutId_) external onlyRole(PAYOUT_CREATOR_ROLE) whenNotPaused nonReentrant {
        require(payoutId_ > 0 && payoutId_ <= _nextPayoutId, "payout not found");
        Payout storage p = _payouts[payoutId_];
        require(p.status == PayoutStatus.APPROVED, "not approved");
        require(block.timestamp >= p.timelockEnd, "timelock active");
        p.status = PayoutStatus.EXECUTED;
        IERC20(p.token).safeTransferFrom(treasuryVault, p.recipient, p.amount);
        emit PayoutExecuted(payoutId_, p.recipient, p.amount);
    }

    /// @notice Cancel a pending payout.
    /// @param payoutId_ The payout ID to cancel.
    function cancelPayout(uint256 payoutId_) external onlyRole(PAYOUT_CREATOR_ROLE) whenNotPaused {
        require(payoutId_ > 0 && payoutId_ <= _nextPayoutId, "payout not found");
        Payout storage p = _payouts[payoutId_];
        require(p.status == PayoutStatus.PENDING, "not pending");
        p.status = PayoutStatus.CANCELLED;
        emit PayoutCancelled(payoutId_);
    }

    /// @notice Set the timelock duration for new payouts.
    /// @param newDuration_ New timelock duration in seconds.
    function setTimelockDuration(uint256 newDuration_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit TimelockDurationUpdated(timelockDuration, newDuration_);
        timelockDuration = newDuration_;
    }

    /// @notice Set the treasury vault address.
    /// @param newVault_ New treasury vault address.
    function setTreasuryVault(address newVault_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newVault_ != address(0), "invalid vault");
        emit TreasuryVaultUpdated(treasuryVault, newVault_);
        treasuryVault = newVault_;
    }

    /// @notice Set the approval threshold required for payouts.
    /// @param newThreshold_ New approval threshold (must be > 0).
    function setApprovalThreshold(uint256 newThreshold_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newThreshold_ > 0, "threshold must be > 0");
        emit ApprovalThresholdUpdated(approvalThreshold, newThreshold_);
        approvalThreshold = newThreshold_;
    }

    /// @notice Get full payout details.
    /// @param payoutId_ The payout ID.
    /// @return The Payout struct.
    function getPayout(uint256 payoutId_) external view returns (Payout memory) {
        require(payoutId_ > 0 && payoutId_ <= _nextPayoutId, "payout not found");
        return _payouts[payoutId_];
    }

    /// @notice Check whether an approver has approved a payout.
    /// @param payoutId_ The payout ID.
    /// @param approver_ The approver address.
    /// @return True if the approver has approved.
    function hasApproved(uint256 payoutId_, address approver_) external view returns (bool) {
        return _approvals[payoutId_][approver_];
    }

    /// @notice Total number of payouts submitted.
    /// @return Payout count.
    function getPayoutCount() external view returns (uint256) { return _nextPayoutId; }

    /// @notice Pause the contract.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    uint256[50] private __gap;
}
