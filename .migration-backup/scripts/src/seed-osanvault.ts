import { db } from "@workspace/db";
import {
  propertiesTable,
  carbonProjectsTable,
  governanceProposalsTable,
  activityEventsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding OsanVault database...");

  await db.execute(sql`TRUNCATE activity_events, governance_proposals, carbon_projects, properties RESTART IDENTITY CASCADE`);
  console.log("Tables cleared.");

  const properties = await db.insert(propertiesTable).values([
    {
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
      legalDocCid: "QmEkitiLandPhase1CID2024",
      lat: 7.72,
      lng: 5.31,
    },
    {
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
      legalDocCid: "QmLagosSolarSPVCID2024",
      lat: 6.62,
      lng: 3.32,
    },
    {
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
      legalDocCid: "QmAbujaResidencesCID2024",
      lat: 9.07,
      lng: 7.49,
    },
    {
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
      legalDocCid: "QmAccraHeightsCID2024",
      lat: 5.6,
      lng: -0.18,
    },
    {
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
      legalDocCid: "QmNairobiBizParkCID2024",
      lat: -1.27,
      lng: 36.81,
    },
    {
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
      legalDocCid: "QmVITowerCID2024",
      lat: 6.43,
      lng: 3.42,
    },
  ]).returning({ id: propertiesTable.id });

  const [p1, p2, , , p5] = properties;
  console.log(`Inserted ${properties.length} properties.`);

  await db.insert(carbonProjectsTable).values([
    {
      name: "Congo Basin Reforestation",
      methodology: "VCS",
      region: "Central Africa",
      vintage: 2023,
      totalIssued: "250000000000000000000000",
      totalRetired: "42000000000000000000000",
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
      name: "Lagos Solar Energy Credits",
      methodology: "Gold Standard",
      region: "West Africa",
      vintage: 2024,
      totalIssued: "480000000000000000000000",
      totalRetired: "96000000000000000000000",
      verified: true,
      verifier: "0x2B3c4D5e6F7a8B9C0D1e2F3A4b5C6d7E8f9A0b1C",
      flag: "🇳🇬",
      description:
        "Carbon credits generated from the Lagos Solar Energy SPV (Property #2). Distributed proportionally to Lagos Solar token holders.",
      lat: 6.62,
      lng: 3.32,
      registryLink: "https://registry.goldstandard.org",
      linkedPropertyId: p2.id,
    },
    {
      name: "Sahel Restoration Initiative",
      methodology: "Plan Vivo",
      region: "West Africa",
      vintage: 2024,
      totalIssued: "95000000000000000000000",
      totalRetired: "12000000000000000000000",
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
      name: "Nairobi Business Park Credits",
      methodology: "Gold Standard",
      region: "East Africa",
      vintage: 2023,
      totalIssued: "320000000000000000000000",
      totalRetired: "142000000000000000000000",
      verified: true,
      verifier: "0x4D5e6F7a8B9c0D1e2F3A4b5C6D7e8F9A0B1C2d3E",
      flag: "🇰🇪",
      description:
        "EDGE-certified green building credits from the Nairobi Business Park (Property #5). Offset distributed quarterly to token holders.",
      lat: -1.27,
      lng: 36.81,
      registryLink: "https://registry.goldstandard.org",
      linkedPropertyId: p5.id,
    },
    {
      name: "Tanzania Blue Carbon",
      methodology: "VCS",
      region: "East Africa",
      vintage: 2024,
      totalIssued: "130000000000000000000000",
      totalRetired: "8000000000000000000000",
      verified: false,
      verifier: "0x5E6f7A8b9C0d1E2F3a4B5C6d7E8f9A0b1C2D3e4F",
      flag: "🇹🇿",
      description:
        "Conservation and restoration of mangrove ecosystems along Tanzania's coastline, protecting critical blue carbon stores.",
      lat: -6.0,
      lng: 39.0,
      registryLink: "https://registry.verra.org",
    },
  ]);
  console.log("Inserted 5 carbon projects.");

  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 86_400_000);

  await db.insert(governanceProposalsTable).values([
    {
      title: "Whitelist Kano Industrial Park for Tokenization",
      description:
        "Add Kano Industrial Estate Phase 2 (85 hectares) to the verified property whitelist. Legal title verified by Kano State Ministry of Lands. Estimated TVL addition: ₦2.8B. Carbon offset: 6,400 tCO₂e/yr.",
      proposer: "0x3a7f2B4c9D1e8F0a5B6C2d3E4f5A6b7C8d9E0f1A",
      status: "active",
      votesFor: 8_450_000,
      votesAgainst: 1_230_000,
      quorum: 5_000_000,
      endTime: days(4),
      category: "property",
    },
    {
      title: "Increase Platinum Staking APR from 22% to 25%",
      description:
        "Increase the Platinum tier staking reward rate from 2200 bps (22%) to 2500 bps (25%) to incentivize long-term OSANV locking and reduce circulating supply. Funded from the Ecosystem & Rewards allocation.",
      proposer: "0x9B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c",
      status: "succeeded",
      votesFor: 12_200_000,
      votesAgainst: 2_100_000,
      quorum: 5_000_000,
      endTime: days(-2),
      category: "token",
    },
    {
      title: "Reduce Platform Fee from 1.5% to 1.2%",
      description:
        "Lower the base property investment fee from 150 bps to 120 bps. Analysis shows the fee reduction would increase transaction volume by ~18%, resulting in net positive protocol revenue. FeeRouter adjustment required.",
      proposer: "0x1C2d3E4f5A6b7C8d9E0f1A2b3C4d5E6f7A8b9C0d",
      status: "active",
      votesFor: 3_800_000,
      votesAgainst: 4_100_000,
      quorum: 5_000_000,
      endTime: days(6),
      category: "fees",
    },
    {
      title: "Launch OsanVault Lend — Phase 1 Parameters",
      description:
        "Approve lending parameters for OsanVault Lend: max LTV 65%, liquidation threshold 75%, borrow rate 9.5% base APR, collateral: verified property tokens only. Audit completed by CertiK.",
      proposer: "0x7D8e9F0a1B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e",
      status: "executed",
      votesFor: 18_500_000,
      votesAgainst: 890_000,
      quorum: 5_000_000,
      endTime: days(-12),
      category: "protocol",
    },
  ]);
  console.log("Inserted 4 governance proposals.");

  const mins = (n: number) => new Date(now.getTime() - n * 60_000);

  await db.insert(activityEventsTable).values([
    {
      type: "purchase",
      propertyId: p1.id,
      propertyName: "Ekiti LandBank Phase 1",
      amount: "500",
      amountNgn: 500_000,
      address: "0xaBcD1234eFgH5678iJkL9012mNoP3456qRsT7890",
      txHash: "0xprop001",
      timestamp: mins(5),
    },
    {
      type: "staked",
      amount: "200000000000000000000000",
      address: "0x1234aBcD5678eFgH9012iJkL3456mNoP7890qRsT",
      txHash: "0xstake001",
      timestamp: mins(22),
    },
    {
      type: "purchase",
      propertyId: p2.id,
      propertyName: "Lagos Solar Energy SPV",
      amount: "1000",
      amountNgn: 1_000_000,
      address: "0x5678iJkL1234aBcD9012eFgH7890mNoP3456qRsT",
      txHash: "0xprop002",
      timestamp: mins(48),
    },
    {
      type: "retired",
      projectId: 2,
      projectName: "Lagos Solar Energy Credits",
      amount: "5000000000000000000000",
      address: "0x9012eFgH5678iJkL1234aBcD3456qRsT7890mNoP",
      txHash: "0xcret001",
      timestamp: mins(75),
    },
    {
      type: "purchase",
      propertyId: p5.id,
      propertyName: "Nairobi Business Park",
      amount: "200",
      amountNgn: 1_000_000,
      address: "0x3456qRsT9012eFgH5678iJkL1234aBcD7890mNoP",
      txHash: "0xprop003",
      timestamp: mins(130),
    },
    {
      type: "vote",
      amount: "500000000000000000000000",
      address: "0xeF0a1B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a",
      txHash: "0xvote001",
      timestamp: mins(200),
    },
  ]);
  console.log("Inserted 6 activity events.");

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
