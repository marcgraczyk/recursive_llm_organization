const { ethers } = require('ethers');

// Your Ethereum provider URL (this example uses the Ethereum mainnet)
const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/DXKbh9gAE81Kq6Enn0uIbIPGOzSTJGuk'; // Replace with your provider URL
const provider = new ethers.providers.JsonRpcProvider(providerUrl);

// The contract address of your DAO token
const tokenAddress = '0xbC882cb8Fa7D5355c5FCEfe0BC5a97EB6D91D9e0'; // Replace with your DAO token's contract address
const mockUSDCAddress = '0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C';
const btokenAddress = '0xcA30D00A262dca2604F155dFe260B7cfb3562b34';
const USDCAddress = '0xf08A50178dfcDe18524640EA6618a1f965821715';

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
    const tokenBalance = await tokenContract.balanceOf(btokenAddress);
    const usdcBalance = await mockUSDCContract.balanceOf(btokenAddress);

    // ethers.js returns BigNumber objects for values, so we convert it to a string for readability
    console.log(`Balance: ${ethers.utils.formatEther(tokenBalance)} DAO Tokens`);
    console.log(`Balance: ${ethers.utils.formatEther(usdcBalance)} mockUSDC Tokens`);
}

checkBalance().catch(console.error);
