import { ethers, defender } from "hardhat";

async function main() {
    // Replace 'TokenAddress' with the address of the governance token contract
    const tokenAddress = "TokenAddress";
    // Replace 'TimelockAddress' with the address of your TimelockController contract
    const timelockAddress = "TimelockAddress";

    // Retrieve the contract factories
    const Governor = await ethers.getContractFactory("MyGovernor");

    const upgradeApprovalProcess = await defender.getUpgradeApprovalProcess();

    if (upgradeApprovalProcess.address === undefined) {
        throw new Error(`Upgrade approval process with id ${upgradeApprovalProcess.approvalProcessId} has no assigned address`);
    }
    // Optionally, retrieve the upgrade approval process if using Defender's governance features
    // const upgradeApprovalProcess = await defender.getUpgradeApprovalProcess();

    // Deploying the Governor contract as an upgradeable proxy
    const governorDeployment = await defender.deployProxy(Governor, [tokenAddress, timelockAddress], {
        initializer: "initialize",
        // Uncomment the next line if you're integrating with an upgrade approval process in Defender
        // admin: upgradeApprovalProcess.address,
    });

    await governorDeployment.waitForDeployment();

    console.log(`Governor contract deployed to ${await governorDeployment.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
