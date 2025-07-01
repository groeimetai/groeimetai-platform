// Module 2 - Lesson 1: Ethereum ecosystem overzicht

export default {
  id: 'lesson-2-1',
  title: 'Ethereum ecosystem overzicht',
  duration: '2.5 uur',
  objectives: [
    'Begrijp de Ethereum architectuur en componenten',
    'Leer over de Ethereum Virtual Machine (EVM)',
    'Begrijp accounts, gas, en transacties',
    'Ontdek het Ethereum ecosysteem en tooling'
  ],
  content: `
# Ethereum Ecosystem Overzicht

## Wat is Ethereum?

Ethereum is een **gedecentraliseerd platform** dat smart contracts draait - applicaties die exact draaien zoals geprogrammeerd zonder downtime, censuur, fraude of interferentie van derden.

### Kernconcepten
- **World Computer**: Ethereum als globale, gedecentraliseerde computer
- **Turing Complete**: Kan elke berekening uitvoeren (met genoeg gas)
- **State Machine**: Ethereum als een state transition systeem
- **Native Currency**: Ether (ETH) als brandstof voor het netwerk

## Ethereum Architectuur

### Componenten Overview

\`\`\`typescript
// Ethereum Architecture Model
interface EthereumNetwork {
  nodes: EthereumNode[];
  blockchain: Blockchain;
  stateDB: WorldState;
  networkProtocol: P2PNetwork;
  consensus: ConsensusEngine;
}

interface EthereumNode {
  nodeId: string;
  evm: EthereumVirtualMachine;
  txPool: TransactionPool;
  blockProducer?: BlockProducer;
  peerConnections: Peer[];
}

class EthereumSimulator {
  private worldState: Map<string, AccountState>;
  private currentBlock: number;
  private gasPrice: bigint;
  
  constructor() {
    this.worldState = new Map();
    this.currentBlock = 0;
    this.gasPrice = BigInt(20_000_000_000); // 20 gwei
  }
  
  // Create new account
  createAccount(address: string): void {
    this.worldState.set(address, {
      nonce: 0,
      balance: BigInt(0),
      storageRoot: '0x',
      codeHash: '0x'
    });
  }
  
  // Process transaction
  processTransaction(tx: Transaction): TransactionReceipt {
    // Validate transaction
    if (!this.validateTransaction(tx)) {
      throw new Error('Invalid transaction');
    }
    
    // Execute transaction
    const receipt = this.executeTransaction(tx);
    
    // Update state
    this.updateWorldState(tx, receipt);
    
    return receipt;
  }
  
  private validateTransaction(tx: Transaction): boolean {
    const sender = this.worldState.get(tx.from);
    if (!sender) return false;
    
    // Check nonce
    if (tx.nonce !== sender.nonce) return false;
    
    // Check balance for gas
    const maxGasCost = tx.gasLimit * tx.gasPrice;
    if (sender.balance < maxGasCost + tx.value) return false;
    
    return true;
  }
  
  private executeTransaction(tx: Transaction): TransactionReceipt {
    // Simplified execution
    const gasUsed = this.estimateGas(tx);
    
    return {
      transactionHash: this.hashTransaction(tx),
      blockNumber: this.currentBlock,
      gasUsed: gasUsed,
      status: true,
      logs: []
    };
  }
  
  private updateWorldState(tx: Transaction, receipt: TransactionReceipt): void {
    const sender = this.worldState.get(tx.from)!;
    const receiver = this.worldState.get(tx.to) || this.createEmptyAccount();
    
    // Update balances
    sender.balance -= tx.value + (receipt.gasUsed * tx.gasPrice);
    receiver.balance += tx.value;
    
    // Update nonce
    sender.nonce++;
    
    // Update state
    this.worldState.set(tx.from, sender);
    this.worldState.set(tx.to, receiver);
  }
  
  private createEmptyAccount(): AccountState {
    return {
      nonce: 0,
      balance: BigInt(0),
      storageRoot: '0x',
      codeHash: '0x'
    };
  }
  
  private estimateGas(tx: Transaction): bigint {
    // Base transaction cost
    let gas = BigInt(21000);
    
    // Add data cost (simplified)
    if (tx.data) {
      gas += BigInt(tx.data.length * 16);
    }
    
    return gas;
  }
  
  private hashTransaction(tx: Transaction): string {
    // Simplified hash
    return '0x' + crypto
      .createHash('sha256')
      .update(JSON.stringify(tx))
      .digest('hex');
  }
}

interface AccountState {
  nonce: number;
  balance: bigint;
  storageRoot: string;
  codeHash: string;
}

interface Transaction {
  from: string;
  to: string;
  value: bigint;
  gasLimit: bigint;
  gasPrice: bigint;
  nonce: number;
  data?: string;
}

interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  gasUsed: bigint;
  status: boolean;
  logs: Log[];
}

interface Log {
  address: string;
  topics: string[];
  data: string;
}
\`\`\`

## Ethereum Virtual Machine (EVM)

### EVM Eigenschappen
- **Stack-based**: 256-bit woord grootte
- **Deterministic**: Zelfde input = zelfde output
- **Isolated**: Sandboxed uitvoering
- **Gas-metered**: Elke operatie kost gas

### EVM Implementatie

\`\`\`typescript
// Simplified EVM implementation
class EVM {
  private stack: bigint[];
  private memory: Uint8Array;
  private storage: Map<string, bigint>;
  private pc: number; // Program counter
  private gas: bigint;
  
  constructor(gasLimit: bigint) {
    this.stack = [];
    this.memory = new Uint8Array(1024 * 1024); // 1MB
    this.storage = new Map();
    this.pc = 0;
    this.gas = gasLimit;
  }
  
  // Execute bytecode
  execute(bytecode: Uint8Array): ExecutionResult {
    while (this.pc < bytecode.length && this.gas > 0) {
      const opcode = bytecode[this.pc];
      
      try {
        this.executeOpcode(opcode, bytecode);
      } catch (error) {
        return {
          success: false,
          gasUsed: this.gas,
          returnData: new Uint8Array(),
          error: error.message
        };
      }
    }
    
    return {
      success: true,
      gasUsed: this.gas,
      returnData: new Uint8Array(),
      error: null
    };
  }
  
  private executeOpcode(opcode: number, bytecode: Uint8Array): void {
    // Simplified opcode execution
    switch (opcode) {
      case 0x00: // STOP
        this.pc = bytecode.length;
        break;
        
      case 0x01: // ADD
        this.useGas(3n);
        const a = this.pop();
        const b = this.pop();
        this.push(a + b);
        break;
        
      case 0x02: // MUL
        this.useGas(5n);
        const x = this.pop();
        const y = this.pop();
        this.push(x * y);
        break;
        
      case 0x50: // POP
        this.useGas(2n);
        this.pop();
        break;
        
      case 0x51: // MLOAD
        this.useGas(3n);
        const offset = Number(this.pop());
        const value = this.readMemory(offset, 32);
        this.push(BigInt('0x' + value.toString('hex')));
        break;
        
      case 0x52: // MSTORE
        this.useGas(3n);
        const mOffset = Number(this.pop());
        const mValue = this.pop();
        this.writeMemory(mOffset, mValue, 32);
        break;
        
      case 0x54: // SLOAD
        this.useGas(200n);
        const key = this.pop().toString();
        this.push(this.storage.get(key) || 0n);
        break;
        
      case 0x55: // SSTORE
        this.useGas(20000n);
        const sKey = this.pop().toString();
        const sValue = this.pop();
        this.storage.set(sKey, sValue);
        break;
        
      case 0x60: // PUSH1
        this.useGas(3n);
        this.pc++;
        this.push(BigInt(bytecode[this.pc]));
        break;
        
      default:
        throw new Error(\`Unknown opcode: \${opcode.toString(16)}\`);
    }
    
    this.pc++;
  }
  
  private push(value: bigint): void {
    if (this.stack.length >= 1024) {
      throw new Error('Stack overflow');
    }
    this.stack.push(value);
  }
  
  private pop(): bigint {
    if (this.stack.length === 0) {
      throw new Error('Stack underflow');
    }
    return this.stack.pop()!;
  }
  
  private useGas(amount: bigint): void {
    if (this.gas < amount) {
      throw new Error('Out of gas');
    }
    this.gas -= amount;
  }
  
  private readMemory(offset: number, size: number): Buffer {
    return Buffer.from(this.memory.slice(offset, offset + size));
  }
  
  private writeMemory(offset: number, value: bigint, size: number): void {
    const bytes = value.toString(16).padStart(size * 2, '0');
    const buffer = Buffer.from(bytes, 'hex');
    this.memory.set(buffer, offset);
  }
}

interface ExecutionResult {
  success: boolean;
  gasUsed: bigint;
  returnData: Uint8Array;
  error: string | null;
}

// Example: Compile simple addition contract
function compileAddition(): Uint8Array {
  return new Uint8Array([
    0x60, 0x05, // PUSH1 5
    0x60, 0x03, // PUSH1 3
    0x01,       // ADD
    0x00        // STOP
  ]);
}

// Execute
const evm = new EVM(100000n);
const bytecode = compileAddition();
const result = evm.execute(bytecode);
console.log('Execution result:', result);
\`\`\`

## Account Types

### Externally Owned Accounts (EOA)
- Controlled door private keys
- Kan transacties initiëren
- Geen code

### Contract Accounts
- Controlled door contract code
- Code wordt uitgevoerd bij transacties
- Heeft storage

\`\`\`typescript
// Account abstraction
abstract class Account {
  address: string;
  balance: bigint;
  nonce: number;
  
  constructor(address: string) {
    this.address = address;
    this.balance = 0n;
    this.nonce = 0;
  }
  
  abstract execute(tx: Transaction): void;
}

class EOA extends Account {
  private privateKey: string;
  
  constructor(privateKey: string) {
    const address = deriveAddress(privateKey);
    super(address);
    this.privateKey = privateKey;
  }
  
  execute(tx: Transaction): void {
    // Sign and send transaction
    const signature = this.signTransaction(tx);
    // Broadcast to network
  }
  
  private signTransaction(tx: Transaction): string {
    // Sign with private key
    return 'signature';
  }
}

class ContractAccount extends Account {
  private code: Uint8Array;
  private storage: Map<string, bigint>;
  
  constructor(address: string, code: Uint8Array) {
    super(address);
    this.code = code;
    this.storage = new Map();
  }
  
  execute(tx: Transaction): void {
    // Execute contract code
    const evm = new EVM(tx.gasLimit);
    evm.execute(this.code);
  }
}

function deriveAddress(privateKey: string): string {
  // Derive Ethereum address from private key
  // Simplified implementation
  return '0x' + crypto
    .createHash('sha256')
    .update(privateKey)
    .digest('hex')
    .substring(0, 40);
}
\`\`\`

## Gas Systeem

### Gas Concepten
- **Gas Limit**: Maximum gas voor transactie
- **Gas Price**: Prijs per gas unit (in gwei)
- **Base Fee**: Minimum gas price (EIP-1559)
- **Priority Fee**: Tip voor miners/validators

\`\`\`typescript
// EIP-1559 Gas calculation
class GasCalculator {
  private baseFee: bigint;
  private blockGasLimit: bigint;
  
  constructor() {
    this.baseFee = 30_000_000_000n; // 30 gwei
    this.blockGasLimit = 30_000_000n; // 30M gas
  }
  
  // Calculate next base fee
  calculateNextBaseFee(gasUsed: bigint): bigint {
    const targetGasUsed = this.blockGasLimit / 2n;
    const gasUsedDelta = gasUsed - targetGasUsed;
    
    // Base fee adjustment (simplified)
    if (gasUsed > targetGasUsed) {
      // Increase base fee (max 12.5%)
      const increase = (this.baseFee * gasUsedDelta) / targetGasUsed / 8n;
      return this.baseFee + increase;
    } else {
      // Decrease base fee
      const decrease = (this.baseFee * -gasUsedDelta) / targetGasUsed / 8n;
      return this.baseFee - decrease;
    }
  }
  
  // Calculate transaction cost
  calculateTransactionCost(
    gasUsed: bigint,
    maxFeePerGas: bigint,
    maxPriorityFeePerGas: bigint
  ): {
    totalCost: bigint;
    baseFee: bigint;
    priorityFee: bigint;
  } {
    // Effective gas price
    const priorityFee = minBigInt(
      maxPriorityFeePerGas,
      maxFeePerGas - this.baseFee
    );
    
    const effectiveGasPrice = this.baseFee + priorityFee;
    
    return {
      totalCost: gasUsed * effectiveGasPrice,
      baseFee: gasUsed * this.baseFee,
      priorityFee: gasUsed * priorityFee
    };
  }
}

function minBigInt(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

// Common gas costs
const GAS_COSTS = {
  TRANSACTION: 21000n,
  SSTORE_NEW: 20000n,
  SSTORE_UPDATE: 5000n,
  SLOAD: 2100n,
  CALL: 700n,
  CREATE_CONTRACT: 32000n,
  LOG: 375n,
  LOG_TOPIC: 375n,
  LOG_DATA_BYTE: 8n
};
\`\`\`

## Ethereum Tooling Ecosystem

### Development Tools

\`\`\`typescript
// Hardhat configuration example
interface HardhatConfig {
  solidity: {
    version: string;
    settings: CompilerSettings;
  };
  networks: {
    [key: string]: NetworkConfig;
  };
  etherscan: {
    apiKey: string;
  };
}

const hardhatConfig: HardhatConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID",
      accounts: ["PRIVATE-KEY"]
    },
    goerli: {
      url: "https://goerli.infura.io/v3/YOUR-PROJECT-ID",
      accounts: ["PRIVATE-KEY"]
    }
  },
  etherscan: {
    apiKey: "YOUR-ETHERSCAN-API-KEY"
  }
};

// Web3 provider setup
class Web3Provider {
  private provider: any;
  
  constructor(rpcUrl: string) {
    this.provider = new JsonRpcProvider(rpcUrl);
  }
  
  async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }
  
  async getTransactionCount(address: string): Promise<number> {
    return await this.provider.getTransactionCount(address);
  }
  
  async sendTransaction(tx: Transaction): Promise<string> {
    const response = await this.provider.sendTransaction(tx);
    return response.hash;
  }
  
  async waitForTransaction(txHash: string): Promise<TransactionReceipt> {
    return await this.provider.waitForTransaction(txHash);
  }
  
  async getGasPrice(): Promise<bigint> {
    return await this.provider.getGasPrice();
  }
  
  async estimateGas(tx: Transaction): Promise<bigint> {
    return await this.provider.estimateGas(tx);
  }
}

interface NetworkConfig {
  url: string;
  accounts: string[];
  chainId?: number;
  gas?: number;
  gasPrice?: number;
}

interface CompilerSettings {
  optimizer: {
    enabled: boolean;
    runs: number;
  };
}
\`\`\`

### Testing Framework

\`\`\`typescript
// Testing smart contracts
import { expect } from 'chai';

describe('Token Contract', () => {
  let token: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  
  beforeEach(async () => {
    // Deploy contract
    const Token = await ethers.getContractFactory('Token');
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await Token.deploy(1000000);
    await token.deployed();
  });
  
  describe('Deployment', () => {
    it('Should set the right owner', async () => {
      expect(await token.owner()).to.equal(owner.address);
    });
    
    it('Should assign total supply to owner', async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });
  
  describe('Transactions', () => {
    it('Should transfer tokens between accounts', async () => {
      await token.transfer(addr1.address, 50);
      expect(await token.balanceOf(addr1.address)).to.equal(50);
      
      await token.connect(addr1).transfer(addr2.address, 50);
      expect(await token.balanceOf(addr2.address)).to.equal(50);
      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });
    
    it('Should fail if sender doesn't have enough tokens', async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith('Not enough tokens');
      
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});
\`\`\`

## Ethereum Upgrades

### The Merge (PoS Transition)
- Van Proof of Work naar Proof of Stake
- 99.95% energie reductie
- ~12 seconde block times

### Ethereum Roadmap
1. **The Surge**: Sharding voor schaalbaarheid
2. **The Verge**: Verkle trees voor state
3. **The Purge**: State expiry
4. **The Splurge**: Overige verbeteringen

## Layer 2 Solutions

### Types of L2s
\`\`\`typescript
// Rollup implementation concept
interface Rollup {
  sequencer: string;
  stateRoot: string;
  pendingTransactions: Transaction[];
  
  // Submit batch to L1
  submitBatch(transactions: Transaction[]): Promise<string>;
  
  // Verify state transition
  verifyStateTransition(
    oldState: string,
    newState: string,
    proof: string
  ): boolean;
}

class OptimisticRollup implements Rollup {
  sequencer: string;
  stateRoot: string;
  pendingTransactions: Transaction[];
  challengePeriod: number = 7 * 24 * 60 * 60; // 7 days
  
  async submitBatch(transactions: Transaction[]): Promise<string> {
    // Create batch
    const batch = {
      transactions,
      stateRoot: this.calculateNewStateRoot(transactions),
      timestamp: Date.now()
    };
    
    // Submit to L1
    const txHash = await this.submitToL1(batch);
    
    // Start challenge period
    this.startChallengePeriod(batch);
    
    return txHash;
  }
  
  verifyStateTransition(
    oldState: string,
    newState: string,
    proof: string
  ): boolean {
    // Optimistic: assume valid unless challenged
    return true;
  }
  
  private calculateNewStateRoot(transactions: Transaction[]): string {
    // Calculate new state root after applying transactions
    return 'new-state-root';
  }
  
  private async submitToL1(batch: any): Promise<string> {
    // Submit batch to Ethereum L1
    return 'tx-hash';
  }
  
  private startChallengePeriod(batch: any): void {
    // Start challenge window
    console.log(\`Challenge period started for batch\`);
  }
}

class ZKRollup implements Rollup {
  sequencer: string;
  stateRoot: string;
  pendingTransactions: Transaction[];
  
  async submitBatch(transactions: Transaction[]): Promise<string> {
    // Generate ZK proof
    const proof = await this.generateZKProof(transactions);
    
    // Submit with proof
    const batch = {
      transactions,
      stateRoot: this.calculateNewStateRoot(transactions),
      proof,
      timestamp: Date.now()
    };
    
    return await this.submitToL1(batch);
  }
  
  verifyStateTransition(
    oldState: string,
    newState: string,
    proof: string
  ): boolean {
    // Verify ZK proof
    return this.verifyZKProof(oldState, newState, proof);
  }
  
  private async generateZKProof(transactions: Transaction[]): Promise<string> {
    // Generate zero-knowledge proof
    return 'zk-proof';
  }
  
  private verifyZKProof(
    oldState: string,
    newState: string,
    proof: string
  ): boolean {
    // Verify proof mathematically
    return true;
  }
  
  private calculateNewStateRoot(transactions: Transaction[]): string {
    return 'new-state-root';
  }
  
  private async submitToL1(batch: any): Promise<string> {
    return 'tx-hash';
  }
}
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-2-1-1',
      title: 'Bouw een Ethereum Transaction Monitor',
      description: 'Creëer een tool die Ethereum transacties monitort',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Connect met Ethereum node via JSON-RPC',
        'Monitor nieuwe blocks en transacties',
        'Parse transaction data en logs',
        'Implementeer gas price tracking'
      ],
      hints: [
        'Gebruik ethers.js of web3.js',
        'Subscribe op newBlockHeaders event',
        'Decode transaction input data'
      ]
    },
    {
      id: 'assignment-2-1-2',
      title: 'Implementeer een Simple EVM',
      description: 'Bouw een basis EVM interpreter',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer stack operations (PUSH, POP, ADD, etc)',
        'Voeg memory operations toe (MLOAD, MSTORE)',
        'Implementeer storage operations (SLOAD, SSTORE)',
        'Test met simple bytecode programs'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het verschil tussen een EOA en een Contract Account?',
      options: [
        'EOAs kunnen geen ETH vasthouden',
        'Contract Accounts hebben geen private key',
        'EOAs kunnen geen transacties ontvangen',
        'Er is geen verschil'
      ],
      correctAnswer: 1,
      explanation: 'Contract Accounts worden gecontroleerd door code, niet door een private key zoals EOAs.'
    },
    {
      question: 'Waarom heeft Ethereum gas nodig?',
      options: [
        'Om miners te betalen',
        'Om infinite loops te voorkomen',
        'Om de prijs van ETH te verhogen',
        'Voor backwards compatibility met Bitcoin'
      ],
      correctAnswer: 1,
      explanation: 'Gas voorkomt infinite loops en DoS attacks door computational resources te limiteren en te beprijzen.'
    },
    {
      question: 'Wat is de rol van de EVM?',
      options: [
        'ETH mining',
        'Smart contract code uitvoeren',
        'Transacties valideren',
        'Blocks produceren'
      ],
      correctAnswer: 1,
      explanation: 'De EVM (Ethereum Virtual Machine) is verantwoordelijk voor het uitvoeren van smart contract bytecode.'
    }
  ],
  resources: [
    {
      title: 'Ethereum Yellow Paper',
      url: 'https://ethereum.github.io/yellowpaper/paper.pdf',
      type: 'paper',
      description: 'De formele specificatie van Ethereum'
    },
    {
      title: 'Mastering Ethereum',
      url: 'https://github.com/ethereumbook/ethereumbook',
      type: 'book',
      description: 'Uitgebreid boek over Ethereum development'
    },
    {
      title: 'EVM Illustrated',
      url: 'https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf',
      type: 'guide',
      description: 'Visuele guide voor de Ethereum Virtual Machine'
    }
  ],
  projectIdeas: [
    'Bouw een Ethereum block explorer',
    'Creëer een gas price predictor',
    'Implementeer een transaction batching systeem',
    'Ontwikkel een L2 bridge interface'
  ]
};