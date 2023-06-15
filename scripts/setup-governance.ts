import { ethers } from "hardhat";
import { contractAddresses } from "./contracts/addresses.json";
import { ADDRESS_ZERO } from "../constants";

async function main() {
    const [deployer] = await ethers.getSigners();
    const { TIMELOCK, DAO_GOVERNOR } = contractAddresses;
    const timelock = await ethers.getContractAt("Timelock", TIMELOCK, deployer);

    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timelock.grantRole(PROPOSER_ROLE, DAO_GOVERNOR);
    await proposerTx.wait();
    console.log(`Grant proposer role to DaoGovernor: ${proposerTx.hash}`);

    const executorTx = await timelock.grantRole(EXECUTOR_ROLE, ADDRESS_ZERO);
    await executorTx.wait();
    console.log(`Disable executor role: ${executorTx.hash}`);

    const revokeTx = await timelock.revokeRole(ADMIN_ROLE, deployer);
    await revokeTx.wait();
    console.log(`Revoke deployer's admin role: ${revokeTx.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});