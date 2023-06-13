import { ethers } from "hardhat";
import { MIN_DELAY } from "../constants";
import { Timelock } from "../typechain-types";

async function deployTimelock(): Promise<Timelock> {
    const [deployer] = await ethers.getSigners();

    const timelock = await ethers.deployContract(
        "Timelock",
        [MIN_DELAY, [], [], deployer]
    );
    await timelock.waitForDeployment();
    console.log(`Timelock address: ${await timelock.getAddress()}`);

    return timelock;
}

export default deployTimelock;