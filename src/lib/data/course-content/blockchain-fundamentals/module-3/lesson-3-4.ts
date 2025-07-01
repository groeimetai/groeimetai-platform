// Module 3 - Lesson 4: NFTs en token standards

export default {
  id: 'lesson-3-4',
  title: 'NFTs en token standards',
  duration: '3 uur',
  objectives: [
    'Begrijp verschillende token standards (ERC-721, ERC-1155)',
    'Implementeer NFT smart contracts',
    'Leer over NFT metadata en eigenschappen',
    'Bouw NFT marketplace functionaliteit'
  ],
  content: `
# NFTs en Token Standards

## Wat zijn NFTs?

**Non-Fungible Tokens (NFTs)** zijn unieke digitale assets op de blockchain. In tegenstelling tot fungible tokens (zoals ETH of ERC-20 tokens), is elke NFT uniek en niet uitwisselbaar.

### Eigenschappen van NFTs
- **Uniekheid**: Elke token heeft unieke eigenschappen
- **Ondeelbaarheid**: Kunnen niet in fracties worden verdeeld (meestal)
- **Eigenaarschap**: Verifieerbaar eigendom op blockchain
- **Overdraagbaarheid**: Kunnen worden verkocht/overgedragen
- **Programmeerbaar**: Smart contract functionaliteit

## ERC-721 Standard

### Interface Definition

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC721 {
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    // Required functions
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IERC721Metadata is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

interface IERC721Enumerable is IERC721 {
    function totalSupply() external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
    function tokenByIndex(uint256 index) external view returns (uint256);
}
\`\`\`

### Complete ERC-721 Implementation

\`\`\`solidity
// Complete NFT contract implementation
contract MyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.05 ether;
    
    mapping(address => uint256) public mintedPerAddress;
    uint256 public constant MAX_PER_ADDRESS = 5;
    
    string private _baseTokenURI;
    bool public mintingEnabled = false;
    
    // Royalty info (EIP-2981)
    address public royaltyReceiver;
    uint256 public royaltyPercentage = 250; // 2.5%
    
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        royaltyReceiver = msg.sender;
    }
    
    // Minting functions
    function mint(uint256 quantity) public payable {
        require(mintingEnabled, "Minting not enabled");
        require(quantity > 0, "Quantity must be greater than 0");
        require(_tokenIdCounter.current() + quantity <= MAX_SUPPLY, "Max supply reached");
        require(mintedPerAddress[msg.sender] + quantity <= MAX_PER_ADDRESS, "Max per address exceeded");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        
        mintedPerAddress[msg.sender] += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(msg.sender, tokenId);
        }
        
        // Refund excess payment
        uint256 excess = msg.value - (MINT_PRICE * quantity);
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
    }
    
    // Owner mint (for giveaways, team, etc.)
    function ownerMint(address to, uint256 quantity) public onlyOwner {
        require(_tokenIdCounter.current() + quantity <= MAX_SUPPLY, "Max supply reached");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(to, tokenId);
        }
    }
    
    // Metadata
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"))
            : "";
    }
    
    // Minting control
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
    }
    
    // Withdraw funds
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    // Royalty support (EIP-2981)
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        return (royaltyReceiver, (salePrice * royaltyPercentage) / 10000);
    }
    
    function setRoyaltyInfo(address receiver, uint256 percentage) public onlyOwner {
        require(percentage <= 1000, "Royalty too high"); // Max 10%
        royaltyReceiver = receiver;
        royaltyPercentage = percentage;
    }
    
    // Required overrides
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return interfaceId == 0x2a55205a || // EIP-2981
            super.supportsInterface(interfaceId);
    }
}
\`\`\`

## ERC-1155 Multi-Token Standard

### Concept
ERC-1155 allows for both fungible and non-fungible tokens in a single contract.

\`\`\`solidity
// ERC-1155 Implementation
contract GameItems is ERC1155, Ownable {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant SWORD = 2;
    uint256 public constant SHIELD = 3;
    uint256 public constant RARE_SWORD = 4;
    
    mapping(uint256 => uint256) public tokenSupply;
    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => bool) public isFungible;
    mapping(uint256 => string) public tokenURIs;
    
    constructor() ERC1155("https://game.example/api/item/{id}.json") {
        // Fungible tokens
        isFungible[GOLD] = true;
        isFungible[SILVER] = true;
        maxSupply[GOLD] = 1000000;
        maxSupply[SILVER] = 5000000;
        
        // Non-fungible tokens
        isFungible[SWORD] = false;
        isFungible[SHIELD] = false;
        isFungible[RARE_SWORD] = false;
        maxSupply[SWORD] = 1000;
        maxSupply[SHIELD] = 1000;
        maxSupply[RARE_SWORD] = 100;
    }
    
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        require(tokenSupply[id] + amount <= maxSupply[id], "Max supply exceeded");
        
        if (!isFungible[id]) {
            require(amount == 1, "Non-fungible tokens must be minted one at a time");
            require(balanceOf(to, id) == 0, "Token already owned");
        }
        
        tokenSupply[id] += amount;
        _mint(to, id, amount, data);
    }
    
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        for (uint256 i = 0; i < ids.length; i++) {
            require(tokenSupply[ids[i]] + amounts[i] <= maxSupply[ids[i]], "Max supply exceeded");
            
            if (!isFungible[ids[i]]) {
                require(amounts[i] == 1, "Non-fungible tokens must be minted one at a time");
                require(balanceOf(to, ids[i]) == 0, "Token already owned");
            }
            
            tokenSupply[ids[i]] += amounts[i];
        }
        
        _mintBatch(to, ids, amounts, data);
    }
    
    function burn(address from, uint256 id, uint256 amount) public {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Not authorized");
        
        tokenSupply[id] -= amount;
        _burn(from, id, amount);
    }
    
    function uri(uint256 id) public view override returns (string memory) {
        if (bytes(tokenURIs[id]).length > 0) {
            return tokenURIs[id];
        }
        return super.uri(id);
    }
    
    function setURI(uint256 id, string memory newuri) public onlyOwner {
        tokenURIs[id] = newuri;
    }
    
    // Game-specific functions
    function craftItem(uint256 resultId, uint256[] memory requiredIds, uint256[] memory requiredAmounts) public {
        require(requiredIds.length == requiredAmounts.length, "Invalid input");
        
        // Check requirements
        for (uint256 i = 0; i < requiredIds.length; i++) {
            require(balanceOf(msg.sender, requiredIds[i]) >= requiredAmounts[i], "Insufficient materials");
        }
        
        // Burn required items
        for (uint256 i = 0; i < requiredIds.length; i++) {
            _burn(msg.sender, requiredIds[i], requiredAmounts[i]);
            tokenSupply[requiredIds[i]] -= requiredAmounts[i];
        }
        
        // Mint result
        require(tokenSupply[resultId] + 1 <= maxSupply[resultId], "Max supply exceeded");
        tokenSupply[resultId] += 1;
        _mint(msg.sender, resultId, 1, "");
    }
}
\`\`\`

## NFT Metadata Standards

### Metadata Structure

\`\`\`typescript
// Standard NFT metadata format
interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL
  external_url?: string; // Website
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
    max_value?: number; // For numeric traits
  }>;
  animation_url?: string; // For animated NFTs
  background_color?: string; // 6 character hex
}

// Example metadata
const exampleMetadata: NFTMetadata = {
  name: "Cool NFT #1234",
  description: "A unique digital collectible from the Cool NFT collection",
  image: "ipfs://QmXxx.../1234.png",
  external_url: "https://coolnfts.com/token/1234",
  attributes: [
    {
      trait_type: "Background",
      value: "Space"
    },
    {
      trait_type: "Body",
      value: "Robot"
    },
    {
      trait_type: "Eyes",
      value: "Laser"
    },
    {
      trait_type: "Rarity Score",
      value: 92,
      display_type: "number",
      max_value: 100
    },
    {
      trait_type: "Generation",
      value: 1,
      display_type: "number"
    },
    {
      trait_type: "Birthday",
      value: 1672531200, // Unix timestamp
      display_type: "date"
    }
  ],
  animation_url: "ipfs://QmXxx.../1234.mp4",
  background_color: "000000"
};

// Generate metadata for collection
class MetadataGenerator {
  private traits: Record<string, string[]> = {
    Background: ['Space', 'City', 'Forest', 'Ocean'],
    Body: ['Human', 'Robot', 'Alien', 'Zombie'],
    Eyes: ['Normal', 'Laser', 'X-Ray', 'Glowing'],
    Accessory: ['None', 'Hat', 'Glasses', 'Necklace']
  };
  
  generateMetadata(tokenId: number, imageIPFS: string): NFTMetadata {
    // Deterministic trait generation based on tokenId
    const seed = this.hashTokenId(tokenId);
    const attributes = this.generateTraits(seed);
    
    return {
      name: \`Cool NFT #\${tokenId}\`,
      description: \`A unique digital collectible from the Cool NFT collection. Token ID: \${tokenId}\`,
      image: \`ipfs://\${imageIPFS}/\${tokenId}.png\`,
      external_url: \`https://coolnfts.com/token/\${tokenId}\`,
      attributes: [
        ...attributes,
        {
          trait_type: "Token ID",
          value: tokenId,
          display_type: "number"
        }
      ]
    };
  }
  
  private hashTokenId(tokenId: number): number {
    // Simple deterministic hash
    return tokenId * 2654435761 % 2**32;
  }
  
  private generateTraits(seed: number): Array<{trait_type: string; value: string}> {
    const attributes = [];
    
    Object.entries(this.traits).forEach(([traitType, values], index) => {
      const traitSeed = seed + index;
      const valueIndex = traitSeed % values.length;
      
      if (values[valueIndex] !== 'None') {
        attributes.push({
          trait_type: traitType,
          value: values[valueIndex]
        });
      }
    });
    
    return attributes;
  }
  
  // Calculate rarity
  calculateRarity(attributes: Array<{trait_type: string; value: string}>): number {
    let rarityScore = 0;
    
    attributes.forEach(attr => {
      const traitValues = this.traits[attr.trait_type];
      if (traitValues) {
        const rarity = 1 / traitValues.length;
        rarityScore += (1 - rarity) * 100;
      }
    });
    
    return Math.round(rarityScore / attributes.length);
  }
}
\`\`\`

## NFT Marketplace Implementation

### Marketplace Smart Contract

\`\`\`solidity
// NFT Marketplace contract
contract NFTMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    
    uint256 public listingFee = 0.025 ether;
    
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address seller;
        address owner;
        uint256 price;
        bool sold;
    }
    
    mapping(uint256 => MarketItem) private idToMarketItem;
    
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );
    
    event MarketItemSold(
        uint256 indexed itemId,
        address buyer
    );
    
    function getListingFee() public view returns (uint256) {
        return listingFee;
    }
    
    function setListingFee(uint256 _listingFee) public onlyOwner {
        listingFee = _listingFee;
    }
    
    // List NFT for sale
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(msg.value == listingFee, "Must pay listing fee");
        
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
        
        // Transfer NFT to marketplace
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price
        );
    }
    
    // Purchase NFT
    function createMarketSale(uint256 itemId) public payable nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];
        uint256 price = item.price;
        uint256 tokenId = item.tokenId;
        
        require(msg.value == price, "Please submit the asking price");
        require(!item.sold, "Item already sold");
        
        // Transfer payment to seller
        payable(item.seller).transfer(msg.value);
        
        // Transfer NFT to buyer
        IERC721(item.nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        // Update item
        item.owner = msg.sender;
        item.sold = true;
        _itemsSold.increment();
        
        emit MarketItemSold(itemId, msg.sender);
    }
    
    // Cancel listing
    function cancelListing(uint256 itemId) public nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];
        
        require(item.seller == msg.sender, "Only seller can cancel");
        require(!item.sold, "Item already sold");
        
        // Return NFT to seller
        IERC721(item.nftContract).transferFrom(address(this), msg.sender, item.tokenId);
        
        // Mark as sold to prevent further actions
        item.sold = true;
    }
    
    // Update price
    function updatePrice(uint256 itemId, uint256 newPrice) public {
        MarketItem storage item = idToMarketItem[itemId];
        
        require(item.seller == msg.sender, "Only seller can update price");
        require(!item.sold, "Item already sold");
        require(newPrice > 0, "Price must be greater than 0");
        
        item.price = newPrice;
    }
    
    // Fetch unsold items
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;
        
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        
        return items;
    }
    
    // Fetch user's NFTs
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](itemCount);
        
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        
        return items;
    }
    
    // Fetch items created by user
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](itemCount);
        
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        
        return items;
    }
    
    // Withdraw accumulated listing fees
    function withdrawFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
}
\`\`\`

### Frontend Integration

\`\`\`typescript
// NFT Marketplace frontend integration
import { ethers } from 'ethers';

class NFTMarketplaceClient {
  private marketplace: ethers.Contract;
  private nftContract: ethers.Contract;
  private signer: ethers.Signer;
  
  constructor(
    marketplaceAddress: string,
    nftAddress: string,
    signer: ethers.Signer
  ) {
    this.marketplace = new ethers.Contract(
      marketplaceAddress,
      MARKETPLACE_ABI,
      signer
    );
    
    this.nftContract = new ethers.Contract(
      nftAddress,
      NFT_ABI,
      signer
    );
    
    this.signer = signer;
  }
  
  // List NFT for sale
  async listNFT(tokenId: number, price: string): Promise<void> {
    // Get listing fee
    const listingFee = await this.marketplace.getListingFee();
    
    // Approve marketplace to transfer NFT
    const approveTx = await this.nftContract.approve(
      this.marketplace.address,
      tokenId
    );
    await approveTx.wait();
    
    // Create market item
    const priceInWei = ethers.utils.parseEther(price);
    const listTx = await this.marketplace.createMarketItem(
      this.nftContract.address,
      tokenId,
      priceInWei,
      { value: listingFee }
    );
    
    await listTx.wait();
  }
  
  // Buy NFT
  async buyNFT(itemId: number): Promise<void> {
    const item = await this.marketplace.idToMarketItem(itemId);
    
    const tx = await this.marketplace.createMarketSale(itemId, {
      value: item.price
    });
    
    await tx.wait();
  }
  
  // Fetch listings
  async getListings(): Promise<MarketItem[]> {
    const items = await this.marketplace.fetchMarketItems();
    
    // Enhance with metadata
    const enhancedItems = await Promise.all(
      items.map(async (item) => {
        const tokenUri = await this.nftContract.tokenURI(item.tokenId);
        const metadata = await this.fetchMetadata(tokenUri);
        
        return {
          ...item,
          metadata,
          priceFormatted: ethers.utils.formatEther(item.price)
        };
      })
    );
    
    return enhancedItems;
  }
  
  // Fetch metadata from IPFS
  private async fetchMetadata(uri: string): Promise<NFTMetadata> {
    const url = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    const response = await fetch(url);
    return response.json();
  }
  
  // Get user's NFTs
  async getMyNFTs(): Promise<any[]> {
    const balance = await this.nftContract.balanceOf(
      await this.signer.getAddress()
    );
    
    const nfts = [];
    
    for (let i = 0; i < balance.toNumber(); i++) {
      const tokenId = await this.nftContract.tokenOfOwnerByIndex(
        await this.signer.getAddress(),
        i
      );
      
      const uri = await this.nftContract.tokenURI(tokenId);
      const metadata = await this.fetchMetadata(uri);
      
      nfts.push({
        tokenId: tokenId.toNumber(),
        metadata
      });
    }
    
    return nfts;
  }
}

// React component for NFT gallery
const NFTGallery: React.FC = () => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const marketplace = useMarketplace();
  
  useEffect(() => {
    loadNFTs();
  }, []);
  
  const loadNFTs = async () => {
    try {
      const items = await marketplace.getListings();
      setNfts(items);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBuy = async (itemId: number) => {
    try {
      await marketplace.buyNFT(itemId);
      // Reload listings
      await loadNFTs();
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };
  
  return (
    <div className="nft-gallery">
      {loading ? (
        <div>Loading NFTs...</div>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.itemId}
              nft={nft}
              onBuy={() => handleBuy(nft.itemId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// NFT Card component
const NFTCard: React.FC<{
  nft: any;
  onBuy: () => void;
}> = ({ nft, onBuy }) => {
  const imageUrl = nft.metadata.image.replace(
    'ipfs://',
    'https://ipfs.io/ipfs/'
  );
  
  return (
    <div className="nft-card">
      <img src={imageUrl} alt={nft.metadata.name} />
      <div className="nft-info">
        <h3>{nft.metadata.name}</h3>
        <p>{nft.metadata.description}</p>
        <div className="attributes">
          {nft.metadata.attributes.map((attr: any) => (
            <span key={attr.trait_type} className="attribute">
              {attr.trait_type}: {attr.value}
            </span>
          ))}
        </div>
        <div className="price">
          {nft.priceFormatted} ETH
        </div>
        <button onClick={onBuy}>Buy Now</button>
      </div>
    </div>
  );
};
\`\`\`

## Advanced NFT Features

### Dynamic NFTs

\`\`\`solidity
// Dynamic NFT that changes based on conditions
contract DynamicNFT is ERC721URIStorage, Chainlink VRFConsumerBase {
    uint256 public tokenCounter;
    
    enum Stage { Egg, Hatchling, Adult }
    
    mapping(uint256 => Stage) public tokenIdToStage;
    mapping(uint256 => uint256) public tokenIdToBirthTime;
    mapping(uint256 => uint256) public tokenIdToRandomNumber;
    
    string[] public eggURIs;
    string[] public hatchlingURIs;
    string[] public adultURIs;
    
    uint256 public constant HATCH_TIME = 1 days;
    uint256 public constant ADULT_TIME = 7 days;
    
    event StageChanged(uint256 tokenId, Stage newStage);
    
    function mint() public {
        uint256 tokenId = tokenCounter;
        tokenCounter++;
        
        _safeMint(msg.sender, tokenId);
        tokenIdToStage[tokenId] = Stage.Egg;
        tokenIdToBirthTime[tokenId] = block.timestamp;
        
        // Request randomness for variation
        requestRandomness(keyHash, fee);
    }
    
    function growNFT(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        
        Stage currentStage = tokenIdToStage[tokenId];
        uint256 age = block.timestamp - tokenIdToBirthTime[tokenId];
        
        if (currentStage == Stage.Egg && age >= HATCH_TIME) {
            tokenIdToStage[tokenId] = Stage.Hatchling;
            emit StageChanged(tokenId, Stage.Hatchling);
        } else if (currentStage == Stage.Hatchling && age >= ADULT_TIME) {
            tokenIdToStage[tokenId] = Stage.Adult;
            emit StageChanged(tokenId, Stage.Adult);
        }
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        Stage stage = tokenIdToStage[tokenId];
        uint256 variation = tokenIdToRandomNumber[tokenId] % 3;
        
        if (stage == Stage.Egg) {
            return eggURIs[variation];
        } else if (stage == Stage.Hatchling) {
            return hatchlingURIs[variation];
        } else {
            return adultURIs[variation];
        }
    }
    
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 tokenId = requestIdToTokenId[requestId];
        tokenIdToRandomNumber[tokenId] = randomness;
    }
}
\`\`\`

### Fractional NFTs

\`\`\`solidity
// Fractional ownership of NFTs
contract FractionalNFT {
    IERC721 public nftContract;
    uint256 public tokenId;
    IERC20 public fractionalToken;
    
    uint256 public fractionSupply = 1000000 * 10**18; // 1M tokens
    uint256 public reservePrice;
    
    address public curator;
    bool public forSale;
    uint256 public salePrice;
    
    constructor(
        address _nftContract,
        uint256 _tokenId,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _reservePrice
    ) {
        nftContract = IERC721(_nftContract);
        tokenId = _tokenId;
        curator = msg.sender;
        reservePrice = _reservePrice;
        
        // Deploy ERC20 token for fractions
        fractionalToken = new FractionalToken(_tokenName, _tokenSymbol, fractionSupply);
        
        // Transfer NFT to this contract
        nftContract.transferFrom(msg.sender, address(this), tokenId);
    }
    
    function putForSale(uint256 price) public {
        require(msg.sender == curator, "Only curator");
        require(price >= reservePrice, "Price below reserve");
        
        forSale = true;
        salePrice = price;
    }
    
    function purchase() public payable {
        require(forSale, "Not for sale");
        require(msg.value >= salePrice, "Insufficient payment");
        
        // Transfer NFT to buyer
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        
        // Distribute payment to fraction holders
        uint256 balance = address(this).balance;
        // Implementation of payment distribution based on fraction ownership
    }
    
    function redeemFractions() public {
        require(fractionalToken.balanceOf(msg.sender) == fractionSupply, "Must own all fractions");
        
        // Burn all fractions
        fractionalToken.burn(fractionSupply);
        
        // Transfer NFT to redeemer
        nftContract.transferFrom(address(this), msg.sender, tokenId);
    }
}
\`\`\`

## Best Practices

### Gas Optimization

\`\`\`solidity
// Gas-optimized NFT contract
contract OptimizedNFT is ERC721A, Ownable {
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_TX = 10;
    uint256 public price = 0.05 ether;
    
    string private baseURI;
    
    // Bit-packed struct for storage efficiency
    struct TokenData {
        uint64 mintTimestamp;
        uint64 transferCount;
        uint128 customData;
    }
    
    mapping(uint256 => TokenData) private tokenData;
    
    constructor() ERC721A("Optimized NFT", "ONFT") {}
    
    // Batch mint for gas efficiency
    function mint(uint256 quantity) external payable {
        require(quantity <= MAX_PER_TX, "Too many per tx");
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Max supply exceeded");
        require(msg.value >= price * quantity, "Insufficient payment");
        
        _mint(msg.sender, quantity);
        
        // Set token data for batch
        uint256 startTokenId = _currentIndex - quantity;
        for (uint256 i = 0; i < quantity; i++) {
            tokenData[startTokenId + i] = TokenData({
                mintTimestamp: uint64(block.timestamp),
                transferCount: 0,
                customData: 0
            });
        }
    }
    
    // Override transfer to track transfer count
    function _afterTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal override {
        super._afterTokenTransfers(from, to, startTokenId, quantity);
        
        if (from != address(0)) { // Not minting
            for (uint256 i = 0; i < quantity; i++) {
                tokenData[startTokenId + i].transferCount++;
            }
        }
    }
    
    // Efficient metadata
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    function setBaseURI(string calldata uri) external onlyOwner {
        baseURI = uri;
    }
    
    // Withdraw with call instead of transfer
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-3-4-1',
      title: 'Create Complete NFT Project',
      description: 'Bouw een volledig NFT project met minting en marketplace',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer een ERC-721 contract met metadata',
        'Creëer een minting website met wallet integratie',
        'Upload metadata en images naar IPFS',
        'Voeg marketplace functionaliteit toe'
      ],
      hints: [
        'Gebruik ERC721A voor gas-efficiënte batch minting',
        'Implement reveal mechanisme voor fair launch',
        'Test thoroughly op testnet eerst'
      ]
    },
    {
      id: 'assignment-3-4-2',
      title: 'Build Gaming NFT System',
      description: 'Ontwikkel een gaming NFT systeem met ERC-1155',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer ERC-1155 voor game items',
        'Creëer crafting systeem',
        'Voeg marketplace voor items toe',
        'Implementeer item upgrades en levels'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het belangrijkste verschil tussen ERC-721 en ERC-1155?',
      options: [
        'ERC-1155 is alleen voor games',
        'ERC-1155 kan zowel fungible als non-fungible tokens in één contract',
        'ERC-721 is nieuwer',
        'Er is geen verschil'
      ],
      correctAnswer: 1,
      explanation: 'ERC-1155 is een multi-token standard die zowel fungible (zoals game currency) als non-fungible tokens (zoals unique items) in één contract kan beheren.'
    },
    {
      question: 'Waarom is het belangrijk om NFT metadata op IPFS op te slaan?',
      options: [
        'Het is wettelijk verplicht',
        'On-chain storage is te duur en IPFS is decentralized',
        'IPFS is sneller',
        'Het is niet belangrijk'
      ],
      correctAnswer: 1,
      explanation: 'Metadata on-chain opslaan is prohibitief duur. IPFS biedt decentralized storage waarbij alleen de IPFS hash on-chain wordt opgeslagen.'
    },
    {
      question: 'Wat is de functie van tokenURI in een NFT contract?',
      options: [
        'Het bepaalt de prijs van de NFT',
        'Het retourneert de locatie van de NFT metadata',
        'Het telt het aantal NFTs',
        'Het mint nieuwe NFTs'
      ],
      correctAnswer: 1,
      explanation: 'tokenURI retourneert de URI (meestal IPFS link) waar de metadata van een specifieke token kan worden gevonden.'
    }
  ],
  resources: [
    {
      title: 'OpenZeppelin NFT Documentation',
      url: 'https://docs.openzeppelin.com/contracts/4.x/erc721',
      type: 'documentation',
      description: 'Complete guide voor ERC-721 implementatie'
    },
    {
      title: 'EIP-721: Non-Fungible Token Standard',
      url: 'https://eips.ethereum.org/EIPS/eip-721',
      type: 'specification',
      description: 'Officiële ERC-721 specificatie'
    },
    {
      title: 'NFT School',
      url: 'https://nftschool.dev/',
      type: 'tutorial',
      description: 'Comprehensive NFT development tutorials'
    }
  ],
  projectIdeas: [
    'Bouw een generative art NFT collectie',
    'Creëer een NFT-based membership systeem',
    'Ontwikkel een decentralized gaming item marketplace',
    'Maak een dynamic NFT dat evolueert over tijd'
  ]
};