// Example using Ethers.js
const { ethers } = require("hardhat");


const reserveTokenAddress = "0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C";

//const amountToApprove1 = ethers.utils.formatEther(1);
const amountToApprove = ethers.utils.parseUnits("2", 18);
//const amountToApprove = ethers.utils.formatUnits(1, 18)

const BTAddress = "0x20D699de74D1A9Fe9E69Ea05c4EEaBD0E69f443f";

//const amountToMint1 = ethers.utils.formatEther(0.00000001);
//const amountToMint = ethers.utils.parseUnits("1", 18);
const amountToMint = 1000;


async function main() {

    const [signer] = await ethers.getSigners(); // Assuming signer is the token holder

    // Get the reserve token contract instance
    const ReserveToken = await ethers.getContractFactory("MockUSDC");
    const reserveToken = ReserveToken.attach(reserveTokenAddress);

    // Approve the BondingCurvedToken contract to spend tokens on behalf of the signer
    const tx = await reserveToken.approve(BTAddress, amountToApprove);
    await tx.wait();

    console.log(`Approved ${BTAddress} to spend ${ethers.utils.formatUnits(amountToApprove, 18)} reserve tokens on behalf of ${signer.address}`);

    const BToken = await ethers.getContractFactory("BToken");
    const bToken = BToken.attach(BTAddress);

    //ethers.utils.parseUnits(amountToMint.toString(), 18)
    const price = await bToken.priceToMint(amountToMint);
    const cost = await price.mul(amountToMint)
    console.log(`The price to mint ${amountToMint} wei token is: ${ethers.utils.formatUnits(cost, 18)} reserve tokens`);

    const reserveTokenBalance = await reserveToken.balanceOf(signer.address);
    const bTokenBalance = await bToken.balanceOf(signer.address);

    // const tx2 = await bToken.mint(amountToMint);
    // await tx2.wait();

    console.log(`Current reserve token balance: ${ethers.utils.formatUnits(reserveTokenBalance, 18)} reserve tokens`);
    console.log(`Current BToken balance: ${ethers.utils.formatUnits(bTokenBalance, 18)} BToken`);


    console.log("success");

    //console.log(tx2.events);

}

main().catch(console.error);

//const { ethers: hreEthers } = require("hardhat");
// const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/DXKbh9gAE81Kq6Enn0uIbIPGOzSTJGuk");
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

//const [deployer] = await ethers.getSigners();

// const ABI = require("../artifacts/contracts/BToken.sol/BToken.json").abi // ABI of LiquidityExamples contract
// const Contract = new ethers.Contract(Address, ABI, deployer);

//const amountToMint = ethers.utils.parseUnits("10000.0", "ether"); // Converts 1 token to its smallest unit (like 1 Ether to 1 wei)
