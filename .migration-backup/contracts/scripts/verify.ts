import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const addressFile = path.join(__dirname, "..", "deployed-addresses.json");
  if (!fs.existsSync(addressFile)) {
    throw new Error("deployed-addresses.json not found. Run 'pnpm deploy:amoy' first.");
  }

  const data = JSON.parse(fs.readFileSync(addressFile, "utf8"));
  const { contracts, constructorArgs } = data;

  if (!contracts.OsanVToken) {
    throw new Error("deployed-addresses.json has no addresses. Run 'pnpm deploy:amoy' first.");
  }

  console.log("═══════════════════════════════════════════════");
  console.log("  OsanVault Africa — Polygonscan Verification");
  console.log("═══════════════════════════════════════════════\n");

  const verifications = [
    { name: "OsanVToken",    address: contracts.OsanVToken    },
    { name: "LandRegistry",  address: contracts.LandRegistry  },
    { name: "PropertyNFT",   address: contracts.PropertyNFT   },
    { name: "OsanCarbon",    address: contracts.OsanCarbon    },
    { name: "StakingVault",  address: contracts.StakingVault  },
    { name: "TreasuryVault", address: contracts.TreasuryVault },
    { name: "FeeRouter",     address: contracts.FeeRouter     },
    { name: "Governance",    address: contracts.Governance    },
  ];

  let ok = 0, skip = 0, fail = 0;

  for (const { name, address } of verifications) {
    const args = constructorArgs[name] ?? [];
    process.stdout.write(`Verifying ${name} at ${address}... `);
    try {
      await run("verify:verify", {
        address,
        constructorArguments: args,
      });
      console.log("✅");
      ok++;
    } catch (e: any) {
      if (e.message?.toLowerCase().includes("already verified")) {
        console.log("✓ (already verified)");
        skip++;
      } else {
        console.log(`❌\n  Error: ${e.message}`);
        fail++;
      }
    }
  }

  console.log(`\nDone. ${ok} verified, ${skip} already verified, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
