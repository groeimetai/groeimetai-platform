// Module 1 - Lesson 3: Cryptografie basics (hashing, digital signatures)

export default {
  id: 'lesson-1-3',
  title: 'Cryptografie basics (hashing, digital signatures)',
  duration: '2.5 uur',
  objectives: [
    'Begrijp de rol van cryptografie in blockchain',
    'Leer hoe hash functies werken en waarom ze belangrijk zijn',
    'Begrijp public key cryptografie',
    'Leer over digital signatures en verificatie',
    'Implementeer cryptografische primitieven'
  ],
  content: `
# Cryptografie Basics voor Blockchain

## Introductie

Cryptografie is de ruggengraat van blockchain technologie. Het zorgt voor:
- **Integriteit**: Data kan niet ongemerkt worden aangepast
- **Authenticatie**: Identiteit van gebruikers kan worden geverifieerd
- **Non-repudiation**: Transacties kunnen niet worden ontkend
- **Confidentialiteit**: Privacy waar nodig

## Hash Functies

### Wat is een Hash Functie?

Een cryptografische hash functie is een wiskundige functie die:
- **Deterministic** is: Dezelfde input geeft altijd dezelfde output
- **Fixed output** heeft: Altijd dezelfde lengte ongeacht input grootte
- **One-way** is: Onmogelijk om input uit output te berekenen
- **Avalanche effect** heeft: Kleine verandering in input = grote verandering in output
- **Collision resistant** is: Moeilijk om twee inputs met dezelfde hash te vinden

### SHA-256 in Detail

\`\`\`typescript
import crypto from 'crypto';

// Basis hash functie gebruik
function sha256(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

// Demonstreer hash eigenschappen
console.log('Hash eigenschappen demo:');
console.log('========================');

// Deterministic
const hash1 = sha256('Hello Blockchain');
const hash2 = sha256('Hello Blockchain');
console.log(\`Deterministic: \${hash1 === hash2}\`); // true

// Fixed length
console.log(\`Hash of "A": \${sha256('A')}\`);
console.log(\`Length: \${sha256('A').length}\`); // 64 (hex characters)
console.log(\`Hash of long text: \${sha256('A'.repeat(1000))}\`);
console.log(\`Length: \${sha256('A'.repeat(1000)).length}\`); // Ook 64

// Avalanche effect
console.log('\\nAvalanche effect:');
console.log(\`Hash of "Hello": \${sha256('Hello')}\`);
console.log(\`Hash of "hello": \${sha256('hello')}\`);

// Merkle Tree implementatie
class MerkleTree {
  private leaves: string[];
  private layers: string[][];
  
  constructor(data: string[]) {
    this.leaves = data.map(item => sha256(item));
    this.layers = this.buildTree();
  }
  
  private buildTree(): string[][] {
    const layers: string[][] = [this.leaves];
    
    while (layers[layers.length - 1].length > 1) {
      const currentLayer = layers[layers.length - 1];
      const nextLayer: string[] = [];
      
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1] || left; // Duplicate if odd
        nextLayer.push(sha256(left + right));
      }
      
      layers.push(nextLayer);
    }
    
    return layers;
  }
  
  getRoot(): string {
    return this.layers[this.layers.length - 1][0];
  }
  
  getProof(index: number): string[] {
    const proof: string[] = [];
    let currentIndex = index;
    
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }
      
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return proof;
  }
  
  static verify(leaf: string, proof: string[], root: string): boolean {
    let hash = sha256(leaf);
    
    for (const sibling of proof) {
      // Assuming left-to-right ordering
      hash = sha256(hash + sibling);
    }
    
    return hash === root;
  }
}

// Gebruik voorbeeld
const transactions = [
  'Alice->Bob:10',
  'Bob->Charlie:5',
  'Charlie->David:3',
  'David->Eve:2'
];

const merkleTree = new MerkleTree(transactions);
console.log(\`Merkle Root: \${merkleTree.getRoot()}\`);
\`\`\`

## Public Key Cryptografie

### Asymmetrische Encryptie

In tegenstelling tot symmetrische encryptie (één sleutel), gebruikt asymmetrische encryptie een key pair:
- **Private Key**: Geheim, alleen bekend bij eigenaar
- **Public Key**: Openbaar, kan gedeeld worden

### Elliptic Curve Cryptography (ECC)

Blockchain gebruikt vaak ECC vanwege:
- Kleinere key sizes
- Snellere operaties
- Zelfde security niveau

\`\`\`typescript
import { ec as EC } from 'elliptic';

// Bitcoin gebruikt secp256k1 curve
const ec = new EC('secp256k1');

class Wallet {
  private keyPair: EC.KeyPair;
  public address: string;
  
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.address = this.generateAddress();
  }
  
  // Genereer Bitcoin-style address
  private generateAddress(): string {
    const publicKey = this.keyPair.getPublic('hex');
    
    // Simplified Bitcoin address generation
    // Real implementation includes RIPEMD-160 and Base58Check
    const hash = crypto
      .createHash('sha256')
      .update(publicKey)
      .digest();
    
    const address = crypto
      .createHash('sha256')
      .update(hash)
      .digest('hex')
      .substring(0, 40); // Simplified
    
    return '1' + address; // '1' prefix for Bitcoin mainnet
  }
  
  getPublicKey(): string {
    return this.keyPair.getPublic('hex');
  }
  
  // Sign een bericht
  sign(message: string): string {
    const msgHash = sha256(message);
    const signature = this.keyPair.sign(msgHash);
    return signature.toDER('hex');
  }
  
  // Verifieer een signature
  static verify(
    message: string, 
    signature: string, 
    publicKey: string
  ): boolean {
    try {
      const key = ec.keyFromPublic(publicKey, 'hex');
      const msgHash = sha256(message);
      return key.verify(msgHash, signature);
    } catch (error) {
      return false;
    }
  }
}

// Demonstratie
const alice = new Wallet();
const message = 'Transfer 10 BTC to Bob';

console.log(\`Alice's address: \${alice.address}\`);
console.log(\`Alice's public key: \${alice.getPublicKey()}\`);

const signature = alice.sign(message);
console.log(\`Signature: \${signature}\`);

const isValid = Wallet.verify(message, signature, alice.getPublicKey());
console.log(\`Signature valid: \${isValid}\`);

// Test met verkeerd bericht
const tamperedMessage = 'Transfer 100 BTC to Bob';
const isTamperedValid = Wallet.verify(tamperedMessage, signature, alice.getPublicKey());
console.log(\`Tampered message valid: \${isTamperedValid}\`); // false
\`\`\`

## Digital Signatures

### Transaction Signing

In blockchain worden digital signatures gebruikt om:
1. **Ownership** te bewijzen
2. **Authorization** te geven voor transacties
3. **Integrity** te waarborgen

\`\`\`typescript
interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature?: string;
}

class TransactionSigner {
  // Creëer transaction hash
  static createTransactionHash(tx: Transaction): string {
    const data = \`\${tx.from}\${tx.to}\${tx.amount}\${tx.timestamp}\`;
    return sha256(data);
  }
  
  // Sign transaction
  static signTransaction(tx: Transaction, privateKey: EC.KeyPair): Transaction {
    const txHash = this.createTransactionHash(tx);
    const signature = privateKey.sign(txHash);
    
    return {
      ...tx,
      signature: signature.toDER('hex')
    };
  }
  
  // Verify transaction signature
  static verifyTransaction(tx: Transaction): boolean {
    if (!tx.signature) return false;
    
    try {
      // Extract public key from 'from' address (simplified)
      // In reality, you'd need to decode the address properly
      const publicKey = this.recoverPublicKeyFromAddress(tx.from);
      
      const txHash = this.createTransactionHash(tx);
      const key = ec.keyFromPublic(publicKey, 'hex');
      
      return key.verify(txHash, tx.signature);
    } catch (error) {
      return false;
    }
  }
  
  private static recoverPublicKeyFromAddress(address: string): string {
    // Simplified - real implementation would decode address format
    return address;
  }
}

// Multi-signature implementation
class MultiSigWallet {
  private requiredSignatures: number;
  private owners: string[]; // public keys
  
  constructor(owners: string[], requiredSignatures: number) {
    this.owners = owners;
    this.requiredSignatures = requiredSignatures;
  }
  
  // Verifieer multi-sig transaction
  verifyMultiSigTransaction(
    tx: Transaction, 
    signatures: Map<string, string>
  ): boolean {
    let validSignatures = 0;
    const txHash = TransactionSigner.createTransactionHash(tx);
    
    for (const [publicKey, signature] of signatures) {
      if (!this.owners.includes(publicKey)) continue;
      
      try {
        const key = ec.keyFromPublic(publicKey, 'hex');
        if (key.verify(txHash, signature)) {
          validSignatures++;
        }
      } catch (error) {
        continue;
      }
    }
    
    return validSignatures >= this.requiredSignatures;
  }
}
\`\`\`

## Zero-Knowledge Proofs (Basis)

### Concept
Bewijs dat je iets weet zonder te onthullen wat je weet.

\`\`\`typescript
// Simplified Zero-Knowledge Proof voor age verification
class ZKAgeProof {
  private secret: number; // Actual age
  private commitment: string;
  
  constructor(age: number) {
    this.secret = age;
    this.commitment = this.createCommitment(age);
  }
  
  // Create commitment (hash with random nonce)
  private createCommitment(age: number): string {
    const nonce = crypto.randomBytes(32).toString('hex');
    return sha256(\`\${age}:\${nonce}\`);
  }
  
  // Prove age >= minAge without revealing actual age
  proveAgeAbove(minAge: number): ZKProof {
    const isAbove = this.secret >= minAge;
    
    // Simplified proof generation
    // Real ZK proofs use complex math (zk-SNARKs, zk-STARKs)
    const proof: ZKProof = {
      commitment: this.commitment,
      claim: \`age >= \${minAge}\`,
      proof: this.generateProof(isAbove),
      timestamp: Date.now()
    };
    
    return proof;
  }
  
  private generateProof(result: boolean): string {
    // Simplified - real implementation uses cryptographic proofs
    const data = \`\${this.commitment}:\${result}:\${Date.now()}\`;
    return sha256(data);
  }
  
  // Verifier checks proof without knowing the age
  static verifyProof(proof: ZKProof): boolean {
    // Simplified verification
    // Real verification involves mathematical checks
    return proof.proof.length === 64; // SHA-256 output length
  }
}

interface ZKProof {
  commitment: string;
  claim: string;
  proof: string;
  timestamp: number;
}
\`\`\`

## Key Derivation

### Hierarchical Deterministic (HD) Wallets

\`\`\`typescript
import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

class HDWallet {
  private seed: Buffer;
  private masterKey: any;
  
  constructor(mnemonic?: string) {
    // Generate or use provided mnemonic
    this.mnemonic = mnemonic || bip39.generateMnemonic();
    this.seed = bip39.mnemonicToSeedSync(this.mnemonic);
    this.masterKey = bip32.fromSeed(this.seed);
  }
  
  // Derive child keys using BIP44 path
  deriveAddress(index: number): {
    address: string;
    publicKey: string;
    privateKey: string;
  } {
    // m/44'/0'/0'/0/index - Bitcoin mainnet path
    const path = \`m/44'/0'/0'/0/\${index}\`;
    const child = this.masterKey.derivePath(path);
    
    return {
      address: this.pubKeyToAddress(child.publicKey),
      publicKey: child.publicKey.toString('hex'),
      privateKey: child.privateKey?.toString('hex') || ''
    };
  }
  
  private pubKeyToAddress(publicKey: Buffer): string {
    // Simplified Bitcoin address generation
    const hash = crypto
      .createHash('sha256')
      .update(publicKey)
      .digest();
    
    return '1' + hash.toString('hex').substring(0, 33);
  }
  
  // Generate multiple addresses
  generateAddresses(count: number): string[] {
    const addresses: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const derived = this.deriveAddress(i);
      addresses.push(derived.address);
    }
    
    return addresses;
  }
}
\`\`\`

## Cryptografische Veiligheid

### Best Practices

1. **Gebruik bewezen libraries**: Niet zelf crypto implementeren
2. **Random number generation**: Gebruik crypto-safe RNG
3. **Key management**: Veilige opslag van private keys
4. **Side-channel attacks**: Timing attacks voorkomen

\`\`\`typescript
// Veilige random number generation
function secureRandom(bytes: number): Buffer {
  return crypto.randomBytes(bytes);
}

// Constant-time comparison tegen timing attacks
function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}

// Key stretching met PBKDF2
function deriveKeyFromPassword(
  password: string,
  salt: Buffer,
  iterations: number = 100000
): Buffer {
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
}
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-1-3-1',
      title: 'Implementeer een Cryptocurrency Wallet',
      description: 'Bouw een complete wallet met key generation en transaction signing',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer key pair generation met secp256k1',
        'Creëer address generation vanuit public key',
        'Implementeer transaction signing en verification',
        'Voeg HD wallet functionaliteit toe'
      ],
      hints: [
        'Gebruik de elliptic library voor ECC',
        'Implementeer proper address encoding',
        'Test signature verification grondig'
      ]
    },
    {
      id: 'assignment-1-3-2',
      title: 'Bouw een Merkle Tree Verificatie Systeem',
      description: 'Implementeer Merkle trees voor efficiënte data verificatie',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer Merkle tree constructie',
        'Creëer proof generation functionaliteit',
        'Implementeer proof verificatie',
        'Test met grote datasets'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het belangrijkste kenmerk van een cryptografische hash functie?',
      options: [
        'Het kan worden omgekeerd',
        'Het produceert altijd dezelfde output voor dezelfde input',
        'Het comprimeert data',
        'Het versleutelt data'
      ],
      correctAnswer: 1,
      explanation: 'Een hash functie is deterministisch - dezelfde input geeft altijd exact dezelfde hash output.'
    },
    {
      question: 'Waarom gebruikt Bitcoin elliptic curve cryptography in plaats van RSA?',
      options: [
        'ECC is ouder en meer getest',
        'ECC biedt dezelfde security met kleinere keys',
        'RSA werkt niet voor blockchain',
        'ECC is gratis, RSA niet'
      ],
      correctAnswer: 1,
      explanation: 'ECC biedt vergelijkbare security als RSA maar met veel kleinere key sizes, wat efficiënter is voor blockchain.'
    },
    {
      question: 'Wat bewijst een digital signature?',
      options: [
        'Alleen dat het bericht niet is aangepast',
        'Alleen wie het bericht heeft ondertekend',
        'Zowel authenticiteit als integriteit',
        'Dat het bericht versleuteld is'
      ],
      correctAnswer: 2,
      explanation: 'Een digital signature bewijst zowel wie het heeft ondertekend (authenticiteit) als dat het niet is aangepast (integriteit).'
    }
  ],
  resources: [
    {
      title: 'Applied Cryptography',
      url: 'https://www.schneier.com/books/applied-cryptography/',
      type: 'book',
      description: 'Het standaard boek over cryptografie door Bruce Schneier'
    },
    {
      title: 'Cryptography I - Coursera',
      url: 'https://www.coursera.org/learn/crypto',
      type: 'course',
      description: 'Stanford University cryptografie cursus'
    },
    {
      title: 'Bitcoin Developer Guide - Cryptography',
      url: 'https://developer.bitcoin.org/devguide/wallets.html',
      type: 'documentation',
      description: 'Bitcoin cryptografie implementatie details'
    }
  ],
  projectIdeas: [
    'Bouw een multi-signature wallet systeem',
    'Implementeer een blockchain-based PKI systeem',
    'Creëer een zero-knowledge proof authenticatie systeem',
    'Ontwikkel een encrypted messaging DApp'
  ]
};