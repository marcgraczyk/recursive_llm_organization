import { ethers } from "hardhat";
import {
    TOKEN_NAME,
    TOKEN_SYMBOL,
    INIT_TOKEN_SUPPLY
} from "../constants";
import { DaoToken } from "../typechain-types";

async function deployGovernanceToken(): Promise<DaoToken> {
    const [deployer] = await ethers.getSigners();

    const daoToken = await ethers.deployContract(
        "DaoToken",
        [TOKEN_NAME, TOKEN_SYMBOL, INIT_TOKEN_SUPPLY]
    );
    //const daoToken = await defender.deployProxy("DaoToken", [TOKEN_NAME, TOKEN_SYMBOL, INIT_TOKEN_SUPPLY]);

    await daoToken.waitForDeployment();

    return daoToken;
}

// const upgradeApprovalProcess = await defender.getUpgradeApprovalProcess();

// if (upgradeApprovalProcess.address === undefined) {
//  throw new Error(`Upgrade approval process with id ${upgradeApprovalProcess.approvalProcessId} has no assigned address`);
// }



export default deployGovernanceToken;