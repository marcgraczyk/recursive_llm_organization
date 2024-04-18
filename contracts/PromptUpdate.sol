pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IBToken.sol";
import "./interfaces/IGovernance.sol";

contract PromptUpdate {
    using SafeERC20 for IERC20;

    // Public Variables

    //IMyToken public myToken;
    uint256 public lastUpdateBlock;
    uint256 public lastBidAmount;
    uint256 public epochLength;
    IGovernance public governance;

    // Private Variables
    // Token-related
    address private usdcToken;
    address private bToken;

    // Ownership and management
    address private owner;

    // Market cap and prompt
    uint256 private lastMarketCap;
    address private lastPrompter; // Store the last prompter to reward them on the next update

    //address _nonfungiblePositionManager;
    //address _uniswapFactory;

    event PromptUpdated(string newPrompt);

    struct ProposalData {
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        string description;
        string currentModelUrl;
    }

    // the description should be the prompt -> can be enforced by social consensus

    constructor(
        address _usdcTokenAddress,
        address _bTokenAddress,
        address _governanceAddress,
        uint256 _epochLength
    ) {
        owner = msg.sender;

        bToken = _bTokenAddress;
        usdcToken = _usdcTokenAddress;

        governance = IGovernance(_governanceAddress);

        lastUpdateBlock = block.number;
        lastBidAmount = 0;
        lastMarketCap = 0;
        epochLength = _epochLength;
    }

    /**
     * Updates the prompt if the sent bid meets the required threshold.
     * The first transaction to call this function in a new block with a sufficient bid amount gets to update the prompt.
     *
     * @param newPrompt The new prompt to be updated to.
     */
    function updatePrompt(
        string memory newPrompt,
        uint256 tokenAmount,
        ProposalData memory proposalData
    ) public {
        uint256 currentPrice = IBToken(bToken).currentPrice();
        uint256 totalMinted = IBToken(bToken).totalTokensMinted();
        uint256 totalBurned = IBToken(bToken).totalTokensBurned();
        uint256 netMint = totalMinted - totalBurned;
        uint256 currentMarketCap = currentPrice * netMint;

        uint256 blocksElapsed = block.number - lastUpdateBlock;

        // Check that enough blocks have passed to be at least one epoch length
        // require(
        //     blocksElapsed >= epochLength,
        //     "Not enough blocks passed since last update."
        // );

        // Require that blocks elapsed since the last update is an exact multiple of epoch length
        // require(
        //     blocksElapsed % epochLength == 0,
        //     "Update can only occur at exact epoch multiples."
        // );

        uint256 epochElapsed = blocksElapsed / epochLength;
        uint256 requiredBid = lastBidAmount / epochElapsed;

        // require(
        //     tokenAmount > requiredBid,
        //     "Bid does not meet the minimum requirement"
        // );

        // need to allow for payment in both tokens -> calculate the bid amount nominally

        // IERC20(bToken).safeTransferFrom(msg.sender, address(this), tokenAmount);

        // governance.propose(
        //     proposalData.targets,
        //     proposalData.values,
        //     proposalData.calldatas,
        //     proposalData.description,
        //     proposalData.currentModelUrl
        // );

        // reward mechanism

        // if (lastMarketCap != 0 && lastPrompter != address(0)) {
        //     uint256 marketCapChange = currentMarketCap - lastMarketCap;
        //     uint256 rewardAmount = marketCapChange / (10 * currentPrice); // 10% of the market cap change

        //     // Mint and send the reward to the last prompter
        //     IBToken(bToken).governanceMint(lastPrompter, rewardAmount);
        // } else if (currentMarketCap < lastMarketCap) {
        //     IBToken(bToken).governanceBurn(address(this), tokenAmount);
        // }

        // if the market cap decreased burn the token amount
        // give a bigger allowance for negative rewards?

        emit PromptUpdated(newPrompt);
        lastUpdateBlock = block.number;
        lastBidAmount = tokenAmount;
        lastMarketCap = currentMarketCap;
        lastPrompter = msg.sender;
    }
}
