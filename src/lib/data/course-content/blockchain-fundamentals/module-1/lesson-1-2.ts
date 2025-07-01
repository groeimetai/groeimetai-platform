// Module 1 - Lesson 2: Consensus mechanismen (PoW, PoS, DPoS)

export default {
  id: 'lesson-1-2',
  title: 'Consensus mechanismen (PoW, PoS, DPoS)',
  duration: '3 uur',
  objectives: [
    'Begrijp waarom consensus nodig is in blockchain',
    'Leer hoe Proof of Work (PoW) werkt',
    'Begrijp Proof of Stake (PoS) en zijn voordelen',
    'Ontdek andere consensus mechanismen zoals DPoS',
    'Vergelijk verschillende consensus algoritmes'
  ],
  content: `
# Consensus Mechanismen in Blockchain

## Waarom is Consensus Nodig?

In een gedecentraliseerd systeem zonder centrale autoriteit, moeten nodes een manier hebben om het eens te worden over:
- Welke transacties geldig zijn
- De volgorde van transacties
- Wie het volgende blok mag toevoegen

**Het Byzantine Generals Problem**: Hoe bereik je consensus wanneer sommige deelnemers mogelijk onbetrouwbaar zijn?

## Proof of Work (PoW)

### Concept
Proof of Work vereist dat miners computationeel werk verrichten om een nieuw blok toe te voegen.

### Hoe werkt het?
1. Miners verzamelen transacties in een blok
2. Ze zoeken naar een nonce waarmee de block hash aan bepaalde criteria voldoet
3. De eerste miner die een geldige hash vindt, mag het blok toevoegen
4. Andere nodes verifiëren het werk en accepteren het blok

### Code Voorbeeld: PoW Implementatie

\`\`\`typescript
class ProofOfWork {
  private difficulty: number;
  
  constructor(difficulty: number = 4) {
    this.difficulty = difficulty;
  }
  
  mine(block: Block): void {
    const target = '0'.repeat(this.difficulty);
    let nonce = 0;
    let hash = '';
    
    console.log(\`Mining block with difficulty \${this.difficulty}...\`);
    const startTime = Date.now();
    
    while (hash.substring(0, this.difficulty) !== target) {
      nonce++;
      hash = this.calculateHash(block, nonce);
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(\`Block mined in \${duration} seconds\`);
    console.log(\`Nonce: \${nonce}\`);
    console.log(\`Hash: \${hash}\`);
    
    block.nonce = nonce;
    block.hash = hash;
  }
  
  private calculateHash(block: Block, nonce: number): string {
    const data = block.index + 
                 block.previousHash + 
                 block.timestamp + 
                 JSON.stringify(block.data) + 
                 nonce;
    
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }
  
  adjustDifficulty(lastBlockTime: number, targetTime: number): void {
    if (lastBlockTime < targetTime / 2) {
      this.difficulty++;
      console.log(\`Difficulty increased to \${this.difficulty}\`);
    } else if (lastBlockTime > targetTime * 2) {
      this.difficulty = Math.max(1, this.difficulty - 1);
      console.log(\`Difficulty decreased to \${this.difficulty}\`);
    }
  }
}

// Bitcoin-style mining reward calculation
function calculateMiningReward(blockHeight: number): number {
  const halvingInterval = 210000; // Bitcoin halving elke 210,000 blocks
  const initialReward = 50;
  const halvings = Math.floor(blockHeight / halvingInterval);
  
  return initialReward / Math.pow(2, halvings);
}
\`\`\`

### Voordelen van PoW
- **Bewezen veiligheid**: Bitcoin gebruikt het sinds 2009
- **Simpel te begrijpen**: Computationeel werk = security
- **Sybil-resistant**: Moeilijk om nep-identiteiten te maken

### Nadelen van PoW
- **Energieverbruik**: Enorme hoeveelheden elektriciteit
- **Centralisatie risico**: Mining pools
- **Hardware arms race**: Specialized ASICs

## Proof of Stake (PoS)

### Concept
In plaats van computationeel werk, selecteert PoS validators op basis van hun stake (inzet) in het netwerk.

### Hoe werkt het?
1. Validators zetten tokens in als onderpand (staking)
2. Het protocol selecteert random een validator voor het volgende blok
3. Selectiekans is proportioneel aan de stake
4. Malicious validators verliezen hun stake (slashing)

### Code Voorbeeld: PoS Implementatie

\`\`\`typescript
interface Validator {
  address: string;
  stake: number;
  isActive: boolean;
}

class ProofOfStake {
  private validators: Map<string, Validator>;
  private minimumStake: number;
  
  constructor(minimumStake: number = 1000) {
    this.validators = new Map();
    this.minimumStake = minimumStake;
  }
  
  // Validator registratie
  registerValidator(address: string, stake: number): boolean {
    if (stake < this.minimumStake) {
      console.log(\`Stake too low. Minimum: \${this.minimumStake}\`);
      return false;
    }
    
    this.validators.set(address, {
      address,
      stake,
      isActive: true
    });
    
    console.log(\`Validator \${address} registered with stake: \${stake}\`);
    return true;
  }
  
  // Selecteer validator voor nieuw blok
  selectValidator(): string | null {
    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive && v.stake >= this.minimumStake);
    
    if (activeValidators.length === 0) return null;
    
    // Bereken totale stake
    const totalStake = activeValidators.reduce((sum, v) => sum + v.stake, 0);
    
    // Random selectie gewogen naar stake
    let random = Math.random() * totalStake;
    
    for (const validator of activeValidators) {
      random -= validator.stake;
      if (random <= 0) {
        return validator.address;
      }
    }
    
    return activeValidators[activeValidators.length - 1].address;
  }
  
  // Slash validator voor malicious gedrag
  slashValidator(address: string, percentage: number = 10): void {
    const validator = this.validators.get(address);
    if (!validator) return;
    
    const slashAmount = validator.stake * (percentage / 100);
    validator.stake -= slashAmount;
    
    console.log(\`Validator \${address} slashed \${slashAmount} tokens\`);
    
    if (validator.stake < this.minimumStake) {
      validator.isActive = false;
      console.log(\`Validator \${address} deactivated (stake too low)\`);
    }
  }
  
  // Reward validator voor block productie
  rewardValidator(address: string, reward: number): void {
    const validator = this.validators.get(address);
    if (!validator) return;
    
    validator.stake += reward;
    console.log(\`Validator \${address} rewarded \${reward} tokens\`);
  }
}

// Ethereum 2.0 style validator selection
class ETH2ValidatorSelection {
  private EPOCH_LENGTH = 32; // slots per epoch
  private COMMITTEE_SIZE = 128;
  
  // Pseudo-random selectie met RANDAO
  selectCommittee(
    validators: Validator[], 
    epoch: number, 
    seed: string
  ): Validator[] {
    const shuffled = this.shuffle(validators, seed + epoch);
    return shuffled.slice(0, this.COMMITTEE_SIZE);
  }
  
  private shuffle(array: Validator[], seed: string): Validator[] {
    const arr = [...array];
    const seedHash = crypto.createHash('sha256').update(seed).digest();
    
    for (let i = arr.length - 1; i > 0; i--) {
      const j = seedHash[i % seedHash.length] % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    return arr;
  }
}
\`\`\`

### Voordelen van PoS
- **Energie-efficiënt**: Geen mining hardware nodig
- **Lagere entry barrier**: Geen dure apparatuur
- **Economische security**: Validators hebben skin in the game

### Nadelen van PoS
- **"Rich get richer"**: Grote stakers krijgen meer rewards
- **Nothing at stake**: Theoretisch probleem bij forks
- **Complexer**: Moeilijker te implementeren dan PoW

## Delegated Proof of Stake (DPoS)

### Concept
Token holders stemmen op een beperkt aantal delegates die blocks produceren.

### Implementatie Voorbeeld

\`\`\`typescript
class DelegatedProofOfStake {
  private delegates: Map<string, Delegate>;
  private votes: Map<string, string>; // voter -> delegate
  private maxDelegates: number;
  
  constructor(maxDelegates: number = 21) {
    this.delegates = new Map();
    this.votes = new Map();
    this.maxDelegates = maxDelegates;
  }
  
  // Stem op een delegate
  vote(voter: string, delegate: string, weight: number): void {
    this.votes.set(voter, delegate);
    
    const del = this.delegates.get(delegate) || {
      address: delegate,
      votes: 0,
      isActive: false,
      blocksProduced: 0
    };
    
    del.votes += weight;
    this.delegates.set(delegate, del);
    this.updateActiveDelegates();
  }
  
  // Update actieve delegates op basis van stemmen
  private updateActiveDelegates(): void {
    const sortedDelegates = Array.from(this.delegates.values())
      .sort((a, b) => b.votes - a.votes);
    
    // Reset alle delegates
    this.delegates.forEach(del => del.isActive = false);
    
    // Activeer top N delegates
    sortedDelegates
      .slice(0, this.maxDelegates)
      .forEach(del => del.isActive = true);
  }
  
  // Selecteer volgende block producer (round-robin)
  selectBlockProducer(round: number): string | null {
    const activeDelegates = Array.from(this.delegates.values())
      .filter(d => d.isActive)
      .sort((a, b) => b.votes - a.votes);
    
    if (activeDelegates.length === 0) return null;
    
    const index = round % activeDelegates.length;
    return activeDelegates[index].address;
  }
}

interface Delegate {
  address: string;
  votes: number;
  isActive: boolean;
  blocksProduced: number;
}
\`\`\`

## Andere Consensus Mechanismen

### Practical Byzantine Fault Tolerance (pBFT)
- Gebruikt in permissioned blockchains
- Snelle finality
- Werkt tot 1/3 malicious nodes

### Proof of Authority (PoA)
- Vertrouwde validators
- Zeer snel en efficiënt
- Gebruikt in private/consortium blockchains

### Proof of Elapsed Time (PoET)
- Intel SGX-based
- Random wait times
- Energie-efficiënt

### Proof of Space/Capacity
- Gebruikt hard drive space
- Chia Network
- Meer energie-efficiënt dan PoW

## Vergelijking van Consensus Mechanismen

| Eigenschap | PoW | PoS | DPoS | pBFT |
|-----------|-----|-----|------|------|
| **Energie-efficiëntie** | Laag | Hoog | Hoog | Hoog |
| **Decentralisatie** | Hoog | Medium | Laag | Laag |
| **Throughput** | Laag | Medium | Hoog | Hoog |
| **Finality** | Probabilistic | Probabilistic | Fast | Instant |
| **Security model** | Hash power | Economic | Reputation | Identity |

## Hybrid Consensus

Sommige blockchains gebruiken combinaties:

\`\`\`typescript
// Voorbeeld: PoW + PoS Hybrid
class HybridConsensus {
  private pow: ProofOfWork;
  private pos: ProofOfStake;
  private powWeight: number = 0.5;
  
  constructor() {
    this.pow = new ProofOfWork(4);
    this.pos = new ProofOfStake(1000);
  }
  
  // Selecteer consensus methode op basis van block nummer
  selectConsensusMethod(blockNumber: number): 'pow' | 'pos' {
    // Even blocks: PoW, Odd blocks: PoS
    return blockNumber % 2 === 0 ? 'pow' : 'pos';
  }
  
  // Of gebruik beide voor extra security
  validateBlock(block: Block): boolean {
    const powValid = this.validatePoW(block);
    const posValid = this.validatePoS(block);
    
    // Beide moeten geldig zijn
    return powValid && posValid;
  }
  
  private validatePoW(block: Block): boolean {
    // PoW validatie logic
    return true;
  }
  
  private validatePoS(block: Block): boolean {
    // PoS validatie logic
    return true;
  }
}
\`\`\`

## Toekomst van Consensus

### Trends
1. **Energie-efficiëntie**: Shift van PoW naar PoS/andere
2. **Schaalbaarheid**: Sharding en layer 2 solutions
3. **Interoperabiliteit**: Cross-chain consensus
4. **Quantum-resistance**: Post-quantum cryptografie

### Onderzoeksgebieden
- Verifiable Delay Functions (VDFs)
- Zero-knowledge proof-based consensus
- AI-enhanced consensus mechanisms
`,
  assignments: [
    {
      id: 'assignment-1-2-1',
      title: 'Implementeer Multiple Consensus Mechanisms',
      description: 'Bouw een blockchain die tussen consensus mechanismen kan switchen',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer zowel PoW als PoS klassen',
        'Creëer een blockchain die beide kan gebruiken',
        'Test performance verschillen tussen beide',
        'Implementeer een hybrid consensus systeem'
      ],
      hints: [
        'Gebruik een abstract Consensus interface',
        'Meet tijd en energie (CPU) gebruik',
        'Test met verschillende difficulty/stake parameters'
      ]
    },
    {
      id: 'assignment-1-2-2',
      title: 'Simuleer een 51% Attack',
      description: 'Onderzoek de veiligheid van verschillende consensus mechanismen',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Simuleer een 51% attack op PoW',
        'Simuleer een stake grinding attack op PoS',
        'Vergelijk de kosten van beide attacks',
        'Stel mitigatie strategieën voor'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het hoofddoel van een consensus mechanisme in blockchain?',
      options: [
        'Om transacties te versleutelen',
        'Om overeenstemming te bereiken over de staat van het netwerk',
        'Om gebruikers te authenticeren',
        'Om data te comprimeren'
      ],
      correctAnswer: 1,
      explanation: 'Consensus mechanismen zorgen ervoor dat alle nodes het eens zijn over welke transacties geldig zijn en in welke volgorde ze worden verwerkt.'
    },
    {
      question: 'Welk consensus mechanisme gebruikt het minste energie?',
      options: [
        'Proof of Work',
        'Proof of Stake',
        'Beiden gebruiken evenveel',
        'Het hangt af van de implementatie'
      ],
      correctAnswer: 1,
      explanation: 'Proof of Stake gebruikt significant minder energie omdat het geen computationeel intensieve puzzels hoeft op te lossen.'
    },
    {
      question: 'Wat is "slashing" in Proof of Stake?',
      options: [
        'Het halveren van block rewards',
        'Het verwijderen van oude blocks',
        'Het straffen van malicious validators door hun stake te verminderen',
        'Het verhogen van de difficulty'
      ],
      correctAnswer: 2,
      explanation: 'Slashing is een strafmechanisme waarbij validators een deel van hun stake verliezen als ze malicious gedrag vertonen.'
    }
  ],
  resources: [
    {
      title: 'Ethereum PoS Explained',
      url: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/',
      type: 'documentation',
      description: 'Officiële Ethereum documentatie over Proof of Stake'
    },
    {
      title: 'Bitcoin Mining Explained',
      url: 'https://www.youtube.com/watch?v=bBC-nXj3Ng4',
      type: 'video',
      description: '3Blue1Brown video over Bitcoin mining en PoW'
    },
    {
      title: 'Consensus Compare Tool',
      url: 'https://consensuscompare.com/',
      type: 'tool',
      description: 'Interactieve tool om consensus mechanismen te vergelijken'
    }
  ],
  projectIdeas: [
    'Bouw een PoS blockchain met slashing mechanisme',
    'Creëer een DPoS voting systeem',
    'Implementeer een energie-efficiënte consensus variant',
    'Ontwikkel een consensus switching protocol'
  ]
};