// Import ethers from Hardhat package
const { ethers, upgrades } = require("hardhat");

async function main() {
    // Grab the contract factory

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const MyToken = await ethers.getContractFactory("MyToken");

    // Deploy the implementation contract and the proxy, then initialize the proxy
    console.log("Deploying MyToken and Proxy");
    const myToken = await upgrades.deployProxy(MyToken, [
        /* defaultAdmin, pauser, minter, upgrader addresses here */
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address,
    ], {
        initializer: 'initialize',
    });
    //await myToken.deployed();
    //await myToken.deployTransaction.wait(); // Wait for the deployment transaction to be mined
    //console.log("MyToken deployment transaction:", myToken.deployTransaction.hash);

    console.log("MyToken deployed to:", myToken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });