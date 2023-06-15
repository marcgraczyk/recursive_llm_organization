import { network } from "hardhat"

export async function increaseTime(amountSec: number) {
    await network.provider.send("evm_increaseTime", [amountSec]);
}