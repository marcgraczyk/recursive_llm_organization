// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
//import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
//import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "./interfaces/IMyToken.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "prb-math/contracts/PRBMath.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

contract PromptUpdate {
    using SafeERC20 for IERC20;

    // Constants
    //address private constant UNISWAP_V3_FACTORY_ADDRESS = "...";
    //IUniswapV3Factory private constant uniswapV3Factory =
    //    IUniswapV3Factory(UNISWAP_V3_FACTORY_ADDRESS);

    // Public Variables
    IUniswapV3Pool public uniswapPool;
    INonfungiblePositionManager public nonfungiblePositionManager;
    IUniswapV3Factory public uniswapV3Factory;
    IMyToken public myToken;
    uint256 public lastUpdateBlock;
    uint256 public lastBidAmount;
    uint24 public fee;

    // Private Variables
    // Token-related
    IERC20 private usdcToken;
    address private daoTokenAddress;

    // Ownership and management
    address private owner;

    // Market cap and prompt
    uint256 private lastMarketCap;
    address private lastPrompter; // Store the last prompter to reward them on the next update

    address _nonfungiblePositionManager;
    address _uniswapFactory;

    event PromptUpdated(string newPrompt);

    constructor(
        address _usdcTokenAddress,
        address _daoTokenAddress,
        address _myTokenAddress
    ) {
        usdcToken = IERC20(_usdcTokenAddress);
        nonfungiblePositionManager = INonfungiblePositionManager(
            _nonfungiblePositionManager
        );
        uniswapV3Factory = IUniswapV3Factory(_uniswapFactory);

        daoTokenAddress = _daoTokenAddress;
        owner = msg.sender;

        lastUpdateBlock = block.number;
        lastBidAmount = 0;

        myToken = IMyToken(_myTokenAddress);
    }

    /**
     * Updates the prompt if the sent bid meets the required threshold.
     * The first transaction to call this function in a new block with a sufficient bid amount gets to update the prompt.
     *
     * @param newPrompt The new prompt to be updated to.
     */
    function updatePrompt(string memory newPrompt, uint256 usdcAmount) public {
        uint256 currentPrice = getCurrentPrice();
        uint256 totalSupply = uniswapPool.liquidity(); // Assuming this is a proxy for liquidity
        uint256 currentMarketCap = currentPrice * totalSupply;

        uint256 blocksElapsed = block.number - lastUpdateBlock;
        require(blocksElapsed > 0, "Prompt already updated in this block");

        // This checks if the sent USDC meets the required bid amount.
        uint256 requiredBid = lastBidAmount / blocksElapsed;
        // Assume the usdcAmount is already in the contract's balance or transferred within this transaction.
        require(
            usdcAmount > requiredBid,
            "Bid does not meet the minimum requirement"
        );
        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        // reward mechanism

        if (lastMarketCap != 0 && lastPrompter != address(0)) {
            uint256 marketCapChange = currentMarketCap > lastMarketCap
                ? currentMarketCap - lastMarketCap
                : 0;
            uint256 rewardAmount = marketCapChange / (10 * currentPrice); // 10% of the market cap change

            // need to mint the correct nominal value

            // Mint and send the reward to the last prompter
            myToken.mint(lastPrompter, rewardAmount);
        }

        // Add liquidity to Uniswap.

        uint256 lowerPrice = (currentPrice * 99) / 100; // 1% below current price
        uint256 upperPrice = (currentPrice * 101) / 100; // 1% above current price

        int24 lowerTick = approximateTickFromPrice(lowerPrice);
        int24 upperTick = approximateTickFromPrice(upperPrice);

        usdcToken.approve(address(nonfungiblePositionManager), usdcAmount);

        // Parameters for minting a new position
        INonfungiblePositionManager.MintParams
            memory params = INonfungiblePositionManager.MintParams({
                token0: address(usdcToken),
                token1: daoTokenAddress,
                fee: fee,
                tickLower: lowerTick,
                tickUpper: upperTick,
                amount0Desired: usdcAmount,
                amount1Desired: 0,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp + 15 minutes
            });

        // Mint a new position
        nonfungiblePositionManager.mint(params);
        //(, , ,uint256 tokenId) =

        emit PromptUpdated(newPrompt);
        lastUpdateBlock = block.number;
        lastBidAmount = usdcAmount;
        lastMarketCap = currentMarketCap;
        lastPrompter = msg.sender;
    }

    function getCurrentPrice() public view returns (uint256 price) {
        address poolAddress = uniswapV3Factory.getPool(
            address(usdcToken),
            daoTokenAddress,
            fee
        );
        require(poolAddress != address(0), "Pool does not exist");

        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();

        address token0 = pool.token0(); // Fetch token0 address from the pool
        bool isToken0USDC = (token0 == address(usdcToken));
        // Price calculation from sqrtPriceX96
        // Note: This gives the price of token1 in terms of token0
        // need to make sure we get the right price
        price =
            (uint256(sqrtPriceX96) * uint256(sqrtPriceX96) * 1e12) /
            (2 ** 192);

        if (!isToken0USDC) {
            // If USDC is not token0, adjust the price calculation to reflect USDC in terms of daoToken.
            price = 1e24 / price; // Invert the price if the base token is not USDC
        }
        // double check the decimals
        // uniswap example uses PoolInfo

        return price;
    }

    function approximateTickFromPrice(
        uint256 price
    ) public pure returns (int24 tick) {
        uint160 sqrtPriceX96 = uint160(sqrt(price / 1e12) * 2 ** 96);
        // adjust for decimals, double check

        // Use TickMath to get the tick at the given sqrt ratio
        tick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);
    }

    function sqrt(uint256 y) internal pure returns (uint256) {
        return PRBMath.sqrt(y);
    }
}
