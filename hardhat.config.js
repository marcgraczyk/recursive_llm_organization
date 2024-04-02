
/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomicfoundation/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');

const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    }
  },
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: "auto"
    }
  },
}