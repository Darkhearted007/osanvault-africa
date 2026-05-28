import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("============================================");
  console.log("ÒsánVault Africa — Master Deployment");
  console.log("============================================");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC");
  console.log("");

  const admin = process.env.ADMIN_WALLET || deployer.address;
  const gasLimit = 3_000_000;

  // ========== 1. OSANVToken ==========
  console.log("[1/6] Deploying OSANVToken...");
  const tokenAdmin = process.env.OSANV_TOKEN_ADMIN || admin;
  const tokenMinter = process.env.OSANV_TOKEN_MINTER || admin;
  const tokenBurner = process.env.OSANV_TOKEN_BURNER || admin;
  const tokenPauser = process.env.OSANV_TOKEN_PAUSER || admin;

  const OSANVToken = await ethers.getContractFactory("OSANVToken");
  const token = await OSANVToken.deploy(tokenAdmin, tokenMinter, tokenBurner, tokenPauser, { gasLimit });
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("  OSANVToken:", tokenAddress);

  // ========== 2. StakingVault ==========
  console.log("[2/6] Deploying StakingVault...");
  const stakingAdmin = process.env.STAKING_VAULT_ADMIN || admin;
  const stakingGovernance = process.env.STAKING_VAULT_GOVERNANCE || admin;
  const stakingEmergency = process.env.STAKING_VAULT_EMERGENCY || admin;
  const stakingToken = process.env.STAKING_TOKEN_ADDRESS || tokenAddress;

  const StakingVault = await ethers.getContractFactory("StakingVault");
  const staking = await StakingVault.deploy(
    stakingAdmin, stakingGovernance, stakingEmergency, stakingToken, { gasLimit }
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("  StakingVault:", stakingAddress);

  // ========== 3. TreasuryVault ==========
  console.log("[3/6] Deploying TreasuryVault...");
  const treasuryAdmin = process.env.TREASURY_VAULT_ADMIN || admin;
  const treasuryExecutor = process.env.TREASURY_VAULT_EXECUTOR || admin;
  const treasuryGuardian = process.env.TREASURY_VAULT_GUARDIAN || admin;

  const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
  const treasury = await TreasuryVault.deploy(
    treasuryAdmin, treasuryExecutor, treasuryGuardian, { gasLimit }
  );
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("  TreasuryVault:", treasuryAddress);

  // ========== 4. TeamVesting ==========
  console.log("[4/6] Deploying TeamVesting...");
  const vestingAdmin = process.env.VESTING_ADMIN || admin;
  const vestingManager = process.env.VESTING_MANAGER || admin;
  const vestingToken = process.env.VESTING_TOKEN || tokenAddress;

  const TeamVesting = await ethers.getContractFactory("TeamVesting");
  const vesting = await TeamVesting.deploy(
    vestingAdmin, vestingManager, vestingToken, { gasLimit }
  );
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();
  console.log("  TeamVesting:", vestingAddress);

  // ========== 5. Governance ==========
  console.log("[5/6] Deploying Governance...");
  const govAdmin = process.env.GOVERNANCE_ADMIN || admin;
  const govProposer = process.env.GOVERNANCE_PROPOSER || admin;
  const govExecutor = process.env.GOVERNANCE_EXECUTOR || admin;
  const govToken = process.env.GOVERNANCE_TOKEN || tokenAddress;

  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(
    govAdmin, govProposer, govExecutor, govToken, { gasLimit }
  );
  await governance.waitForDeployment();
  const govAddress = await governance.getAddress();
  console.log("  Governance:", govAddress);

  // ========== 6. FeeRouter ==========
  console.log("[6/6] Deploying FeeRouter...");
  const feeAdmin = process.env.FEE_ROUTER_ADMIN || admin;
  const feeConfigurer = process.env.FEE_ROUTER_CONFIGURER || admin;
  const feeCollector = process.env.FEE_ROUTER_COLLECTOR || admin;
  const feeTreasury = process.env.FEE_ROUTER_TREASURY || treasuryAddress;
  const feeStaking = process.env.FEE_ROUTER_STAKING || stakingAddress;
  const feeVesting = process.env.FEE_ROUTER_VESTING || vestingAddress;

  const FeeRouter = await ethers.getContractFactory("FeeRouter");
  const feeRouter = await FeeRouter.deploy(
    feeAdmin, feeConfigurer, feeCollector,
    feeTreasury, feeStaking, feeVesting,
    { gasLimit }
  );
  await feeRouter.waitForDeployment();
  const feeAddress = await feeRouter.getAddress();
  console.log("  FeeRouter:", feeAddress);

  // ========== Summary ==========
  console.log("");
  console.log("============================================");
  console.log("Deployment Complete");
  console.log("============================================");
  console.log("OSANVToken:     ", tokenAddress);
  console.log("StakingVault:   ", stakingAddress);
  console.log("TreasuryVault:  ", treasuryAddress);
  console.log("TeamVesting:    ", vestingAddress);
  console.log("Governance:     ", govAddress);
  console.log("FeeRouter:      ", feeAddress);
  console.log("============================================");

  return {
    token: tokenAddress,
    staking: stakingAddress,
    treasury: treasuryAddress,
    vesting: vestingAddress,
    governance: govAddress,
    feeRouter: feeAddress,
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
