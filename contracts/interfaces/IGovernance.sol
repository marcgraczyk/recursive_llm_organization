pragma solidity ^0.8.20;

interface IGovernance {
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        string memory currentModelUrl
    ) external returns (uint256);
}
