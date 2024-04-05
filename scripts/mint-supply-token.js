const { ethers } = require("hardhat");

async function mintTokens() {
    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.attach("0x33f559e3BB297C0C294E040Ef0e969614a722CAD");
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
