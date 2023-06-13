import deployGovernor from "../deploy/dao-governor";
import deployGovernanceToken from "../deploy/governor-token";
import deployTargetContract from "../deploy/target-contract";
import deployTimelock from "../deploy/timelock";

async function deploy() {
  const governanceToken = await deployGovernanceToken();
  const timelock = await deployTimelock();
  await deployGovernor(governanceToken, timelock);
  await deployTargetContract(timelock);
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
