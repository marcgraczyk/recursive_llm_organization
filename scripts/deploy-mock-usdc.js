// Import ethers from Hardhat package
const { ethers, upgrades } = require("hardhat");

async function main() {
    // Grab the contract factory

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const MockUSDC = await ethers.getContractFactory("MockUSDC");

    // Deploy the implementation contract and the proxy, then initialize the proxy
    console.log("Deploying MockUSDC");
    const mockUSDC = await MockUSDC.deploy(deployer.address, deployer.address)
    //await myToken.deployed();
    //await myToken.deployTransaction.wait(); // Wait for the deployment transaction to be mined
    //console.log("MyToken deployment transaction:", myToken.deployTransaction.hash);

    console.log("MockUSDC deployed to:", mockUSDC.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
