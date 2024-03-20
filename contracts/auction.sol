// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecondPriceAuction {
    address public highestBidder;
    uint public highestBid;
    uint public secondHighestBid;
    bool public auctionEnded;
    address public lastAuctionWinner;
    uint public auctionEndTime;
    mapping(address => uint) public pendingReturns;

    event AuctionEnded(address winner, uint bid);

    constructor(uint _biddingTime) {
        auctionEndTime = block.timestamp + _biddingTime;
    }

    function bid() external payable {
        require(block.timestamp <= auctionEndTime, "Auction already ended.");
        require(msg.value > highestBid, "There already is a higher bid.");

        if (highestBid != 0) {
            // Return the previous highest bid
            pendingReturns[highestBidder] += highestBid;
            secondHighestBid = highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function withdraw() external returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function endAuction() external {
        require(block.timestamp >= auctionEndTime, "Auction not yet ended.");
        require(!auctionEnded, "endAuction has already been called.");

        auctionEnded = true;
        lastAuctionWinner = highestBidder;

        emit AuctionEnded(highestBidder, secondHighestBid);

        // Reset for next auction
        highestBidder = address(0);
        highestBid = 0;
        secondHighestBid = 0;
        auctionEndTime = block.timestamp + 7 days; // Example to restart auction
    }
}
