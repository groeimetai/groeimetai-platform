// Blockchain Fundamentals voor Developers - Course Index
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: LessonInfo[];
}

export interface LessonInfo {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const courseInfo = {
  id: 'blockchain-fundamentals',
  title: 'Blockchain Fundamentals voor Developers',
  description: 'Een complete cursus over blockchain technologie, smart contracts, en Web3 development voor moderne developers.',
  duration: '40 uur',
  level: 'intermediate',
  prerequisites: [
    'Basis JavaScript/TypeScript kennis',
    'Begrip van web development concepten',
    'Basis kennis van cryptografie is een plus'
  ],
  objectives: [
    'Begrijp de fundamenten van blockchain technologie',
    'Ontwikkel smart contracts in Solidity',
    'Bouw Web3 applicaties met moderne tools',
    'Implementeer blockchain oplossingen voor real-world problemen'
  ]
};

export const modules: CourseModule[] = [
  {
    id: 'module-1',
    title: 'Module 1: Blockchain Basics',
    description: 'Leer de fundamenten van blockchain technologie, consensus mechanismen, en cryptografie.',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Wat is blockchain technologie?',
        description: 'Introductie tot blockchain concepten, geschiedenis, en use cases.',
        duration: '2 uur',
        difficulty: 'beginner'
      },
      {
        id: 'lesson-1-2',
        title: 'Consensus mechanismen (PoW, PoS, DPoS)',
        description: 'Diepgaande uitleg van verschillende consensus algoritmes.',
        duration: '3 uur',
        difficulty: 'intermediate'
      },
      {
        id: 'lesson-1-3',
        title: 'Cryptografie basics (hashing, digital signatures)',
        description: 'Cryptografische concepten die blockchain mogelijk maken.',
        duration: '2.5 uur',
        difficulty: 'intermediate'
      },
      {
        id: 'lesson-1-4',
        title: 'Smart contracts introductie',
        description: 'Wat zijn smart contracts en hoe werken ze?',
        duration: '2 uur',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'module-2',
    title: 'Module 2: Ethereum & Smart Contracts',
    description: 'Duik diep in het Ethereum ecosysteem en leer Solidity programmeren.',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Ethereum ecosystem overzicht',
        description: 'EVM, gas, accounts, en de Ethereum architectuur.',
        duration: '2.5 uur',
        difficulty: 'intermediate'
      },
      {
        id: 'lesson-2-2',
        title: 'Solidity programmeren basics',
        description: 'Leer de Solidity programmeertaal vanaf scratch.',
        duration: '4 uur',
        difficulty: 'intermediate'
      },
      {
        id: 'lesson-2-3',
        title: 'Smart contract security',
        description: 'Security best practices en common vulnerabilities.',
        duration: '3 uur',
        difficulty: 'advanced'
      },
      {
        id: 'lesson-2-4',
        title: 'DApps ontwikkelen',
        description: 'Bouw je eerste decentralized application.',
        duration: '3.5 uur',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'module-3',
    title: 'Module 3: Web3 Development',
    description: 'Moderne tools en technieken voor Web3 development.',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Web3.js en Ethers.js',
        description: 'JavaScript libraries voor blockchain interactie.',
        duration: '3 uur',
        difficulty: 'intermediate'
      },
      {
        id: 'lesson-3-2',
        title: 'MetaMask integratie',
        description: 'Wallet connectie en gebruikersauthenticatie.',
        duration: '2 uur',
        difficulty: 'beginner'
      },
      {
        id: 'lesson-3-3',
        title: 'IPFS voor decentralized storage',
        description: 'Decentralized file storage met IPFS.',
        duration: '2.5 uur',
        difficulty: 'intermediate'
      },
      {
        id: 'lesson-3-4',
        title: 'NFTs en token standards',
        description: 'ERC-721, ERC-1155, en NFT development.',
        duration: '3 uur',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'module-4',
    title: 'Module 4: Praktische Toepassingen',
    description: 'Real-world blockchain toepassingen en scaling solutions.',
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Supply chain op blockchain',
        description: 'Implementeer een supply chain tracking systeem.',
        duration: '3 uur',
        difficulty: 'advanced'
      },
      {
        id: 'lesson-4-2',
        title: 'DeFi applicaties bouwen',
        description: 'Bouw je eigen DeFi protocol.',
        duration: '4 uur',
        difficulty: 'advanced'
      },
      {
        id: 'lesson-4-3',
        title: 'Blockchain voor verificatie systemen',
        description: 'Digital identity en credential verificatie.',
        duration: '2.5 uur',
        difficulty: 'intermediate'
      },
      {
        id: 'lesson-4-4',
        title: 'Scaling solutions (Layer 2)',
        description: 'Optimism, Arbitrum, en andere Layer 2 oplossingen.',
        duration: '3 uur',
        difficulty: 'advanced'
      }
    ]
  }
];

// Export individual lessons
export { default as lesson1_1 } from './module-1/lesson-1-1';
export { default as lesson1_2 } from './module-1/lesson-1-2';
export { default as lesson1_3 } from './module-1/lesson-1-3';
export { default as lesson1_4 } from './module-1/lesson-1-4';

export { default as lesson2_1 } from './module-2/lesson-2-1';
export { default as lesson2_2 } from './module-2/lesson-2-2';
export { default as lesson2_3 } from './module-2/lesson-2-3';
export { default as lesson2_4 } from './module-2/lesson-2-4';

export { default as lesson3_1 } from './module-3/lesson-3-1';
export { default as lesson3_2 } from './module-3/lesson-3-2';
export { default as lesson3_3 } from './module-3/lesson-3-3';
export { default as lesson3_4 } from './module-3/lesson-3-4';

export { lesson41 as lesson4_1 } from './module-4/lesson-4-1';
export { lesson4_2 } from './module-4/lesson-4-2';
export { lesson4_3 } from './module-4/lesson-4-3';
export { default as lesson4_4 } from './module-4/lesson-4-4';