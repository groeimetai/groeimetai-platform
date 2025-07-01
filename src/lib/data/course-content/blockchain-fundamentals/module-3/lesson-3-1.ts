// Module 3 - Lesson 1: Web3.js en Ethers.js

export default {
  id: 'lesson-3-1',
  title: 'Web3.js en Ethers.js',
  duration: '3 uur',
  objectives: [
    'Vergelijk Web3.js en Ethers.js libraries',
    'Leer providers, signers en contracts gebruiken',
    'Implementeer blockchain interacties',
    'Best practices voor Web3 development'
  ],
  content: `
# Web3.js en Ethers.js

## Introductie

**Web3.js** en **Ethers.js** zijn de twee meest populaire JavaScript libraries voor interactie met Ethereum. Beide bieden vergelijkbare functionaliteit maar met verschillende design filosofieën.

### Vergelijking

| Feature | Web3.js | Ethers.js |
|---------|---------|-----------|
| **Bundle Size** | ~337kb | ~88kb (modulair) |
| **API Design** | Object-oriented | Functional |
| **TypeScript** | Toegevoegd later | Native support |
| **Documentation** | Uitgebreid | Excellent |
| **Learning Curve** | Steeper | Gentler |
| **Performance** | Good | Better |
| **Modularity** | Monolithic | Highly modular |

## Ethers.js Deep Dive

### Installation en Setup

\`\`\`bash
# NPM
npm install ethers

# Yarn
yarn add ethers

# Voor specifieke modules
npm install @ethersproject/providers @ethersproject/wallet
\`\`\`

### Providers

Providers zijn read-only connecties met de blockchain.

\`\`\`typescript
import { ethers } from 'ethers';

// 1. Default Provider (aggregeert meerdere services)
const defaultProvider = ethers.getDefaultProvider('mainnet', {
  etherscan: process.env.ETHERSCAN_API_KEY,
  infura: process.env.INFURA_PROJECT_ID,
  alchemy: process.env.ALCHEMY_API_KEY,
  pocket: process.env.POCKET_APP_ID,
  ankr: process.env.ANKR_API_KEY
});

// 2. Specific Provider
const infuraProvider = new ethers.providers.InfuraProvider(
  'mainnet',
  process.env.INFURA_PROJECT_ID
);

const alchemyProvider = new ethers.providers.AlchemyProvider(
  'mainnet',
  process.env.ALCHEMY_API_KEY
);

// 3. JSON-RPC Provider
const customProvider = new ethers.providers.JsonRpcProvider(
  'http://localhost:8545'
);

// 4. Web3 Provider (MetaMask, etc.)
const web3Provider = new ethers.providers.Web3Provider(
  window.ethereum
);

// 5. WebSocket Provider (voor real-time events)
const wsProvider = new ethers.providers.WebSocketProvider(
  'wss://mainnet.infura.io/ws/v3/YOUR-PROJECT-ID'
);

// Provider methods
async function providerExamples() {
  // Network info
  const network = await defaultProvider.getNetwork();
  console.log('Network:', network.name, network.chainId);
  
  // Latest block
  const blockNumber = await defaultProvider.getBlockNumber();
  const block = await defaultProvider.getBlock(blockNumber);
  console.log('Latest block:', block);
  
  // Account balance
  const balance = await defaultProvider.getBalance(
    '0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E'
  );
  console.log('Balance:', ethers.utils.formatEther(balance), 'ETH');
  
  // Transaction info
  const tx = await defaultProvider.getTransaction(
    '0x5b73e239ee3455fcd0e3f3f5a5c198e89d7f71a8ef2f3f52e00b2d4fdce3b466'
  );
  console.log('Transaction:', tx);
  
  // Gas prices
  const gasPrice = await defaultProvider.getGasPrice();
  const feeData = await defaultProvider.getFeeData();
  console.log('Gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
  console.log('Fee data:', feeData);
  
  // ENS resolution
  const address = await defaultProvider.resolveName('vitalik.eth');
  const name = await defaultProvider.lookupAddress(address);
  console.log('ENS:', name, '->', address);
}
\`\`\`

### Signers en Wallets

Signers kunnen transacties ondertekenen en verzenden.

\`\`\`typescript
// 1. Wallet from private key
const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
const wallet = new ethers.Wallet(privateKey);

// Connect wallet to provider
const connectedWallet = wallet.connect(defaultProvider);

// 2. Random wallet
const randomWallet = ethers.Wallet.createRandom();
console.log('Address:', randomWallet.address);
console.log('Private key:', randomWallet.privateKey);
console.log('Mnemonic:', randomWallet.mnemonic.phrase);

// 3. Wallet from mnemonic
const mnemonic = 'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';
const walletFromMnemonic = ethers.Wallet.fromMnemonic(mnemonic);

// HD Wallet (multiple addresses from one mnemonic)
const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
const firstAccount = hdNode.derivePath("m/44'/60'/0'/0/0");
const secondAccount = hdNode.derivePath("m/44'/60'/0'/0/1");

// 4. Signer from Web3Provider (MetaMask)
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// 5. Encrypted JSON wallet
const password = 'super-secret-password';

// Create encrypted wallet
const encryptedJson = await wallet.encrypt(password);

// Decrypt wallet
const decryptedWallet = await ethers.Wallet.fromEncryptedJson(
  encryptedJson,
  password
);

// Signer methods
async function signerExamples() {
  // Get address
  const address = await signer.getAddress();
  
  // Get balance
  const balance = await signer.getBalance();
  
  // Sign message
  const message = 'Hello Ethereum!';
  const signature = await signer.signMessage(message);
  
  // Verify signature
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  console.log('Signature valid:', recoveredAddress === address);
  
  // Sign typed data (EIP-712)
  const domain = {
    name: 'My DApp',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  };
  
  const types = {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' }
    ]
  };
  
  const value = {
    name: 'Alice',
    wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E'
  };
  
  const typedSignature = await signer._signTypedData(domain, types, value);
}
\`\`\`

### Contract Interaction

\`\`\`typescript
// Contract ABI (Application Binary Interface)
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// Create contract instance
const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

// Read-only contract (connected to provider)
async function readContract() {
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const totalSupply = await contract.totalSupply();
  
  console.log(\`Token: \${name} (\${symbol})\`);
  console.log(\`Decimals: \${decimals}\`);
  console.log(\`Total Supply: \${ethers.utils.formatUnits(totalSupply, decimals)}\`);
  
  // Check balance
  const balance = await contract.balanceOf(address);
  console.log(\`Balance: \${ethers.utils.formatUnits(balance, decimals)} \${symbol}\`);
}

// Write contract (connected to signer)
const contractWithSigner = contract.connect(signer);

async function writeContract() {
  // Transfer tokens
  const recipient = '0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E';
  const amount = ethers.utils.parseUnits('100', 6); // 100 USDC
  
  // Estimate gas
  const estimatedGas = await contractWithSigner.estimateGas.transfer(
    recipient,
    amount
  );
  console.log('Estimated gas:', estimatedGas.toString());
  
  // Send transaction
  const tx = await contractWithSigner.transfer(recipient, amount, {
    gasLimit: estimatedGas.mul(110).div(100), // 10% buffer
    // For EIP-1559:
    maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
    maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')
  });
  
  console.log('Transaction hash:', tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait(1); // 1 confirmation
  console.log('Transaction confirmed in block:', receipt.blockNumber);
  console.log('Gas used:', receipt.gasUsed.toString());
  
  // Check events in receipt
  const transferEvents = receipt.events?.filter(
    event => event.event === 'Transfer'
  );
  console.log('Transfer events:', transferEvents);
}

// Event listening
function listenToEvents() {
  // Listen for all Transfer events
  contract.on('Transfer', (from, to, amount, event) => {
    console.log(\`Transfer: \${from} -> \${to}: \${ethers.utils.formatUnits(amount, 6)} USDC\`);
    console.log('Block:', event.blockNumber);
    console.log('Transaction:', event.transactionHash);
  });
  
  // Filter events (only transfers to specific address)
  const filter = contract.filters.Transfer(null, myAddress);
  contract.on(filter, (from, to, amount, event) => {
    console.log(\`Received \${ethers.utils.formatUnits(amount, 6)} USDC from \${from}\`);
  });
  
  // Query past events
  async function queryPastEvents() {
    const fromBlock = 15000000;
    const toBlock = 'latest';
    
    const events = await contract.queryFilter(
      contract.filters.Transfer(),
      fromBlock,
      toBlock
    );
    
    console.log(\`Found \${events.length} transfer events\`);
    
    // Process events
    events.forEach(event => {
      console.log({
        from: event.args.from,
        to: event.args.to,
        amount: ethers.utils.formatUnits(event.args.value, 6),
        block: event.blockNumber,
        tx: event.transactionHash
      });
    });
  }
  
  // Remove listeners
  contract.removeAllListeners('Transfer');
}
\`\`\`

### Advanced Contract Features

\`\`\`typescript
// Contract Factory for deployment
const contractFactory = new ethers.ContractFactory(
  contractABI,
  contractBytecode,
  signer
);

async function deployContract() {
  // Deploy with constructor parameters
  const contract = await contractFactory.deploy(
    'My Token',
    'MTK',
    ethers.utils.parseUnits('1000000', 18)
  );
  
  console.log('Deployment transaction:', contract.deployTransaction.hash);
  
  // Wait for deployment
  await contract.deployed();
  console.log('Contract deployed at:', contract.address);
  
  // Wait for more confirmations
  await contract.deployTransaction.wait(5);
}

// Interface for encoding/decoding
const iface = new ethers.utils.Interface(ERC20_ABI);

// Encode function call
const data = iface.encodeFunctionData('transfer', [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E',
  ethers.utils.parseUnits('100', 6)
]);

// Decode function result
const result = iface.decodeFunctionResult(
  'balanceOf',
  '0x0000000000000000000000000000000000000000000000000000000005f5e100'
);

// Parse logs
const parsedLog = iface.parseLog({
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f2bd6e'
  ],
  data: '0x0000000000000000000000000000000000000000000000000000000005f5e100'
});

// Multicall for batch reads
const multicallContract = new ethers.Contract(
  '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441', // Multicall2
  [
    'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'
  ],
  provider
);

async function batchRead() {
  const calls = [
    {
      target: tokenAddress,
      callData: iface.encodeFunctionData('name')
    },
    {
      target: tokenAddress,
      callData: iface.encodeFunctionData('symbol')
    },
    {
      target: tokenAddress,
      callData: iface.encodeFunctionData('decimals')
    }
  ];
  
  const [blockNumber, returnData] = await multicallContract.aggregate(calls);
  
  const name = iface.decodeFunctionResult('name', returnData[0])[0];
  const symbol = iface.decodeFunctionResult('symbol', returnData[1])[0];
  const decimals = iface.decodeFunctionResult('decimals', returnData[2])[0];
  
  console.log({ name, symbol, decimals });
}
\`\`\`

## Web3.js Comparison

### Installation

\`\`\`bash
npm install web3
\`\`\`

### Basic Usage

\`\`\`typescript
import Web3 from 'web3';

// Initialize Web3
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR-PROJECT-ID');

// Or with MetaMask
const web3MM = new Web3(window.ethereum);

// Web3.js examples
async function web3Examples() {
  // Get accounts
  const accounts = await web3.eth.getAccounts();
  
  // Get balance
  const balance = await web3.eth.getBalance(accounts[0]);
  const balanceInEther = web3.utils.fromWei(balance, 'ether');
  
  // Send transaction
  const tx = {
    from: accounts[0],
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E',
    value: web3.utils.toWei('0.1', 'ether'),
    gas: 21000
  };
  
  const receipt = await web3.eth.sendTransaction(tx);
  
  // Contract interaction
  const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
  
  // Read
  const name = await contract.methods.name().call();
  const balance = await contract.methods.balanceOf(accounts[0]).call();
  
  // Write
  const transferTx = await contract.methods
    .transfer(recipient, amount)
    .send({ from: accounts[0] });
  
  // Events
  contract.events.Transfer({
    filter: { to: accounts[0] },
    fromBlock: 'latest'
  })
  .on('data', event => console.log(event))
  .on('error', error => console.error(error));
}
\`\`\`

## Utils en Helpers

### Ethers.js Utils

\`\`\`typescript
import { ethers } from 'ethers';

// 1. Unit conversion
const oneEther = ethers.utils.parseEther('1.0'); // '1000000000000000000'
const oneGwei = ethers.utils.parseUnits('1.0', 'gwei'); // '1000000000'
const formatted = ethers.utils.formatEther('1000000000000000000'); // '1.0'

// 2. Address utilities
const isValid = ethers.utils.isAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E');
const checksum = ethers.utils.getAddress('0x742d35cc6634c0532925a3b844bc9e7595f2bd6e');
const contractAddr = ethers.utils.getContractAddress({
  from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E',
  nonce: 0
});

// 3. Hashing
const hash = ethers.utils.keccak256('0x1234');
const id = ethers.utils.id('Transfer(address,address,uint256)'); // Function selector
const solidityHash = ethers.utils.solidityKeccak256(
  ['address', 'uint256'],
  ['0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E', 100]
);

// 4. Encoding/Decoding
const encoded = ethers.utils.defaultAbiCoder.encode(
  ['address', 'uint256'],
  ['0x742d35Cc6634C0532925a3b844Bc9e7595f2BD6E', 100]
);

const decoded = ethers.utils.defaultAbiCoder.decode(
  ['address', 'uint256'],
  encoded
);

// 5. String manipulation
const bytes32 = ethers.utils.formatBytes32String('Hello World');
const string = ethers.utils.parseBytes32String(bytes32);
const utf8Bytes = ethers.utils.toUtf8Bytes('Hello Ethereum');
const hexString = ethers.utils.hexlify(utf8Bytes);

// 6. BigNumber operations
const bn1 = ethers.BigNumber.from('1000000000000000000');
const bn2 = ethers.BigNumber.from('2000000000000000000');
const sum = bn1.add(bn2);
const product = bn1.mul(bn2);
const isGreater = bn1.gt(bn2);

// 7. Random values
const randomBytes = ethers.utils.randomBytes(32);
const shuffled = ethers.utils.shuffled([1, 2, 3, 4, 5]);
\`\`\`

## Best Practices

### Error Handling

\`\`\`typescript
// Comprehensive error handling
async function safeContractCall() {
  try {
    const tx = await contract.someMethod();
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }
    
    return receipt;
  } catch (error: any) {
    // Parse error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('Not enough ETH for gas');
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      console.error('Transaction will fail');
      
      // Try to get revert reason
      try {
        await contract.callStatic.someMethod();
      } catch (staticCallError: any) {
        console.error('Revert reason:', staticCallError.reason);
      }
    } else if (error.code === 'USER_REJECTED') {
      console.error('User rejected transaction');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network connection issue');
    } else {
      console.error('Unknown error:', error);
    }
    
    throw error;
  }
}

// Retry logic for network issues
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (error.code === 'NETWORK_ERROR' && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError!;
}
\`\`\`

### Gas Optimization

\`\`\`typescript
// Gas management utilities
class GasManager {
  private provider: ethers.providers.Provider;
  
  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
  }
  
  async getOptimalGasPrice(): Promise<{
    slow: ethers.BigNumber;
    standard: ethers.BigNumber;
    fast: ethers.BigNumber;
  }> {
    const block = await this.provider.getBlock('latest');
    
    if (block.baseFeePerGas) {
      // EIP-1559
      const baseFee = block.baseFeePerGas;
      
      return {
        slow: baseFee.mul(110).div(100), // 10% above base
        standard: baseFee.mul(125).div(100), // 25% above base
        fast: baseFee.mul(150).div(100) // 50% above base
      };
    } else {
      // Legacy
      const gasPrice = await this.provider.getGasPrice();
      
      return {
        slow: gasPrice.mul(90).div(100),
        standard: gasPrice,
        fast: gasPrice.mul(120).div(100)
      };
    }
  }
  
  async estimateWithBuffer(
    contract: ethers.Contract,
    method: string,
    args: any[],
    bufferPercent: number = 20
  ): Promise<ethers.BigNumber> {
    const estimated = await contract.estimateGas[method](...args);
    return estimated.mul(100 + bufferPercent).div(100);
  }
}

// Batch transactions with Multicall
class BatchTransactionManager {
  private multicall: ethers.Contract;
  
  constructor(multicallAddress: string, provider: ethers.providers.Provider) {
    this.multicall = new ethers.Contract(
      multicallAddress,
      ['function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[])'],
      provider
    );
  }
  
  async executeBatch(calls: Array<{
    contract: ethers.Contract;
    method: string;
    args: any[];
  }>): Promise<any[]> {
    const callData = calls.map(call => ({
      target: call.contract.address,
      callData: call.contract.interface.encodeFunctionData(
        call.method,
        call.args
      )
    }));
    
    const results = await this.multicall.tryAggregate(false, callData);
    
    return results.map((result: any, i: number) => {
      if (!result.success) {
        throw new Error(\`Call \${i} failed\`);
      }
      
      return calls[i].contract.interface.decodeFunctionResult(
        calls[i].method,
        result.returnData
      );
    });
  }
}
\`\`\`

### Type Safety

\`\`\`typescript
// Using TypeChain for type-safe contracts
import { MyToken__factory } from './typechain';

async function typeChainExample() {
  const signer = provider.getSigner();
  
  // Deploy with types
  const myToken = await new MyToken__factory(signer).deploy(
    'My Token',
    'MTK',
    ethers.utils.parseEther('1000000')
  );
  
  // All methods are typed
  const name: string = await myToken.name();
  const balance: ethers.BigNumber = await myToken.balanceOf(address);
  
  // Events are typed
  myToken.on('Transfer', (from: string, to: string, value: ethers.BigNumber) => {
    console.log(\`Transfer: \${from} -> \${to}: \${ethers.utils.formatEther(value)}\`);
  });
  
  // Errors provide better IDE support
  try {
    await myToken.transfer(recipient, amount);
  } catch (error) {
    // TypeScript knows the error structure
  }
}

// Custom types for better DX
interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: ethers.BigNumber;
}

async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply()
  ]);
  
  return {
    address: tokenAddress,
    name,
    symbol,
    decimals,
    totalSupply
  };
}
\`\`\`

## Performance Optimization

\`\`\`typescript
// Connection pooling for multiple providers
class ProviderPool {
  private providers: ethers.providers.Provider[];
  private currentIndex: number = 0;
  
  constructor(rpcUrls: string[]) {
    this.providers = rpcUrls.map(url => 
      new ethers.providers.JsonRpcProvider(url)
    );
  }
  
  getProvider(): ethers.providers.Provider {
    const provider = this.providers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.providers.length;
    return provider;
  }
  
  async callWithFallback<T>(
    fn: (provider: ethers.providers.Provider) => Promise<T>
  ): Promise<T> {
    const errors: Error[] = [];
    
    for (const provider of this.providers) {
      try {
        return await fn(provider);
      } catch (error: any) {
        errors.push(error);
      }
    }
    
    throw new Error(\`All providers failed: \${errors.map(e => e.message).join(', ')}\`);
  }
}

// Caching frequently accessed data
class ContractCache {
  private cache: Map<string, any> = new Map();
  private ttl: number;
  
  constructor(ttlSeconds: number = 60) {
    this.ttl = ttlSeconds * 1000;
  }
  
  async get<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.value;
    }
    
    const value = await fetcher();
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    
    return value;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Usage
const cache = new ContractCache(300); // 5 minutes TTL

async function getCachedBalance(address: string): Promise<ethers.BigNumber> {
  return cache.get(
    \`balance:\${address}\`,
    () => provider.getBalance(address)
  );
}
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-3-1-1',
      title: 'Multi-Provider DApp',
      description: 'Bouw een robuuste Web3 applicatie met fallback providers',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer provider failover logica',
        'Voeg caching toe voor network calls',
        'Handle verschillende network errors gracefully',
        'Test met verschillende RPC endpoints'
      ],
      hints: [
        'Gebruik Promise.race voor snelste response',
        'Implementeer exponential backoff voor retries',
        'Cache read-only calls'
      ]
    },
    {
      id: 'assignment-3-1-2',
      title: 'Advanced Contract Interaction Tool',
      description: 'Creëer een tool voor complexe contract interacties',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Bouw een contract method encoder/decoder',
        'Implementeer batch transaction functionaliteit',
        'Voeg gas estimation met verschillende strategies toe',
        'Creëer event log analyzer'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het grootste verschil tussen een Provider en een Signer in Ethers.js?',
      options: [
        'Providers zijn sneller dan Signers',
        'Providers kunnen alleen lezen, Signers kunnen ook transacties verzenden',
        'Signers werken alleen met MetaMask',
        'Er is geen verschil'
      ],
      correctAnswer: 1,
      explanation: 'Providers zijn read-only connecties met de blockchain, terwijl Signers transacties kunnen ondertekenen en verzenden.'
    },
    {
      question: 'Wanneer zou je Web3.js kiezen boven Ethers.js?',
      options: [
        'Voor betere TypeScript support',
        'Voor kleinere bundle size',
        'Als je bestaande Web3.js code hebt of specifieke Web3.js plugins nodig hebt',
        'Voor betere performance'
      ],
      correctAnswer: 2,
      explanation: 'Web3.js kan de betere keuze zijn voor legacy projecten of wanneer specifieke Web3.js plugins/extensions nodig zijn.'
    },
    {
      question: 'Wat is de beste manier om meerdere contract calls efficiënt uit te voeren?',
      options: [
        'Sequential await statements',
        'Promise.all voor parallel execution',
        'Multicall contract voor batch reads',
        'Separate transactions voor elke call'
      ],
      correctAnswer: 2,
      explanation: 'Multicall contracts kunnen meerdere read operations in één RPC call bundelen, wat veel efficiënter is.'
    }
  ],
  resources: [
    {
      title: 'Ethers.js Documentation',
      url: 'https://docs.ethers.io/',
      type: 'documentation',
      description: 'Complete Ethers.js v5 documentatie'
    },
    {
      title: 'Web3.js Documentation',
      url: 'https://web3js.readthedocs.io/',
      type: 'documentation',
      description: 'Officiële Web3.js documentatie'
    },
    {
      title: 'Ethereum Provider API',
      url: 'https://eips.ethereum.org/EIPS/eip-1193',
      type: 'specification',
      description: 'EIP-1193: Ethereum Provider JavaScript API'
    }
  ],
  projectIdeas: [
    'Bouw een universal blockchain explorer',
    'Creëer een gas tracker dashboard',
    'Ontwikkel een smart contract interaction CLI',
    'Maak een Web3 provider abstraction library'
  ]
};