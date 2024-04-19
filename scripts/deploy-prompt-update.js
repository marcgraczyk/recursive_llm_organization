// scripts/deployPromptUpdate.js

const hre = require("hardhat");

async function main() {
    // Replace the following addresses with your actual contract addresses
    const usdcTokenAddress = "0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C";
    const bTokenAddress = "0x1dE66E61eBD4DD176F9F9da9Ec138B87395682ec";
    const governanceAddress = "0x0beF131983302135F450dD91899F26a15A3156Df";
    const epochLength = 1;

    // Assuming NonfungiblePositionManager and UniswapV3Factory are already deployed
    // and their addresses are known (for Uniswap official deployments, these addresses
    // are constant and well-known)
    // const nonfungiblePositionManagerAddress = "0x1238536071E1c677A632429e3655c799b22cDA52";
    // const uniswapV3FactoryAddress = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
    // Get the contract factory for the PromptUpdate contract
    const PromptUpdate = await hre.ethers.getContractFactory("PromptUpdate");

    // Deploy the contract with the necessary constructor arguments
    const promptUpdate = await PromptUpdate.deploy(
        usdcTokenAddress,
        bTokenAddress,
        governanceAddress,
        epochLength
    );

    await promptUpdate.deployed();

    console.log("PromptUpdate deployed to:", promptUpdate.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
