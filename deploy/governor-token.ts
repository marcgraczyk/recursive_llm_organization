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
    await daoToken.waitForDeployment();
    console.log(`DaoToken address: ${await daoToken.getAddress()}`);

    return daoToken;
}

export default deployGovernanceToken;