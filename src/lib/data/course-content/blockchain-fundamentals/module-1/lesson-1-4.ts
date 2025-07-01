// Module 1 - Lesson 4: Smart contracts introductie

export default {
  id: 'lesson-1-4',
  title: 'Smart contracts introductie',
  duration: '2 uur',
  objectives: [
    'Begrijp wat smart contracts zijn en hoe ze werken',
    'Leer de geschiedenis en evolutie van smart contracts',
    'Identificeer use cases voor smart contracts',
    'Begrijp de basisprincipes van smart contract development'
  ],
  content: `
# Smart Contracts Introductie

## Wat zijn Smart Contracts?

Smart contracts zijn **zelf-uitvoerende contracten** waarbij de voorwaarden direct in code zijn geschreven. Ze draaien op een blockchain en worden automatisch uitgevoerd wanneer vooraf bepaalde condities zijn vervuld.

### Kernkenmerken
- **Autonoom**: Voeren zichzelf uit zonder tussenpersonen
- **Transparent**: Code is openbaar en verifieerbaar
- **Onveranderlijk**: Eenmaal deployed, kan de code niet worden aangepast
- **Deterministisch**: Zelfde input geeft altijd zelfde output

## Geschiedenis

### Nick Szabo (1994)
De term "smart contract" werd bedacht door Nick Szabo, die het vergeleek met een **vending machine**:
- Je stopt geld erin (input)
- Je selecteert een product (functie)
- Machine geeft product (output)
- Geen menselijke tussenkomst nodig

### Evolutie
- **1994**: Nick Szabo conceptualiseert smart contracts
- **2009**: Bitcoin introduceert beperkte scripting mogelijkheden
- **2015**: Ethereum lanceert met Turing-complete smart contracts
- **2020+**: Multi-chain ecosysteem met gespecialiseerde platforms

## Hoe Werken Smart Contracts?

### Basis Architectuur

\`\`\`typescript
// Conceptueel smart contract model
interface SmartContract {
  // State variables
  state: Map<string, any>;
  
  // Constructor
  constructor(...args: any[]): void;
  
  // Functions
  functions: Map<string, Function>;
  
  // Events
  events: EventEmitter;
}

// Simpele smart contract simulator
class SmartContractSimulator {
  private state: Map<string, any>;
  private balance: Map<string, number>;
  
  constructor() {
    this.state = new Map();
    this.balance = new Map();
  }
  
  // Deploy een contract
  deploy(code: string, deployer: string): string {
    const contractAddress = this.generateAddress(deployer);
    
    // Parse en store contract code (simplified)
    this.state.set(contractAddress, {
      code: code,
      storage: new Map(),
      owner: deployer
    });
    
    console.log(\`Contract deployed at: \${contractAddress}\`);
    return contractAddress;
  }
  
  // Roep contract functie aan
  call(
    contractAddress: string, 
    functionName: string, 
    caller: string,
    ...args: any[]
  ): any {
    const contract = this.state.get(contractAddress);
    if (!contract) throw new Error('Contract not found');
    
    // Execute function (highly simplified)
    console.log(\`Calling \${functionName} on \${contractAddress}\`);
    
    // In reality, this would execute EVM bytecode
    return this.executeFunction(contract, functionName, caller, args);
  }
  
  private generateAddress(deployer: string): string {
    // Simplified address generation
    return '0x' + crypto
      .createHash('sha256')
      .update(deployer + Date.now())
      .digest('hex')
      .substring(0, 40);
  }
  
  private executeFunction(
    contract: any, 
    functionName: string, 
    caller: string,
    args: any[]
  ): any {
    // Simplified function execution
    return \`Function \${functionName} executed\`;
  }
}
\`\`\`

## Eerste Smart Contract Voorbeeld

### Simpel Storage Contract

\`\`\`typescript
// Pseudo-code voor een storage contract
class SimpleStorage {
  private storedData: number;
  private owner: string;
  
  constructor(deployer: string) {
    this.storedData = 0;
    this.owner = deployer;
  }
  
  // Store een waarde
  set(value: number, caller: string): void {
    // Alleen owner mag waarde zetten
    if (caller !== this.owner) {
      throw new Error('Only owner can set value');
    }
    
    this.storedData = value;
    console.log(\`Value set to: \${value}\`);
  }
  
  // Haal waarde op
  get(): number {
    return this.storedData;
  }
  
  // Transfer ownership
  transferOwnership(newOwner: string, caller: string): void {
    if (caller !== this.owner) {
      throw new Error('Only owner can transfer ownership');
    }
    
    this.owner = newOwner;
    console.log(\`Ownership transferred to: \${newOwner}\`);
  }
}

// Gebruik
const storage = new SimpleStorage('0xAlice');
storage.set(42, '0xAlice'); // Success
console.log(storage.get()); // 42

try {
  storage.set(100, '0xBob'); // Fail - not owner
} catch (error) {
  console.error(error.message);
}
\`\`\`

### Token Contract Basis

\`\`\`typescript
// ERC-20 style token contract (simplified)
class TokenContract {
  private name: string;
  private symbol: string;
  private totalSupply: number;
  private balances: Map<string, number>;
  private allowances: Map<string, Map<string, number>>;
  
  constructor(name: string, symbol: string, initialSupply: number, creator: string) {
    this.name = name;
    this.symbol = symbol;
    this.totalSupply = initialSupply;
    this.balances = new Map();
    this.allowances = new Map();
    
    // Geef alle tokens aan creator
    this.balances.set(creator, initialSupply);
  }
  
  // Get balance
  balanceOf(account: string): number {
    return this.balances.get(account) || 0;
  }
  
  // Transfer tokens
  transfer(from: string, to: string, amount: number): boolean {
    const senderBalance = this.balanceOf(from);
    
    if (senderBalance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Update balances
    this.balances.set(from, senderBalance - amount);
    this.balances.set(to, this.balanceOf(to) + amount);
    
    // Emit event (in real blockchain)
    this.emitTransferEvent(from, to, amount);
    
    return true;
  }
  
  // Approve spending
  approve(owner: string, spender: string, amount: number): boolean {
    if (!this.allowances.has(owner)) {
      this.allowances.set(owner, new Map());
    }
    
    this.allowances.get(owner)!.set(spender, amount);
    this.emitApprovalEvent(owner, spender, amount);
    
    return true;
  }
  
  // Transfer from (gebruikt allowance)
  transferFrom(spender: string, from: string, to: string, amount: number): boolean {
    const allowance = this.allowances.get(from)?.get(spender) || 0;
    
    if (allowance < amount) {
      throw new Error('Allowance exceeded');
    }
    
    // Update allowance
    this.allowances.get(from)!.set(spender, allowance - amount);
    
    // Do transfer
    return this.transfer(from, to, amount);
  }
  
  private emitTransferEvent(from: string, to: string, amount: number): void {
    console.log(\`Transfer: \${from} -> \${to}: \${amount} \${this.symbol}\`);
  }
  
  private emitApprovalEvent(owner: string, spender: string, amount: number): void {
    console.log(\`Approval: \${owner} approved \${spender} for \${amount} \${this.symbol}\`);
  }
}

// Gebruik voorbeeld
const token = new TokenContract('MyToken', 'MTK', 1000000, '0xAlice');

// Alice transfers naar Bob
token.transfer('0xAlice', '0xBob', 100);
console.log(\`Bob balance: \${token.balanceOf('0xBob')}\`); // 100

// Alice approves Charlie
token.approve('0xAlice', '0xCharlie', 50);

// Charlie gebruikt allowance
token.transferFrom('0xCharlie', '0xAlice', '0xDavid', 30);
console.log(\`David balance: \${token.balanceOf('0xDavid')}\`); // 30
\`\`\`

## Smart Contract Lifecycle

### 1. Development
\`\`\`typescript
// Development fase
interface ContractDevelopment {
  // Write contract code
  writeCode(): string;
  
  // Test locally
  runTests(): TestResults;
  
  // Audit for security
  auditCode(): AuditReport;
}
\`\`\`

### 2. Deployment
\`\`\`typescript
// Deployment process
class ContractDeployment {
  async deploy(
    contractCode: string,
    network: string,
    gasPrice: number
  ): Promise<string> {
    // Compile contract
    const bytecode = await this.compile(contractCode);
    
    // Estimate gas
    const gasEstimate = await this.estimateGas(bytecode);
    
    // Send deployment transaction
    const txHash = await this.sendTransaction({
      data: bytecode,
      gas: gasEstimate,
      gasPrice: gasPrice
    });
    
    // Wait for confirmation
    const receipt = await this.waitForReceipt(txHash);
    
    return receipt.contractAddress;
  }
  
  private async compile(code: string): Promise<string> {
    // Compile to bytecode
    return '0x608060405234801561001057600080fd5b50...'; // Example
  }
  
  private async estimateGas(bytecode: string): Promise<number> {
    // Estimate gas needed
    return 1000000; // Example
  }
  
  private async sendTransaction(tx: any): Promise<string> {
    // Send to blockchain
    return '0xtransactionhash...';
  }
  
  private async waitForReceipt(txHash: string): Promise<any> {
    // Wait for mining
    return { contractAddress: '0xcontractaddress...' };
  }
}
\`\`\`

### 3. Interaction
\`\`\`typescript
// Interacting with deployed contract
class ContractInteraction {
  private contractAddress: string;
  private abi: any[]; // Contract interface
  
  constructor(address: string, abi: any[]) {
    this.contractAddress = address;
    this.abi = abi;
  }
  
  // Read contract state
  async read(functionName: string, ...args: any[]): Promise<any> {
    // No transaction needed for read
    return await this.callFunction(functionName, args);
  }
  
  // Write to contract
  async write(
    functionName: string, 
    signer: string,
    ...args: any[]
  ): Promise<string> {
    // Creates transaction
    const tx = {
      to: this.contractAddress,
      from: signer,
      data: this.encodeFunctionCall(functionName, args)
    };
    
    return await this.sendTransaction(tx);
  }
  
  private async callFunction(name: string, args: any[]): Promise<any> {
    // Simulate function call
    return 'result';
  }
  
  private encodeFunctionCall(name: string, args: any[]): string {
    // Encode function call as hex data
    return '0xfunctiondata...';
  }
  
  private async sendTransaction(tx: any): Promise<string> {
    // Send transaction to blockchain
    return '0xtxhash...';
  }
}
\`\`\`

## Gas en Execution Costs

### Gas Concept
- Elke operatie kost **gas**
- Gas voorkomt infinite loops
- Gebruikers betalen gas fees

\`\`\`typescript
// Gas calculation example
class GasCalculator {
  private static GAS_COSTS = {
    STORAGE_WRITE: 20000,
    STORAGE_READ: 200,
    ADDITION: 3,
    MULTIPLICATION: 5,
    COMPARISON: 3,
    TRANSFER: 21000
  };
  
  static calculateGas(operations: string[]): number {
    let totalGas = 0;
    
    for (const op of operations) {
      totalGas += this.GAS_COSTS[op] || 0;
    }
    
    return totalGas;
  }
  
  static estimateTransactionCost(
    gasUsed: number,
    gasPrice: number // in gwei
  ): number {
    // Convert to ETH
    return (gasUsed * gasPrice) / 1e9;
  }
}

// Example gebruik
const operations = ['STORAGE_WRITE', 'ADDITION', 'COMPARISON', 'TRANSFER'];
const gasUsed = GasCalculator.calculateGas(operations);
const costInETH = GasCalculator.estimateTransactionCost(gasUsed, 50); // 50 gwei

console.log(\`Gas used: \${gasUsed}\`);
console.log(\`Cost: \${costInETH} ETH\`);
\`\`\`

## Common Smart Contract Patterns

### 1. Ownership Pattern
\`\`\`typescript
abstract class Ownable {
  protected owner: string;
  
  constructor(initialOwner: string) {
    this.owner = initialOwner;
  }
  
  modifier onlyOwner(caller: string): void {
    if (caller !== this.owner) {
      throw new Error('Caller is not the owner');
    }
  }
  
  transferOwnership(newOwner: string, caller: string): void {
    this.onlyOwner(caller);
    this.owner = newOwner;
  }
}
\`\`\`

### 2. Pausable Pattern
\`\`\`typescript
abstract class Pausable extends Ownable {
  private paused: boolean = false;
  
  modifier whenNotPaused(): void {
    if (this.paused) {
      throw new Error('Contract is paused');
    }
  }
  
  pause(caller: string): void {
    this.onlyOwner(caller);
    this.paused = true;
  }
  
  unpause(caller: string): void {
    this.onlyOwner(caller);
    this.paused = false;
  }
}
\`\`\`

### 3. Escrow Pattern
\`\`\`typescript
class Escrow {
  private depositor: string;
  private beneficiary: string;
  private arbiter: string;
  private amount: number;
  private released: boolean = false;
  
  constructor(
    depositor: string,
    beneficiary: string,
    arbiter: string,
    amount: number
  ) {
    this.depositor = depositor;
    this.beneficiary = beneficiary;
    this.arbiter = arbiter;
    this.amount = amount;
  }
  
  release(caller: string): void {
    if (caller !== this.arbiter) {
      throw new Error('Only arbiter can release funds');
    }
    
    if (this.released) {
      throw new Error('Funds already released');
    }
    
    this.released = true;
    // Transfer funds to beneficiary
    console.log(\`Released \${this.amount} to \${this.beneficiary}\`);
  }
  
  refund(caller: string): void {
    if (caller !== this.arbiter) {
      throw new Error('Only arbiter can refund');
    }
    
    if (this.released) {
      throw new Error('Funds already released');
    }
    
    this.released = true;
    // Return funds to depositor
    console.log(\`Refunded \${this.amount} to \${this.depositor}\`);
  }
}
\`\`\`

## Smart Contract Security Basics

### Common Vulnerabilities
1. **Reentrancy**: Contract roept externe contract aan die terugkomt
2. **Integer Overflow/Underflow**: Arithmetic errors
3. **Access Control**: Onvoldoende permissie checks
4. **Race Conditions**: Front-running attacks

### Security Best Practices
\`\`\`typescript
// Reentrancy guard
class ReentrancyGuard {
  private locked: boolean = false;
  
  modifier nonReentrant(): void {
    if (this.locked) {
      throw new Error('Reentrant call');
    }
    this.locked = true;
    
    // Function executes here
    
    this.locked = false;
  }
}

// Safe math operations
class SafeMath {
  static add(a: number, b: number): number {
    const c = a + b;
    if (c < a) throw new Error('Addition overflow');
    return c;
  }
  
  static sub(a: number, b: number): number {
    if (b > a) throw new Error('Subtraction underflow');
    return a - b;
  }
  
  static mul(a: number, b: number): number {
    if (a === 0) return 0;
    const c = a * b;
    if (c / a !== b) throw new Error('Multiplication overflow');
    return c;
  }
}
\`\`\`

## Toekomst van Smart Contracts

### Trends
1. **Cross-chain contracts**: Interoperabiliteit tussen blockchains
2. **Upgradeable contracts**: Proxy patterns voor updates
3. **Zero-knowledge contracts**: Privacy-preserving execution
4. **AI-enhanced contracts**: Machine learning integratie

### Nieuwe Platforms
- **Ethereum 2.0**: Verbeterde schaalbaarheid
- **Polkadot**: Parachain smart contracts
- **Cardano**: Functional programming approach
- **Solana**: High-performance contracts
`,
  assignments: [
    {
      id: 'assignment-1-4-1',
      title: 'Implementeer een Voting Smart Contract',
      description: 'Bouw een stemming systeem met smart contracts',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Creëer een contract voor proposals',
        'Implementeer stemming functionaliteit',
        'Voeg tijd-gebaseerde voting periods toe',
        'Implementeer vote delegation'
      ],
      hints: [
        'Track unique voters om dubbel stemmen te voorkomen',
        'Gebruik timestamps voor voting deadlines',
        'Overweeg verschillende stemgewichten'
      ]
    },
    {
      id: 'assignment-1-4-2',
      title: 'Bouw een NFT Marketplace Contract',
      description: 'Creëer een simpele NFT marketplace',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer NFT listing functionaliteit',
        'Voeg buy/sell mechanismen toe',
        'Implementeer royalty distribution',
        'Voeg auction functionaliteit toe'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het belangrijkste verschil tussen smart contracts en traditionele contracten?',
      options: [
        'Smart contracts zijn goedkoper',
        'Smart contracts voeren zichzelf automatisch uit',
        'Smart contracts zijn juridisch bindend',
        'Smart contracts zijn sneller te schrijven'
      ],
      correctAnswer: 1,
      explanation: 'Smart contracts zijn self-executing - ze voeren automatisch uit wanneer voorwaarden zijn vervuld, zonder menselijke tussenkomst.'
    },
    {
      question: 'Waarom zijn smart contracts "immutable" (onveranderlijk)?',
      options: [
        'Omdat ze in steen zijn gebeiteld',
        'Omdat blockchain data niet kan worden gewijzigd',
        'Omdat niemand de code begrijpt',
        'Omdat ze te duur zijn om te veranderen'
      ],
      correctAnswer: 1,
      explanation: 'Eenmaal gedeployed op de blockchain, kan smart contract code niet worden gewijzigd vanwege de immutable nature van blockchain.'
    },
    {
      question: 'Wat is "gas" in de context van smart contracts?',
      options: [
        'Brandstof voor mining computers',
        'Een type cryptocurrency',
        'Betaling voor computational resources',
        'Een fout in de code'
      ],
      correctAnswer: 2,
      explanation: 'Gas is de fee die gebruikers betalen voor de computational resources die nodig zijn om smart contract operaties uit te voeren.'
    }
  ],
  resources: [
    {
      title: 'Ethereum Smart Contract Best Practices',
      url: 'https://consensys.github.io/smart-contract-best-practices/',
      type: 'guide',
      description: 'Uitgebreide guide voor veilige smart contract development'
    },
    {
      title: 'CryptoZombies',
      url: 'https://cryptozombies.io/',
      type: 'interactive',
      description: 'Leer smart contracts bouwen door een game te maken'
    },
    {
      title: 'OpenZeppelin Contracts',
      url: 'https://docs.openzeppelin.com/contracts/',
      type: 'library',
      description: 'Veilige, herbruikbare smart contract componenten'
    }
  ],
  projectIdeas: [
    'Bouw een crowdfunding platform smart contract',
    'Creëer een decentralized exchange (DEX)',
    'Implementeer een DAO governance systeem',
    'Ontwikkel een supply chain tracking contract'
  ]
};