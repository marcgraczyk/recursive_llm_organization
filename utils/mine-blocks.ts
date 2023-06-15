import { network } from "hardhat"

export async function mineBlocks(amount: number) {
    for (let index = 0; index < amount; ++index) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
    }
}