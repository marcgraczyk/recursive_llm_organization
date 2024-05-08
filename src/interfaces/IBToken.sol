// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity ^0.8.25;

interface IBToken {
    function currentPrice() external view returns (uint256);
    function totalTokensMinted() external view returns (uint256);
    function totalTokensBurned() external view returns (uint256);
    function permissionlessMint(uint256 numTokens) external;
    function governanceMint(address to, uint256 amount) external;
    function governanceBurn(address to, uint256 amount) external;
}
