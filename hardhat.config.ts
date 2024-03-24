import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const defaultNetwork = "localhost";
const mainnetGwei = 21;

const config: HardhatUserConfig = {
  defaultNetwork,
  gasReporter: {
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP || undefined,
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/kYdQOWZIPE-9fbTFQ_NJ_RqJbszUNk-w",
        blockNumber: 14989351
      }
    },
    localhost: {
      url: "http://localhost:8545",
    },
    sepolia: {
      url: `${process.env.SEPOLIA_RPC_URL}`,
      accounts: [`${process.env.SEPOLIA_DEPLOYER_PRIV_KEY}`],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ],
  }
};

export default config;