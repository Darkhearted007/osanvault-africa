// ─── OsanCarbon (ERC-1155 carbon credits) ────────────────────────────────────
export const OsanCarbonAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "admin", type: "address" },
      { name: "verifier", type: "address" },
      { name: "uri_", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "event", name: "ProjectCreated", inputs: [
    { name: "projectId", type: "uint256", indexed: true },
    { name: "name", type: "string", indexed: false },
    { name: "methodology", type: "string", indexed: false },
    { name: "region", type: "string", indexed: false },
    { name: "vintage", type: "uint256", indexed: false },
    { name: "verifier", type: "address", indexed: true },
  ]},
  { type: "event", name: "CreditsIssued", inputs: [
    { name: "projectId", type: "uint256", indexed: true },
    { name: "amount", type: "uint256", indexed: false },
    { name: "recipient", type: "address", indexed: true },
  ]},
  { type: "event", name: "CreditsRetired", inputs: [
    { name: "projectId", type: "uint256", indexed: true },
    { name: "amount", type: "uint256", indexed: false },
    { name: "retirer", type: "address", indexed: true },
    { name: "holder", type: "address", indexed: true },
    { name: "reason", type: "string", indexed: false },
  ]},
  { type: "event", name: "ProjectVerified", inputs: [
    { name: "projectId", type: "uint256", indexed: true },
    { name: "verifier", type: "address", indexed: true },
  ]},
  { type: "event", name: "FeeConfigUpdated", inputs: [
    { name: "feeRouter", type: "address", indexed: true },
    { name: "feeToken", type: "address", indexed: true },
    { name: "feePerCredit", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "TransferSingle", inputs: [
    { name: "operator", type: "address", indexed: true },
    { name: "from", type: "address", indexed: true },
    { name: "to", type: "address", indexed: true },
    { name: "id", type: "uint256", indexed: false },
    { name: "value", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "TransferBatch", inputs: [
    { name: "operator", type: "address", indexed: true },
    { name: "from", type: "address", indexed: true },
    { name: "to", type: "address", indexed: true },
    { name: "ids", type: "uint256[]", indexed: false },
    { name: "values", type: "uint256[]", indexed: false },
  ]},
  { type: "event", name: "ApprovalForAll", inputs: [
    { name: "account", type: "address", indexed: true },
    { name: "operator", type: "address", indexed: true },
    { name: "approved", type: "bool", indexed: false },
  ]},
  { type: "event", name: "RoleGranted", inputs: [
    { name: "role", type: "bytes32", indexed: true },
    { name: "account", type: "address", indexed: true },
    { name: "sender", type: "address", indexed: true },
  ]},
  { type: "event", name: "RoleRevoked", inputs: [
    { name: "role", type: "bytes32", indexed: true },
    { name: "account", type: "address", indexed: true },
    { name: "sender", type: "address", indexed: true },
  ]},
  { type: "event", name: "Paused", inputs: [{ name: "account", type: "address", indexed: false }] },
  { type: "event", name: "Unpaused", inputs: [{ name: "account", type: "address", indexed: false }] },
  // Read functions
  { type: "function", name: "getProjectCount", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getProject", inputs: [{ name: "projectId_", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "name", type: "string" },
      { name: "methodology", type: "string" },
      { name: "region", type: "string" },
      { name: "vintage", type: "uint256" },
      { name: "totalIssued", type: "uint256" },
      { name: "verified", type: "bool" },
      { name: "verifier", type: "address" },
    ]}],
    stateMutability: "view",
  },
  { type: "function", name: "getProjectRemainingCap", inputs: [{ name: "projectId_", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }, { name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOfBatch", inputs: [{ name: "accounts", type: "address[]" }, { name: "ids", type: "uint256[]" }],
    outputs: [{ name: "", type: "uint256[]" }], stateMutability: "view" },
  { type: "function", name: "uri", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "function", name: "paused", inputs: [], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "isApprovedForAll", inputs: [{ name: "account", type: "address" }, { name: "operator", type: "address" }],
    outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "hasRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "VERIFIER_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "PAUSER_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "MAX_SUPPLY_PER_PROJECT", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "feeRouter", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "feeToken", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "retirementFeePerCredit", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "supportsInterface", inputs: [{ name: "interfaceId", type: "bytes4" }], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  // Write functions
  { type: "function", name: "createProject", inputs: [
    { name: "name_", type: "string" }, { name: "methodology_", type: "string" },
    { name: "region_", type: "string" }, { name: "vintage_", type: "uint256" }, { name: "uri_", type: "string" },
  ], outputs: [{ name: "projectId", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "verifyProject", inputs: [{ name: "projectId_", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "issueCredits", inputs: [
    { name: "projectId_", type: "uint256" }, { name: "amount_", type: "uint256" }, { name: "recipient_", type: "address" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "retireCredits", inputs: [
    { name: "projectId_", type: "uint256" }, { name: "amount_", type: "uint256" }, { name: "reason_", type: "string" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "retireCreditsFrom", inputs: [
    { name: "holder_", type: "address" }, { name: "projectId_", type: "uint256" },
    { name: "amount_", type: "uint256" }, { name: "reason_", type: "string" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setApprovalForAll", inputs: [{ name: "operator", type: "address" }, { name: "approved", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setMetadata", inputs: [{ name: "projectId_", type: "uint256" }, { name: "uri_", type: "string" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setFeeConfig", inputs: [
    { name: "feeRouter_", type: "address" }, { name: "feeToken_", type: "address" }, { name: "feePerCredit_", type: "uint256" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "pause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "unpause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "grantRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "revokeRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "safeTransferFrom", inputs: [
    { name: "from", type: "address" }, { name: "to", type: "address" }, { name: "id", type: "uint256" },
    { name: "amount", type: "uint256" }, { name: "data", type: "bytes" },
  ], outputs: [], stateMutability: "nonpayable" },
] as const;

// ─── PropertyNFT (ERC-1155 fractional property tokens) ───────────────────────
// PropertyInfo struct: { totalSupply, maxSupply, name, location, jurisdiction, legalDocCID, createdAt, exists }
export const PropertyNFTAbi = [
  {
    type: "constructor",
    inputs: [{ name: "admin", type: "address" }],
    stateMutability: "nonpayable",
  },
  { type: "event", name: "PropertyCreated", inputs: [
    { name: "id", type: "uint256", indexed: true },
    { name: "name", type: "string", indexed: false },
    { name: "maxSupply", type: "uint256", indexed: false },
    { name: "location", type: "string", indexed: false },
    { name: "jurisdiction", type: "string", indexed: false },
    { name: "uri", type: "string", indexed: false },
    { name: "legalDoc", type: "string", indexed: false },
  ]},
  { type: "event", name: "TokensMinted", inputs: [
    { name: "propertyId", type: "uint256", indexed: true },
    { name: "to", type: "address", indexed: true },
    { name: "amount", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "MetadataUpdated", inputs: [
    { name: "propertyId", type: "uint256", indexed: true },
    { name: "newURI", type: "string", indexed: false },
  ]},
  { type: "event", name: "TransferSingle", inputs: [
    { name: "operator", type: "address", indexed: true },
    { name: "from", type: "address", indexed: true },
    { name: "to", type: "address", indexed: true },
    { name: "id", type: "uint256", indexed: false },
    { name: "value", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "TransferBatch", inputs: [
    { name: "operator", type: "address", indexed: true },
    { name: "from", type: "address", indexed: true },
    { name: "to", type: "address", indexed: true },
    { name: "ids", type: "uint256[]", indexed: false },
    { name: "values", type: "uint256[]", indexed: false },
  ]},
  { type: "event", name: "ApprovalForAll", inputs: [
    { name: "account", type: "address", indexed: true },
    { name: "operator", type: "address", indexed: true },
    { name: "approved", type: "bool", indexed: false },
  ]},
  { type: "event", name: "RoleGranted", inputs: [
    { name: "role", type: "bytes32", indexed: true },
    { name: "account", type: "address", indexed: true },
    { name: "sender", type: "address", indexed: true },
  ]},
  { type: "event", name: "Paused", inputs: [{ name: "account", type: "address", indexed: false }] },
  { type: "event", name: "Unpaused", inputs: [{ name: "account", type: "address", indexed: false }] },
  // Read functions
  { type: "function", name: "propertyCount", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getProperty", inputs: [{ name: "propertyId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "totalSupply", type: "uint256" },
      { name: "maxSupply", type: "uint256" },
      { name: "name", type: "string" },
      { name: "location", type: "string" },
      { name: "jurisdiction", type: "string" },
      { name: "legalDocCID", type: "string" },
      { name: "createdAt", type: "uint256" },
      { name: "exists", type: "bool" },
    ]}],
    stateMutability: "view",
  },
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }, { name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOfBatch", inputs: [{ name: "accounts", type: "address[]" }, { name: "ids", type: "uint256[]" }],
    outputs: [{ name: "", type: "uint256[]" }], stateMutability: "view" },
  { type: "function", name: "uri", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "function", name: "paused", inputs: [], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "isApprovedForAll", inputs: [{ name: "account", type: "address" }, { name: "operator", type: "address" }],
    outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "hasRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "MINTER_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "ADMIN_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "URI_MANAGER_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "supportsInterface", inputs: [{ name: "interfaceId", type: "bytes4" }], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  // Write functions
  { type: "function", name: "createProperty", inputs: [
    { name: "name", type: "string" }, { name: "maxSupply", type: "uint256" }, { name: "location", type: "string" },
    { name: "jurisdiction", type: "string" }, { name: "metadataURI", type: "string" }, { name: "legalDocCID", type: "string" },
  ], outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "mint", inputs: [
    { name: "to", type: "address" }, { name: "propertyId", type: "uint256" }, { name: "amount", type: "uint256" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "mintBatch", inputs: [
    { name: "to", type: "address" }, { name: "ids", type: "uint256[]" }, { name: "amounts", type: "uint256[]" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "updatePropertyURI", inputs: [{ name: "propertyId", type: "uint256" }, { name: "newURI", type: "string" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setApprovalForAll", inputs: [{ name: "operator", type: "address" }, { name: "approved", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "safeTransferFrom", inputs: [
    { name: "from", type: "address" }, { name: "to", type: "address" }, { name: "id", type: "uint256" },
    { name: "amount", type: "uint256" }, { name: "data", type: "bytes" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "pause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "unpause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "grantRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "revokeRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], outputs: [], stateMutability: "nonpayable" },
] as const;

// ─── StakingVault (4-tier OSANV staking) ─────────────────────────────────────
// Tiers: 0=Bronze(800bps/30d), 1=Silver(1200bps/90d), 2=Gold(1800bps/180d), 3=Platinum(2200bps/365d)
export const StakingVaultAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "admin", type: "address" }, { name: "governance", type: "address" },
      { name: "emergency", type: "address" }, { name: "token", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "event", name: "Staked", inputs: [
    { name: "user", type: "address", indexed: true }, { name: "tier", type: "uint256", indexed: true },
    { name: "amount", type: "uint256", indexed: false }, { name: "lockEnd", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "Withdrawn", inputs: [
    { name: "user", type: "address", indexed: true }, { name: "tier", type: "uint256", indexed: true },
    { name: "amount", type: "uint256", indexed: false }, { name: "early", type: "bool", indexed: false },
  ]},
  { type: "event", name: "RewardsClaimed", inputs: [
    { name: "user", type: "address", indexed: true }, { name: "tier", type: "uint256", indexed: true },
    { name: "amount", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "TierConfigUpdated", inputs: [
    { name: "tier", type: "uint256", indexed: true }, { name: "aprBps", type: "uint256", indexed: false },
    { name: "lockDuration", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "EarlyWithdrawalPenaltyUpdated", inputs: [{ name: "penaltyBps", type: "uint256", indexed: false }] },
  { type: "event", name: "TokensDeposited", inputs: [{ name: "sender", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
  { type: "event", name: "TokensWithdrawn", inputs: [{ name: "recipient", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
  { type: "event", name: "Paused", inputs: [{ name: "account", type: "address", indexed: false }] },
  { type: "event", name: "Unpaused", inputs: [{ name: "account", type: "address", indexed: false }] },
  // Read functions
  { type: "function", name: "earned", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getStakeInfo", inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "tier", type: "uint256" }, { name: "amount", type: "uint256" },
      { name: "lockEnd", type: "uint256" }, { name: "pendingRewards", type: "uint256" },
    ], stateMutability: "view",
  },
  { type: "function", name: "tiers", inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" }, { name: "aprBps", type: "uint256" },
      { name: "lockDuration", type: "uint256" }, { name: "totalStaked", type: "uint256" },
      { name: "accRewardPerShare", type: "uint256" }, { name: "lastUpdateTime", type: "uint256" }, { name: "exists", type: "bool" },
    ], stateMutability: "view",
  },
  { type: "function", name: "stakes", inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "tier", type: "uint256" }, { name: "amount", type: "uint256" },
      { name: "lockEnd", type: "uint256" }, { name: "rewardDebt", type: "uint256" },
    ], stateMutability: "view",
  },
  { type: "function", name: "earlyWithdrawalPenaltyBps", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "totalRewardsDistributed", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "stakingToken", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "paused", inputs: [], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "hasRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "GOVERNANCE_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "EMERGENCY_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "supportsInterface", inputs: [{ name: "interfaceId", type: "bytes4" }], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  // Write functions
  { type: "function", name: "stake", inputs: [{ name: "tierIndex", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "withdraw", inputs: [{ name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "claimRewards", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "depositRewards", inputs: [{ name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "configureTier", inputs: [
    { name: "tierIndex", type: "uint256" }, { name: "aprBps", type: "uint256" }, { name: "lockDuration", type: "uint256" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setEarlyWithdrawalPenalty", inputs: [{ name: "penaltyBps", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "withdrawTokens", inputs: [{ name: "recipient", type: "address" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "pause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "unpause", inputs: [], outputs: [], stateMutability: "nonpayable" },
] as const;

// ─── Governance (DAO voting: 100K OSANV threshold, 5M quorum, 7d period) ─────
// ProposalState: 0=Pending, 1=Active, 2=Defeated, 3=Succeeded, 4=Queued, 5=Executed, 6=Cancelled
export const GovernanceAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "admin", type: "address" }, { name: "proposer", type: "address" },
      { name: "executor", type: "address" }, { name: "token", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "event", name: "ProposalCreated", inputs: [
    { name: "proposalId", type: "uint256", indexed: true }, { name: "proposer", type: "address", indexed: true },
    { name: "description", type: "string", indexed: false }, { name: "voteStart", type: "uint256", indexed: false },
    { name: "voteEnd", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "VoteCast", inputs: [
    { name: "voter", type: "address", indexed: true }, { name: "proposalId", type: "uint256", indexed: true },
    { name: "support", type: "bool", indexed: false }, { name: "weight", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "ProposalExecuted", inputs: [{ name: "proposalId", type: "uint256", indexed: true }] },
  { type: "event", name: "ProposalCancelled", inputs: [{ name: "proposalId", type: "uint256", indexed: true }] },
  { type: "event", name: "ProposalQueued", inputs: [{ name: "proposalId", type: "uint256", indexed: true }] },
  { type: "event", name: "ParametersUpdated", inputs: [
    { name: "votingPeriod", type: "uint256", indexed: false }, { name: "quorum", type: "uint256", indexed: false },
    { name: "proposalThreshold", type: "uint256", indexed: false },
  ]},
  { type: "event", name: "Paused", inputs: [{ name: "account", type: "address", indexed: false }] },
  { type: "event", name: "Unpaused", inputs: [{ name: "account", type: "address", indexed: false }] },
  // Read functions
  { type: "function", name: "getProposal", inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" }, { name: "proposer", type: "address" }, { name: "description", type: "string" },
      { name: "voteStart", type: "uint256" }, { name: "voteEnd", type: "uint256" },
      { name: "forVotes", type: "uint256" }, { name: "againstVotes", type: "uint256" },
      { name: "quorum", type: "uint256" }, { name: "state", type: "uint8" }, { name: "executed", type: "bool" },
    ], stateMutability: "view",
  },
  { type: "function", name: "hasVoted", inputs: [{ name: "proposalId", type: "uint256" }, { name: "voter", type: "address" }],
    outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "votingToken", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "paused", inputs: [], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "hasRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "PROPOSER_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "EXECUTOR_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  { type: "function", name: "supportsInterface", inputs: [{ name: "interfaceId", type: "bytes4" }], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  // Write functions
  { type: "function", name: "propose", inputs: [{ name: "description", type: "string" }],
    outputs: [{ name: "proposalId", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "castVote", inputs: [{ name: "proposalId", type: "uint256" }, { name: "support", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "queue", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "execute", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "cancel", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "updateParameters", inputs: [
    { name: "votingPeriod", type: "uint256" }, { name: "quorum", type: "uint256" }, { name: "proposalThreshold", type: "uint256" },
  ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "pause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "unpause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "grantRole", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], outputs: [], stateMutability: "nonpayable" },
] as const;

// ─── LandRegistry (dual government + indigenous authority verification) ───────
// LandParcel struct: { id, location, geoHash, indigenousAuthority, governmentTitleHash,
//   currentOwner, indigenousVerified, governmentVerified, isFinalized, isDisputed,
//   approvalCount, rejectionCount }
export const LandRegistryAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  { type: "event", name: "LandRegistered", inputs: [{ name: "id", type: "uint256", indexed: true }, { name: "location", type: "string", indexed: false }] },
  { type: "event", name: "OwnershipClaimed", inputs: [{ name: "id", type: "uint256", indexed: true }, { name: "claimant", type: "address", indexed: true }] },
  { type: "event", name: "LandApproved", inputs: [{ name: "id", type: "uint256", indexed: true }, { name: "voter", type: "address", indexed: true }] },
  { type: "event", name: "LandRejected", inputs: [{ name: "id", type: "uint256", indexed: true }, { name: "voter", type: "address", indexed: true }] },
  { type: "event", name: "DisputeRaised", inputs: [{ name: "id", type: "uint256", indexed: true }, { name: "reporter", type: "address", indexed: true }] },
  { type: "event", name: "LandFinalized", inputs: [{ name: "id", type: "uint256", indexed: true }, { name: "owner", type: "address", indexed: false }] },
  // Read functions
  { type: "function", name: "parcelCount", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "parcels", inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" }, { name: "location", type: "string" }, { name: "geoHash", type: "string" },
      { name: "indigenousAuthority", type: "address" }, { name: "governmentTitleHash", type: "bytes32" },
      { name: "currentOwner", type: "address" }, { name: "indigenousVerified", type: "bool" },
      { name: "governmentVerified", type: "bool" }, { name: "isFinalized", type: "bool" },
      { name: "isDisputed", type: "bool" }, { name: "approvalCount", type: "uint256" }, { name: "rejectionCount", type: "uint256" },
    ], stateMutability: "view",
  },
  { type: "function", name: "hasVoted", inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "owner", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  // Write functions
  { type: "function", name: "registerLand", inputs: [
    { name: "location", type: "string" }, { name: "geoHash", type: "string" },
    { name: "indigenousAuthority", type: "address" }, { name: "governmentTitleHash", type: "bytes32" },
  ], outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "claimOwnership", inputs: [{ name: "id", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "approveLand", inputs: [{ name: "id", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "rejectLand", inputs: [{ name: "id", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "raiseDispute", inputs: [{ name: "id", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "finalizeLand", inputs: [{ name: "id", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "renounceOwnership", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "transferOwnership", inputs: [{ name: "newOwner", type: "address" }], outputs: [], stateMutability: "nonpayable" },
] as const;
