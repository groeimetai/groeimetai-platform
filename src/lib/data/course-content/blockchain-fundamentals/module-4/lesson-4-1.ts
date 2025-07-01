import { type Lesson } from '../../../types';

export const lesson41: Lesson = {
  id: 'lesson-4-1',
  title: 'Web3 Development Basics',
  duration: '60 min',
  objectives: [
    'Set up a Hardhat development environment',
    'Write and test smart contracts',
    'Integrate smart contracts with frontend using ethers.js',
    'Connect and interact with MetaMask',
    'Apply gas optimization techniques'
  ],
  sections: [
    {
      id: 'hardhat-setup',
      title: 'Hardhat Project Setup',
      content: `
# Setting Up Your Web3 Development Environment

Hardhat is a comprehensive development environment for Ethereum that provides:
- Local blockchain for testing
- Built-in console and debugging
- Plugin ecosystem
- TypeScript support

## Installation and Project Setup

\`\`\`bash
# Create a new project directory
mkdir my-dapp && cd my-dapp

# Initialize npm project
npm init -y

# Install Hardhat
npm install --save-dev hardhat

# Initialize Hardhat project
npx hardhat init
# Select "Create a TypeScript project"
# Follow the prompts
\`\`\`

## Project Structure

\`\`\`
my-dapp/
├── contracts/        # Smart contracts
├── scripts/         # Deployment scripts
├── test/           # Test files
├── hardhat.config.ts  # Hardhat configuration
└── package.json
\`\`\`

## Hardhat Configuration

\`\`\`typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;
\`\`\`

## Environment Variables

\`\`\`bash
# .env file
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
\`\`\`
      `,
      code: `
// Sample Smart Contract: contracts/SimpleStorage.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 indexed newValue, address indexed setter);
    
    constructor(uint256 _initialValue) {
        storedData = _initialValue;
    }
    
    function set(uint256 _value) public {
        storedData = _value;
        emit DataStored(_value, msg.sender);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
    
    function increment() public {
        storedData++;
        emit DataStored(storedData, msg.sender);
    }
}
      `
    },
    {
      id: 'smart-contract-testing',
      title: 'Smart Contract Testing Basics',
      content: `
# Writing Tests for Smart Contracts

Testing is crucial for smart contract development. Hardhat provides a robust testing framework using Mocha and Chai.

## Basic Test Structure

Tests should cover:
- Deployment
- Function execution
- Access control
- Edge cases
- Gas consumption

## Testing Best Practices

1. **Test Coverage**: Aim for 100% code coverage
2. **Edge Cases**: Test boundary conditions
3. **Negative Testing**: Test failure scenarios
4. **Gas Reporting**: Monitor gas consumption
5. **Event Testing**: Verify event emissions
      `,
      code: `
// test/SimpleStorage.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleStorage } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleStorage", function () {
  let simpleStorage: SimpleStorage;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy contract
    const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorageFactory.deploy(42);
    await simpleStorage.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the initial value correctly", async function () {
      expect(await simpleStorage.get()).to.equal(42);
    });
  });
  
  describe("Storage Operations", function () {
    it("Should store a new value", async function () {
      await simpleStorage.set(100);
      expect(await simpleStorage.get()).to.equal(100);
    });
    
    it("Should increment the value", async function () {
      await simpleStorage.increment();
      expect(await simpleStorage.get()).to.equal(43);
    });
    
    it("Should emit DataStored event", async function () {
      await expect(simpleStorage.set(200))
        .to.emit(simpleStorage, "DataStored")
        .withArgs(200, owner.address);
    });
  });
  
  describe("Gas Consumption", function () {
    it("Should consume reasonable gas for set operation", async function () {
      const tx = await simpleStorage.set(500);
      const receipt = await tx.wait();
      
      expect(receipt?.gasUsed).to.be.lessThan(50000);
    });
  });
});

// Advanced testing example with more complex contract
// contracts/TokenVault.sol
contract TokenVault {
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    function deposit() public payable {
        require(msg.value > 0, "Must deposit something");
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
}

// test/TokenVault.test.ts
describe("TokenVault", function () {
  let vault: TokenVault;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  
  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    const VaultFactory = await ethers.getContractFactory("TokenVault");
    vault = await VaultFactory.deploy();
    await vault.waitForDeployment();
  });
  
  describe("Deposits", function () {
    it("Should accept deposits", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await expect(vault.connect(user1).deposit({ value: depositAmount }))
        .to.emit(vault, "Deposit")
        .withArgs(user1.address, depositAmount);
      
      expect(await vault.balances(user1.address)).to.equal(depositAmount);
      expect(await vault.totalDeposits()).to.equal(depositAmount);
    });
    
    it("Should reject zero deposits", async function () {
      await expect(vault.deposit({ value: 0 }))
        .to.be.revertedWith("Must deposit something");
    });
  });
  
  describe("Withdrawals", function () {
    beforeEach(async function () {
      await vault.connect(user1).deposit({ value: ethers.parseEther("2.0") });
    });
    
    it("Should allow withdrawals", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      await expect(vault.connect(user1).withdraw(withdrawAmount))
        .to.emit(vault, "Withdrawal")
        .withArgs(user1.address, withdrawAmount);
      
      expect(await vault.balances(user1.address)).to.equal(ethers.parseEther("1.0"));
    });
    
    it("Should prevent overdrafts", async function () {
      await expect(vault.connect(user1).withdraw(ethers.parseEther("3.0")))
        .to.be.revertedWith("Insufficient balance");
    });
  });
});
      `
    },
    {
      id: 'frontend-integration',
      title: 'Frontend Integration with ethers.js',
      content: `
# Integrating Smart Contracts with Frontend

Ethers.js is a lightweight library for interacting with Ethereum blockchain from JavaScript/TypeScript applications.

## Setting Up ethers.js

\`\`\`bash
npm install ethers
\`\`\`

## Key Concepts

1. **Provider**: Connection to Ethereum network
2. **Signer**: Wallet that can sign transactions
3. **Contract**: JavaScript representation of smart contract
4. **ABI**: Application Binary Interface for contract interaction
      `,
      code: `
// Frontend integration example
// utils/ethereum.ts
import { ethers, BrowserProvider, Contract } from 'ethers';
import SimpleStorageABI from '../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json';

// Contract addresses (deploy first to get these)
const CONTRACT_ADDRESSES = {
  SimpleStorage: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};

export class EthereumService {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: { [key: string]: Contract } = {};
  
  // Initialize provider and signer
  async connect(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed!');
    }
    
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider and signer
    this.provider = new BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    // Get connected address
    const address = await this.signer.getAddress();
    
    // Initialize contracts
    this.initializeContracts();
    
    return address;
  }
  
  // Initialize contract instances
  private initializeContracts() {
    if (!this.signer) throw new Error('Not connected');
    
    this.contracts.SimpleStorage = new Contract(
      CONTRACT_ADDRESSES.SimpleStorage,
      SimpleStorageABI.abi,
      this.signer
    );
  }
  
  // Get current network
  async getNetwork() {
    if (!this.provider) throw new Error('Not connected');
    const network = await this.provider.getNetwork();
    return network;
  }
  
  // SimpleStorage contract methods
  async getStoredValue(): Promise<number> {
    const contract = this.contracts.SimpleStorage;
    const value = await contract.get();
    return Number(value);
  }
  
  async setStoredValue(newValue: number): Promise<ethers.TransactionReceipt> {
    const contract = this.contracts.SimpleStorage;
    const tx = await contract.set(newValue);
    const receipt = await tx.wait();
    return receipt;
  }
  
  async incrementValue(): Promise<ethers.TransactionReceipt> {
    const contract = this.contracts.SimpleStorage;
    const tx = await contract.increment();
    const receipt = await tx.wait();
    return receipt;
  }
  
  // Listen to events
  listenToDataStored(callback: (value: number, setter: string) => void) {
    const contract = this.contracts.SimpleStorage;
    
    contract.on("DataStored", (value: bigint, setter: string) => {
      callback(Number(value), setter);
    });
  }
  
  // Get transaction details
  async getTransactionDetails(txHash: string) {
    if (!this.provider) throw new Error('Not connected');
    
    const tx = await this.provider.getTransaction(txHash);
    const receipt = await this.provider.getTransactionReceipt(txHash);
    
    return { transaction: tx, receipt };
  }
  
  // Estimate gas
  async estimateGas(method: string, ...args: any[]): Promise<bigint> {
    const contract = this.contracts.SimpleStorage;
    const gasEstimate = await contract[method].estimateGas(...args);
    return gasEstimate;
  }
}

// React component example
// components/SimpleStorageUI.tsx
import React, { useState, useEffect } from 'react';
import { EthereumService } from '../utils/ethereum';

export function SimpleStorageUI() {
  const [ethereum] = useState(new EthereumService());
  const [account, setAccount] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [newValue, setNewValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  
  // Connect wallet
  const connectWallet = async () => {
    try {
      const address = await ethereum.connect();
      setAccount(address);
      await loadCurrentValue();
      
      // Set up event listener
      ethereum.listenToDataStored((value, setter) => {
        console.log(\`New value: \${value} set by \${setter}\`);
        setCurrentValue(value);
      });
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };
  
  // Load current value
  const loadCurrentValue = async () => {
    try {
      const value = await ethereum.getStoredValue();
      setCurrentValue(value);
    } catch (error) {
      console.error('Failed to load value:', error);
    }
  };
  
  // Set new value
  const handleSetValue = async () => {
    if (!newValue) return;
    
    setLoading(true);
    try {
      // Estimate gas first
      const gasEstimate = await ethereum.estimateGas('set', parseInt(newValue));
      console.log(\`Estimated gas: \${gasEstimate.toString()}\`);
      
      // Execute transaction
      const receipt = await ethereum.setStoredValue(parseInt(newValue));
      setTxHash(receipt.hash);
      setNewValue('');
      
      console.log('Transaction receipt:', receipt);
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Increment value
  const handleIncrement = async () => {
    setLoading(true);
    try {
      const receipt = await ethereum.incrementValue();
      setTxHash(receipt.hash);
      console.log('Increment transaction:', receipt);
    } catch (error) {
      console.error('Increment failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Simple Storage DApp</h2>
      
      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Current Value</h3>
            <p className="text-3xl font-mono">{currentValue}</p>
          </div>
          
          <div className="space-y-2">
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter new value"
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleSetValue}
                disabled={loading || !newValue}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Set Value'}
              </button>
              
              <button
                onClick={handleIncrement}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Increment
              </button>
            </div>
          </div>
          
          {txHash && (
            <div className="text-xs">
              <p>Last transaction:</p>
              <a 
                href={\`https://etherscan.io/tx/\${txHash}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
      `
    },
    {
      id: 'metamask-connection',
      title: 'MetaMask Connection',
      content: `
# Working with MetaMask

MetaMask is the most popular Web3 wallet. Understanding how to integrate it properly is crucial for DApp development.

## Key MetaMask Events

1. **accountsChanged**: User switches accounts
2. **chainChanged**: User switches networks
3. **disconnect**: Wallet disconnects

## Security Considerations

- Always check if MetaMask is installed
- Handle network switching gracefully
- Verify the connected network
- Handle transaction rejections
      `,
      code: `
// Advanced MetaMask integration
// utils/metamask.ts
import { ethers } from 'ethers';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}

export class MetaMaskService {
  private listeners: ((state: WalletState) => void)[] = [];
  private state: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  };
  
  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  }
  
  // Connect to MetaMask
  async connect(): Promise<WalletState> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask!');
    }
    
    try {
      // Request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      // Get chain ID
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      // Get balance
      const balance = await this.getBalance(accounts[0]);
      
      // Update state
      this.state = {
        isConnected: true,
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        balance
      };
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Notify listeners
      this.notifyListeners();
      
      return this.state;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected connection');
      }
      throw error;
    }
  }
  
  // Get balance for an address
  private async getBalance(address: string): Promise<string> {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    return ethers.formatEther(balance);
  }
  
  // Set up event listeners
  private setupEventListeners() {
    // Account changed
    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        const balance = await this.getBalance(accounts[0]);
        this.state = {
          ...this.state,
          address: accounts[0],
          balance
        };
        this.notifyListeners();
      }
    });
    
    // Chain changed
    window.ethereum.on('chainChanged', (chainId: string) => {
      this.state = {
        ...this.state,
        chainId: parseInt(chainId, 16)
      };
      this.notifyListeners();
      
      // Reload page on chain change (recommended by MetaMask)
      window.location.reload();
    });
    
    // Disconnect
    window.ethereum.on('disconnect', () => {
      this.disconnect();
    });
  }
  
  // Disconnect wallet
  disconnect() {
    this.state = {
      isConnected: false,
      address: null,
      chainId: null,
      balance: null
    };
    this.notifyListeners();
  }
  
  // Switch to a specific network
  async switchNetwork(chainId: number) {
    const chainIdHex = \`0x\${chainId.toString(16)}\`;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });
    } catch (error: any) {
      // This error code indicates the chain has not been added to MetaMask
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw error;
      }
    }
  }
  
  // Add a new network to MetaMask
  private async addNetwork(chainId: number) {
    const networks: { [key: number]: any } = {
      1: {
        chainName: 'Ethereum Mainnet',
        rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        blockExplorerUrls: ['https://etherscan.io']
      },
      11155111: {
        chainName: 'Sepolia Testnet',
        rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
        nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      },
      137: {
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com'],
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        blockExplorerUrls: ['https://polygonscan.com']
      }
    };
    
    const network = networks[chainId];
    if (!network) {
      throw new Error(\`Unknown network: \${chainId}\`);
    }
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: \`0x\${chainId.toString(16)}\`,
        ...network
      }]
    });
  }
  
  // Subscribe to state changes
  subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  // Get current state
  getState(): WalletState {
    return this.state;
  }
  
  // Request signature
  async signMessage(message: string): Promise<string> {
    if (!this.state.address) {
      throw new Error('Not connected');
    }
    
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, this.state.address]
    });
    
    return signature;
  }
}

// React Hook for MetaMask
// hooks/useMetaMask.ts
import { useEffect, useState } from 'react';
import { MetaMaskService, WalletState } from '../utils/metamask';

const metamaskService = new MetaMaskService();

export function useMetaMask() {
  const [walletState, setWalletState] = useState<WalletState>(
    metamaskService.getState()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = metamaskService.subscribe(setWalletState);
    
    // Check if already connected
    if (metamaskService.isMetaMaskInstalled()) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            metamaskService.connect().catch(console.error);
          }
        });
    }
    
    return unsubscribe;
  }, []);
  
  const connect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await metamaskService.connect();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const disconnect = () => {
    metamaskService.disconnect();
  };
  
  const switchNetwork = async (chainId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await metamaskService.switchNetwork(chainId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const signMessage = async (message: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      return await metamaskService.signMessage(message);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    ...walletState,
    loading,
    error,
    connect,
    disconnect,
    switchNetwork,
    signMessage,
    isMetaMaskInstalled: metamaskService.isMetaMaskInstalled()
  };
}
      `
    },
    {
      id: 'gas-optimization',
      title: 'Gas Optimization Tips',
      content: `
# Gas Optimization Strategies

Gas optimization is crucial for making your DApps economically viable. Here are key strategies to reduce gas costs.

## Solidity Optimization Techniques

1. **Storage Packing**: Pack struct variables
2. **Short-Circuit Evaluation**: Order conditions by likelihood
3. **Storage vs Memory**: Use memory for temporary data
4. **Batch Operations**: Combine multiple operations
5. **Events vs Storage**: Use events for data not needed on-chain
      `,
      code: `
// Gas optimization examples
// contracts/GasOptimized.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract GasOptimizationExamples {
    // Bad: Uses multiple storage slots
    contract Unoptimized {
        uint8 a;    // Slot 0 (uses 1 byte, wastes 31)
        uint256 b;  // Slot 1 (uses 32 bytes)
        uint8 c;    // Slot 2 (uses 1 byte, wastes 31)
        // Total: 3 storage slots
    }
    
    // Good: Packs variables into fewer slots
    contract Optimized {
        uint8 a;    // Slot 0, position 0
        uint8 c;    // Slot 0, position 1
        uint256 b;  // Slot 1
        // Total: 2 storage slots (saves ~20,000 gas)
    }
    
    // Example: Efficient array operations
    contract EfficientArrays {
        uint256[] public numbers;
        
        // Bad: Multiple storage reads/writes
        function sumArrayBad() public view returns (uint256) {
            uint256 sum = 0;
            for (uint256 i = 0; i < numbers.length; i++) {
                sum += numbers[i]; // Storage read on each iteration
            }
            return sum;
        }
        
        // Good: Cache array length and use memory
        function sumArrayGood() public view returns (uint256) {
            uint256[] memory nums = numbers; // Load to memory once
            uint256 length = nums.length;     // Cache length
            uint256 sum = 0;
            
            for (uint256 i = 0; i < length; i++) {
                sum += nums[i]; // Memory read (cheaper)
            }
            return sum;
        }
        
        // Batch operations
        function batchUpdate(uint256[] calldata indices, uint256[] calldata values) 
            external 
        {
            require(indices.length == values.length, "Length mismatch");
            
            for (uint256 i = 0; i < indices.length; i++) {
                numbers[indices[i]] = values[i];
            }
        }
    }
    
    // Example: Using events instead of storage
    contract EventBasedStorage {
        // Bad: Storing all historical data
        struct Transaction {
            address from;
            address to;
            uint256 amount;
            uint256 timestamp;
        }
        Transaction[] public transactions; // Expensive storage
        
        // Good: Use events for historical data
        event TransactionLog(
            address indexed from,
            address indexed to,
            uint256 amount,
            uint256 timestamp
        );
        
        mapping(address => uint256) public balances;
        
        function transfer(address to, uint256 amount) external {
            require(balances[msg.sender] >= amount, "Insufficient balance");
            
            balances[msg.sender] -= amount;
            balances[to] += amount;
            
            // Log the transaction instead of storing
            emit TransactionLog(msg.sender, to, amount, block.timestamp);
        }
    }
    
    // Example: Efficient string operations
    contract StringOptimization {
        // Bad: String concatenation in Solidity
        function concatenateBad(string memory a, string memory b) 
            public 
            pure 
            returns (string memory) 
        {
            return string(abi.encodePacked(a, b)); // Gas intensive
        }
        
        // Good: Use bytes32 for short strings
        function storeNameEfficient(bytes32 name) external {
            // Store as bytes32 instead of string
            // Saves significant gas for strings < 32 bytes
        }
    }
    
    // Example: Minimize external calls
    contract MinimizeExternalCalls {
        IERC20 public token;
        
        // Bad: Multiple external calls
        function transferMultipleBad(
            address[] calldata recipients,
            uint256[] calldata amounts
        ) external {
            for (uint256 i = 0; i < recipients.length; i++) {
                token.transferFrom(msg.sender, recipients[i], amounts[i]);
            }
        }
        
        // Good: Batch transfer in token contract
        function transferMultipleGood(
            address[] calldata recipients,
            uint256[] calldata amounts
        ) external {
            // Implement batch transfer in the token contract itself
            // to avoid multiple external calls
        }
    }
}

// Frontend gas optimization
// utils/gasOptimization.ts
import { ethers } from 'ethers';

export class GasOptimizer {
  private provider: ethers.Provider;
  
  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }
  
  // Get current gas prices
  async getGasPrices() {
    const feeData = await this.provider.getFeeData();
    
    return {
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    };
  }
  
  // Estimate transaction cost
  async estimateTransactionCost(
    contract: ethers.Contract,
    method: string,
    args: any[]
  ): Promise<{
    gasLimit: bigint;
    gasCostWei: bigint;
    gasCostEth: string;
    gasCostUsd: string;
  }> {
    // Estimate gas
    const gasLimit = await contract[method].estimateGas(...args);
    
    // Get current gas price
    const feeData = await this.provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    
    // Calculate cost
    const gasCostWei = gasLimit * gasPrice;
    const gasCostEth = ethers.formatEther(gasCostWei);
    
    // Assume ETH price (in production, fetch from API)
    const ethPrice = 2000; // USD
    const gasCostUsd = (parseFloat(gasCostEth) * ethPrice).toFixed(2);
    
    return {
      gasLimit,
      gasCostWei,
      gasCostEth,
      gasCostUsd
    };
  }
  
  // Optimize transaction parameters
  async optimizeTransaction(
    tx: ethers.TransactionRequest,
    speedPreference: 'slow' | 'medium' | 'fast' = 'medium'
  ): Promise<ethers.TransactionRequest> {
    const feeData = await this.provider.getFeeData();
    
    // Adjust gas price based on preference
    const multipliers = {
      slow: 0.8,
      medium: 1.0,
      fast: 1.2
    };
    
    const multiplier = multipliers[speedPreference];
    
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      // EIP-1559 transaction
      return {
        ...tx,
        maxFeePerGas: BigInt(Math.floor(Number(feeData.maxFeePerGas) * multiplier)),
        maxPriorityFeePerGas: BigInt(Math.floor(Number(feeData.maxPriorityFeePerGas) * multiplier))
      };
    } else if (feeData.gasPrice) {
      // Legacy transaction
      return {
        ...tx,
        gasPrice: BigInt(Math.floor(Number(feeData.gasPrice) * multiplier))
      };
    }
    
    return tx;
  }
  
  // Batch transactions for lower gas
  async batchTransactions(
    transactions: ethers.TransactionRequest[]
  ): Promise<ethers.TransactionRequest> {
    // In practice, this would use a multicall contract
    // Here's a conceptual example
    const batchData = transactions.map(tx => ({
      to: tx.to,
      data: tx.data,
      value: tx.value || 0
    }));
    
    // Encode batch call
    const multicallInterface = new ethers.Interface([
      'function multicall(tuple(address to, bytes data, uint256 value)[] calls) payable'
    ]);
    
    const encodedData = multicallInterface.encodeFunctionData('multicall', [batchData]);
    
    return {
      to: '0xMULTICALL_CONTRACT_ADDRESS',
      data: encodedData,
      value: transactions.reduce((sum, tx) => sum + (tx.value || BigInt(0)), BigInt(0))
    };
  }
}

// React component with gas optimization
export function GasOptimizedTransaction() {
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [speedPreference, setSpeedPreference] = useState<'slow' | 'medium' | 'fast'>('medium');
  
  const estimateGas = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const optimizer = new GasOptimizer(provider);
    
    // Example contract interaction
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const estimate = await optimizer.estimateTransactionCost(
      contract,
      'transfer',
      [recipientAddress, amount]
    );
    
    setGasEstimate(estimate);
  };
  
  const executeOptimizedTransaction = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const optimizer = new GasOptimizer(provider);
    
    // Create transaction
    let tx = await contract.transfer.populateTransaction(recipientAddress, amount);
    
    // Optimize gas parameters
    tx = await optimizer.optimizeTransaction(tx, speedPreference);
    
    // Send transaction
    const response = await signer.sendTransaction(tx);
    await response.wait();
  };
  
  return (
    <div className="gas-optimizer">
      <h3>Gas Optimization</h3>
      
      <div className="speed-selector">
        <label>Transaction Speed:</label>
        <select 
          value={speedPreference} 
          onChange={(e) => setSpeedPreference(e.target.value as any)}
        >
          <option value="slow">Slow (Lower Gas)</option>
          <option value="medium">Medium</option>
          <option value="fast">Fast (Higher Gas)</option>
        </select>
      </div>
      
      {gasEstimate && (
        <div className="gas-estimate">
          <p>Estimated Gas: {gasEstimate.gasLimit.toString()}</p>
          <p>Cost in ETH: {gasEstimate.gasCostEth}</p>
          <p>Cost in USD: ${gasEstimate.gasCostUsd}</p>
        </div>
      )}
      
      <button onClick={estimateGas}>Estimate Gas</button>
      <button onClick={executeOptimizedTransaction}>Send Optimized Transaction</button>
    </div>
  );
}
      `
    }
  ],
  quiz: {
    questions: [
      {
        id: 'q1',
        question: 'Which Hardhat command initializes a new project?',
        options: [
          'hardhat new',
          'npx hardhat init',
          'hardhat create',
          'npm init hardhat'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What is the purpose of the beforeEach hook in smart contract tests?',
        options: [
          'To compile contracts before testing',
          'To deploy fresh contract instances for each test',
          'To connect to the blockchain',
          'To generate test reports'
        ],
        correctAnswer: 1
      },
      {
        id: 'q3',
        question: 'Which ethers.js component signs transactions?',
        options: [
          'Provider',
          'Contract',
          'Signer',
          'Wallet'
        ],
        correctAnswer: 2
      },
      {
        id: 'q4',
        question: 'What MetaMask event fires when a user switches accounts?',
        options: [
          'accountsChanged',
          'userChanged',
          'walletChanged',
          'addressChanged'
        ],
        correctAnswer: 0
      },
      {
        id: 'q5',
        question: 'Which gas optimization technique saves the most gas?',
        options: [
          'Using shorter variable names',
          'Packing struct variables',
          'Adding more comments',
          'Using more functions'
        ],
        correctAnswer: 1
      }
    ]
  }
};