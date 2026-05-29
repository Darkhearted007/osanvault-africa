/**
 * OsanVault Africa — UUPS Proxy Deployment Script
 *
 * Deploy order (dependency graph):
 *   1.  RoleManager       — role constants registry
 *   2.  TreasuryVault     — receives genesis treasury allocation
 *   3.  TeamVesting       — receives genesis team allocation
 *   4.  OsanVToken        — ERC-20 with capped supply + genesis mints
 *   5.  LandRegistry      — dual land verification (gov + indigenous)
 *   6.  PropertyNFT       — ERC-1155 fractions, gated by LandRegistry
 *   7.  OsanCarbon        — ERC-1155 carbon credits
 *   8.  StakingVault      — 4-tier OSANV staking
 *   9.  Governance        — DAO voting (ERC20Votes snapshot)
 *   10. FeeRouter         — protocol fee distribution
 *   11. PropertyOracle    — on-chain property valuation
 *
 * Usage:
 *   pnpm --filter @workspace/contracts run deploy:amoy
 *   DEPLOYER_PRIVATE_KEY=<hex> AMOY_RPC_URL=<rpc> npx hardhat run scripts/deploy.ts --network amoy
 */

import { ethers, upgrades } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("═══════════════════════════════════════════════════════");
  console.log("  OsanVault Africa — Institutional UUPS Proxy Deploy   ");
  console.log("  Network:", network.name, "(chainId", network.chainId.toString() + ")");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Deployer :", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance  :", ethers.formatEther(balance), "MATIC");
  if (balance < ethers.parseEther("0.5")) {
    console.warn("⚠️  Low balance — get test MATIC at https://faucet.polygon.technology/");
  }
  console.log();

  // ─── Deployment helpers ────────────────────────────────────────────────────

  async function deployProxy(contractName: string, args: unknown[]) {
    console.log(`[deploy] ${contractName}...`);
    const Factory = await ethers.getContractFactory(contractName);
    const proxy = await upgrades.deployProxy(Factory, args, {
      kind: "uups",
      initializer: "initialize",
    });
    await proxy.waitForDeployment();
    const addr = await proxy.getAddress();
    console.log(`  ✓ ${contractName} proxy: ${addr}`);
    return { proxy, addr };
  }

  // ─── 1. RoleManager ───────────────────────────────────────────────────────
  const { addr: roleManagerAddress } = await deployProxy("RoleManager", [deployer.address]);

  // ─── 2. TreasuryVault ─────────────────────────────────────────────────────
  //   timelockDuration = 2 days (172 800 s), dailyLimit = 50 000 OSANV (in wei)
  const { addr: treasuryAddress } = await deployProxy("TreasuryVault", [
    deployer.address,
    2 * 24 * 60 * 60,              // 2-day timelock
    ethers.parseEther("50000"),    // 50 000 OSANV daily limit
  ]);

  // ─── 3. TeamVesting ───────────────────────────────────────────────────────
  const { addr: teamVestingAddress } = await deployProxy("TeamVesting", [
    deployer.address,
    treasuryAddress,               // revoked tokens return to treasury
  ]);

  // ─── 4. OsanVToken ────────────────────────────────────────────────────────
  //   Genesis allocations (by bps from contract constants):
  //   Treasury 20% · Ecosystem 30% · Community 20% · Institutional 15%
  //   Governance 10% · Team 5%
  //   For testnet all genesis recipients = deployer for simplicity.
  const { proxy: osanvProxy, addr: osanvAddress } = await deployProxy("OsanVToken", [
    deployer.address,    // admin
    deployer.address,    // treasury     recipient (→ TreasuryVault on mainnet)
    deployer.address,    // ecosystem    recipient
    deployer.address,    // community    recipient
    deployer.address,    // institutional recipient
    deployer.address,    // governance   reserve recipient
    teamVestingAddress,  // team vesting contract
  ]);

  // ─── 5. LandRegistry ──────────────────────────────────────────────────────
  const { addr: landRegistryAddress } = await deployProxy("LandRegistry", [deployer.address]);

  // ─── 6. PropertyNFT ───────────────────────────────────────────────────────
  const { addr: propertyNFTAddress } = await deployProxy("PropertyNFT", [
    deployer.address,
    landRegistryAddress,
  ]);

  // ─── 7. OsanCarbon ────────────────────────────────────────────────────────
  const carbonBaseURI = "https://api.osanvaultafrica.com/metadata/carbon/{id}.json";
  const { addr: carbonAddress } = await deployProxy("OsanCarbon", [
    deployer.address,  // admin
    deployer.address,  // verifier (replace with authorized verifier on mainnet)
    carbonBaseURI,
  ]);

  // ─── 8. StakingVault ──────────────────────────────────────────────────────
  const { addr: stakingVaultAddress } = await deployProxy("StakingVault", [
    deployer.address,  // admin
    deployer.address,  // governance (update after Governance proxy is deployed)
    deployer.address,  // emergency multisig
    osanvAddress,      // staking token
  ]);

  // ─── 9. Governance ────────────────────────────────────────────────────────
  const { addr: governanceAddress } = await deployProxy("Governance", [
    deployer.address,  // admin
    deployer.address,  // executor
    osanvAddress,      // voting token
  ]);

  // ─── 10. FeeRouter ────────────────────────────────────────────────────────
  const { addr: feeRouterAddress } = await deployProxy("FeeRouter", [
    deployer.address,      // admin
    osanvAddress,          // token
    treasuryAddress,       // treasury
    stakingVaultAddress,   // staking vault
    deployer.address,      // operations multisig (replace before mainnet)
  ]);

  // ─── 11. PropertyOracle ───────────────────────────────────────────────────
  const { addr: oracleAddress } = await deployProxy("PropertyOracle", [deployer.address]);

  // ─── Post-deploy wiring ───────────────────────────────────────────────────
  console.log("\nWiring post-deploy configuration...");

  // Grant GOVERNANCE_ROLE on StakingVault to the Governance proxy
  const stakingVault = await ethers.getContractAt("StakingVault", stakingVaultAddress);
  const GOVERNANCE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNANCE_ROLE"));
  const tx1 = await stakingVault.grantRole(GOVERNANCE_ROLE, governanceAddress);
  await tx1.wait();
  console.log("  ✓ StakingVault.GOVERNANCE_ROLE → Governance");

  // Grant ORACLE_ROLE on PropertyNFT to the PropertyOracle
  const propertyNFT = await ethers.getContractAt("PropertyNFT", propertyNFTAddress);
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
  try {
    const tx2 = await propertyNFT.grantRole(ORACLE_ROLE, oracleAddress);
    await tx2.wait();
    console.log("  ✓ PropertyNFT.ORACLE_ROLE → PropertyOracle");
  } catch {
    console.log("  ⚠  PropertyNFT.ORACLE_ROLE grant skipped (role may not exist)");
  }

  // ─── Delegate voting power (testnet convenience) ─────────────────────────
  console.log("\nDelegating voting power to deployer (testnet)...");
  const osanvToken = await ethers.getContractAt("OsanVToken", osanvAddress);
  const tx3 = await osanvToken.delegate(deployer.address);
  await tx3.wait();
  console.log("  ✓ OSANV voting power delegated to deployer");

  // ─── Save addresses ───────────────────────────────────────────────────────
  const result = {
    network:    network.name,
    chainId:    network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer:   deployer.address,
    proxyPattern: "UUPS",
    contracts: {
      RoleManager:     roleManagerAddress,
      TreasuryVault:   treasuryAddress,
      TeamVesting:     teamVestingAddress,
      OsanVToken:      osanvAddress,
      LandRegistry:    landRegistryAddress,
      PropertyNFT:     propertyNFTAddress,
      OsanCarbon:      carbonAddress,
      StakingVault:    stakingVaultAddress,
      Governance:      governanceAddress,
      FeeRouter:       feeRouterAddress,
      PropertyOracle:  oracleAddress,
    },
  };

  const outPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ✅  All 11 UUPS proxies deployed successfully!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n📄 Addresses saved to contracts/deployed-addresses.json");
  console.log("\n📋 Contract addresses:");
  console.log(JSON.stringify(result.contracts, null, 2));
  console.log("\n📋 Next steps:");
  console.log("   1. Run:  pnpm verify:amoy  (verify on Polygonscan)");
  console.log("   2. Update artifacts/osanvault/src/lib/contract.ts with proxy addresses");
  console.log("   3. Set IS_CONTRACT_DEPLOYED = true  in contract.ts");
  console.log("   4. On mainnet: replace deployer with multisig as DEFAULT_ADMIN_ROLE");
  console.log("\n   Polygonscan: https://amoy.polygonscan.com/address/<address>");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
