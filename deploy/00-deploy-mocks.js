const { ethers } = require("ethers")
const { network } = require("hardhat")

// VRF Args
const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9

// V3 Args

const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId == "31337") {
        log("Deploying Mock Coordinator")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            log: true
        })

        log("Deploying MockAggregatorV3")

        await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INITIAL_PRICE],
            log: true
        })

        log("Mock Deployed")
        log("---------------------------------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "main", "mock"]