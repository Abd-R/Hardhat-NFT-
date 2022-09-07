const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains } = require("../helper-hardhat-config")


module.exports = async function ({ getNamedAccounts, deployments }) {

    const { deploy, log } = deployments
    const {deployer} = await getNamedAccounts()

    const args = []

    const BasicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying--------------------------------")
        await verify(BasicNFT.address, [])
    }
}

module.exports.tags = ["all", "basicnft"]