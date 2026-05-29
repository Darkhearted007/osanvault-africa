import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("═══════════════════════════════════════════════");
  console.log("  OsanVault Africa — Contract Deployment");
  console.log("  Network: Polygon Amoy Testnet (chainId 80002)");
  console.log("═══════════════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance: ", ethers.formatEther(balance), "MATIC");
  if (balance < ethers.parseEther("0.5")) {
    console.warn("⚠️  Low balance — get test MATIC at https://faucet.polygon.technology/");
  }
  console.log();

  // ── 1. OsanVToken (OSANV ERC-20) ─────────────────────────────────────────
  console.log("[1/8] Deploying OsanVToken (OSANV)...");
  const OsanVToken = await ethers.getContractFactory("OsanVToken");
  const initialSupply = ethers.parseEther("1000000000"); // 1 billion OSANV
  const osanvToken = await OsanVToken.deploy(deployer.address, initialSupply);
  await osanvToken.waitForDeployment();
  const osanvTokenAddress = await osanvToken.getAddress();
  console.log("  ✓ OsanVToken:", osanvTokenAddress);

  // ── 2. LandRegistry ───────────────────────────────────────────────────────
  console.log("[2/8] Deploying LandRegistry...");
  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy(deployer.address);
  await landRegistry.waitForDeployment();
  const landRegistryAddress = await landRegistry.getAddress();
  console.log("  ✓ LandRegistry:", landRegistryAddress);

  // ── 3. PropertyNFT ────────────────────────────────────────────────────────
  console.log("[3/8] Deploying PropertyNFT...");
  const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
  const propertyNFT = await PropertyNFT.deploy(deployer.address);
  await propertyNFT.waitForDeployment();
  const propertyNFTAddress = await propertyNFT.getAddress();
  console.log("  ✓ PropertyNFT:", propertyNFTAddress);

  // ── 4. OsanCarbon ─────────────────────────────────────────────────────────
  console.log("[4/8] Deploying OsanCarbon...");
  const OsanCarbon = await ethers.getContractFactory("OsanCarbon");
  const carbonMetadataURI = "https://api.osanvaultafrica.com/metadata/carbon/{id}.json";
  const osanCarbon = await OsanCarbon.deploy(
    deployer.address,
    deployer.address,
    carbonMetadataURI
  );
  await osanCarbon.waitForDeployment();
  const osanCarbonAddress = await osanCarbon.getAddress();
  console.log("  ✓ OsanCarbon:", osanCarbonAddress);

  // ── 5. StakingVault ───────────────────────────────────────────────────────
  console.log("[5/8] Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(
    deployer.address, // admin
    deployer.address, // governance (update after Governance is deployed)
    deployer.address, // emergency multisig
    osanvTokenAddress
  );
  await stakingVault.waitForDeployment();
  const stakingVaultAddress = await stakingVault.getAddress();
  console.log("  ✓ StakingVault:", stakingVaultAddress);

  // ── 6. TreasuryVault ──────────────────────────────────────────────────────
  console.log("[6/8] Deploying TreasuryVault...");
  const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
  const treasuryVault = await TreasuryVault.deploy(deployer.address);
  await treasuryVault.waitForDeployment();
  const treasuryVaultAddress = await treasuryVault.getAddress();
  console.log("  ✓ TreasuryVault:", treasuryVaultAddress);

  // ── 7. FeeRouter ──────────────────────────────────────────────────────────
  console.log("[7/8] Deploying FeeRouter...");
  const FeeRouter = await ethers.getContractFactory("FeeRouter");
  const feeRouter = await FeeRouter.deploy(
    deployer.address,   // admin
    treasuryVaultAddress,
    stakingVaultAddress,
    deployer.address,   // team wallet — replace with multisig before mainnet
    osanvTokenAddress
  );
  await feeRouter.waitForDeployment();
  const feeRouterAddress = await feeRouter.getAddress();
  console.log("  ✓ FeeRouter:", feeRouterAddress);

  // ── 8. Governance ─────────────────────────────────────────────────────────
  console.log("[8/8] Deploying Governance...");
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(
    deployer.address, // admin
    deployer.address, // proposer (initially deployer; open up after launch)
    deployer.address, // executor
    osanvTokenAddress
  );
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("  ✓ Governance:", governanceAddress);

  // ── Post-deploy: wire FeeRouter into OsanCarbon ──────────────────────────
  console.log("\nWiring FeeRouter into OsanCarbon...");
  const tx = await osanCarbon.setFeeConfig(feeRouterAddress, osanvTokenAddress, 0);
  await tx.wait();
  console.log("  ✓ OsanCarbon.setFeeConfig done");

  // ── Save addresses ────────────────────────────────────────────────────────
  const addresses = {
    network:      "polygonAmoy",
    chainId:      80002,
    deployedAt:   new Date().toISOString(),
    deployer:     deployer.address,
    constructorArgs: {
      OsanVToken:    [deployer.address, initialSupply.toString()],
      LandRegistry:  [deployer.address],
      PropertyNFT:   [deployer.address],
      OsanCarbon:    [deployer.address, deployer.address, carbonMetadataURI],
      StakingVault:  [deployer.address, deployer.address, deployer.address, osanvTokenAddress],
      TreasuryVault: [deployer.address],
      FeeRouter:     [deployer.address, treasuryVaultAddress, stakingVaultAddress, deployer.address, osanvTokenAddress],
      Governance:    [deployer.address, deployer.address, deployer.address, osanvTokenAddress],
    },
    contracts: {
      OsanVToken:    osanvTokenAddress,
      LandRegistry:  landRegistryAddress,
      PropertyNFT:   propertyNFTAddress,
      OsanCarbon:    osanCarbonAddress,
      StakingVault:  stakingVaultAddress,
      TreasuryVault: treasuryVaultAddress,
      FeeRouter:     feeRouterAddress,
      Governance:    governanceAddress,
    },
  };

  const outPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));

  console.log("\n═══════════════════════════════════════════════");
  console.log("  ✅ All 8 contracts deployed successfully!");
  console.log("═══════════════════════════════════════════════");
  console.log("\n📄 Addresses saved to contracts/deployed-addresses.json");
  console.log("\n📋 Next steps:");
  console.log("   1. Run:  pnpm verify:amoy  (verify on Polygonscan)");
  console.log("   2. Update artifacts/osanvault/src/lib/contract.ts with these addresses:");
  console.log();
  console.log(JSON.stringify(addresses.contracts, null, 2));
  console.log("\n   Polygonscan: https://amoy.polygonscan.com/address/<address>");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
