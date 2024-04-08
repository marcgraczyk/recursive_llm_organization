// Example using Ethers.js
const { ethers } = require("hardhat");
//const { ethers: hreEthers } = require("hardhat");
// const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/DXKbh9gAE81Kq6Enn0uIbIPGOzSTJGuk");
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

//const [deployer] = await ethers.getSigners();

// const ABI = require("../artifacts/contracts/BToken.sol/BToken.json").abi // ABI of LiquidityExamples contract
// const Contract = new ethers.Contract(Address, ABI, deployer);

//const amountToMint = ethers.utils.parseUnits("10000.0", "ether"); // Converts 1 token to its smallest unit (like 1 Ether to 1 wei)


const reserveTokenAddress = "0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C"; // Replace with your reserve token contract address
const amountToApprove = ethers.utils.parseUnits("100000", 18);
const BTAddress = "0xcA30D00A262dca2604F155dFe260B7cfb3562b34";
const amountToSpend = ethers.utils.parseUnits("10", 18);
const amountToBurn = ethers.utils.parseUnits("0.00001", 18);



async function main() {

    const [signer] = await ethers.getSigners(); // Assuming signer is the token holder

    // Get the reserve token contract instance
    const ReserveToken = await ethers.getContractFactory("MockUSDC");
    const reserveToken = ReserveToken.attach(reserveTokenAddress);

    // Approve the BondingCurvedToken contract to spend tokens on behalf of the signer
    const tx = await reserveToken.approve(BTAddress, amountToApprove);
    await tx.wait();

    console.log(`Approved ${BTAddress} to spend ${amountToApprove} tokens on behalf of ${signer.address}`);

    const BToken = await ethers.getContractFactory("BToken");
    const bToken = BToken.attach(BTAddress);

    // const tx2 = await bToken.mint(amountToSpend);
    // await tx2.wait();
    // console.log("New position minted");

    const tx3 = await bToken.burn(amountToBurn);
    await tx3.wait();
    console.log("New burn reward");

}

main().catch(console.error);
