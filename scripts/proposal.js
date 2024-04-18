const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();

    // Specify the address of your deployed MyGovernor contract
    const governorAddress = "0x407F695C895b60f95078DbB1553af8B028a7412D";
    const governor = await ethers.getContractAt("MyGovernor", governorAddress, deployer);

    // Define the proposal details
    const targets = []; // Address of the contract to be called
    const values = [0]; // Ether values for the transaction (usually 0 in governance actions)
    const calldatas = [];
    const description = "test";
    const modelUrl = "https://hackmd.io/uCvCVxOxS6iuzkpT9q8MmQ";

    // Create the proposal
    //const tx = 
    //console.log(await governor.propose(targets, values, calldatas, description, modelUrl));

    //console.log(JSON.stringify(governor.interface.fragments));

    const tx = await governor.propose(
        targets,
        values,
        calldatas,
        description
    );

    const receipt = await tx.wait();

    console.log(`Proposal submitted. Transaction hash: ${receipt.transactionHash}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
