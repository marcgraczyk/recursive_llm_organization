// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.25;

import "./interfaces/IGovernance.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

//    IGovernance -> not added explicitly here, the prompt update contract is calling through this interface

contract MyGovernor is
    IGovernance,
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    uint256 private lastProposalId;
    string private lastModelUrl;
    event ProposalCreated(uint256 indexed proposalId, string currentModelUrl);

    constructor(
        IVotes _token,
        string memory _lastModelUrl
    )
        Governor("MyGovernor")
        GovernorSettings(7200 /* 1 day */, 50400 /* 1 week */, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(1)
    {
        lastModelUrl = _lastModelUrl;
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function quorum(
        uint256 blockNumber
    )
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    // add a currentModelUrl parameter
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernance) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    // figure out the execute function -> keeps throwing an error despite it being referenced in the Governor.sol file
    // the aim was to execute a proposal

    function execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor) {
        super.execute(proposalId, targets, values, calldatas);
    }
}

//string memory currentModelUrl
// function propose(
//     address[] memory targets,
//     uint256[] memory values,
//     bytes[] memory calldatas,
//     string memory description
// ) public override(Governor) returns (uint256) {
//     return super.propose(targets, values, calldatas, description);
//uint256 proposalId =
//emit ProposalCreated(proposalId, currentModelUrl);
// lastModelUrl = currentModelUrl; // Update lastModelUrl
// lastProposalId = proposalId; // Update lastProposalId
//return proposalId;
// }
