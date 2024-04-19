pragma solidity ^0.8.20;

interface IGovernance {
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256);

    //string memory currentModelUrl
}
