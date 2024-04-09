// Example using Ethers.js
const { ethers } = require("hardhat");


const reserveTokenAddress = "0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C";
const BTAddress = "0x20D699de74D1A9Fe9E69Ea05c4EEaBD0E69f443f";
const amountToBurn = 1;


async function main() {

    // [signer] = await ethers.getSigners(); // Assuming signer is the token holder

    // Get the reserve token contract instance
    const ReserveToken = await ethers.getContractFactory("MockUSDC");
    const reserveToken = ReserveToken.attach(reserveTokenAddress);

    // Approve the BondingCurvedToken contract to spend tokens on behalf of the signer
    const BToken = await ethers.getContractFactory("BToken");
    const bToken = BToken.attach(BTAddress);

    //ethers.utils.parseUnits(amountToMint.toString(), 18)
    const price = await bToken.priceToMint(0);
    const reward = await price.mul(amountToBurn)
    console.log(`The reward for burning ${amountToBurn} wei token is: ${ethers.utils.formatUnits(reward, 18)} reserve tokens`);

    // const reserveTokenBalance = await reserveToken.balanceOf(signer.address);
    // const bTokenBalance = await bToken.balanceOf(signer.address);

    const tx3 = await bToken.burn(amountToBurn);
    await tx3.wait();
    console.log("New burn reward");

    // console.log(`Current reserve token balance: ${ethers.utils.formatUnits(reserveTokenBalance, 18)} reserve tokens`);
    // console.log(`Current BToken balance: ${ethers.utils.formatUnits(bTokenBalance, 18)} BToken`);


    console.log("success");

    //console.log(tx2.events);

}

main().catch(console.error);



