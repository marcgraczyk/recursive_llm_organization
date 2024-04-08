const { ethers } = require("hardhat");
const NonfungiblePositionManager = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
const usdcContractFactory = "../artifacts/contracts/MockUSDC.sol/MockUSDC.json";
const tokenContractFactory = "../artifacts/contracts/MyToken.sol/MyToken.json";

async function main() {
    // Wallet address that will provide liquidity
    //const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
    const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/DXKbh9gAE81Kq6Enn0uIbIPGOzSTJGuk';
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`Using signer address: ${signer.address}`);


    // Addresses of the tokens and the NonfungiblePositionManager
    const USDCAddress = "0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C";
    const daoTokenAddress = "0xbC882cb8Fa7D5355c5FCEfe0BC5a97EB6D91D9e0";
    const positionManagerAddress = "0x1238536071E1c677A632429e3655c799b22cDA52";


    const ERC20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
    ];

    const positionManager = new ethers.Contract(
        positionManagerAddress,
        NonfungiblePositionManager.abi,
        signer
    );
    const usdcContract = new ethers.Contract(USDCAddress, ERC20Abi, signer);
    const daoTokenContract = new ethers.Contract(daoTokenAddress, ERC20Abi, signer);

    const usdcBalance = await usdcContract.balanceOf(signer.address);
    console.log(`USDC Balance: ${ethers.utils.formatUnits(usdcBalance)}`);
    const daoTokenBalance = await daoTokenContract.balanceOf(signer.address);
    console.log(`DAO Token Balance: ${ethers.utils.formatEther(daoTokenBalance)}`);

    if (usdcBalance.lt(ethers.utils.parseUnits("100")) || daoTokenBalance.lt(ethers.utils.parseEther("1000"))) {
        console.error("Insufficient funds for the transaction");
        return;
    }

    // Parameters for adding liquidity
    const token0 = USDCAddress < daoTokenAddress ? USDCAddress : daoTokenAddress;
    const token1 = USDCAddress < daoTokenAddress ? daoTokenAddress : USDCAddress;
    const fee = 3000; // Fee tier, e.g., 0.3%
    const tickLower = -60000; // Example tick range
    const tickUpper = 60000; // Example tick range
    const amount0Desired = ethers.utils.parseUnits("1"); // Mock USDC amount
    const amount1Desired = ethers.utils.parseEther("2"); // DAO token amount
    const amount0Min = 0; // Slippage protection
    const amount1Min = 0; // Slippage protection
    const recipient = signer.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    // Approve the position manager to spend tokens
    await usdcContract.approve(positionManagerAddress, amount0Desired);
    await daoTokenContract.approve(positionManagerAddress, amount1Desired);
    console.log("Approval successful");

    // Check USDC allowance
    const usdcAllowance = await usdcContract.allowance(signer.address, positionManagerAddress);
    console.log(`USDC Allowance for Position Manager: ${ethers.utils.formatUnits(usdcAllowance)} USDC`);

    // Check DAO Token allowance
    const daoTokenAllowance = await daoTokenContract.allowance(signer.address, positionManagerAddress);
    console.log(`DAO Token Allowance for Position Manager: ${ethers.utils.formatEther(daoTokenAllowance)} DAO Tokens`);



    // Add liquidity
    const tx = await positionManager.mint({
        token0,
        token1,
        fee,
        tickLower,
        tickUpper,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        recipient,
        deadline,
    });

    const receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
