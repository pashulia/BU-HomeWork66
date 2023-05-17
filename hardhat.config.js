require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      loggingEnabled: false,
    }
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: "0bf4f898-cff1-48de-81f0-269056db100a",
    gasPriceApi: "https://eth-goerli.g.alchemy.com/v2/XdE1v9zVDSoRe6S5013cteykw1ZDC0u9",
    currency: "KZT",
    showTimeSpent: true
  }
};
