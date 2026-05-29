// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Errors — custom error definitions for all OsanVault contracts
library Errors {
    // ─── Common ───────────────────────────────────────────────────────────────
    error ZeroAddress();
    error ZeroAmount();
    error AlreadyExists();
    error DoesNotExist();
    error InvalidState();
    error Unauthorized();
    error ArrayLengthMismatch();

    // ─── Token ────────────────────────────────────────────────────────────────
    error SupplyCapExceeded();
    error TransferRestricted();

    // ─── Property ─────────────────────────────────────────────────────────────
    error PropertyDoesNotExist();
    error MaxSupplyExceeded();
    error LandNotFullyVerified();
    error PropertyAlreadyTokenized();

    // ─── Staking ──────────────────────────────────────────────────────────────
    error AlreadyStaked();
    error InsufficientStake();
    error LockPeriodActive();
    error InvalidTier();
    error NoRewards();
    error AntiWhaleLimit();

    // ─── Governance ───────────────────────────────────────────────────────────
    error BelowProposalThreshold();
    error AlreadyVoted();
    error ProposalNotActive();
    error VotingPeriodEnded();
    error InsufficientVotingPower();
    error TimelockNotExpired();
    error ProposalNotQueued();
    error QuorumNotMet();

    // ─── Treasury ─────────────────────────────────────────────────────────────
    error WithdrawalAlreadyExecuted();
    error WithdrawalAlreadyCancelled();
    error DailyLimitExceeded();
    error TimelockActive();

    // ─── Vesting ──────────────────────────────────────────────────────────────
    error CliffNotReached();
    error ScheduleRevoked();
    error NothingToRelease();
    error NotRevocable();
    error VestingScheduleDoesNotExist();

    // ─── Carbon ───────────────────────────────────────────────────────────────
    error ProjectNotVerified();
    error IssuanceCapExceeded();
    error InsufficientCarbonBalance();

    // ─── Oracle ───────────────────────────────────────────────────────────────
    error InvalidValuation();
}
