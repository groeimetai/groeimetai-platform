import { BrowserProvider, JsonRpcProvider, Signer, formatEther, parseUnits } from 'ethers'
import { 
  NETWORK_CONFIGS, 
  BLOCKCHAIN_SERVICE_CONFIG, 
  BLOCKCHAIN_ERRORS,
  type NetworkType,
  getBlockchainConfig
} from './config'

export interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  balance: string | null
  provider: BrowserProvider | null
  signer: Signer | null
}

export type WalletConnectMethod = 'metamask' | 'walletconnect' | 'coinbase'

export class Web3Provider {
  private static instance: Web3Provider
  private provider: BrowserProvider | null = null
  private signer: Signer | null = null
  private listeners: ((state: WalletState) => void)[] = []
  private currentNetwork: NetworkType = BLOCKCHAIN_SERVICE_CONFIG.defaultNetwork
  
  private walletState: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    provider: null,
    signer: null,
  }

  private constructor() {
    // Initialize provider if window.ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      this.setupEventListeners()
    }
  }

  static getInstance(): Web3Provider {
    if (!Web3Provider.instance) {
      Web3Provider.instance = new Web3Provider()
    }
    return Web3Provider.instance
  }

  /**
   * Setup event listeners for wallet events
   */
  private setupEventListeners(): void {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect()
      } else {
        this.handleAccountChange(accounts[0])
      }
    })

    window.ethereum.on('chainChanged', (chainId: string) => {
      this.handleChainChange(parseInt(chainId, 16))
    })

    window.ethereum.on('disconnect', () => {
      this.disconnect()
    })
  }

  /**
   * Handle account change
   */
  private async handleAccountChange(account: string): Promise<void> {
    this.walletState.address = account
    await this.updateBalance()
    this.notifyListeners()
  }

  /**
   * Handle chain change
   */
  private handleChainChange(chainId: number): void {
    this.walletState.chainId = chainId
    this.notifyListeners()
  }

  /**
   * Subscribe to wallet state changes
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener)
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.walletState))
  }

  /**
   * Connect wallet
   */
  async connect(method: WalletConnectMethod = 'metamask'): Promise<WalletState> {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet provider found. Please install MetaMask.')
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Setup provider and signer
      this.provider = new BrowserProvider(window.ethereum)
      this.signer = this.provider.getSigner()
      
      // Get network info
      const network = await this.provider.getNetwork()
      
      // Update wallet state
      this.walletState = {
        isConnected: true,
        address: accounts[0],
        chainId: network.chainId,
        balance: await this.getBalance(accounts[0]),
        provider: this.provider,
        signer: this.signer,
      }

      // Check if correct network
      await this.ensureCorrectNetwork()
      
      this.notifyListeners()
      return this.walletState
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.walletState = {
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
      provider: null,
      signer: null,
    }
    this.provider = null
    this.signer = null
    this.notifyListeners()
  }

  /**
   * Switch to specific network
   */
  async switchNetwork(network: NetworkType): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No wallet provider found')
    }

    const networkConfig = NETWORK_CONFIGS[network]
    const hexChainId = `0x${networkConfig.chainId.toString(16)}`

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      })
      this.currentNetwork = network
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        await this.addNetwork(network)
      } else {
        throw error
      }
    }
  }

  /**
   * Add network to MetaMask
   */
  private async addNetwork(network: NetworkType): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No wallet provider found')
    }

    const networkConfig = NETWORK_CONFIGS[network]
    
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${networkConfig.chainId.toString(16)}`,
          chainName: networkConfig.chainName,
          nativeCurrency: networkConfig.nativeCurrency,
          rpcUrls: networkConfig.rpcUrls,
          blockExplorerUrls: networkConfig.blockExplorerUrls,
        }],
      })
    } catch (error) {
      console.error('Error adding network:', error)
      throw error
    }
  }

  /**
   * Ensure wallet is connected to correct network
   */
  private async ensureCorrectNetwork(): Promise<void> {
    if (!this.walletState.chainId) return

    const expectedChainId = NETWORK_CONFIGS[this.currentNetwork].chainId
    
    if (this.walletState.chainId !== expectedChainId) {
      await this.switchNetwork(this.currentNetwork)
    }
  }

  /**
   * Get balance for address
   */
  private async getBalance(address: string): Promise<string> {
    if (!this.provider) return '0'
    
    try {
      const balance = await this.provider.getBalance(address)
      return formatEther(balance)
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  }

  /**
   * Update balance for current address
   */
  private async updateBalance(): Promise<void> {
    if (this.walletState.address && this.provider) {
      this.walletState.balance = await this.getBalance(this.walletState.address)
    }
  }

  /**
   * Get current wallet state
   */
  getState(): WalletState {
    return { ...this.walletState }
  }

  /**
   * Get provider instance
   */
  getProvider(): BrowserProvider | null {
    return this.provider
  }

  /**
   * Get signer instance
   */
  getSigner(): Signer | null {
    return this.signer
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.walletState.isConnected
  }

  /**
   * Get current address
   */
  getAddress(): string | null {
    return this.walletState.address
  }

  /**
   * Get current chain ID
   */
  getChainId(): number | null {
    return this.walletState.chainId
  }

  /**
   * Send transaction with proper error handling
   */
  async sendTransaction(
    transaction: any
  ): Promise<any> {
    if (!this.signer) {
      throw new Error(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED)
    }

    try {
      await this.ensureCorrectNetwork()
      
      // Estimate gas if not provided
      if (!transaction.gasLimit) {
        const estimatedGas = await this.signer.estimateGas(transaction)
        transaction.gasLimit = estimatedGas.mul(120).div(100) // Add 20% buffer
      }

      // Send transaction
      const tx = await this.signer.sendTransaction(transaction)
      return tx
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error(BLOCKCHAIN_ERRORS.USER_REJECTED)
      } else if (error.code === -32603) {
        throw new Error(BLOCKCHAIN_ERRORS.INSUFFICIENT_BALANCE)
      } else {
        console.error('Transaction error:', error)
        throw new Error(BLOCKCHAIN_ERRORS.TRANSACTION_FAILED)
      }
    }
  }

  /**
   * Wait for transaction with timeout
   */
  async waitForTransaction(
    txHash: string,
    confirmations?: number
  ): Promise<any> {
    if (!this.provider) {
      throw new Error(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED)
    }

    const confirms = confirmations || BLOCKCHAIN_SERVICE_CONFIG.confirmations
    const timeout = BLOCKCHAIN_SERVICE_CONFIG.transactionTimeout

    return Promise.race([
      this.provider.waitForTransaction(txHash, confirms),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timeout')), timeout)
      ),
    ])
  }

  /**
   * Get read-only provider for querying blockchain
   */
  static getReadOnlyProvider(network: NetworkType = BLOCKCHAIN_SERVICE_CONFIG.defaultNetwork): JsonRpcProvider {
    const config = getBlockchainConfig(network)
    return new JsonRpcProvider(config.rpcUrl)
  }
}

// Export singleton instance getter
export const getWeb3Provider = () => Web3Provider.getInstance()

// React hook for using Web3Provider
export function useWeb3Provider() {
  const [walletState, setWalletState] = React.useState<WalletState>(() => 
    getWeb3Provider().getState()
  )

  React.useEffect(() => {
    const unsubscribe = getWeb3Provider().subscribe(setWalletState)
    return unsubscribe
  }, [])

  return {
    ...walletState,
    connect: (method?: WalletConnectMethod) => getWeb3Provider().connect(method),
    disconnect: () => getWeb3Provider().disconnect(),
    switchNetwork: (network: NetworkType) => getWeb3Provider().switchNetwork(network),
    sendTransaction: (tx: any) => getWeb3Provider().sendTransaction(tx),
    waitForTransaction: (txHash: string, confirmations?: number) => 
      getWeb3Provider().waitForTransaction(txHash, confirmations),
  }
}

// Utility function to format address
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Utility function to get explorer URL
export function getExplorerUrl(
  txHash: string, 
  type: 'tx' | 'address' | 'block' = 'tx',
  network: NetworkType = BLOCKCHAIN_SERVICE_CONFIG.defaultNetwork
): string {
  const baseUrl = NETWORK_CONFIGS[network].blockExplorerUrls[0]
  return `${baseUrl}/${type}/${txHash}`
}

// Add React import for the hook
import React from 'react'

// Add window.ethereum type declaration
declare global {
  interface Window {
    ethereum?: any
  }
}