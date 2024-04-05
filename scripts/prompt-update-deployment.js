// scripts/deployPromptUpdate.js

const hre = require("hardhat");

async function main() {
    // Replace the following addresses with your actual contract addresses
    const usdcTokenAddress = "0xf08A50178dfcDe18524640EA6618a1f965821715";
    const daoTokenAddress = "0xe165BCDd9e093399Ccb03fE2cb199DDA164efdee";
    const governanceAddress = "0xAb3CD5D6C3Da57060fa0403260632b530D583bA2";
    const fee = 500;

    // Assuming NonfungiblePositionManager and UniswapV3Factory are already deployed
    // and their addresses are known (for Uniswap official deployments, these addresses
    // are constant and well-known)
    const nonfungiblePositionManagerAddress = "0x1238536071E1c677A632429e3655c799b22cDA52";
    const uniswapV3FactoryAddress = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
    // Get the contract factory for the PromptUpdate contract
    const PromptUpdate = await hre.ethers.getContractFactory("PromptUpdate");

    // Deploy the contract with the necessary constructor arguments
    const promptUpdate = await PromptUpdate.deploy(
        usdcTokenAddress,
        daoTokenAddress,
        governanceAddress,
        nonfungiblePositionManagerAddress,
        uniswapV3FactoryAddress,
        fee
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
