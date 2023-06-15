import { ethers } from "hardhat";
import { TargetContract, Timelock } from "../typechain-types";

async function deployTargetContract(timelock: Timelock): Promise<TargetContract> {
    const [signer] = await ethers.getSigners();
    const targetContract = await ethers.deployContract("TargetContract", []);
    await targetContract.waitForDeployment();

    const OPERATOR_ROLE = await targetContract.OPERATOR_ROLE();
    const DEFAULT_ADMIN_ROLE = await targetContract.DEFAULT_ADMIN_ROLE();

    const grantOperatorRoleTx = await targetContract.grantRole(OPERATOR_ROLE, timelock);
    await grantOperatorRoleTx.wait();
    const grantDefaultAdminRoleTx = await targetContract.grantRole(DEFAULT_ADMIN_ROLE, timelock);
    await grantDefaultAdminRoleTx.wait();

    const revokeOperatorRoleTx = await targetContract.revokeRole(OPERATOR_ROLE, signer);
    await revokeOperatorRoleTx.wait();
    const revokeDefaultAdminRoleTx = await targetContract.renounceRole(DEFAULT_ADMIN_ROLE, signer);
    await revokeDefaultAdminRoleTx.wait();

    return targetContract;
}

export default deployTargetContract;