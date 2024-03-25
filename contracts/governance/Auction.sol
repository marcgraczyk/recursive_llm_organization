// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/IDGovernor.sol";

contract Auction {
    address public highestBidder;
    uint public highestBid;
    address public secondHighestBidder;
    uint public secondHighestBid;
    mapping(address => uint) public bids;
    IDGovernor public daoGovernorAddress;
    // Address of the DaoGovernor contract
    string public winningRepoLink; // The repository link for the winning proposal

    event NewBid(address indexed bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    constructor(address _daoGovernorAddress) {
        daoGovernorAddress = IDGovernor(_daoGovernorAddress);
    }

    function placeBid(string calldata repoLink) external payable {
        require(msg.value > secondHighestBid, "Bid is not high enough.");

        if (msg.value > highestBid) {
            if (highestBidder != address(0)) {
                // Refund the previous highest bidder
                payable(highestBidder).transfer(highestBid);
            }
            secondHighestBidder = highestBidder;
            secondHighestBid = highestBid;
            highestBidder = msg.sender;
            highestBid = msg.value;
            winningRepoLink = repoLink;
        } else if (msg.value > secondHighestBid) {
            secondHighestBidder = msg.sender;
            secondHighestBid = msg.value;
        }

        bids[msg.sender] = msg.value;
        emit NewBid(msg.sender, msg.value);
    }

    function endAuction() external {
        // Logic to conclude the auction, typically restricted to the contract owner or an admin
        emit AuctionEnded(highestBidder, secondHighestBid);

        IDGovernor(daoGovernorAddress).setAuctionWinner(
            highestBidder,
            winningRepoLink
        );

        // Refund the difference to the highest bidder if needed
        uint refundAmount = highestBid - secondHighestBid;
        if (refundAmount > 0) {
            payable(highestBidder).transfer(refundAmount);
        }

        // Reset auction state
        highestBidder = address(0);
        highestBid = 0;
        secondHighestBidder = address(0);
        secondHighestBid = 0;
    }

    // Additional functions for auction management...
}
