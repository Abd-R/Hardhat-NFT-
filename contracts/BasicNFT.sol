// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721{
    string public constant TOKEN_URI =
    "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4";

    uint256 private s_tokenCounter;

    constructor()               
    ERC721("Doggie", "DOG")     
    {

    }

    function tokenURI
    (uint256 /*tokenId*/) 
    public 
    pure
    override 
    returns 
    (string memory) 
    {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }

    function mintNft() 
    public
    {
        s_tokenCounter++;
        _safeMint(msg.sender, s_tokenCounter, "");
    }

    function getTokenCounter()
    public 
    view
    returns 
    (uint256) 
    {
        return s_tokenCounter;        
    }

}