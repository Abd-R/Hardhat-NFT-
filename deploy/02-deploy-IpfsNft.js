require("dotenv").config()
const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImage, storeMetadata } = require("../utils/pinataUpload")

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    atributes: [
        {
            trait: "",
            value: 0
        }
    ]
}
// 10 Link ether
const FUND_SUBSC_AMOUNT = ethers.utils.parseEther("10")


let tokenUri = [
    'ipfs://QmUGFanJtMzs9hXJeapJq3LkQL13Ac2ypTSNdK3LL4ZxDZ',
    'ipfs://Qmei8K51Kcws9PMtnXH9GeCChU4NhQAXTVNi8piDLwAAdW',
    'ipfs://QmQAFywJSj6QmwDZri6KecZb84LjWmAfmpUXVtYSuvWpwB'
]

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const chainId = network.config.chainId

    let VRFCoordinatorV2Address, subId

    if (process.env.UPLOAD_TO_PINATA == "true")
        tokenUri = await handleTokenURI("images/randomNft")

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordinatorV2Address = VRFCoordinatorV2Mock.address

        const txRes = await VRFCoordinatorV2Mock.createSubscription()
        const txRec = await txRes.wait()
        subId = txRec.events[0].args.subId
        VRFCoordinatorV2Mock.fundSubscription(subId, FUND_SUBSC_AMOUNT)
    } else {
        VRFCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subId = networkConfig[chainId].subscriptionId
    }

    arguments = [
        VRFCoordinatorV2Address,
        subId,
        networkConfig[chainId].callbackGasLimit,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].mintFee,
        tokenUri,
    ]
    log("_________________________________________________________________")
    log("Deploying IPFS NFT CONTRACT")

    const IpfsNft = await deploy("IpfsNFT", {
        from: deployer,
        log: true,
        args: arguments,
        waitConfirmations: network.config.blockConfirmation || 1,
    })


    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("_________________________________________________________________")
        log("Verifying")
        await verify(IpfsNft.address, arguments)
    }
}

async function handleTokenURI(imgLocation) {

    let tokenUris = []
    const { responses: imageUploadResponses, files } = await storeImage(imgLocation)
    console.log("Pinning JSON metadata to Pinata")

    for (index in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[index].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[index].IpfsHash}`
        const response = await storeMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${response.IpfsHash}`)
    }

    return tokenUris
}

module.exports.tags = ["all", "main", "ipfs"];