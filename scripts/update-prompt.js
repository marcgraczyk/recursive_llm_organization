const { ethers } = require("hardhat");

async function main() {

    const [signer] = await ethers.getSigners();
    const promptUpdateAddress = "0x02ACEf23F19E84bb0Db12b784C05eDAd7c90ffd8";
    const newPrompt = "How can I pass a proposal that mints 1 token using the governanceMint() function to my address?";
    const tokenAmount = 1000;

    const bTokenAddress = "0x1dE66E61eBD4DD176F9F9da9Ec138B87395682ec"; // Replace with your actual BToken contract address
    const bToken = await ethers.getContractAt("BToken", bTokenAddress);

    const recipientAddress = "0x0e45a2b6710AB75C5d5C5220b4144D1BA11574a9"; // Address to receive the minted token
    const mintAmount = ethers.utils.parseUnits("1", 18); // Adjust '18' to match your token's decimals

    const mintCalldata = bToken.interface.encodeFunctionData("governanceMint", [recipientAddress, mintAmount]);

    const proposalData = {
        targets: [bTokenAddress],
        values: [0], // No Ether is sent with the mint function
        calldatas: [mintCalldata],
        description: "test1",
    };

    //currentModelUrl: "https://hackmd.io/uCvCVxOxS6iuzkpT9q8MmQ"

    //Mint 1 token from the governanceMint() function

    // Connect to your contract
    const PromptUpdate = await ethers.getContractFactory("PromptUpdate");
    const promptUpdate = await PromptUpdate.attach(promptUpdateAddress);

    // Update prompt and submit proposal
    const tx = await promptUpdate.connect(signer).updatePrompt(
        newPrompt,
        tokenAmount,
        proposalData
    );
    await tx.wait();

    console.log(`Prompt updated and proposal submitted. Transaction Hash: ${tx.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});