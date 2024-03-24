pragma solidity ^0.8.0;

interface IDGovernor {
    function setAuctionWinner(
        address winner,
        string calldata repoLink
    ) external;
}
