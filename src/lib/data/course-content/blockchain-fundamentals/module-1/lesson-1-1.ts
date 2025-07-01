// Module 1 - Lesson 1: Wat is blockchain technologie?

import type { Lesson, Assignment, CodeExample } from '../../../courses';

const lesson: Lesson = {
  id: 'lesson-1-1',
  title: 'Wat is blockchain technologie?',
  duration: '2 uur',
  content: `
# Wat is blockchain technologie?

## Introductie

Blockchain is een revolutionaire technologie die de manier waarop we data opslaan, delen en verifiëren fundamenteel verandert. In deze les duiken we diep in de concepten die blockchain mogelijk maken.

## Wat is een blockchain?

Een blockchain is een **gedistribueerd grootboek** (distributed ledger) dat transacties registreert op een manier die:
- **Transparent** is voor alle deelnemers
- **Onveranderlijk** is na toevoeging
- **Gedecentraliseerd** wordt beheerd
- **Cryptografisch beveiligd** is

### Kernconcepten

1. **Blokken**: Containers van data die transacties bevatten
2. **Chain**: De keten van blokken, verbonden door cryptografische hashes
3. **Nodes**: Computers die een kopie van de blockchain bijhouden
4. **Consensus**: Het mechanisme waarmee nodes het eens worden over de staat

## Geschiedenis van Blockchain

### Timeline
- **1991**: Stuart Haber en W. Scott Stornetta beschrijven cryptografisch beveiligde chain van blokken
- **2008**: Satoshi Nakamoto publiceert Bitcoin whitepaper
- **2009**: Eerste Bitcoin blok wordt gemined
- **2015**: Ethereum lanceert met smart contract functionaliteit
- **2017-2021**: Explosie van blockchain adoptie en innovatie

## Hoe werkt blockchain?

### Stap-voor-stap proces:

1. **Transactie initiatie**: Een gebruiker start een transactie
2. **Broadcasting**: De transactie wordt naar alle nodes gestuurd
3. **Validatie**: Nodes valideren de transactie
4. **Block creatie**: Gevalideerde transacties worden in een blok geplaatst
5. **Consensus**: Nodes bereiken consensus over het nieuwe blok
6. **Block toevoeging**: Het blok wordt aan de chain toegevoegd
7. **Distributie**: De bijgewerkte blockchain wordt naar alle nodes gestuurd

## Code Voorbeeld: Simpele Blockchain

\`\`\`typescript
import crypto from 'crypto';

class Block {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;

  constructor(index: number, data: any, previousHash: string = '') {
    this.index = index;
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty: number): void {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(\`Block mined: \${this.hash}\`);
  }
}

class Blockchain {
  chain: Block[];
  difficulty: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
  }

  createGenesisBlock(): Block {
    return new Block(0, 'Genesis Block', '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock: Block): void {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

// Gebruik voorbeeld
const myBlockchain = new Blockchain();

console.log('Mining block 1...');
myBlockchain.addBlock(new Block(1, { amount: 4 }));

console.log('Mining block 2...');
myBlockchain.addBlock(new Block(2, { amount: 8 }));

console.log('Is blockchain valid?', myBlockchain.isChainValid());
console.log(JSON.stringify(myBlockchain, null, 4));
\`\`\`

## Use Cases voor Blockchain

### 1. Financiële Services
- **Cryptocurrencies**: Bitcoin, Ethereum, etc.
- **Cross-border payments**: Snellere, goedkopere internationale transacties
- **Smart contracts**: Automatische uitvoering van contracten

### 2. Supply Chain Management
- **Tracking**: Real-time tracking van producten
- **Verificatie**: Authenticiteit van producten
- **Transparantie**: Volledige zichtbaarheid in de supply chain

### 3. Healthcare
- **Medical records**: Veilige opslag van patiëntgegevens
- **Drug traceability**: Bestrijding van namaak medicijnen
- **Research data**: Veilig delen van onderzoeksdata

### 4. Digital Identity
- **Self-sovereign identity**: Gebruikers beheren hun eigen identiteit
- **Verificatie**: Snelle en veilige identiteitsverificatie
- **Privacy**: Selective disclosure van persoonlijke informatie

## Blockchain vs Traditionele Databases

| Aspect | Blockchain | Traditionele Database |
|--------|------------|----------------------|
| **Controle** | Gedecentraliseerd | Gecentraliseerd |
| **Toegang** | Open/Permissioned | Restricted |
| **Snelheid** | Langzamer | Sneller |
| **Kosten** | Hoger | Lager |
| **Trust** | Trustless | Requires trust |
| **Immutability** | Ja | Nee |

## Voordelen van Blockchain

1. **Decentralisatie**: Geen single point of failure
2. **Transparantie**: Alle transacties zijn zichtbaar
3. **Onveranderlijkheid**: Data kan niet worden aangepast
4. **Verminderde kosten**: Geen tussenpersonen nodig
5. **Verhoogde efficiëntie**: Automatisering via smart contracts

## Uitdagingen

1. **Schaalbaarheid**: Beperkte transactiesnelheid
2. **Energieverbruik**: Vooral bij Proof of Work
3. **Regulatie**: Onduidelijke wettelijke kaders
4. **Adoptie**: Weerstand tegen verandering
5. **Complexiteit**: Technisch complex voor eindgebruikers
`,
  assignments: [
    {
      id: 'assignment-1-1-1',
      title: 'Implementeer een Basic Blockchain',
      description: 'Bouw je eigen simpele blockchain implementatie',
      difficulty: 'medium' as const,
      type: 'project' as const,
      hints: [
        'Gebruik crypto module voor hashing',
        'Zorg dat elke block een referentie heeft naar de vorige',
        'Implementeer een isValid() methode'
      ]
    },
    {
      id: 'assignment-1-1-2',
      title: 'Blockchain Use Case Analyse',
      description: 'Analyseer een real-world use case voor blockchain',
      difficulty: 'hard' as const,
      type: 'project' as const
    }
  ],
  resources: [
    {
      title: 'Bitcoin Whitepaper',
      url: 'https://bitcoin.org/bitcoin.pdf',
      type: 'paper'
    },
    {
      title: 'Blockchain Demo',
      url: 'https://andersbrownworth.com/blockchain/',
      type: 'interactive'
    },
    {
      title: 'MIT Blockchain Course',
      url: 'https://ocw.mit.edu/courses/sloan-school-of-management/15-s12-blockchain-and-money-fall-2018/',
      type: 'course'
    }
  ]
};

export default lesson;