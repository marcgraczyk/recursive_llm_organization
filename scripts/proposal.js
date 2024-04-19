const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();

    const bTokenAddress = "0x1dE66E61eBD4DD176F9F9da9Ec138B87395682ec"; // Replace with your actual BToken contract address
    const bToken = await ethers.getContractAt("BToken", bTokenAddress);

    const recipientAddress = "0x0e45a2b6710AB75C5d5C5220b4144D1BA11574a9"; // Address to receive the minted token
    const mintAmount = ethers.utils.parseUnits("1", 18); // Adjust '18' to match your token's decimals

    const mintCalldata = bToken.interface.encodeFunctionData("governanceMint", [recipientAddress, mintAmount]);

    // Specify the address of your deployed MyGovernor contract
    const governorAddress = "0x26794076DB3E01DB5f78fc9DC2d3367626569BC4";
    const governor = await ethers.getContractAt("MyGovernor", governorAddress, deployer);

    // Define the proposal details
    const targets = [bTokenAddress]; // Address of the contract to be called
    const values = [0]; // Ether values for the transaction (usually 0 in governance actions)
    const calldatas = [mintCalldata];
    const description = "test";
    const modelUrl = "https://hackmd.io/uCvCVxOxS6iuzkpT9q8MmQ";

    const tx = await governor.propose(
        targets,
        values,
        calldatas,
        description
    );

    // Create the proposal
    //const tx = 
    //console.log(await governor.propose(targets, values, calldatas, description, modelUrl));

    //console.log(JSON.stringify(governor.interface.fragments));


    const receipt = await tx.wait();

    console.log(`Proposal submitted. Transaction hash: ${receipt.transactionHash}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
