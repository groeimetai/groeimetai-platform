import { type BlockchainConfig } from '@/types/certificate'

// Network configurations
export const NETWORK_CONFIGS = {
  polygon: {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.maticvigil.com',
      'https://polygon-mainnet.g.alchemy.com/v2/' + process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    ],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  mumbai: {
    chainId: 80001,
    chainName: 'Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      'https://rpc-mumbai.maticvigil.com',
      'https://polygon-mumbai.g.alchemy.com/v2/' + process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    ],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
  localhost: {
    chainId: 31337,
    chainName: 'Localhost',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: ['http://localhost:3000'],
  },
} as const

// Contract addresses per network
export const CONTRACT_ADDRESSES = {
  certificateRegistry: {
    polygon: process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON || '',
    mumbai: process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI || '',
    localhost: process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_LOCAL || '',
  },
} as const

// IPFS Configuration
export const IPFS_CONFIG = {
  gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  apiUrl: process.env.NEXT_PUBLIC_IPFS_API_URL || 'https://api.pinata.cloud',
  pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
  pinataSecretKey: process.env.PINATA_SECRET_KEY || '',
} as const

// Blockchain service configuration
export const BLOCKCHAIN_SERVICE_CONFIG = {
  defaultNetwork: (process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'mumbai') as keyof typeof NETWORK_CONFIGS,
  autoConnect: process.env.NEXT_PUBLIC_AUTO_CONNECT === 'true',
  readOnlyMode: process.env.NEXT_PUBLIC_READ_ONLY_MODE === 'true',
  transactionTimeout: parseInt(process.env.NEXT_PUBLIC_TX_TIMEOUT || '300000', 10), // 5 minutes
  maxRetries: parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || '3', 10),
  confirmations: parseInt(process.env.NEXT_PUBLIC_CONFIRMATIONS || '2', 10),
} as const

// Get blockchain configuration based on network
export function getBlockchainConfig(network?: keyof typeof NETWORK_CONFIGS): BlockchainConfig {
  const selectedNetwork = network || BLOCKCHAIN_SERVICE_CONFIG.defaultNetwork
  const networkConfig = NETWORK_CONFIGS[selectedNetwork]
  
  return {
    enabled: process.env.NEXT_PUBLIC_BLOCKCHAIN_ENABLED === 'true',
    network: selectedNetwork === 'polygon' ? 'polygon' : selectedNetwork === 'mumbai' ? 'test' : 'test',
    contractAddress: CONTRACT_ADDRESSES.certificateRegistry[selectedNetwork],
    explorerBaseUrl: networkConfig.blockExplorerUrls[0],
    rpcUrl: networkConfig.rpcUrls[0],
    chainId: networkConfig.chainId,
  }
}

// Get contract address for a specific network
export function getContractAddress(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  network?: keyof typeof NETWORK_CONFIGS
): string {
  const selectedNetwork = network || BLOCKCHAIN_SERVICE_CONFIG.defaultNetwork
  const addresses = CONTRACT_ADDRESSES[contractName]
  
  if (!addresses || !addresses[selectedNetwork]) {
    throw new Error(`Contract ${contractName} not deployed on network ${selectedNetwork}`)
  }
  
  return addresses[selectedNetwork]
}

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development'

// Check if blockchain is enabled
export const isBlockchainEnabled = process.env.NEXT_PUBLIC_BLOCKCHAIN_ENABLED === 'true'

// Error messages
export const BLOCKCHAIN_ERRORS = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  WRONG_NETWORK: 'Please switch to the correct network',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  INSUFFICIENT_BALANCE: 'Insufficient balance to complete transaction',
  CONTRACT_NOT_FOUND: 'Smart contract not found on this network',
  USER_REJECTED: 'Transaction was rejected by user',
  NETWORK_ERROR: 'Network error. Please check your connection',
  IPFS_UPLOAD_FAILED: 'Failed to upload metadata to IPFS',
} as const

// Transaction status messages
export const TRANSACTION_STATUS = {
  PENDING: 'Transaction pending...',
  CONFIRMING: 'Confirming transaction...',
  CONFIRMED: 'Transaction confirmed!',
  FAILED: 'Transaction failed',
} as const

export type NetworkType = keyof typeof NETWORK_CONFIGS
export type ContractName = keyof typeof CONTRACT_ADDRESSES
export type BlockchainError = keyof typeof BLOCKCHAIN_ERRORS
export type TransactionStatus = keyof typeof TRANSACTION_STATUS