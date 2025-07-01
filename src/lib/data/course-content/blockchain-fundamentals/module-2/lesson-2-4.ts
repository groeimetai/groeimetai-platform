// Module 2 - Lesson 4: DApps ontwikkelen

export default {
  id: 'lesson-2-4',
  title: 'DApps ontwikkelen',
  duration: '3.5 uur',
  objectives: [
    'Begrijp DApp architectuur en componenten',
    'Leer Web3 integratie met frontend frameworks',
    'Implementeer wallet connectie en transacties',
    'Bouw een complete DApp van smart contract tot UI'
  ],
  content: `
# DApps Ontwikkelen

## Wat is een DApp?

Een **Decentralized Application (DApp)** is een applicatie die draait op een gedecentraliseerd netwerk, meestal met:
- **Smart contracts** als backend
- **Decentralized storage** (IPFS, Arweave)
- **Web3 wallet** integratie
- **No single point of failure**

### DApp vs Traditional App

| Traditional App | DApp |
|----------------|------|
| Centralized server | Blockchain network |
| Database | Smart contract state |
| API authentication | Wallet signature |
| Server hosting | IPFS/Decentralized hosting |

## DApp Architecture

### Complete DApp Stack

\`\`\`typescript
// DApp Architecture Overview
interface DAppStack {
  frontend: {
    framework: 'React' | 'Vue' | 'Angular' | 'Svelte';
    web3Library: 'ethers.js' | 'web3.js' | 'wagmi';
    wallet: 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet';
    stateManagement: 'Redux' | 'Zustand' | 'Context API';
  };
  
  smartContracts: {
    language: 'Solidity' | 'Vyper';
    framework: 'Hardhat' | 'Foundry' | 'Truffle';
    testing: 'Mocha' | 'Jest' | 'Foundry Tests';
    deployment: 'Hardhat Deploy' | 'Foundry Script';
  };
  
  storage: {
    onChain: 'Contract Storage';
    offChain: 'IPFS' | 'Arweave' | 'Filecoin';
    indexing: 'The Graph' | 'Moralis' | 'Custom';
  };
  
  infrastructure: {
    rpc: 'Infura' | 'Alchemy' | 'QuickNode';
    monitoring: 'Tenderly' | 'Defender' | 'Custom';
    analytics: 'Dune' | 'Nansen' | 'Custom';
  };
}
\`\`\`

## Smart Contract Development

### DApp Smart Contract Example

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TodoList {
    struct Task {
        uint256 id;
        string content;
        bool completed;
        uint256 createdAt;
        address creator;
    }
    
    mapping(address => Task[]) private userTasks;
    mapping(address => uint256) private taskCounts;
    
    event TaskCreated(
        address indexed user,
        uint256 indexed taskId,
        string content,
        uint256 timestamp
    );
    
    event TaskCompleted(
        address indexed user,
        uint256 indexed taskId,
        uint256 timestamp
    );
    
    event TaskDeleted(
        address indexed user,
        uint256 indexed taskId
    );
    
    function createTask(string memory _content) public returns (uint256) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 256, "Content too long");
        
        uint256 taskId = taskCounts[msg.sender];
        
        userTasks[msg.sender].push(Task({
            id: taskId,
            content: _content,
            completed: false,
            createdAt: block.timestamp,
            creator: msg.sender
        }));
        
        taskCounts[msg.sender]++;
        
        emit TaskCreated(msg.sender, taskId, _content, block.timestamp);
        
        return taskId;
    }
    
    function toggleTask(uint256 _taskId) public {
        require(_taskId < userTasks[msg.sender].length, "Task does not exist");
        
        Task storage task = userTasks[msg.sender][_taskId];
        task.completed = !task.completed;
        
        if (task.completed) {
            emit TaskCompleted(msg.sender, _taskId, block.timestamp);
        }
    }
    
    function deleteTask(uint256 _taskId) public {
        require(_taskId < userTasks[msg.sender].length, "Task does not exist");
        
        // Move last element to deleted position
        uint256 lastIndex = userTasks[msg.sender].length - 1;
        if (_taskId != lastIndex) {
            userTasks[msg.sender][_taskId] = userTasks[msg.sender][lastIndex];
            userTasks[msg.sender][_taskId].id = _taskId;
        }
        
        userTasks[msg.sender].pop();
        
        emit TaskDeleted(msg.sender, _taskId);
    }
    
    function getTasks() public view returns (Task[] memory) {
        return userTasks[msg.sender];
    }
    
    function getTask(uint256 _taskId) public view returns (Task memory) {
        require(_taskId < userTasks[msg.sender].length, "Task does not exist");
        return userTasks[msg.sender][_taskId];
    }
    
    function getTaskCount() public view returns (uint256) {
        return userTasks[msg.sender].length;
    }
}
\`\`\`

### Deployment Script (Hardhat)

\`\`\`typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TodoList contract...");
  
  const TodoList = await ethers.getContractFactory("TodoList");
  const todoList = await TodoList.deploy();
  
  await todoList.deployed();
  
  console.log("TodoList deployed to:", todoList.address);
  
  // Verify on Etherscan
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await todoList.deployTransaction.wait(6);
    
    console.log("Verifying contract on Etherscan...");
    await run("verify:verify", {
      address: todoList.address,
      constructorArguments: [],
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
\`\`\`

## Frontend Development

### React DApp Setup

\`\`\`typescript
// App.tsx - Main DApp Component
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from './contexts/Web3Context';
import { WalletConnect } from './components/WalletConnect';
import { TodoList } from './components/TodoList';
import TodoListABI from './abis/TodoList.json';

const TODO_LIST_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS!;

function App() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  
  // Initialize Web3
  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);
  
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setSigner(null);
      setContract(null);
    } else {
      setAccount(accounts[0]);
    }
  };
  
  const handleChainChanged = () => {
    window.location.reload();
  };
  
  const connectWallet = async () => {
    if (!provider) return;
    
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const signer = provider.getSigner();
      
      setAccount(accounts[0]);
      setSigner(signer);
      setChainId(network.chainId);
      
      // Initialize contract
      const todoContract = new ethers.Contract(
        TODO_LIST_ADDRESS,
        TodoListABI,
        signer
      );
      setContract(todoContract);
      
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
  
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
  };
  
  return (
    <Web3Provider value={{ provider, signer, account, contract, chainId }}>
      <div className="app">
        <header>
          <h1>Decentralized Todo List</h1>
          <WalletConnect 
            account={account}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
          />
        </header>
        
        <main>
          {account && contract ? (
            <TodoList contract={contract} account={account} />
          ) : (
            <div className="connect-prompt">
              <p>Please connect your wallet to continue</p>
            </div>
          )}
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;
\`\`\`

### Wallet Connection Component

\`\`\`typescript
// components/WalletConnect.tsx
import React from 'react';
import { formatAddress } from '../utils/format';

interface WalletConnectProps {
  account: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  account,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="wallet-connect">
      {account ? (
        <div className="wallet-info">
          <span className="address">{formatAddress(account)}</span>
          <button onClick={onDisconnect} className="btn-disconnect">
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={onConnect} className="btn-connect">
          Connect Wallet
        </button>
      )}
    </div>
  );
};

// utils/format.ts
export const formatAddress = (address: string): string => {
  return \`\${address.slice(0, 6)}...\${address.slice(-4)}\`;
};
\`\`\`

### Todo List Component

\`\`\`typescript
// components/TodoList.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Task } from './Task';

interface TodoListProps {
  contract: ethers.Contract;
  account: string;
}

interface TaskData {
  id: number;
  content: string;
  completed: boolean;
  createdAt: number;
  creator: string;
}

export const TodoList: React.FC<TodoListProps> = ({ contract, account }) => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load tasks on mount
  useEffect(() => {
    loadTasks();
    
    // Listen for events
    contract.on("TaskCreated", handleTaskCreated);
    contract.on("TaskCompleted", handleTaskCompleted);
    contract.on("TaskDeleted", handleTaskDeleted);
    
    return () => {
      contract.removeAllListeners();
    };
  }, [contract, account]);
  
  const loadTasks = async () => {
    try {
      setLoading(true);
      const userTasks = await contract.getTasks();
      setTasks(userTasks.map((task: any) => ({
        id: task.id.toNumber(),
        content: task.content,
        completed: task.completed,
        createdAt: task.createdAt.toNumber(),
        creator: task.creator
      })));
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTaskCreated = (user: string, taskId: ethers.BigNumber, content: string) => {
    if (user.toLowerCase() === account.toLowerCase()) {
      loadTasks();
    }
  };
  
  const handleTaskCompleted = (user: string, taskId: ethers.BigNumber) => {
    if (user.toLowerCase() === account.toLowerCase()) {
      setTasks(prev => prev.map(task => 
        task.id === taskId.toNumber() 
          ? { ...task, completed: !task.completed }
          : task
      ));
    }
  };
  
  const handleTaskDeleted = (user: string, taskId: ethers.BigNumber) => {
    if (user.toLowerCase() === account.toLowerCase()) {
      loadTasks();
    }
  };
  
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.createTask(newTask);
      await tx.wait();
      setNewTask('');
    } catch (error: any) {
      console.error("Failed to create task:", error);
      setError(error.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTask = async (taskId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.toggleTask(taskId);
      await tx.wait();
    } catch (error: any) {
      console.error("Failed to toggle task:", error);
      setError(error.message || "Failed to toggle task");
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTask = async (taskId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
    } catch (error: any) {
      console.error("Failed to delete task:", error);
      setError(error.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="todo-list">
      <form onSubmit={createTask} className="task-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          maxLength={256}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newTask.trim()}>
          Add Task
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      {loading && <div className="loading">Processing transaction...</div>}
      
      <div className="tasks">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Create your first task!</p>
        ) : (
          tasks.map(task => (
            <Task
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
              disabled={loading}
            />
          ))
        )}
      </div>
    </div>
  );
};
\`\`\`

### Web3 Context

\`\`\`typescript
// contexts/Web3Context.tsx
import React, { createContext, useContext } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  contract: ethers.Contract | null;
  chainId: number | null;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  contract: null,
  chainId: null,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{
  value: Web3ContextType;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
\`\`\`

## Advanced DApp Features

### Transaction Management

\`\`\`typescript
// hooks/useTransaction.ts
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  txHash: string | null;
  error: Error | null;
  confirmations: number;
}

export const useTransaction = () => {
  const [state, setState] = useState<TransactionState>({
    status: 'idle',
    txHash: null,
    error: null,
    confirmations: 0,
  });
  
  const execute = useCallback(async (
    txPromise: Promise<ethers.ContractTransaction>,
    confirmations: number = 1
  ) => {
    setState({
      status: 'pending',
      txHash: null,
      error: null,
      confirmations: 0,
    });
    
    try {
      const tx = await txPromise;
      setState(prev => ({ ...prev, txHash: tx.hash }));
      
      const receipt = await tx.wait(confirmations);
      
      setState({
        status: 'success',
        txHash: receipt.transactionHash,
        error: null,
        confirmations: receipt.confirmations,
      });
      
      return receipt;
    } catch (error: any) {
      setState({
        status: 'error',
        txHash: null,
        error,
        confirmations: 0,
      });
      throw error;
    }
  }, []);
  
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      txHash: null,
      error: null,
      confirmations: 0,
    });
  }, []);
  
  return { ...state, execute, reset };
};

// Usage
const { status, txHash, error, execute } = useTransaction();

const handleSubmit = async () => {
  try {
    const receipt = await execute(
      contract.someMethod(param1, param2),
      2 // Wait for 2 confirmations
    );
    console.log("Transaction confirmed:", receipt);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};
\`\`\`

### Event Listening and Indexing

\`\`\`typescript
// services/EventService.ts
import { ethers } from 'ethers';
import { TypedEventFilter } from '../typechain';

export class EventService {
  private contract: ethers.Contract;
  private listeners: Map<string, Function> = new Map();
  
  constructor(contract: ethers.Contract) {
    this.contract = contract;
  }
  
  // Subscribe to events
  subscribe<T>(
    eventFilter: TypedEventFilter<T>,
    callback: (event: T) => void
  ): () => void {
    const listener = (...args: any[]) => {
      const event = args[args.length - 1];
      callback(event);
    };
    
    this.contract.on(eventFilter, listener);
    this.listeners.set(eventFilter.toString(), listener);
    
    // Return unsubscribe function
    return () => {
      this.contract.off(eventFilter, listener);
      this.listeners.delete(eventFilter.toString());
    };
  }
  
  // Query past events
  async queryEvents<T>(
    eventFilter: TypedEventFilter<T>,
    fromBlock: number = 0,
    toBlock: number | 'latest' = 'latest'
  ): Promise<T[]> {
    const events = await this.contract.queryFilter(
      eventFilter,
      fromBlock,
      toBlock
    );
    return events as T[];
  }
  
  // Cleanup
  removeAllListeners(): void {
    this.listeners.forEach((listener, filter) => {
      this.contract.off(filter, listener);
    });
    this.listeners.clear();
  }
}

// Usage with The Graph
interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

export class TheGraphService {
  private endpoint: string;
  
  constructor(subgraphUrl: string) {
    this.endpoint = subgraphUrl;
  }
  
  async query<T>(query: GraphQLQuery): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });
    
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    
    return data.data;
  }
}

// Example query
const getUserTasks = \`
  query GetUserTasks($user: String!) {
    tasks(where: { creator: $user }) {
      id
      content
      completed
      createdAt
      creator
    }
  }
\`;
\`\`\`

### IPFS Integration

\`\`\`typescript
// services/IPFSService.ts
import { create, IPFSHTTPClient } from 'ipfs-http-client';

export class IPFSService {
  private client: IPFSHTTPClient;
  
  constructor() {
    // Use Infura IPFS or local node
    this.client = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: 'Basic ' + Buffer.from(
          process.env.REACT_APP_INFURA_PROJECT_ID + ':' +
          process.env.REACT_APP_INFURA_PROJECT_SECRET
        ).toString('base64')
      }
    });
  }
  
  // Upload JSON data
  async uploadJSON(data: any): Promise<string> {
    const json = JSON.stringify(data);
    const result = await this.client.add(json);
    return result.path; // IPFS hash
  }
  
  // Upload file
  async uploadFile(file: File): Promise<string> {
    const result = await this.client.add(file);
    return result.path;
  }
  
  // Retrieve JSON data
  async getJSON<T>(ipfsHash: string): Promise<T> {
    const stream = this.client.cat(ipfsHash);
    const chunks = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const data = Buffer.concat(chunks).toString();
    return JSON.parse(data);
  }
  
  // Pin content
  async pin(ipfsHash: string): Promise<void> {
    await this.client.pin.add(ipfsHash);
  }
  
  // Get IPFS gateway URL
  getGatewayUrl(ipfsHash: string): string {
    return \`https://ipfs.io/ipfs/\${ipfsHash}\`;
  }
}

// Usage in DApp
const ipfs = new IPFSService();

// Store metadata on IPFS
const metadata = {
  name: "My NFT",
  description: "A unique digital asset",
  image: "ipfs://QmXxx...",
  attributes: [
    { trait_type: "Color", value: "Blue" },
    { trait_type: "Rarity", value: "Rare" }
  ]
};

const ipfsHash = await ipfs.uploadJSON(metadata);
console.log("Metadata stored at:", ipfsHash);
\`\`\`

### Gas Estimation

\`\`\`typescript
// hooks/useGasEstimate.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

interface GasEstimate {
  gasLimit: ethers.BigNumber | null;
  gasPrice: ethers.BigNumber | null;
  maxFeePerGas: ethers.BigNumber | null;
  maxPriorityFeePerGas: ethers.BigNumber | null;
  estimatedCost: ethers.BigNumber | null;
  isEIP1559: boolean;
}

export const useGasEstimate = (
  contract: ethers.Contract | null,
  method: string,
  args: any[]
) => {
  const { provider } = useWeb3();
  const [estimate, setEstimate] = useState<GasEstimate>({
    gasLimit: null,
    gasPrice: null,
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
    estimatedCost: null,
    isEIP1559: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!contract || !provider) return;
    
    const estimateGas = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Estimate gas limit
        const gasLimit = await contract.estimateGas[method](...args);
        
        // Get current gas prices
        const block = await provider.getBlock('latest');
        const isEIP1559 = block.baseFeePerGas !== undefined;
        
        if (isEIP1559) {
          // EIP-1559 gas pricing
          const baseFee = block.baseFeePerGas!;
          const maxPriorityFeePerGas = ethers.utils.parseUnits('2', 'gwei');
          const maxFeePerGas = baseFee.mul(2).add(maxPriorityFeePerGas);
          
          setEstimate({
            gasLimit,
            gasPrice: null,
            maxFeePerGas,
            maxPriorityFeePerGas,
            estimatedCost: gasLimit.mul(maxFeePerGas),
            isEIP1559: true,
          });
        } else {
          // Legacy gas pricing
          const gasPrice = await provider.getGasPrice();
          
          setEstimate({
            gasLimit,
            gasPrice,
            maxFeePerGas: null,
            maxPriorityFeePerGas: null,
            estimatedCost: gasLimit.mul(gasPrice),
            isEIP1559: false,
          });
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    estimateGas();
  }, [contract, provider, method, ...args]);
  
  return { ...estimate, loading, error };
};
\`\`\`

## Testing DApps

### Unit Testing Smart Contracts

\`\`\`typescript
// test/TodoList.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TodoList } from "../typechain";

describe("TodoList", function () {
  let todoList: TodoList;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const TodoListFactory = await ethers.getContractFactory("TodoList");
    todoList = await TodoListFactory.deploy();
    await todoList.deployed();
  });
  
  describe("Task Management", function () {
    it("Should create a new task", async function () {
      const content = "Test task";
      
      await expect(todoList.connect(user1).createTask(content))
        .to.emit(todoList, "TaskCreated")
        .withArgs(user1.address, 0, content, await getBlockTimestamp());
      
      const tasks = await todoList.connect(user1).getTasks();
      expect(tasks.length).to.equal(1);
      expect(tasks[0].content).to.equal(content);
      expect(tasks[0].completed).to.be.false;
    });
    
    it("Should toggle task completion", async function () {
      await todoList.connect(user1).createTask("Test task");
      
      await expect(todoList.connect(user1).toggleTask(0))
        .to.emit(todoList, "TaskCompleted");
      
      const task = await todoList.connect(user1).getTask(0);
      expect(task.completed).to.be.true;
    });
    
    it("Should not allow empty content", async function () {
      await expect(
        todoList.connect(user1).createTask("")
      ).to.be.revertedWith("Content cannot be empty");
    });
    
    it("Should isolate tasks per user", async function () {
      await todoList.connect(user1).createTask("User1 task");
      await todoList.connect(user2).createTask("User2 task");
      
      const user1Tasks = await todoList.connect(user1).getTasks();
      const user2Tasks = await todoList.connect(user2).getTasks();
      
      expect(user1Tasks.length).to.equal(1);
      expect(user2Tasks.length).to.equal(1);
      expect(user1Tasks[0].content).to.equal("User1 task");
      expect(user2Tasks[0].content).to.equal("User2 task");
    });
  });
  
  async function getBlockTimestamp(): Promise<number> {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    return block.timestamp;
  }
});
\`\`\`

### E2E Testing with Cypress

\`\`\`typescript
// cypress/integration/todolist.spec.ts
describe('TodoList DApp', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    
    // Connect wallet
    cy.window().then((win) => {
      win.ethereum = {
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub(),
      };
    });
  });
  
  it('should connect wallet', () => {
    cy.get('[data-cy=connect-wallet]').click();
    cy.get('[data-cy=wallet-address]').should('contain', '0x1234...7890');
  });
  
  it('should create a new task', () => {
    // Connect wallet first
    cy.get('[data-cy=connect-wallet]').click();
    
    // Create task
    cy.get('[data-cy=task-input]').type('Test task from Cypress');
    cy.get('[data-cy=add-task]').click();
    
    // Wait for transaction
    cy.get('[data-cy=loading]').should('be.visible');
    cy.get('[data-cy=loading]').should('not.exist');
    
    // Verify task appears
    cy.get('[data-cy=task-item]').should('contain', 'Test task from Cypress');
  });
  
  it('should toggle task completion', () => {
    cy.get('[data-cy=task-checkbox]').first().click();
    cy.get('[data-cy=task-item]').first().should('have.class', 'completed');
  });
});
\`\`\`

## Deployment

### Multi-chain Deployment

\`\`\`typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!],
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!],
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!],
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY!,
      goerli: process.env.ETHERSCAN_API_KEY!,
      polygon: process.env.POLYGONSCAN_API_KEY!,
      arbitrumOne: process.env.ARBISCAN_API_KEY!,
    },
  },
};

export default config;
\`\`\`

### Frontend Deployment

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy DApp

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Build DApp
        run: |
          cd frontend
          npm run build
        env:
          REACT_APP_CONTRACT_ADDRESS: \${{ secrets.CONTRACT_ADDRESS }}
          REACT_APP_INFURA_ID: \${{ secrets.INFURA_ID }}
          
      - name: Deploy to IPFS
        uses: aquiladev/ipfs-action@v0.3.1
        with:
          path: ./frontend/build
          service: infura
          infuraProjectId: \${{ secrets.INFURA_PROJECT_ID }}
          infuraProjectSecret: \${{ secrets.INFURA_PROJECT_SECRET }}
          
      - name: Update ENS
        run: |
          npx hardhat run scripts/update-ens.ts --network mainnet
        env:
          PRIVATE_KEY: \${{ secrets.PRIVATE_KEY }}
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-2-4-1',
      title: 'Bouw een Complete DApp',
      description: 'Creëer een volledig functionele DApp van smart contract tot UI',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Ontwikkel een smart contract (bijv. een marktplaats)',
        'Implementeer een React frontend met Web3 integratie',
        'Voeg wallet connectie en transactie handling toe',
        'Deploy op testnet en host frontend op IPFS'
      ],
      hints: [
        'Begin met een simpel smart contract',
        'Test eerst lokaal met Hardhat',
        'Gebruik ethers.js voor Web3 integratie'
      ]
    },
    {
      id: 'assignment-2-4-2',
      title: 'Multi-chain DApp',
      description: 'Bouw een DApp die op meerdere chains werkt',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Deploy contract op meerdere testnets',
        'Implementeer chain switching in frontend',
        'Handle verschillende gas tokens en prijzen',
        'Test cross-chain functionaliteit'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het belangrijkste verschil tussen een DApp en een traditionele web app?',
      options: [
        'DApps zijn sneller',
        'DApps hebben geen backend server nodig',
        'DApps zijn goedkoper om te runnen',
        'DApps werken alleen met cryptocurrency'
      ],
      correctAnswer: 1,
      explanation: 'DApps gebruiken smart contracts op een blockchain als backend in plaats van centralized servers, wat ze decentralized en censorship-resistant maakt.'
    },
    {
      question: 'Waarom is event listening belangrijk in DApps?',
      options: [
        'Voor debugging doeleinden',
        'Om real-time updates te krijgen zonder constant de blockchain te pollen',
        'Events zijn verplicht in Solidity',
        'Voor gas optimalisatie'
      ],
      correctAnswer: 1,
      explanation: 'Events stellen DApps in staat om efficiënt real-time updates te ontvangen wanneer state changes optreden, zonder expensive polling.'
    },
    {
      question: 'Wat is de beste manier om grote files op te slaan in een DApp?',
      options: [
        'Direct in het smart contract',
        'In de browser localStorage',
        'Op IPFS met alleen de hash on-chain',
        'In transaction data'
      ],
      correctAnswer: 2,
      explanation: 'IPFS wordt gebruikt voor decentralized storage van grote files, waarbij alleen de content hash on-chain wordt opgeslagen om gas kosten te minimaliseren.'
    }
  ],
  resources: [
    {
      title: 'Scaffold-ETH',
      url: 'https://github.com/scaffold-eth/scaffold-eth-2',
      type: 'framework',
      description: 'Full-stack Ethereum development environment'
    },
    {
      title: 'RainbowKit',
      url: 'https://www.rainbowkit.com/',
      type: 'library',
      description: 'Best-in-class wallet connection library'
    },
    {
      title: 'Alchemy University',
      url: 'https://university.alchemy.com/',
      type: 'course',
      description: 'Comprehensive Web3 development courses'
    }
  ],
  projectIdeas: [
    'Bouw een decentralized social media platform',
    'Creëer een NFT marketplace met bidding',
    'Ontwikkel een DAO governance platform',
    'Maak een DeFi yield aggregator'
  ]
};