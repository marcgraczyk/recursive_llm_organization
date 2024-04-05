const UNISWAP_V3_FACTORY_ADDRESS = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
const uniswapV3FactoryJson = require("../node_modules/@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");
const uniswapV3FactoryABI = uniswapV3FactoryJson.abi;
const USDC_ADDRESS = "0x15B007107a17717dd8d74D4C7B1d51b39063CD12";
const DAO_TOKEN_ADDRESS = "0x076671B7EC9957898ab21dc43Aa7ba305Ab40A5b";
const FEE_TIER = 3000;

const { ethers } = require("hardhat");

async function main() {
    // Connect to the Uniswap V3 Factory contract
    console.log("test");
    const [deployer] = await ethers.getSigners();
    const uniswapV3Factory = new ethers.Contract(
        UNISWAP_V3_FACTORY_ADDRESS,
        uniswapV3FactoryABI,
        deployer
    );

    // Create the pool
    console.log("Creating Uniswap V3 Pool...");
    const tx = await uniswapV3Factory.createPool(
        USDC_ADDRESS,
        DAO_TOKEN_ADDRESS,
        FEE_TIER
    );
    const receipt = await tx.wait();

    if (receipt.status === 1) {
        console.log("Transaction successful!");
    } else {
        console.log("Transaction failed.");
    }

    const filter = uniswapV3Factory.filters.PoolCreated(
        USDC_ADDRESS,
        DAO_TOKEN_ADDRESS,
        FEE_TIER
    );
    const events = await receipt.events.filter((e) => filter.decode(e.topics, e.data));
    if (events.length > 0) {
        const poolAddress = events[0].args.pool;
        console.log(`Pool created at address: ${poolAddress}`);
    } else {
        console.log("No PoolCreated event found.");
    }

    // Compute the pool address



}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


