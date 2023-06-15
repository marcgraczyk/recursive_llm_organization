import { expect } from "chai";
import { ethers } from "hardhat";
import { DaoGovernor, DaoToken, TargetContract, Timelock } from "../typechain-types";
import deployGovernor from "../deploy/dao-governor";
import deployGovernanceToken from "../deploy/governor-token";
import deployTargetContract from "../deploy/target-contract";
import deployTimelock from "../deploy/timelock";
import {
  ADDRESS_ZERO,
  INIT_TOKEN_SUPPLY,
  MIN_DELAY,
  PROPOSAL_THRESHOLD,
  QUORUM_PERCENTAGE,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  VOTING_DELAY,
  VOTING_PERIOD
} from "../constants";
import { EventLog } from "ethers";
import { mineBlocks } from "../utils/mine-blocks";
import { increaseTime } from "../utils/increase-time";

describe("DaoGovernor", () => {
  let daoGovernor: DaoGovernor;
  let daoToken: DaoToken;
  let timelock: Timelock;
  let targetContract: TargetContract;
  let signer: any;
  let PROPOSER_ROLE: string;
  let EXECUTOR_ROLE: string;
  let ADMIN_ROLE: string;
  let OPERATOR_ROLE: string;
  let PROPOSAL_DESCRIPTION: string;
  let proposalId: string;
  let proposalState: bigint;
  let encodedFunctionCall: string;
  const voteOption = 1; // for
  const voteReason = "some powerful reason";
  const SET_VALUE = 333;

  enum ProposalState {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed
  }

  it("deploy contracts", async () => {
    [signer] = await ethers.getSigners();
    daoToken = await deployGovernanceToken();
    timelock = await deployTimelock();
    daoGovernor = await deployGovernor(daoToken, timelock);
    targetContract = await deployTargetContract(timelock);
  });

  it("setup governor contracts", async () => {
    PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();
    OPERATOR_ROLE = await targetContract.OPERATOR_ROLE();

    await timelock.grantRole(PROPOSER_ROLE, daoGovernor);
    expect(await timelock.hasRole(PROPOSER_ROLE, daoGovernor)).to.be.true;

    await timelock.grantRole(EXECUTOR_ROLE, ADDRESS_ZERO);
    expect(await timelock.hasRole(EXECUTOR_ROLE, ADDRESS_ZERO)).to.be.true;

    await timelock.revokeRole(ADMIN_ROLE, signer);
    expect(await timelock.hasRole(ADMIN_ROLE, signer)).to.be.false;
    expect(await targetContract.hasRole(OPERATOR_ROLE, timelock)).to.be.true;
  });

  it("check daoToken constructor param", async () => {
    expect(await daoToken.name()).to.equal(TOKEN_NAME);
    expect(await daoToken.symbol()).to.equal(TOKEN_SYMBOL);
    expect(await daoToken.totalSupply()).to.equal(INIT_TOKEN_SUPPLY);
  });

  it("check governor constructor param", async () => {
    expect(await daoGovernor["quorumNumerator()"]()).to.equal(QUORUM_PERCENTAGE);
    expect(await daoGovernor.votingDelay()).to.equal(VOTING_DELAY);
    expect(await daoGovernor.votingPeriod()).to.equal(VOTING_PERIOD);
    expect(await daoGovernor.proposalThreshold()).to.equal(PROPOSAL_THRESHOLD);
  });

  it("targetContract should be called only by Timelock", async () => {
    const revertMsg = `AccessControl: account ${signer.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`;
    await expect(targetContract.setValue(13)).to.be.revertedWith(revertMsg);
  });

  it("creating proposal", async () => {
    PROPOSAL_DESCRIPTION = "This is proposal #1";
    encodedFunctionCall = targetContract.interface.encodeFunctionData("setValue", [SET_VALUE])
    const proposeTx = await daoGovernor.propose(
      [targetContract],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION
    );

    const receipt = await proposeTx.wait();
    const logs = receipt?.logs[0] as EventLog;
    proposalId = logs.args[0].toString();

    proposalState = await daoGovernor.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Pending);
  });

  it("voting", async () => {
    await daoToken.delegate(signer);
    await mineBlocks(VOTING_DELAY + 1);

    proposalState = await daoGovernor.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Active);

    const voteTx = await daoGovernor.castVoteWithReason(proposalId, voteOption, voteReason);
    await voteTx.wait();

    await mineBlocks(VOTING_PERIOD + 1);
    proposalState = await daoGovernor.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Succeeded);
  });

  it("queue & execute", async () => {
    const descriptionHash = ethers.id(PROPOSAL_DESCRIPTION);

    const queueTx = await daoGovernor.queue(
      [targetContract],
      [0],
      [encodedFunctionCall],
      descriptionHash
    );
    await queueTx.wait();
    await increaseTime(MIN_DELAY + 1);

    proposalState = await daoGovernor.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Queued);

    const executeTx = await daoGovernor.execute(
      [targetContract],
      [0],
      [encodedFunctionCall],
      descriptionHash
    );
    await executeTx.wait();

    proposalState = await daoGovernor.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Executed);
    expect(await targetContract.getValue()).to.equal(SET_VALUE);
  });
});
