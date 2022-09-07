// npx hardhat test --grep "IPFS NFT"

const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("IPFS NFT Unit Tests", function () {
        console.log("test")
        let IpfsNft, VrfMock, deployer
        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["all"])
            IpfsNft = await ethers.getContract("IpfsNFT")
            VrfMock = await ethers.getContract("VRFCoordinatorV2Mock")
        })

        describe("Constructor", async () => {
            it("initializes values correctly", async () => {
                const tokenUri = await IpfsNft.getDogTokenUris(0)
                assert(tokenUri.includes("ipfs://"))
            })
        })
        describe("requestNft", () => {
            it("fails if entrance price is insufficient", async () => {
                await expect(IpfsNft.requestNft()).to.be.revertedWith("IpfsNFT__NeedMoreEth()")
            })
            it("emits an event in if NFT is requested", async () => {
                const fee = await IpfsNft.getMintFee()
                await expect(IpfsNft.requestNft({ value: fee })).to.emit(
                    IpfsNft,
                    "NftRequested"
                )
            })
        })
        describe("fulfillRandomWords", async () => {
            it("emits event NftMinted", async () => {
                const fee = await IpfsNft.getMintFee()
                const txRes = await IpfsNft.requestNft({ value: fee })
                const txRec = await txRes.wait(1)
                await expect(
                    VrfMock.fulfillRandomWords(
                        txRec.events[1].args.requestId,
                        IpfsNft.address
                    )
                ).to.emit(
                    IpfsNft,
                    "NftMinted"
                )
            })

            it("mints an Nft on fulfillRandomWords()", async () => {
                return new Promise(async (resolve, reject) => {
                    IpfsNft.once("NftMinted", async () => {
                        try {
                            const tokenUri = await IpfsNft.getDogTokenUris(0);
                            assert(tokenUri.includes("ipfs://"))
                            const tokenCounter = await IpfsNft.getTokenCounter()
                            assert.equal(tokenCounter, "1")
                            resolve()
                        }
                        catch (ex) {
                            console.log(ex)
                            reject(ex)
                        }
                    })
                    try {
                        const fee = await IpfsNft.getMintFee()
                        const txRes = await IpfsNft.requestNft({ value: fee })
                        const txRec = await txRes.wait(1)
                        await VrfMock.fulfillRandomWords(
                            txRec.events[1].args.requestId,
                            IpfsNft.address
                        )
                    } catch (error) {
                        console.log(ex)
                        reject(ex)
                    }
                })
            })
        })
    })

module.exports.tags = ["Ipfs"]