/* eslint-disable prettier/prettier */
const { ethers } = require("hardhat");
const { encodeSqrtRatioX96, nearestUsableTick, NonfungiblePositionManager, Position, Pool } = require("@uniswap/v3-sdk");
const UNISWAP_FACTORY_ABI = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json").abi;
const UNISWAP_V3_POOL_ABI = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json").abi;
const { Percent, Token } = require("@uniswap/sdk-core");
const ERC20_ABI = require("../artifacts/contracts/MyToken.sol/MyToken.json").abi;
const ERC20_ABI_U = require("../artifacts/contracts/MockUSDC.sol/MockUSDC.json").abi;

async function main() {
    const tokenAAddress = "0x014f31e84328a6A134dcEF0F58FFB0947fC8a96C";
    const tokenBAddress = "0xbC882cb8Fa7D5355c5FCEfe0BC5a97EB6D91D9e0";
    const fee = 0.5 * 10000; // 0.3% fee tier
    const amountA = ethers.utils.parseUnits('10000', 18);
    const amountB = ethers.utils.parseUnits('10000', 18);
    const npmAddress = "0x1238536071E1c677A632429e3655c799b22cDA52";
    const uniswapFactoryAddress = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
    const price = encodeSqrtRatioX96(1, 1);
    const chainID = 11155111;

    const [deployer] = await ethers.getSigners();

    const factoryContract = new ethers.Contract(uniswapFactoryAddress, UNISWAP_FACTORY_ABI, deployer);
    const tokenA = new ethers.Contract(tokenAAddress, ERC20_ABI_U, deployer);
    const tokenB = new ethers.Contract(tokenBAddress, ERC20_ABI, deployer);

    await mintAndApprove(tokenA, tokenB, amountA, amountB, npmAddress);

    let poolAddress = await factoryContract.getPool(tokenAAddress, tokenBAddress, fee);
    if (poolAddress === ethers.constants.AddressZero) {
        console.log("Creating pool...");
        poolAddress = await createPool(factoryContract, tokenAAddress, tokenBAddress, fee, price);
        console.log(`Pool created at address: ${poolAddress}`);
    } else {
        console.log(`Pool found at address: ${poolAddress}`);
    }

    await addLiquidity(poolAddress, chainID, tokenA, tokenB, amountA, amountB, fee, npmAddress);
    console.log("Liquidity added successfully.");

    //const poolContract = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, tokenA.signer);
    // console.log(await poolContract.slot0());

}

async function mintAndApprove(tokenA, tokenB, amountA, amountB, npmAddress) {

    const tx1 = await tokenA.mint(npmAddress, amountA);
    await tx1.wait();
    const tx2 = await tokenB.mint(npmAddress, amountB);
    await tx2.wait();

    // Approve tokens and wait for transactions to be mined
    const tx3 = await tokenA.approve(npmAddress, amountA);
    await tx3.wait();
    const tx4 = await tokenB.approve(npmAddress, amountB);
    await tx4.wait();
    // await Promise.all([
    //     tokenA.mint(npmAddress, amountA),
    //     tokenB.mint(npmAddress, amountB),
    //     tokenA.approve(npmAddress, amountA),
    //     tokenB.approve(npmAddress, amountB)
    // ]);
    console.log("Tokens minted and approved.");
}

async function addLiquidity(poolAddress, chainId, tokenA, tokenB, amountA, amountB, fee, npmAddress) {
    const poolContract = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, tokenA.signer);
    const poolState = await getPoolState(poolContract);

    const token1 = new Token(chainId, tokenA.address, 18);
    const token2 = new Token(chainId, tokenB.address, 18);

    const configuredPool = new Pool(token1, token2, fee, poolState.sqrtPriceX96.toString(), poolState.liquidity.toString(), poolState.tick);
    const position = Position.fromAmounts({
        pool: configuredPool,
        tickLower: nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) - configuredPool.tickSpacing * 2,
        tickUpper: nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) + configuredPool.tickSpacing * 2,
        amount0: amountA.toString(),
        amount1: amountB.toString(),
        useFullPrecision: false,
    });

    const { calldata, value } = NonfungiblePositionManager.addCallParameters(position, {
        recipient: tokenA.signer.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        slippageTolerance: new Percent(50, 10_000),
    });

    const transaction = {
        data: calldata,
        to: npmAddress,
        value: value,
        from: tokenA.signer.address,
        gasLimit: 10000000,
    };

    const txRes = await tokenA.signer.sendTransaction(transaction);
    await txRes.wait();
}

async function getPoolState(poolContract) {
    const slot0 = await poolContract.slot0();
    const liquidity = await poolContract.liquidity();
    const sqrtPriceX96 = slot0[0];
    const tick = slot0[1];
    return { liquidity, sqrtPriceX96, tick };
}

async function createPool(factoryContract, tokenAAddress, tokenBAddress, fee, price) {
    const tx = await factoryContract.createPool(tokenAAddress, tokenBAddress, fee);
    await tx.wait();

    const poolAddress = await factoryContract.getPool(tokenAAddress, tokenBAddress, fee);
    const poolContract = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, factoryContract.signer);
    await poolContract.initialize(price.toString());

    return poolAddress;
}


main().catch(error => console.error(error));