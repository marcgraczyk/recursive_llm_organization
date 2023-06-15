import deployGovernor from "../deploy/dao-governor";
import deployGovernanceToken from "../deploy/governor-token";
import deployTargetContract from "../deploy/target-contract";
import deployTimelock from "../deploy/timelock";
import type { BaseContract } from "ethers";
import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function deploy() {
  const governanceToken = await deployGovernanceToken();
  const timelock = await deployTimelock();
  const governor = await deployGovernor(governanceToken, timelock);
  const targetContract = await deployTargetContract(timelock);

  await saveContractAddresses([governanceToken, timelock, governor, targetContract])
}

async function saveContractAddresses(contracts: Array<BaseContract>) {
  const [governanceToken, timelock, governor, targetContract] = contracts;

  const addresses: Object = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddresses: {
      DAO_TOKEN: await governanceToken.getAddress(),
      TIMELOCK: await timelock.getAddress(),
      DAO_GOVERNOR: await governor.getAddress(),
      TARGET_CONTRACT: await targetContract.getAddress()
    }
  }

  const contractsDir: string = path.join(__dirname, '/..', 'scripts/contracts')

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    path.join(contractsDir, '/', 'addresses.json'),
    JSON.stringify(addresses)
  )
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
