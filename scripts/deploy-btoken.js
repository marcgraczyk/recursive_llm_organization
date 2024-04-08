const { ethers, upgrades } = require("hardhat");

const reserveTokenAddress = '0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C';

async function main() {
    // Grab the contract factory

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const BToken = await ethers.getContractFactory("BToken");

    console.log("Deploying BToken");
    const bToken = await BToken.deploy("MockUSDC", "MUSDC", reserveTokenAddress)

    console.log("MyToken deployed to:", bToken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });