// Import ethers from Hardhat package
const { ethers } = require("hardhat");

async function main() {
    // The address of the deployed contract
    const contractAddress = '0x1dE66E61eBD4DD176F9F9da9Ec138B87395682ec';
    const [deployer] = await ethers.getSigners();
    // the promptupdate contract address
    const newMinterAddress = '0x78F634be7d4111E6fe42231b9684AcFca8391Bcf';

    // Get the contract instance
    const BToken = await ethers.getContractFactory("BToken");
    const bToken = BToken.attach(contractAddress);

    // Connect to the admin wallet

    // Grant the MINTER_ROLE
    const grantTx = await bToken.connect(deployer).grantRole(
        ethers.utils.id("MINTER_ROLE"),
        newMinterAddress
    );
    await grantTx.wait();
    console.log(`Minter role granted to ${newMinterAddress}`);

    // Optionally, revoke the MINTER_ROLE from another address
    // const oldMinterAddress = 'OLD_MINTER_ADDRESS';
    // const revokeTx = await bToken.connect(adminSigner).revokeRole(
    //     ethers.utils.id("MINTER_ROLE"),
    //     oldMinterAddress
    // );
    // await revokeTx.wait();
    // console.log(`Minter role revoked from ${oldMinterAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
