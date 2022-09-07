// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


error IpfsNFT__RangeOutOfBounds();
error IpfsNFT__NeedMoreEth();
error IpfsNFT__TransferFailed();

contract IpfsNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable{
    
    // VRF interphase
    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2;

    // VRF init
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    bytes32 private immutable i_gasLane;                   // key hash
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF helper
    mapping (uint256 => address) s_requestIdToSender;
    string[3] internal s_dogTokenURI;

    // NFT vars
    uint256 internal immutable i_mintFee;
    uint256 public s_tokenCounter;
    
    // Type Declaration
    enum Breed{
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // Events

    event NftRequested(uint256 indexed requestId,  address requester);
    event NftMinted(Breed beed, address minter);

    // Constructor
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId, 
        uint32 callbackGasLimit, 
        bytes32 gasLane,
        uint256 mintFee,
        string[3] memory dogTokenURI
    )
    VRFConsumerBaseV2(vrfCoordinatorV2)
    ERC721("IpfsNFT", "INF")
    {
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId; 
        i_callbackGasLimit = callbackGasLimit;
        i_gasLane = gasLane;
        s_dogTokenURI = dogTokenURI;
        i_mintFee = mintFee;
    }

    // Functions

    function requestNft()
    public
    payable
    returns
    (uint256 requestId)
    {
        if(msg.value < i_mintFee)
            revert IpfsNFT__NeedMoreEth();
        requestId = i_vrfCoordinatorV2.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords
    (
        uint256 requestId,
        uint256[] memory randomWords
    )
    internal
    override
    {
        address owner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter++;
        Breed dogBreed = getDogBreed((randomWords[0] % 100));

        _safeMint(owner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenURI[uint256(dogBreed)]);
        emit NftMinted(dogBreed, owner);
    }

    /**
    *  n = random_number
    *  if n <= 10
    *      pug
    *  else if n > 10 and n <= 30
    *      st bd
    *  else if n > 30 and n <= 100
    *      shiba inu
    */
    function getProbabilty
    ()
    public
    pure
    returns 
    (uint8[3] memory) 
    {
        return [10, 30, 100];
    }

    function getDogBreed
    (uint256 moddedRandomNum)
    public
    pure
    returns 
    (Breed) 
    {
        uint8 sum = 0;
        uint8 [3] memory chance = getProbabilty();
        for (uint i = 0; i < 3; i++) {
            if(moddedRandomNum >= sum && moddedRandomNum < chance[i])
                return Breed(i);
            sum += chance[i];
        }
        revert IpfsNFT__RangeOutOfBounds();
    }

    function withdraw()
    public
    onlyOwner
    {
        uint256 amount = address(this).balance;
        bool success = payable(msg.sender).send(amount);
        if(!success)
            revert IpfsNFT__TransferFailed();
    }

    function getMintFee() 
    public 
    view 
    returns 
    (uint256) 
    {
        return i_mintFee;
    }

    function getDogTokenUris
    (uint256 index) 
    public 
    view 
    returns 
    (string memory) 
    {
        return s_dogTokenURI[index];
    }

    // function getInitialized() public view returns (bool) {
    //     return s_initialized;
    // }

    function getTokenCounter() 
    public 
    view 
    returns 
    (uint256) 
    {
        return s_tokenCounter;
    }
}