import { ethers } from "hardhat";
import { mainConfig } from "./config";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Account balance: ${balance.toString()}`);

  const AyaaToken = await ethers.getContractFactory("AyaaToken");
  const ayaaToken = await AyaaToken.deploy();
  console.log(`AyaaToken address: ${ayaaToken.address}`);

  const AyaaFarm = await ethers.getContractFactory("AyaaFarm");
  const ayaaFarm = await AyaaFarm.deploy(...mainConfig, ayaaToken.address);
  console.log(`AyaaFarm address: ${ayaaFarm.address}`);

  const ayaaMinter = await ayaaToken.MINTER_ROLE();
  await ayaaToken.grantRole(ayaaMinter, ayaaFarm.address);
  console.log(`AyaaToken minter role transferred to: ${ayaaFarm.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
