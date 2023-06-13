import { ethers } from "hardhat";
import { Timelock } from "../typechain-types";

async function deployTargetContract(timelock: Timelock) {
    const targetContract = await ethers.deployContract(
        "TargetContract",
        []
    );
    await targetContract.waitForDeployment();
    console.log(`TargetContract address: ${await targetContract.getAddress()}`);

    const OPERATOR_ROLE = await targetContract.OPERATOR_ROLE();
    const tx = await targetContract.grantRole(OPERATOR_ROLE, timelock);
    console.log(`Granted operator role to Timelock: ${tx.hash}`);
}

export default deployTargetContract;