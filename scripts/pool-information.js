const { ethers } = require('ethers');

// Provider
const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/DXKbh9gAE81Kq6Enn0uIbIPGOzSTJGuk';
const provider = new ethers.providers.JsonRpcProvider(providerUrl);

// Pool Contract Details
const POOL_ADDRESS = '0x602D87C3691D42856Dd4a349bfBA848F21CA4faB';
const poolJson = require('../node_modules/@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json');
const poolAbi = poolJson.abi;

// Create Contract Instance
const poolContract = new ethers.Contract(POOL_ADDRESS, poolAbi, provider);

async function getPoolDetails() {
    // Fetch pool details
    const slot0 = await poolContract.slot0();
    const liquidity = await poolContract.liquidity();
    const token0Address = await poolContract.token0();
    const token1Address = await poolContract.token1();
    const fee = await poolContract.fee();
    //const address = await poolContract.POOL_ADDRESS();

    console.log(fee);
    //console.log(address);

    console.log("Token0 Address:", token0Address);
    console.log("Token1 Address:", token1Address);

    // Extract details from slot0
    const sqrtPriceX96 = slot0[0];
    const tick = slot0[1];

    // Calculate current price
    // Price of token1 in terms of token0
    const price = (sqrtPriceX96 / 2 ** 96) ** 2;

    console.log(slot0);
    console.log(`Current sqrtPriceX96: ${sqrtPriceX96.toString()}`);
    console.log(`Current tick: ${tick}`);
    console.log(`Current price (Token1 per Token0): ${price}`);
    console.log(`Current liquidity: ${liquidity.toString()}`);
}

getPoolDetails().catch(console.error);
