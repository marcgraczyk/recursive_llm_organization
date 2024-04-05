// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "./interfaces/IGovernance.sol";

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract MyGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    IGovernance
{
    uint256 private _lastProposalId;
    string private _lastModelUrl;
    event ProposalCreated(uint256 indexed proposalID, string currentModelUrl);
    mapping(uint256 => uint256) private _customVotingPeriods;

    constructor(
        IVotes _token
    )
        Governor("MyGovernor")
        GovernorSettings(7200 /* 1 day */, 50400 /* 1 week */, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
    {}

    // The following functions are overrides required by Solidity.

    function _setCustomVotingPeriod(
        uint256 proposalId,
        uint256 customVotingPeriod
    ) internal {
        _customVotingPeriods[proposalId] = customVotingPeriod;
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        string memory currentModelUrl
    ) public override(IGovernance) returns (uint256) {
        uint256 proposalID = super.propose(
            targets,
            values,
            calldatas,
            description
        );
        emit ProposalCreated(proposalID, currentModelUrl);

        bool isModelUrlChanged = false; // Default to false

        // Only perform the check if _lastModelUrl is not empty
        if (bytes(_lastModelUrl).length > 0) {
            isModelUrlChanged =
                keccak256(abi.encodePacked(currentModelUrl)) !=
                keccak256(abi.encodePacked(_lastModelUrl));
        }

        _lastModelUrl = currentModelUrl;

        // Store the currentModelUrl for future comparisons

        // Proceed to call the original propose function
        uint256 proposalId = super.propose(
            targets,
            values,
            calldatas,
            description
        );

        // If isModelUrlChanged is true, adjust the voting period or store information to adjust the voting logic
        if (isModelUrlChanged) {
            // Custom logic to handle the voting period adjustment
            _setCustomVotingPeriod(proposalId, 50400);
        } else {
            // default voting period
            _setCustomVotingPeriod(proposalId, 0);
        }
        return proposalID;
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        uint256 proposalId = _lastProposalId;

        if (_customVotingPeriods[proposalId] != 0) {
            return _customVotingPeriods[proposalId];
        }

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
}
