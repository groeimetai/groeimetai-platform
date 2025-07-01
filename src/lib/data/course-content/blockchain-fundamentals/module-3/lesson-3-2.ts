// Module 3 - Lesson 2: MetaMask integratie

export default {
  id: 'lesson-3-2',
  title: 'MetaMask integratie',
  duration: '2 uur',
  objectives: [
    'Begrijp wallet connectie flows',
    'Implementeer MetaMask integratie',
    'Handle verschillende wallet states',
    'Werk met meerdere wallets en chains'
  ],
  content: `
# MetaMask Integratie

## Introductie tot Web3 Wallets

MetaMask is de meest gebruikte browser wallet voor Ethereum. Het fungeert als:
- **Key Management**: Veilige opslag van private keys
- **Transaction Signing**: Gebruikers autoriseren transacties
- **Network Gateway**: Connectie met verschillende blockchains
- **dApp Browser**: Interface tussen gebruikers en dApps

### Wallet Landscape

Populaire wallets:
- **MetaMask**: Browser extension & mobile
- **WalletConnect**: Protocol voor mobile wallets
- **Coinbase Wallet**: Integrated met Coinbase
- **Rainbow**: User-friendly mobile wallet
- **Argent**: Smart contract wallet
- **Gnosis Safe**: Multi-sig wallet

## MetaMask API

### Window.ethereum Object

\`\`\`typescript
// Check if MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask is installed!');
} else {
  console.log('Please install MetaMask');
}

// MetaMask injects the ethereum object
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
    selectedAddress: string | null;
    chainId: string | null;
  };
}

// Detect provider
function getProvider(): any {
  if ('ethereum' in window) {
    const provider = window.ethereum;
    
    // Some wallets inject multiple providers
    if (provider.providers?.length) {
      // Check for MetaMask
      const metaMaskProvider = provider.providers.find(
        (p: any) => p.isMetaMask
      );
      if (metaMaskProvider) return metaMaskProvider;
      
      // Return first provider
      return provider.providers[0];
    }
    
    return provider;
  }
  
  return null;
}
\`\`\`

## Basic Connection Flow

### Connect Wallet Implementation

\`\`\`typescript
// Complete wallet connection implementation
class WalletConnector {
  private provider: any;
  private accounts: string[] = [];
  private chainId: string | null = null;
  private connected: boolean = false;
  
  constructor() {
    this.provider = getProvider();
    
    if (this.provider) {
      this.setupEventListeners();
      this.checkConnection();
    }
  }
  
  // Setup event listeners
  private setupEventListeners(): void {
    this.provider.on('accountsChanged', this.handleAccountsChanged.bind(this));
    this.provider.on('chainChanged', this.handleChainChanged.bind(this));
    this.provider.on('connect', this.handleConnect.bind(this));
    this.provider.on('disconnect', this.handleDisconnect.bind(this));
  }
  
  // Check if already connected
  private async checkConnection(): Promise<void> {
    try {
      const accounts = await this.provider.request({
        method: 'eth_accounts'
      });
      
      if (accounts.length > 0) {
        this.accounts = accounts;
        this.chainId = await this.provider.request({
          method: 'eth_chainId'
        });
        this.connected = true;
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
  }
  
  // Connect wallet
  async connect(): Promise<{
    accounts: string[];
    chainId: string;
  }> {
    if (!this.provider) {
      throw new Error('MetaMask not installed');
    }
    
    try {
      // Request accounts (triggers MetaMask popup)
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      });
      
      // Get chain ID
      const chainId = await this.provider.request({
        method: 'eth_chainId'
      });
      
      this.accounts = accounts;
      this.chainId = chainId;
      this.connected = true;
      
      return { accounts, chainId };
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected connection');
      }
      throw error;
    }
  }
  
  // Disconnect (only clears local state)
  disconnect(): void {
    this.accounts = [];
    this.connected = false;
  }
  
  // Event handlers
  private handleAccountsChanged(accounts: string[]): void {
    this.accounts = accounts;
    
    if (accounts.length === 0) {
      this.connected = false;
      console.log('Wallet disconnected');
    } else {
      console.log('Active account changed:', accounts[0]);
    }
  }
  
  private handleChainChanged(chainId: string): void {
    this.chainId = chainId;
    console.log('Chain changed to:', chainId);
    
    // Reload is recommended by MetaMask
    window.location.reload();
  }
  
  private handleConnect(connectInfo: { chainId: string }): void {
    this.chainId = connectInfo.chainId;
    this.connected = true;
    console.log('Wallet connected to chain:', connectInfo.chainId);
  }
  
  private handleDisconnect(error: any): void {
    this.connected = false;
    console.error('Wallet disconnected:', error);
  }
  
  // Getters
  isConnected(): boolean {
    return this.connected;
  }
  
  getAccounts(): string[] {
    return this.accounts;
  }
  
  getChainId(): string | null {
    return this.chainId;
  }
}
\`\`\`

## React Integration

### Custom Hook for MetaMask

\`\`\`typescript
// useMetaMask.ts
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { ethers } from 'ethers';

interface MetaMaskContextType {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  error: Error | null;
}

const MetaMaskContext = createContext<MetaMaskContextType>({
  account: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
  switchChain: async () => {},
  error: null
});

export const useMetaMask = () => useContext(MetaMaskContext);

export const MetaMaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  const isConnected = !!account;
  
  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(web3Provider);
      
      // Check if already connected
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setSigner(web3Provider.getSigner());
          }
        });
      
      // Get initial chain ID
      window.ethereum
        .request({ method: 'eth_chainId' })
        .then((chainId: string) => {
          setChainId(parseInt(chainId, 16));
        });
    }
  }, []);
  
  // Setup event listeners
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        if (provider) {
          setSigner(provider.getSigner());
        }
      } else {
        setAccount(null);
        setSigner(null);
      }
    };
    
    const handleChainChanged = (chainId: string) => {
      setChainId(parseInt(chainId, 16));
      window.location.reload();
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider]);
  
  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError(new Error('MetaMask not installed'));
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0 && provider) {
        setAccount(accounts[0]);
        setSigner(provider.getSigner());
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError(new Error('User rejected connection'));
      } else {
        setError(err);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);
  
  // Disconnect
  const disconnect = useCallback(() => {
    setAccount(null);
    setSigner(null);
  }, []);
  
  // Switch chain
  const switchChain = useCallback(async (chainId: number) => {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    
    const hexChainId = '0x' + chainId.toString(16);
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });
    } catch (err: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        // Try to add the chain
        const chainData = getChainData(chainId);
        if (chainData) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainData]
          });
        } else {
          throw new Error('Unknown chain ID');
        }
      } else {
        throw err;
      }
    }
  }, []);
  
  return (
    <MetaMaskContext.Provider
      value={{
        account,
        chainId,
        isConnecting,
        isConnected,
        provider,
        signer,
        connect,
        disconnect,
        switchChain,
        error
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

// Chain configuration data
function getChainData(chainId: number): any {
  const chains: Record<number, any> = {
    1: {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://mainnet.infura.io/v3/'],
      blockExplorerUrls: ['https://etherscan.io']
    },
    137: {
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com']
    },
    56: {
      chainId: '0x38',
      chainName: 'BNB Smart Chain',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      },
      rpcUrls: ['https://bsc-dataseed.binance.org'],
      blockExplorerUrls: ['https://bscscan.com']
    },
    42161: {
      chainId: '0xa4b1',
      chainName: 'Arbitrum One',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io']
    }
  };
  
  return chains[chainId];
}
\`\`\`

### Wallet UI Component

\`\`\`typescript
// WalletButton.tsx
import React from 'react';
import { useMetaMask } from './useMetaMask';
import { formatAddress } from '../utils';

export const WalletButton: React.FC = () => {
  const {
    account,
    chainId,
    isConnecting,
    isConnected,
    connect,
    disconnect,
    switchChain,
    error
  } = useMetaMask();
  
  const getChainName = (chainId: number): string => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      5: 'Goerli',
      137: 'Polygon',
      80001: 'Mumbai',
      56: 'BSC',
      97: 'BSC Testnet',
      42161: 'Arbitrum',
      421613: 'Arbitrum Goerli'
    };
    
    return chains[chainId] || \`Chain \${chainId}\`;
  };
  
  if (isConnected && account) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="chain-badge">
            {chainId && getChainName(chainId)}
          </span>
          <span className="address">{formatAddress(account)}</span>
        </div>
        <button onClick={disconnect} className="btn-disconnect">
          Disconnect
        </button>
      </div>
    );
  }
  
  return (
    <div className="wallet-connect">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="btn-connect"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <div className="error-message">{error.message}</div>
      )}
    </div>
  );
};

// ChainSwitcher.tsx
export const ChainSwitcher: React.FC = () => {
  const { chainId, switchChain } = useMetaMask();
  
  const supportedChains = [
    { id: 1, name: 'Ethereum' },
    { id: 137, name: 'Polygon' },
    { id: 56, name: 'BSC' },
    { id: 42161, name: 'Arbitrum' }
  ];
  
  return (
    <select
      value={chainId || ''}
      onChange={(e) => switchChain(Number(e.target.value))}
      className="chain-selector"
    >
      {supportedChains.map(chain => (
        <option key={chain.id} value={chain.id}>
          {chain.name}
        </option>
      ))}
    </select>
  );
};
\`\`\`

## Advanced Features

### Sign Messages

\`\`\`typescript
// Message signing for authentication
async function signMessage(signer: ethers.Signer, message: string): Promise<string> {
  try {
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected signature');
    }
    throw error;
  }
}

// Verify signature
function verifyMessage(message: string, signature: string, expectedAddress: string): boolean {
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
}

// Sign typed data (EIP-712)
async function signTypedData(signer: ethers.Signer): Promise<string> {
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
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' }
    ]
  };
  
  const value = {
    from: {
      name: 'Alice',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
    },
    contents: 'Hello, Bob!'
  };
  
  const signature = await signer._signTypedData(domain, types, value);
  return signature;
}

// Authentication flow
class Web3Auth {
  private signer: ethers.Signer;
  
  constructor(signer: ethers.Signer) {
    this.signer = signer;
  }
  
  async authenticate(): Promise<{
    address: string;
    signature: string;
    nonce: string;
  }> {
    // Get address
    const address = await this.signer.getAddress();
    
    // Generate nonce
    const nonce = this.generateNonce();
    
    // Create message
    const message = this.createAuthMessage(address, nonce);
    
    // Sign message
    const signature = await this.signer.signMessage(message);
    
    return { address, signature, nonce };
  }
  
  private generateNonce(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  private createAuthMessage(address: string, nonce: string): string {
    return \`Welcome to My DApp!
    
This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address:
\${address}

Nonce:
\${nonce}\`;
  }
  
  static verify(
    address: string,
    signature: string,
    nonce: string
  ): boolean {
    const auth = new Web3Auth(null as any);
    const message = auth.createAuthMessage(address, nonce);
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  }
}
\`\`\`

### Watch Asset

\`\`\`typescript
// Add custom token to MetaMask
async function watchAsset(
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenImage?: string
): Promise<boolean> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage
        }
      }
    });
    
    return wasAdded;
  } catch (error) {
    console.error('Failed to add token:', error);
    return false;
  }
}

// Usage
const addUSDC = async () => {
  const added = await watchAsset(
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    'USDC',
    6,
    'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  );
  
  if (added) {
    console.log('USDC added to MetaMask');
  }
};
\`\`\`

### Permissions System

\`\`\`typescript
// MetaMask permissions
async function getPermissions(): Promise<any[]> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const permissions = await window.ethereum.request({
    method: 'wallet_getPermissions'
  });
  
  return permissions;
}

// Request specific permissions
async function requestPermissions(): Promise<any[]> {
  const permissions = await window.ethereum.request({
    method: 'wallet_requestPermissions',
    params: [{
      eth_accounts: {}
    }]
  });
  
  return permissions;
}

// Revoke permissions (user must do this in MetaMask)
function openMetaMaskSettings(): void {
  alert('Please revoke permissions in MetaMask settings: Settings > Connected sites');
}
\`\`\`

## Error Handling

### Common MetaMask Errors

\`\`\`typescript
// Comprehensive error handler
class MetaMaskErrorHandler {
  static handle(error: any): string {
    // User rejected request
    if (error.code === 4001) {
      return 'You rejected the request';
    }
    
    // Unauthorized
    if (error.code === 4100) {
      return 'The requested account/method has not been authorized';
    }
    
    // Unsupported method
    if (error.code === 4200) {
      return 'The requested method is not supported';
    }
    
    // Disconnected
    if (error.code === 4900) {
      return 'MetaMask is disconnected from all chains';
    }
    
    // Chain disconnected
    if (error.code === 4901) {
      return 'MetaMask is disconnected from the specified chain';
    }
    
    // Missing chain
    if (error.code === 4902) {
      return 'Unrecognized chain ID. Try adding the chain first';
    }
    
    // Internal error
    if (error.code === -32603) {
      return 'Internal MetaMask error';
    }
    
    // Invalid input
    if (error.code === -32000) {
      return 'Invalid input';
    }
    
    // Transaction rejected
    if (error.code === -32003) {
      return 'Transaction rejected';
    }
    
    // Method not found
    if (error.code === -32601) {
      return 'Method not found';
    }
    
    // Parse error message
    if (error.message) {
      return error.message;
    }
    
    return 'An unknown error occurred';
  }
  
  static isUserRejection(error: any): boolean {
    return error.code === 4001;
  }
  
  static isChainError(error: any): boolean {
    return error.code === 4902 || error.code === 4901 || error.code === 4900;
  }
}

// Usage in React component
const handleConnect = async () => {
  try {
    await connect();
  } catch (error: any) {
    const message = MetaMaskErrorHandler.handle(error);
    
    if (MetaMaskErrorHandler.isUserRejection(error)) {
      // Handle user rejection specifically
      showToast('Connection cancelled', 'info');
    } else if (MetaMaskErrorHandler.isChainError(error)) {
      // Handle chain errors
      showToast('Please switch to a supported network', 'warning');
    } else {
      // General error
      showToast(message, 'error');
    }
  }
};
\`\`\`

## Mobile Support

### Deep Linking

\`\`\`typescript
// Detect mobile and handle MetaMask deep linking
class MobileWalletConnector {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  
  static hasMetaMaskApp(): boolean {
    // Check if in MetaMask mobile browser
    return window.ethereum?.isMetaMask || false;
  }
  
  static openMetaMaskApp(): void {
    const dappUrl = window.location.href;
    const metamaskDeepLink = \`https://metamask.app.link/dapp/\${dappUrl}\`;
    
    window.open(metamaskDeepLink, '_blank');
  }
  
  static getConnectionStrategy(): 'direct' | 'deeplink' | 'walletconnect' {
    if (!this.isMobile()) {
      return 'direct';
    }
    
    if (this.hasMetaMaskApp()) {
      return 'direct';
    }
    
    // On mobile without MetaMask browser
    return 'deeplink';
  }
}

// React component for mobile
const MobileConnect: React.FC = () => {
  const strategy = MobileWalletConnector.getConnectionStrategy();
  
  if (strategy === 'deeplink') {
    return (
      <button
        onClick={() => MobileWalletConnector.openMetaMaskApp()}
        className="mobile-connect-btn"
      >
        Open in MetaMask App
      </button>
    );
  }
  
  return <WalletButton />;
};
\`\`\`

## Best Practices

### Security Considerations

\`\`\`typescript
// Security best practices implementation
class SecureWalletConnection {
  // Always verify the connected chain
  static async verifyChain(expectedChainId: number): Promise<boolean> {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });
    
    return parseInt(chainId, 16) === expectedChainId;
  }
  
  // Verify contract addresses
  static verifyContractAddress(address: string, expectedAddress: string): boolean {
    return address.toLowerCase() === expectedAddress.toLowerCase();
  }
  
  // Rate limiting for requests
  static rateLimiter = new Map<string, number>();
  
  static async rateLimitedRequest(
    method: string,
    params: any[],
    limitMs: number = 1000
  ): Promise<any> {
    const lastCall = this.rateLimiter.get(method) || 0;
    const now = Date.now();
    
    if (now - lastCall < limitMs) {
      throw new Error('Too many requests. Please wait.');
    }
    
    this.rateLimiter.set(method, now);
    
    return window.ethereum.request({ method, params });
  }
  
  // Validate addresses
  static isValidAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }
  
  // Safe transaction parameters
  static async getSafeTransactionParams(
    provider: ethers.providers.Provider
  ): Promise<{
    maxFeePerGas?: ethers.BigNumber;
    maxPriorityFeePerGas?: ethers.BigNumber;
    gasPrice?: ethers.BigNumber;
  }> {
    const block = await provider.getBlock('latest');
    
    if (block.baseFeePerGas) {
      // EIP-1559
      const maxPriorityFeePerGas = ethers.utils.parseUnits('2', 'gwei');
      const maxFeePerGas = block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas);
      
      return { maxFeePerGas, maxPriorityFeePerGas };
    } else {
      // Legacy
      const gasPrice = await provider.getGasPrice();
      return { gasPrice: gasPrice.mul(110).div(100) }; // 10% buffer
    }
  }
}

// Phishing detection
class PhishingDetector {
  private static knownPhishingSites = [
    'metarnask.io',
    'metamask.cm',
    // Add more known phishing domains
  ];
  
  static isPhishingSite(): boolean {
    const hostname = window.location.hostname;
    
    return this.knownPhishingSites.some(site => 
      hostname.includes(site)
    );
  }
  
  static warnIfPhishing(): void {
    if (this.isPhishingSite()) {
      alert('WARNING: This might be a phishing site!');
    }
  }
}
\`\`\`

### UX Improvements

\`\`\`typescript
// Enhanced UX patterns
class WalletUX {
  // Auto-connect if previously connected
  static async autoConnect(): Promise<boolean> {
    const previouslyConnected = localStorage.getItem('wallet_connected') === 'true';
    
    if (previouslyConnected && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        
        if (accounts.length > 0) {
          return true;
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
      }
    }
    
    return false;
  }
  
  // Remember connection
  static rememberConnection(): void {
    localStorage.setItem('wallet_connected', 'true');
  }
  
  // Forget connection
  static forgetConnection(): void {
    localStorage.removeItem('wallet_connected');
  }
  
  // Show installation guide
  static showInstallGuide(): void {
    const guide = \`
      <div class="install-guide">
        <h2>Install MetaMask</h2>
        <ol>
          <li>Visit <a href="https://metamask.io" target="_blank">metamask.io</a></li>
          <li>Click "Download"</li>
          <li>Install the browser extension</li>
          <li>Create or import a wallet</li>
          <li>Refresh this page</li>
        </ol>
      </div>
    \`;
    
    // Show in modal or dedicated UI
    console.log(guide);
  }
  
  // Network suggestions
  static async suggestNetwork(chainId: number): Promise<void> {
    const networkNames: Record<number, string> = {
      1: 'Ethereum Mainnet',
      137: 'Polygon',
      56: 'BNB Chain',
      42161: 'Arbitrum'
    };
    
    const message = \`Please switch to \${networkNames[chainId] || \`chain \${chainId}\`} in MetaMask\`;
    
    // Show toast or modal
    console.log(message);
  }
}
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-3-2-1',
      title: 'Build a Wallet Connection Manager',
      description: 'Creëer een robuuste wallet connection manager',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer multi-wallet support (MetaMask, WalletConnect, etc)',
        'Handle alle edge cases en errors gracefully',
        'Voeg auto-connect en remember functionaliteit toe',
        'Test op desktop en mobile'
      ],
      hints: [
        'Gebruik een state machine voor connection states',
        'Implementeer proper event cleanup',
        'Test disconnect scenarios'
      ]
    },
    {
      id: 'assignment-3-2-2',
      title: 'Web3 Authentication System',
      description: 'Bouw een complete authentication systeem met MetaMask',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer sign-in with Ethereum',
        'Creëer session management',
        'Voeg nonce-based verificatie toe',
        'Handle token refresh en expiry'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat gebeurt er wanneer een gebruiker van chain wisselt in MetaMask?',
      options: [
        'Niets, de dApp moet dit zelf detecteren',
        'MetaMask triggert een "chainChanged" event',
        'De wallet wordt automatisch disconnected',
        'De pagina moet handmatig worden herladen'
      ],
      correctAnswer: 1,
      explanation: 'MetaMask emits een "chainChanged" event wanneer de gebruiker van netwerk wisselt, zodat dApps hierop kunnen reageren.'
    },
    {
      question: 'Waarom is het belangrijk om eth_requestAccounts te gebruiken in plaats van eth_accounts?',
      options: [
        'eth_accounts bestaat niet',
        'eth_requestAccounts toont de MetaMask popup als nog niet connected',
        'eth_requestAccounts is sneller',
        'Er is geen verschil'
      ],
      correctAnswer: 1,
      explanation: 'eth_requestAccounts vraagt expliciet om toegang en toont de MetaMask connection popup, terwijl eth_accounts alleen connected accounts returnt.'
    },
    {
      question: 'Hoe kun je het beste mobile MetaMask support toevoegen?',
      options: [
        'Mobile wordt niet ondersteund',
        'Forceer desktop mode',
        'Gebruik deep linking naar de MetaMask app',
        'Gebruik alleen WalletConnect'
      ],
      correctAnswer: 2,
      explanation: 'Deep linking naar de MetaMask mobile app is de beste manier om mobile gebruikers te ondersteunen die niet in de MetaMask browser zijn.'
    }
  ],
  resources: [
    {
      title: 'MetaMask Docs',
      url: 'https://docs.metamask.io/guide/',
      type: 'documentation',
      description: 'Officiële MetaMask developer documentatie'
    },
    {
      title: 'EIP-1193: Ethereum Provider API',
      url: 'https://eips.ethereum.org/EIPS/eip-1193',
      type: 'specification',
      description: 'Standaard voor Ethereum wallet providers'
    },
    {
      title: 'Web3Modal',
      url: 'https://web3modal.com/',
      type: 'library',
      description: 'Library voor multi-wallet support'
    }
  ],
  projectIdeas: [
    'Bouw een universal wallet connector library',
    'Creëer een Web3 authentication service',
    'Ontwikkel een wallet permission manager',
    'Maak een mobile-first dApp met wallet support'
  ]
};