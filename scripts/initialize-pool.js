const { ethers } = require("hardhat");
const { Interface } = require("ethers").utils;

// Uniswap V3 Factory ABI snippet containing only the necessary function
const factoryABI = [
    "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external returns (address pool)"
];
const factoryAddress = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
// wrong factory address most likely

async function main() {
    const [deployer] = await ethers.getSigners();

    // Your script parameters
    const token0 = "0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C"; // Token A address
    const token1 = "0xbC882cb8Fa7D5355c5FCEfe0BC5a97EB6D91D9e0"; // Token B address
    const fee = 3000; // Fee tier, e.g., 0.3%
    const sqrtPriceX96 = ethers.BigNumber.from("1"); // Calculated sqrt price

    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, deployer);

    try {
        const poolAddress = await factoryContract.createAndInitializePoolIfNecessary(
            token0,
            token1,
            fee,
            sqrtPriceX96
        );
        console.log(`Pool address: ${poolAddress}`);
    } catch (error) {
        console.error(`Error creating or initializing the pool: ${error.message}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

