// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

//import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BToken is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    ERC20Votes,
    AccessControl
{
    IERC20 public reserveToken;

    uint256 public totalTokensMinted;
    uint256 public totalTokensBurned;
    uint256 public currentPrice;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event DebugApproval(uint256 allowance);
    event DebugBalance(uint256 balance);

    constructor(
        string memory name,
        string memory symbol,
        address _reserveToken,
        address defaultAdmin,
        address minter
    ) ERC20(name, symbol) ERC20Permit(name) {
        require(
            _reserveToken != address(0),
            "Reserve token address cannot be 0"
        );
        reserveToken = IERC20(_reserveToken);

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    // function priceToMint(uint256 numTokens) public view returns (uint256) {
    //     uint256 netTokensMinted = totalTokensMinted - totalTokensBurned;
    //     return netTokensMinted + numTokens;
    // }
    function costToMint(uint256 numTokens) public view returns (uint256) {
        uint256 netTokensMinted = totalTokensMinted - totalTokensBurned;
        return ((2 * netTokensMinted + numTokens) * numTokens) / 2;
    }

    // function rewardForBurn(uint256 numTokens) public view returns (uint256) {
    //     return currentPrice * numTokens;
    // }

    function rewardForBurn(uint256 numTokens) public view returns (uint256) {
        uint256 netTokensMinted = totalTokensMinted - totalTokensBurned;
        return ((2 * netTokensMinted - numTokens) * numTokens) / 2;
    }

    function permissionlessMint(uint256 numTokens) public {
        uint256 priceForTokens = costToMint(numTokens);
        // uint256 priceForTokens = numTokens * priceToMint(numTokens);
        // Debugging: Check the caller's reserve token balance
        uint256 callerBalance = reserveToken.balanceOf(msg.sender);
        emit DebugBalance(callerBalance);

        // Debugging: Check the allowance given to this contract
        uint256 allowance = reserveToken.allowance(msg.sender, address(this));
        emit DebugApproval(allowance);

        // Ensure the caller has enough balance and has given enough allowance
        require(
            callerBalance >= priceForTokens,
            "Insufficient balance for minting"
        );
        require(
            allowance >= priceForTokens,
            "Insufficient allowance for minting"
        );

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
        currentPrice = totalTokensMinted - totalTokensBurned;
        // currentPrice = priceToMint(0);

        // can emit a price event
    }

    function governanceMint(
        address to,
        uint256 amount
    ) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        totalTokensMinted += amount;
        currentPrice = totalTokensMinted - totalTokensBurned;
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
        currentPrice = totalTokensMinted - totalTokensBurned;
        // currentPrice = priceToMint(0);
        // can emit a price change event
    }

    function governanceBurn(
        address from,
        uint256 amount
    ) public onlyRole(MINTER_ROLE) {
        _burn(from, amount);
        totalTokensBurned += amount;
        currentPrice = totalTokensMinted - totalTokensBurned;
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
