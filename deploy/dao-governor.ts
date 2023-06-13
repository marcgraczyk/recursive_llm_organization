import { ethers } from "hardhat";
import {
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
    PROPOSAL_THRESHOLD
} from "../constants";
import { DaoToken, Timelock } from "../typechain-types";

async function deployGovernor(governorToken: DaoToken, timelock: Timelock) {
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
    console.log(`DaoGovernor address: ${await governor.getAddress()}`);
}

export default deployGovernor;