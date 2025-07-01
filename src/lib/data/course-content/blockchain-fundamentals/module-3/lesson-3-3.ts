// Module 3 - Lesson 3: DeFi Protocols & Dutch Projects

export default {
  id: 'lesson-3-3',
  title: 'DeFi Protocols & Dutch Projects',
  duration: '3 uur',
  objectives: [
    'Begrijp de laatste DeFi trends van 2024',
    'Leer yield farming strategieën op Ethereum en BSC',
    'Master liquidity pool mechanics en AMM formules',
    'Implementeer impermanent loss calculators',
    'Ontdek Nederlandse DeFi projecten zoals LTO, GET en Request Network'
  ],
  content: `
# DeFi Protocols & Dutch Projects

## DeFi Trends 2024

### Current DeFi Landscape

**Total Value Locked (TVL)**: $180+ billion across all chains
- Ethereum: 60% dominance
- BNB Chain: 12%
- Arbitrum/Optimism: 15%
- Other L2s & Alt L1s: 13%

### 2024 Key Trends

1. **Liquid Staking Derivatives (LSDs)**
   - Lido, Rocket Pool dominance
   - Restaking protocols (EigenLayer)
   - LSD-fi protocols emerging

2. **Real World Assets (RWAs)**
   - Tokenized treasuries
   - Credit protocols
   - Real estate on-chain

3. **Cross-chain DeFi**
   - Bridge aggregators
   - Cross-chain lending
   - Unified liquidity

4. **Account Abstraction**
   - Smart contract wallets
   - Gasless transactions
   - Social recovery

## Liquidity Pool Mechanics

### Automated Market Makers (AMMs)

\`\`\`typescript
// AMM Constant Product Formula: x * y = k
interface LiquidityPool {
  tokenA: string;
  tokenB: string;
  reserveA: bigint;
  reserveB: bigint;
  totalSupply: bigint;
  fee: number; // basis points (30 = 0.3%)
}

// Calculate output amount for swap
function getAmountOut(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  fee: number = 30 // 0.3%
): bigint {
  const amountInWithFee = amountIn * BigInt(10000 - fee);
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * BigInt(10000) + amountInWithFee;
  return numerator / denominator;
}

// Calculate required input for desired output
function getAmountIn(
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  fee: number = 30
): bigint {
  const numerator = reserveIn * amountOut * BigInt(10000);
  const denominator = (reserveOut - amountOut) * BigInt(10000 - fee);
  return numerator / denominator + 1n;
}

// Price impact calculation
function calculatePriceImpact(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): number {
  const amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
  const spotPrice = Number(reserveOut) / Number(reserveIn);
  const executionPrice = Number(amountOut) / Number(amountIn);
  const impact = (spotPrice - executionPrice) / spotPrice * 100;
  return impact;
}
\`\`\`

## Yield Farming Calculator

### CodeSandbox Component

\`\`\`typescript
import React, { useState, useEffect } from 'react';

interface FarmInfo {
  name: string;
  tvl: number;
  apr: number;
  stakingToken: string;
  rewardToken: string;
  dailyRewards: number;
}

interface YieldCalculation {
  dailyYield: number;
  weeklyYield: number;
  monthlyYield: number;
  yearlyYield: number;
  dailyUSD: number;
  weeklyUSD: number;
  monthlyUSD: number;
  yearlyUSD: number;
}

// Yield Farming Calculator Component
export function YieldFarmingCalculator() {
  const [investment, setInvestment] = useState<number>(1000);
  const [apr, setApr] = useState<number>(25);
  const [compound, setCompound] = useState<boolean>(true);
  const [compoundFrequency, setCompoundFrequency] = useState<number>(365);
  const [result, setResult] = useState<YieldCalculation | null>(null);

  const calculateYield = () => {
    const principal = investment;
    const rate = apr / 100;
    
    if (compound) {
      // Compound interest: A = P(1 + r/n)^(nt)
      const daily = principal * (Math.pow(1 + rate/compoundFrequency, compoundFrequency/365) - 1);
      const weekly = principal * (Math.pow(1 + rate/compoundFrequency, compoundFrequency*7/365) - 1);
      const monthly = principal * (Math.pow(1 + rate/compoundFrequency, compoundFrequency*30/365) - 1);
      const yearly = principal * (Math.pow(1 + rate/compoundFrequency, compoundFrequency) - 1);
      
      setResult({
        dailyYield: (daily / principal) * 100,
        weeklyYield: (weekly / principal) * 100,
        monthlyYield: (monthly / principal) * 100,
        yearlyYield: (yearly / principal) * 100,
        dailyUSD: daily,
        weeklyUSD: weekly,
        monthlyUSD: monthly,
        yearlyUSD: yearly
      });
    } else {
      // Simple interest
      const dailyRate = rate / 365;
      const weeklyRate = rate * 7 / 365;
      const monthlyRate = rate * 30 / 365;
      
      setResult({
        dailyYield: dailyRate * 100,
        weeklyYield: weeklyRate * 100,
        monthlyYield: monthlyRate * 100,
        yearlyYield: rate * 100,
        dailyUSD: principal * dailyRate,
        weeklyUSD: principal * weeklyRate,
        monthlyUSD: principal * monthlyRate,
        yearlyUSD: principal * rate
      });
    }
  };

  useEffect(() => {
    calculateYield();
  }, [investment, apr, compound, compoundFrequency]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Yield Farming Calculator</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Investment Amount ($)</label>
        <input
          type="number"
          value={investment}
          onChange={(e) => setInvestment(Number(e.target.value))}
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>APR (%)</label>
        <input
          type="number"
          value={apr}
          onChange={(e) => setApr(Number(e.target.value))}
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          <input
            type="checkbox"
            checked={compound}
            onChange={(e) => setCompound(e.target.checked)}
          />
          Auto-compound
        </label>
      </div>

      {compound && (
        <div style={{ marginBottom: '15px' }}>
          <label>Compound Frequency</label>
          <select
            value={compoundFrequency}
            onChange={(e) => setCompoundFrequency(Number(e.target.value))}
            style={{ width: '100%', padding: '5px' }}
          >
            <option value={365}>Daily</option>
            <option value={52}>Weekly</option>
            <option value={12}>Monthly</option>
          </select>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h4>Projected Earnings</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '5px' }}>Period</th>
                <th style={{ textAlign: 'right', padding: '5px' }}>Yield %</th>
                <th style={{ textAlign: 'right', padding: '5px' }}>USD Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '5px' }}>Daily</td>
                <td style={{ textAlign: 'right', padding: '5px' }}>{result.dailyYield.toFixed(4)}%</td>
                <td style={{ textAlign: 'right', padding: '5px' }}>${result.dailyUSD.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px' }}>Weekly</td>
                <td style={{ textAlign: 'right', padding: '5px' }}>{result.weeklyYield.toFixed(3)}%</td>
                <td style={{ textAlign: 'right', padding: '5px' }}>${result.weeklyUSD.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px' }}>Monthly</td>
                <td style={{ textAlign: 'right', padding: '5px' }}>{result.monthlyYield.toFixed(2)}%</td>
                <td style={{ textAlign: 'right', padding: '5px' }}>${result.monthlyUSD.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px' }}>Yearly</td>
                <td style={{ textAlign: 'right', padding: '5px' }}>{result.yearlyYield.toFixed(2)}%</td>
                <td style={{ textAlign: 'right', padding: '5px' }}>${result.yearlyUSD.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Impermanent Loss Calculator

### CodeSandbox Component

\`\`\`typescript
export function ImpermanentLossCalculator() {
  const [token1InitialPrice, setToken1InitialPrice] = useState<number>(1000);
  const [token2InitialPrice, setToken2InitialPrice] = useState<number>(1);
  const [token1CurrentPrice, setToken1CurrentPrice] = useState<number>(1500);
  const [token2CurrentPrice, setToken2CurrentPrice] = useState<number>(1);
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [result, setResult] = useState<any>(null);

  const calculateImpermanentLoss = () => {
    // Initial price ratio
    const initialRatio = token1InitialPrice / token2InitialPrice;
    // Current price ratio
    const currentRatio = token1CurrentPrice / token2CurrentPrice;
    // Price change
    const priceChange = currentRatio / initialRatio;
    
    // Impermanent loss formula
    const impermanentLoss = 2 * Math.sqrt(priceChange) / (1 + priceChange) - 1;
    
    // Value calculations
    const halfInvestment = initialInvestment / 2;
    
    // Initial tokens
    const initialToken1Amount = halfInvestment / token1InitialPrice;
    const initialToken2Amount = halfInvestment / token2InitialPrice;
    
    // Pool value if held
    const holdValue = initialToken1Amount * token1CurrentPrice + 
                     initialToken2Amount * token2CurrentPrice;
    
    // Pool value with IL
    const poolValue = initialInvestment * (1 + impermanentLoss);
    
    // Calculate new token amounts in pool
    const k = initialToken1Amount * initialToken2Amount;
    const newToken1Amount = Math.sqrt(k * token2CurrentPrice / token1CurrentPrice);
    const newToken2Amount = Math.sqrt(k * token1CurrentPrice / token2CurrentPrice);
    
    setResult({
      impermanentLossPercent: impermanentLoss * 100,
      impermanentLossUSD: holdValue - poolValue,
      holdValue,
      poolValue,
      initialToken1: initialToken1Amount,
      initialToken2: initialToken2Amount,
      currentToken1: newToken1Amount,
      currentToken2: newToken2Amount,
      priceChange: (priceChange - 1) * 100
    });
  };

  useEffect(() => {
    calculateImpermanentLoss();
  }, [token1InitialPrice, token2InitialPrice, token1CurrentPrice, token2CurrentPrice, initialInvestment]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Impermanent Loss Calculator</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4>Initial Prices</h4>
          <div style={{ marginBottom: '10px' }}>
            <label>Token 1 Price ($)</label>
            <input
              type="number"
              value={token1InitialPrice}
              onChange={(e) => setToken1InitialPrice(Number(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label>Token 2 Price ($)</label>
            <input
              type="number"
              value={token2InitialPrice}
              onChange={(e) => setToken2InitialPrice(Number(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
        </div>

        <div>
          <h4>Current Prices</h4>
          <div style={{ marginBottom: '10px' }}>
            <label>Token 1 Price ($)</label>
            <input
              type="number"
              value={token1CurrentPrice}
              onChange={(e) => setToken1CurrentPrice(Number(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label>Token 2 Price ($)</label>
            <input
              type="number"
              value={token2CurrentPrice}
              onChange={(e) => setToken2CurrentPrice(Number(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Initial Investment ($)</label>
        <input
          type="number"
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(Number(e.target.value))}
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h4>Results</h4>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Price Change:</span>
              <span style={{ color: result.priceChange > 0 ? 'green' : 'red' }}>
                {result.priceChange > 0 ? '+' : ''}{result.priceChange.toFixed(2)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Impermanent Loss:</span>
              <span style={{ color: 'red' }}>{result.impermanentLossPercent.toFixed(2)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Loss in USD:</span>
              <span style={{ color: 'red' }}>-${Math.abs(result.impermanentLossUSD).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Value if HODL:</span>
              <span>${result.holdValue.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Value in Pool:</span>
              <span>${result.poolValue.toFixed(2)}</span>
            </div>
          </div>
          
          <h5 style={{ marginTop: '15px' }}>Token Amounts</h5>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}></th>
                <th style={{ textAlign: 'right' }}>Token 1</th>
                <th style={{ textAlign: 'right' }}>Token 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Initial</td>
                <td style={{ textAlign: 'right' }}>{result.initialToken1.toFixed(4)}</td>
                <td style={{ textAlign: 'right' }}>{result.initialToken2.toFixed(4)}</td>
              </tr>
              <tr>
                <td>Current</td>
                <td style={{ textAlign: 'right' }}>{result.currentToken1.toFixed(4)}</td>
                <td style={{ textAlign: 'right' }}>{result.currentToken2.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Dutch DeFi Projects

### LTO Network

**Overview**: Hybrid blockchain for business processes and decentralized workflows

\`\`\`typescript
// LTO Network Integration Example
import { LTO, Account, Transfer } from '@ltonetwork/lto';

const lto = new LTO('https://nodes.lto.network');

// Create account
const account = lto.account({
  seed: 'your seed phrase here'
});

// Anchor data on blockchain
async function anchorDocument(documentHash: string) {
  const anchor = lto.anchor(documentHash);
  const tx = await anchor.signWith(account).broadcast();
  
  return {
    txId: tx.id,
    timestamp: tx.timestamp,
    hash: documentHash,
    proof: \`https://explorer.lto.network/transaction/\${tx.id}\`
  };
}


\`\`\`

### GET Protocol

**Overview**: Blockchain ticketing solution preventing fraud and scalping

\`\`\`typescript
// GET Protocol NFT Ticket Implementation
interface GETTicket {
  eventId: string;
  ticketId: string;
  owner: string;
  metadata: {
    eventName: string;
    venue: string;
    date: Date;
    seat: string;
    price: number;
  };
  rules: {
    maxResalePrice: number;
    transferable: boolean;
    requiresIdentity: boolean;
  };
}

// Smart contract for GET tickets
contract GETProtocolTickets {
  mapping(uint256 => GETTicket) public tickets;
  mapping(uint256 => bool) public usedTickets;
  
  event TicketIssued(uint256 indexed ticketId, address indexed owner);
  event TicketTransferred(uint256 indexed ticketId, address from, address to);
  
  function mintTicket(
    address to,
    string memory eventId,
    uint256 maxResalePrice
  ) public returns (uint256) {
    uint256 ticketId = totalSupply + 1;
    
    tickets[ticketId] = GETTicket({
      eventId: eventId,
      owner: to,
      maxResalePrice: maxResalePrice,
      transferable: true
    });
    
    _mint(to, ticketId);
    emit TicketIssued(ticketId, to);
    return ticketId;
  }
  
  function transferTicket(uint256 ticketId, address to, uint256 price) public {
    require(ownerOf(ticketId) == msg.sender, "Not owner");
    require(!usedTickets[ticketId], "Already used");
    require(price <= tickets[ticketId].maxResalePrice, "Price too high");
    
    _transfer(msg.sender, to, ticketId);
    emit TicketTransferred(ticketId, msg.sender, to);
  }
}
\`\`\`

### Request Network

**Overview**: Decentralized payment request protocol for invoicing and payments

\`\`\`typescript
// Request Network Integration
import { RequestNetwork, Types, Utils } from '@requestnetwork/request-client.js';
import { providers, Wallet } from 'ethers';

// Initialize Request Network
const requestClient = new RequestNetwork({
  nodeConnectionConfig: {
    baseURL: 'https://api.request.network'
  }
});

// Create payment request
async function createInvoice(
  payerAddress: string,
  amount: string,
  currency: string,
  reason: string
) {
  const request = await requestClient.create({
    requestInfo: {
      currency: {
        type: Types.RequestLogic.CURRENCY.ERC20,
        value: currency,
        network: 'mainnet'
      },
      expectedAmount: amount,
      payee: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: wallet.address
      },
      payer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payerAddress
      }
    },
    contentData: {
      reason: reason,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
  
  return request;
}
\`\`\`

`,
  assignments: [
    {
      id: 'assignment-3-3-1',
      title: 'Build DeFi Yield Aggregator',
      description: 'Creëer een yield aggregator die de beste farming opportunities vindt',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer multi-protocol APY fetching',
        'Bouw auto-compound functionaliteit',
        'Voeg gas optimization toe',
        'Creëer gebruiksvriendelijke interface'
      ],
      hints: [
        'Gebruik multicall voor efficient data fetching',
        'Implementeer slippage protection',
        'Cache APY data voor performance'
      ]
    },
    {
      id: 'assignment-3-3-2',
      title: 'Dutch DeFi Integration',
      description: 'Integreer een Nederlands DeFi project in je applicatie',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Kies LTO, GET of Request Network',
        'Implementeer basis functionaliteit',
        'Bouw een demo use case',
        'Test op testnet'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is impermanent loss in AMMs?',
      options: [
        'Verlies door hoge gas fees',
        'Waardeverlies door price divergence tussen tokens in een pool',
        'Verlies door smart contract bugs',
        'Verlies door liquidatie'
      ],
      correctAnswer: 1,
      explanation: 'Impermanent loss ontstaat wanneer de prijsverhouding tussen tokens in een liquidity pool verandert ten opzichte van het moment van deposit.'
    },
    {
      question: 'Welk Nederlands project focust op blockchain ticketing?',
      options: [
        'LTO Network',
        'Request Network',
        'GET Protocol',
        'Ocean Protocol'
      ],
      correctAnswer: 2,
      explanation: 'GET Protocol is een Nederlands blockchain project dat zich specialiseert in NFT-based ticketing om fraude en scalping tegen te gaan.'
    },
    {
      question: 'Wat is de constant product formula in AMMs?',
      options: [
        'x + y = k',
        'x * y = k',
        'x / y = k',
        'x ^ y = k'
      ],
      correctAnswer: 1,
      explanation: 'De constant product formula x * y = k wordt gebruikt in AMMs zoals Uniswap om de prijs te bepalen bij token swaps.'
    }
  ],
  resources: [
    {
      title: 'DeFi Llama',
      url: 'https://defillama.com/',
      type: 'website',
      description: 'DeFi TVL en protocol analytics'
    },
    {
      title: 'LTO Network Docs',
      url: 'https://docs.lto.network/',
      type: 'documentation',
      description: 'LTO Network developer documentatie'
    },
    {
      title: 'GET Protocol Whitepaper',
      url: 'https://get-protocol.io/whitepaper',
      type: 'whitepaper',
      description: 'GET Protocol technical documentation'
    },
    {
      title: 'Request Network Docs',
      url: 'https://docs.request.network/',
      type: 'documentation',
      description: 'Request Network integration guide'
    }
  ],
  projectIdeas: [
    'Bouw een DeFi dashboard voor Nederlandse projecten',
    'Creëer een impermanent loss hedging tool',
    'Ontwikkel een cross-chain yield optimizer',
    'Maak een NFT ticketing platform met GET Protocol'
  ]
};