const pinataSDK = require("@pinata/sdk")
const fs = require("fs")

const pinataApiKey = process.env.PINATA_API_KEY
const pinataSecretApiKey = process.env.PINATA_API_SECRET_KEY
const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey)

let responses = []


async function storeImage(imagesFilePath){
    console.log("Pinning files to Pinata")
    const files = fs.readdirSync(imagesFilePath)
    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${imagesFilePath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return {
        files,
        responses,
    }
}

async function storeMetadata(metadata){
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = {
    storeImage,
    storeMetadata
}
