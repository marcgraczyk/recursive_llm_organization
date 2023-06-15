import { ethers } from "hardhat";
import {
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
    PROPOSAL_THRESHOLD
} from "../constants";
import { DaoGovernor, DaoToken, Governor, Timelock } from "../typechain-types";

async function deployGovernor(governorToken: DaoToken, timelock: Timelock): Promise<DaoGovernor> {
    const governor = await ethers.deployContract(
        "DaoGovernor",
        [
            governorToken,
            timelock,
            QUORUM_PERCENTAGE,
            VOTING_PERIOD,
            VOTING_DELAY,
            PROPOSAL_THRESHOLD
        ]
    );
    await governor.waitForDeployment();

    return governor;
}

export default deployGovernor;