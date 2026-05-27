import { ethers, run } from "hardhat";

async function main() {
  const addresses: Record<string, string> = {};

  const vars = [
    "TOKEN_ADDRESS",
    "STAKING_ADDRESS",
    "TREASURY_ADDRESS",
    "VESTING_ADDRESS",
    "GOVERNANCE_ADDRESS",
    "FEE_ROUTER_ADDRESS",
    "CARBON_ADDRESS",
    "PROPERTY_NFT_ADDRESS",
  ];

  for (const v of vars) {
    const val = process.env[v];
    if (val) addresses[v.toLowerCase()] = val;
  }

  if (Object.keys(addresses).length === 0) {
    console.log("No addresses found in env. Set TOKEN_ADDRESS, STAKING_ADDRESS, etc.");
    process.exitCode = 1;
    return;
  }

  for (const [name, address] of Object.entries(addresses)) {
    console.log(`Verifying ${name}: ${address}...`);
    try {
      await run("verify:verify", { address });
      console.log(`  ✓ ${name} verified`);
    } catch (err: any) {
      if (err.message?.includes("already verified")) {
        console.log(`  - ${name} already verified`);
      } else {
        console.error(`  ✗ ${name} verification failed:`, err.message);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
