import { ethers } from "hardhat";

async function main() {
  const network = ethers.provider.network;
  if (network.chainId === 80002n && !process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error("DEPLOYER_PRIVATE_KEY is required for Amoy network");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const admin = process.env.ADMIN_WALLET || deployer.address;
  const verifier = process.env.VERIFIER_WALLET || deployer.address;
  const baseURI = process.env.OSANCARBON_BASE_URI || "https://api.osanvault.africa/metadata/carbon/";

  const OsanCarbon = await ethers.getContractFactory("OsanCarbon");
  const carbon = await OsanCarbon.deploy(admin, verifier, baseURI);

  await carbon.waitForDeployment();

  const address = await carbon.getAddress();
  console.log("OsanCarbon deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
