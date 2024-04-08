// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
//import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BToken is ERC20, ERC20Burnable {
    IERC20 public reserveToken;

    uint256 public totalTokensMinted;
    uint256 public totalTokensBurned;

    constructor(
        string memory name,
        string memory symbol,
        address _reserveToken
    ) ERC20(name, symbol) {
        require(
            _reserveToken != address(0),
            "Reserve token address cannot be 0"
        );
        reserveToken = IERC20(_reserveToken);
    }

    function priceToMint(uint256 numTokens) public view returns (uint256) {
        uint256 netTokensMinted = totalTokensMinted - totalTokensBurned;
        // Example pricing logic: price increases by 1 reserve token per net token minted
        return netTokensMinted + numTokens;
    }

    function rewardForBurn(uint256 numTokens) public view returns (uint256) {
        // Calculate reward based on current price times the number of tokens burned
        uint256 currentPrice = priceToMint(0); // Current price per token
        return currentPrice * numTokens;
    }

    function mint(uint256 numTokens) public {
        uint256 priceForTokens = priceToMint(numTokens);
        require(
            reserveToken.transferFrom(
                msg.sender,
                address(this),
                priceForTokens
            ),
            "Transfer failed"
        );

        _mint(msg.sender, numTokens);
        totalTokensMinted += numTokens;

        // Emit an event or other logic as needed
    }

    function burn(uint256 numTokens) public override {
        uint256 reserveTokensToReturn = rewardForBurn(numTokens);

        // Ensure the contract has enough reserve tokens to pay for the burn reward
        require(
            reserveToken.balanceOf(address(this)) >= reserveTokensToReturn,
            "Insufficient reserve tokens"
        );

        super.burn(numTokens);
        totalTokensBurned += numTokens;

        require(
            reserveToken.transfer(msg.sender, reserveTokensToReturn),
            "Transfer failed"
        );

        // Adjust pool balance or other logic as needed
        // Emit an event or other logic as needed
    }
}
