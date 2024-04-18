const { ethers } = require('ethers');

// Your Ethereum provider URL (this example uses the Ethereum mainnet)
const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/DXKbh9gAE81Kq6Enn0uIbIPGOzSTJGuk'; // Replace with your provider URL
const provider = new ethers.providers.JsonRpcProvider(providerUrl);


const tokenAddress = '0xbC882cb8Fa7D5355c5FCEfe0BC5a97EB6D91D9e0'; // Replace with your DAO token's contract address
const USDCAddress = '0xf08A50178dfcDe18524640EA6618a1f965821715';

const mockUSDCAddress = '0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C';
const btokenAddress = '0x1dE66E61eBD4DD176F9F9da9Ec138B87395682ec';

// The ABI (Application Binary Interface) of your DAO token's contract for the balanceOf function
// This is a simplified ABI for the balanceOf function common to ERC20 tokens
const tokenAbi = [
    "function balanceOf(address owner) view returns (uint256)"
];
const mockUSDCAbi = [
    "function balanceOf(address owner) view returns (uint256)"
];

// The address of the wallet you want to check the balance of
const walletAddress = '0x0e45a2b6710AB75C5d5C5220b4144D1BA11574a9';

// Create a new contract instance
const tokenContract = new ethers.Contract(btokenAddress, tokenAbi, provider);
const mockUSDCContract = new ethers.Contract(mockUSDCAddress, mockUSDCAbi, provider);

async function checkBalance() {
    // Call the balanceOf function
    const tokenBalance = await tokenContract.balanceOf(walletAddress);
    const usdcBalance = await mockUSDCContract.balanceOf(walletAddress);

    // ethers.js returns BigNumber objects for values, so we convert it to a string for readability
    //console.log(`Balance: ${ethers.utils.formatEther(tokenBalance)} BTokens`);
    console.log(`Current BToken balance: ${ethers.utils.formatUnits(tokenBalance, 18)} BToken`);
    console.log(`Current reserve token balance: ${ethers.utils.formatUnits(usdcBalance, 18)} reserve tokens`);
    //console.log(`Balance: ${ethers.utils.formatEther(usdcBalance)} reserve Tokens`);
}

checkBalance().catch(console.error);
