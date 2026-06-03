import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

export async function deployUUPS(
  contractName: string,
  deployer: Signer,
  ...initArgs: any[]
): Promise<Contract> {
  const Factory = await ethers.getContractFactory(contractName, deployer);
  const impl = await Factory.deploy();
  await impl.waitForDeployment();

  const initData = impl.interface.encodeFunctionData("initialize", initArgs);

  const ProxyFactory = await ethers.getContractFactory("ERC1967Proxy", deployer);
  const proxy = await ProxyFactory.deploy(await impl.getAddress(), initData);
  await proxy.waitForDeployment();

  return Factory.attach(await proxy.getAddress());
}
