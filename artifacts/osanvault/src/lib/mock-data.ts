export interface PropertyMeta {
  id: number;
  name: string;
  type: "LandBank" | "Commercial" | "Residential" | "Industrial" | "Mixed";
  location: string;
  country: string;
  flag: string;
  targetRaise: number;
  raised: number;
  totalTokens: number;
  tokenPrice: number;
  yieldApy: number;
  size: string;
  status: "live" | "funding" | "closed";
  carbonOffsetTonnes: number;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  jurisdiction: string;
  indigenousAuthority: string;
  legalDocCID: string;
  lat: number;
  lng: number;
}

export const MOCK_PROPERTIES: PropertyMeta[] = [
  {
    id: 1,
    name: "Ekiti LandBank Phase 1",
    type: "LandBank",
    location: "Ekiti State, Nigeria",
    country: "Nigeria",
    flag: "🇳🇬",
    targetRaise: 400_000_000,
    raised: 249_000_000,
    totalTokens: 400_000,
    tokenPrice: 1_000,
    yieldApy: 14.5,
    size: "50 hectares",
    status: "live",
    carbonOffsetTonnes: 2_400,
    description:
      "A community-backed land banking initiative in Ekiti State, securing 50 hectares of verified government-titled land. Token holders earn from appreciation and leasing income as the region develops. Dual-verified by the Ekiti Traditional Council and State Ministry of Lands.",
    gradientFrom: "#1a3d1f",
    gradientTo: "#2d5a35",
    jurisdiction: "Ekiti State, Nigeria",
    indigenousAuthority: "Ekiti Traditional Council",
    legalDocCID: "QmEkitiLandPhase1CID2024",
    lat: 7.72,
    lng: 5.31,
  },
  {
    id: 2,
    name: "Lagos Solar Energy SPV",
    type: "Commercial",
    location: "Agege, Lagos, Nigeria",
    country: "Nigeria",
    flag: "🇳🇬",
    targetRaise: 1_500_000_000,
    raised: 687_000_000,
    totalTokens: 1_500_000,
    tokenPrice: 1_000,
    yieldApy: 12.8,
    size: "100MW capacity",
    status: "live",
    carbonOffsetTonnes: 48_000,
    description:
      "A 100MW utility-scale solar energy SPV generating clean electricity for Lagos' grid. Token holders earn from power purchase agreements (PPAs) with EKEDC. Carbon credits generated are distributed proportionally to token holders via OsanCarbon.",
    gradientFrom: "#2d4a1f",
    gradientTo: "#3a5e2a",
    jurisdiction: "Lagos State, Nigeria",
    indigenousAuthority: "Agege Community Development Association",
    legalDocCID: "QmLagosSolarSPVCID2024",
    lat: 6.62,
    lng: 3.32,
  },
  {
    id: 3,
    name: "Abuja Premium Residences",
    type: "Residential",
    location: "Maitama, FCT Abuja, Nigeria",
    country: "Nigeria",
    flag: "🇳🇬",
    targetRaise: 2_200_000_000,
    raised: 1_716_000_000,
    totalTokens: 440_000,
    tokenPrice: 5_000,
    yieldApy: 11.2,
    size: "48 luxury units",
    status: "funding",
    carbonOffsetTonnes: 860,
    description:
      "A 48-unit premium residential complex in Maitama, Abuja's most prestigious district. Designed to EDGE green building standards, generating passive carbon offsets. Rental income distributed monthly to token holders.",
    gradientFrom: "#0d1f0f",
    gradientTo: "#1a3d1f",
    jurisdiction: "FCT Abuja, Nigeria",
    indigenousAuthority: "FCT Area Council",
    legalDocCID: "QmAbujaResidencesCID2024",
    lat: 9.07,
    lng: 7.49,
  },
  {
    id: 4,
    name: "Accra Heights Ghana",
    type: "Mixed",
    location: "Airport City, Accra, Ghana",
    country: "Ghana",
    flag: "🇬🇭",
    targetRaise: 880_000_000,
    raised: 299_200_000,
    totalTokens: 880_000,
    tokenPrice: 1_000,
    yieldApy: 13.5,
    size: "12-floor tower",
    status: "live",
    carbonOffsetTonnes: 1_150,
    description:
      "A 12-floor mixed-use tower in Accra's Airport City business hub, combining retail, office, and serviced apartments. OsanVault's first pan-African expansion, verified under Ghana Land Commission title.",
    gradientFrom: "#2a3d0a",
    gradientTo: "#3d5c12",
    jurisdiction: "Greater Accra Region, Ghana",
    indigenousAuthority: "Accra Metropolitan Assembly",
    legalDocCID: "QmAccraHeightsCID2024",
    lat: 5.6,
    lng: -0.18,
  },
  {
    id: 5,
    name: "Nairobi Business Park",
    type: "Commercial",
    location: "Westlands, Nairobi, Kenya",
    country: "Kenya",
    flag: "🇰🇪",
    targetRaise: 1_900_000_000,
    raised: 1_729_000_000,
    totalTokens: 380_000,
    tokenPrice: 5_000,
    yieldApy: 13.0,
    size: "35,000 sqm GFA",
    status: "funding",
    carbonOffsetTonnes: 3_200,
    description:
      "A Grade-A commercial park in Nairobi's Westlands district, home to multinational tenants. 92% occupancy secured pre-token. Green-certified under EDGE, generating verified carbon offsets channeled to OsanCarbon.",
    gradientFrom: "#0f2a1a",
    gradientTo: "#1a3d28",
    jurisdiction: "Nairobi County, Kenya",
    indigenousAuthority: "Nairobi County Government",
    legalDocCID: "QmNairobiBizParkCID2024",
    lat: -1.27,
    lng: 36.81,
  },
  {
    id: 6,
    name: "Victoria Island Tower",
    type: "Residential",
    location: "Victoria Island, Lagos, Nigeria",
    country: "Nigeria",
    flag: "🇳🇬",
    targetRaise: 4_500_000_000,
    raised: 675_000_000,
    totalTokens: 900_000,
    tokenPrice: 5_000,
    yieldApy: 10.8,
    size: "25-floor luxury tower",
    status: "live",
    carbonOffsetTonnes: 1_800,
    description:
      "A 25-floor luxury residential tower on Victoria Island — Lagos' premium waterfront address. Tokenizing Africa's most sought-after real estate, making it accessible from ₦5,000 per fraction. Completion target: Q3 2027.",
    gradientFrom: "#1f1a0d",
    gradientTo: "#3d3512",
    jurisdiction: "Lagos State, Nigeria",
    indigenousAuthority: "Eko Atlantic Authority",
    legalDocCID: "QmVITowerCID2024",
    lat: 6.43,
    lng: 3.42,
  },
];

export interface StakingTier {
  tier: number;
  name: "Bronze" | "Silver" | "Gold" | "Platinum";
  aprBps: number;
  apr: number;
  lockDays: number;
  minStake: number;
  colorClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  emoji: string;
}

export const STAKING_TIERS: StakingTier[] = [
  {
    tier: 0,
    name: "Bronze",
    aprBps: 800,
    apr: 8,
    lockDays: 30,
    minStake: 50_000,
    colorClass: "text-amber-700",
    bgClass: "bg-amber-700/10",
    textClass: "text-amber-700 dark:text-amber-500",
    borderClass: "border-amber-700/30",
    emoji: "🥉",
  },
  {
    tier: 1,
    name: "Silver",
    aprBps: 1200,
    apr: 12,
    lockDays: 90,
    minStake: 100_000,
    colorClass: "text-slate-400",
    bgClass: "bg-slate-400/10",
    textClass: "text-slate-500 dark:text-slate-300",
    borderClass: "border-slate-400/30",
    emoji: "🥈",
  },
  {
    tier: 2,
    name: "Gold",
    aprBps: 1800,
    apr: 18,
    lockDays: 180,
    minStake: 200_000,
    colorClass: "text-yellow-600",
    bgClass: "bg-yellow-500/10",
    textClass: "text-yellow-600 dark:text-yellow-400",
    borderClass: "border-yellow-500/30",
    emoji: "🥇",
  },
  {
    tier: 3,
    name: "Platinum",
    aprBps: 2200,
    apr: 22,
    lockDays: 365,
    minStake: 500_000,
    colorClass: "text-violet-600",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-600 dark:text-violet-400",
    borderClass: "border-violet-500/30",
    emoji: "💎",
  },
];

export interface GovernanceProposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: "active" | "succeeded" | "defeated" | "pending" | "executed";
  votesFor: number;
  votesAgainst: number;
  quorum: number;
  endTime: Date;
  category: "property" | "token" | "fees" | "protocol";
}

export const MOCK_PROPOSALS: GovernanceProposal[] = [
  {
    id: 1,
    title: "Whitelist Kano Industrial Park for Tokenization",
    description:
      "Add Kano Industrial Estate Phase 2 (85 hectares) to the verified property whitelist. Legal title verified by Kano State Ministry of Lands. Estimated TVL addition: ₦2.8B. Carbon offset: 6,400 tCO₂e/yr.",
    proposer: "0x3a7f2B4c9D1e8F0a5B6C2d3E4f5A6b7C8d9E0f1A",
    status: "active",
    votesFor: 8_450_000,
    votesAgainst: 1_230_000,
    quorum: 5_000_000,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    category: "property",
  },
  {
    id: 2,
    title: "Increase Platinum Staking APR from 22% to 25%",
    description:
      "Increase the Platinum tier staking reward rate from 2200 bps (22%) to 2500 bps (25%) to incentivize long-term OSANV locking and reduce circulating supply. Funded from the Ecosystem & Rewards allocation.",
    proposer: "0x9B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c",
    status: "succeeded",
    votesFor: 12_200_000,
    votesAgainst: 2_100_000,
    quorum: 5_000_000,
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    category: "token",
  },
  {
    id: 3,
    title: "Reduce Platform Fee from 1.5% to 1.2%",
    description:
      "Lower the base property investment fee from 150 bps to 120 bps. Analysis shows the fee reduction would increase transaction volume by ~18%, resulting in net positive protocol revenue. FeeRouter adjustment required.",
    proposer: "0x1C2d3E4f5A6b7C8d9E0f1A2b3C4d5E6f7A8b9C0d",
    status: "active",
    votesFor: 3_800_000,
    votesAgainst: 4_100_000,
    quorum: 5_000_000,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
    category: "fees",
  },
  {
    id: 4,
    title: "Launch OsanVault Lend — Phase 1 Parameters",
    description:
      "Approve lending parameters for OsanVault Lend: max LTV 65%, liquidation threshold 75%, borrow rate 9.5% base APR, collateral: verified property tokens only. Audit completed by CertiK.",
    proposer: "0x7D8e9F0a1B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e",
    status: "executed",
    votesFor: 18_500_000,
    votesAgainst: 890_000,
    quorum: 5_000_000,
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    category: "protocol",
  },
];

export interface CarbonProject {
  id: number;
  name: string;
  methodology: string;
  region: string;
  vintage: number;
  totalIssued: bigint;
  totalRetired: bigint;
  verified: boolean;
  verifier: string;
  flag: string;
  description: string;
  lat: number;
  lng: number;
  registryLink: string;
  linkedPropertyId?: number;
}

export const MOCK_CARBON_PROJECTS: CarbonProject[] = [
  {
    id: 1,
    name: "Congo Basin Reforestation",
    methodology: "VCS",
    region: "Central Africa",
    vintage: 2023,
    totalIssued: BigInt("250000000000000000000000"),
    totalRetired: BigInt("42000000000000000000000"),
    verified: true,
    verifier: "0x1A2b3C4d5E6f7A8B9C0d1E2F3a4B5c6D7e8F9a0B",
    flag: "🇨🇩",
    description:
      "Large-scale reforestation of degraded lands in the Congo Basin, restoring native tree species across 50,000 hectares.",
    lat: -0.5,
    lng: 23.5,
    registryLink: "https://registry.verra.org",
  },
  {
    id: 2,
    name: "Lagos Solar Energy Credits",
    methodology: "Gold Standard",
    region: "West Africa",
    vintage: 2024,
    totalIssued: BigInt("480000000000000000000000"),
    totalRetired: BigInt("96000000000000000000000"),
    verified: true,
    verifier: "0x2B3c4D5e6F7a8B9C0D1e2F3A4b5C6d7E8f9A0b1C",
    flag: "🇳🇬",
    description:
      "Carbon credits generated from the Lagos Solar Energy SPV (Property #2). Distributed proportionally to Lagos Solar token holders.",
    lat: 6.62,
    lng: 3.32,
    registryLink: "https://registry.goldstandard.org",
    linkedPropertyId: 2,
  },
  {
    id: 3,
    name: "Sahel Restoration Initiative",
    methodology: "Plan Vivo",
    region: "West Africa",
    vintage: 2024,
    totalIssued: BigInt("95000000000000000000000"),
    totalRetired: BigInt("12000000000000000000000"),
    verified: true,
    verifier: "0x3C4d5E6f7A8b9C0D1E2f3A4B5c6D7E8F9a0B1c2D",
    flag: "🇲🇱",
    description:
      "Community-led agroforestry and land restoration across the Sahel belt, combining traditional knowledge with modern monitoring.",
    lat: 14.0,
    lng: -3.0,
    registryLink: "https://www.planvivo.org",
  },
  {
    id: 4,
    name: "Nairobi Business Park Credits",
    methodology: "Gold Standard",
    region: "East Africa",
    vintage: 2023,
    totalIssued: BigInt("320000000000000000000000"),
    totalRetired: BigInt("142000000000000000000000"),
    verified: true,
    verifier: "0x4D5e6F7a8B9c0D1e2F3A4b5C6D7e8F9A0B1C2d3E",
    flag: "🇰🇪",
    description:
      "EDGE-certified green building credits from the Nairobi Business Park (Property #5). Offset distributed quarterly to token holders.",
    lat: -1.27,
    lng: 36.81,
    registryLink: "https://registry.goldstandard.org",
    linkedPropertyId: 5,
  },
  {
    id: 5,
    name: "Tanzania Blue Carbon",
    methodology: "VCS",
    region: "East Africa",
    vintage: 2024,
    totalIssued: BigInt("130000000000000000000000"),
    totalRetired: BigInt("8000000000000000000000"),
    verified: false,
    verifier: "0x5E6f7A8b9C0d1E2F3a4B5C6d7E8f9A0b1C2D3e4F",
    flag: "🇹🇿",
    description:
      "Conservation and restoration of mangrove ecosystems along Tanzania's coastline, protecting critical blue carbon stores.",
    lat: -6.0,
    lng: 39.0,
    registryLink: "https://registry.verra.org",
  },
];

export interface ActivityEvent {
  type: "purchase" | "issued" | "retired" | "staked" | "vote";
  propertyId?: number;
  propertyName?: string;
  projectId?: number;
  projectName?: string;
  amount: bigint;
  amountNgn?: number;
  address: string;
  timestamp: Date;
  txHash: string;
}

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    type: "purchase",
    propertyId: 1,
    propertyName: "Ekiti LandBank Phase 1",
    amount: BigInt("500"),
    amountNgn: 500_000,
    address: "0xaBcD1234eFgH5678iJkL9012mNoP3456qRsT7890",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    txHash: "0xprop001",
  },
  {
    type: "staked",
    amount: BigInt("200000000000000000000000"),
    address: "0x1234aBcD5678eFgH9012iJkL3456mNoP7890qRsT",
    timestamp: new Date(Date.now() - 1000 * 60 * 22),
    txHash: "0xstake001",
  },
  {
    type: "purchase",
    propertyId: 2,
    propertyName: "Lagos Solar Energy SPV",
    amount: BigInt("1000"),
    amountNgn: 1_000_000,
    address: "0x5678iJkL1234aBcD9012eFgH7890mNoP3456qRsT",
    timestamp: new Date(Date.now() - 1000 * 60 * 48),
    txHash: "0xprop002",
  },
  {
    type: "retired",
    projectId: 2,
    projectName: "Lagos Solar Energy Credits",
    amount: BigInt("5000000000000000000000"),
    address: "0x9012eFgH5678iJkL1234aBcD3456qRsT7890mNoP",
    timestamp: new Date(Date.now() - 1000 * 60 * 75),
    txHash: "0xcret001",
  },
  {
    type: "purchase",
    propertyId: 5,
    propertyName: "Nairobi Business Park",
    amount: BigInt("200"),
    amountNgn: 1_000_000,
    address: "0x3456qRsT9012eFgH5678iJkL1234aBcD7890mNoP",
    timestamp: new Date(Date.now() - 1000 * 60 * 130),
    txHash: "0xprop003",
  },
  {
    type: "vote",
    amount: BigInt("500000000000000000000000"),
    address: "0xeF0a1B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a",
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
    txHash: "0xvote001",
  },
];

export const PLATFORM_STATS = {
  propertiesLive: 6,
  tvlNgn: 8_600_000_000,
  totalInvestors: 1_247,
  osanvStaked: 42_500_000,
  totalCarbonTonnes: 57_410,
  avgPropertyYield: 12.6,
};

export function formatNgn(amount: number): string {
  if (amount >= 1_000_000_000)
    return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

export function formatOsanv(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M OSANV`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K OSANV`;
  return `${amount.toLocaleString()} OSANV`;
}

export function formatCredits(amount: bigint): string {
  const val = Number(amount) / 1e18;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toFixed(0);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function fundingPct(property: { raised: number; targetRaise: number }): number {
  return Math.min(100, (property.raised / property.targetRaise) * 100);
}
