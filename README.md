# DAO Research 

This project represents a simple implementation of on-chain DAO on Ethereum using OpenZeppelin's suite of governance modules. In this implementation, the Governor system consists of three contracts: 

- [`DaoToken`](https://github.com/Syndika-Corp/dao-evm-research/blob/master/contracts/governance/DaoToken.sol)
- [`DaoGovernor`](https://github.com/Syndika-Corp/dao-evm-research/blob/master/contracts/governance/DaoGovernor.sol)
- [`Timelock`](https://github.com/Syndika-Corp/dao-evm-research/blob/master/contracts/governance/Timelock.sol)

For illustration purposes the [`TargetContract`](https://github.com/Syndika-Corp/dao-evm-research/blob/master/contracts/TargetContract.sol) was created, which contains methods that serve as targets for specific proposals. 

The underlying architecture and main relationships are shown in the figure below.

![image](https://github.com/Syndika-Corp/dao-evm-research/assets/92053176/58a58a55-c19b-4cb8-8f56-2bba5481dc1b)

An example of proposal flow is shown in `test/dao-use-case.spec.ts`, including proposal creation, vote casting, queuing and execution.

## Install all dependences

`npm i` or `npm install`

## Compile contracts

`npx hardhat compile`

## Test contracts

`npx hardhat test --network hardhat`

## Deploy contracts

If you want to deploy to a testnet or mainnet, add a `.env` file with the same contents of `.env.example`, but replaced with your variables.

### Sepolia

`npx hardhat run scripts/deploy.ts --network sepolia`

### Ethereum Mainnet

`npx hardhat run scripts/deploy.ts --network mainnet`

The addresses of all deployed contracts are stored in the `scripts/contracts/addresses.json` directory. Specifically, for Sepolia, the JSON representation of the addresses should appear as follows:

```
{
    "network": "sepolia",
    "contractAddresses": {
        "DAO_TOKEN": "0xb2D92A5f1188f547eB0b6DA0a5d8aa4C0E04c30A",
        "TIMELOCK": "0xE9262F85C51E2e265b4eB0dc95651fe7591aD172",
        "DAO_GOVERNOR": "0xB6172e3dC67e4AF5A9A0fffCEF15a94d49c2bA02",
        "TARGET_CONTRACT": "0xf9D7aa83209C5Ae66aCc8136dF7721889590278D"
    }
}
```
