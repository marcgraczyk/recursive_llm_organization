const { ethers } = require("hardhat");

async function main() {
    const usdcAddress = "0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C";
    const tokenAddress = "0x20D699de74D1A9Fe9E69Ea05c4EEaBD0E69f443f";// Replace with the token contract address
    const tokenAbi = ["function decimals() view returns (uint8)"];
    const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/DXKbh9gAE81Kq6Enn0uIbIPGOzSTJGuk'; // Replace with your provider URL
    const provider = new ethers.providers.JsonRpcProvider(providerUrl); // Using the default provider from Hardhat

    // Create a contract instance
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

    // Call the decimals function
    const decimals = await tokenContract.decimals();
    console.log(`Decimals: ${decimals}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
