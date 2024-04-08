const { ethers } = require("hardhat");

async function mintTokens() {
    const Token = await ethers.getContractFactory("MockUSDC");
    const token = await Token.attach("0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C");
    const [deployer] = await ethers.getSigners();

    console.log(deployer.address);

    const MINTER_ROLE = await token.MINTER_ROLE();
    const hasMinterRole = await token.hasRole(MINTER_ROLE, deployer.address);
    if (!hasMinterRole) {
        console.error("Deployer does not have MINTER_ROLE. Exiting...");
        return;
    } else {
        console.log("Deployer has minter role");

    }

    // Mint tokens to your wallet
    await token.mint(deployer.address, ethers.utils.parseEther("1000000"));
}

mintTokens()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
