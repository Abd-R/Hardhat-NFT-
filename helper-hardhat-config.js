const networkConfig = {
    31337: {
        name: "localhost",
        interval: "30",
        callbackGasLimit: "500000",
        mintFee: "10000000000000000", // 0.01 ETH
        entranceFee: ethers.utils.parseEther("0.01"),
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    // Default one is ETH/USD contract on Kovan
    42: {
        name: "kovan",
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    },
    4: {
        name: "rinkeby",
        interval: "30",
        subscriptionId: "20772",
        callbackGasLimit: "500000",
        mintFee: "10000000000000000", // 0.01 ETH
        entranceFee: ethers.utils.parseEther("0.01"),
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    },
}

const DECIMALS = "18"
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const INITIAL_PRICE = "200000000000000000000"
const developmentChains = ["hardhat", "localhost"]

module.exports = {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains, 
    networkConfig, 
    INITIAL_PRICE,
    DECIMALS,
}
