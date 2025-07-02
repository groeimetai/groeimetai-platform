import { JsonRpcProvider, Wallet } from 'ethers'
import { NETWORK_CONFIGS } from './config'

/**
 * Create a server-side wallet for automated blockchain operations
 * This wallet is used by GroeimetAI to automatically mint certificates
 */
export function getServerWallet(network: 'polygon' | 'mumbai' = 'polygon') {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    throw new Error('Server wallet private key not configured')
  }

  const networkConfig = NETWORK_CONFIGS[network]
  const rpcUrl = network === 'polygon' 
    ? process.env.POLYGON_RPC_URL || networkConfig.rpcUrls[0]
    : process.env.MUMBAI_RPC_URL || networkConfig.rpcUrls[0]

  const provider = new JsonRpcProvider(rpcUrl)
  const wallet = new Wallet(privateKey, provider)

  return {
    wallet,
    provider,
    address: wallet.address,
    network,
    chainId: networkConfig.chainId
  }
}

/**
 * Check if server wallet has sufficient balance for operations
 */
export async function checkServerWalletBalance(network: 'polygon' | 'mumbai' = 'polygon'): Promise<{
  balance: string
  isLow: boolean
  canMint: boolean
}> {
  try {
    const { wallet, provider } = getServerWallet(network)
    const balance = await provider.getBalance(wallet.address)
    const balanceInEther = parseFloat(balance.toString()) / 1e18
    
    // Consider balance low if less than 1 POL
    const isLow = balanceInEther < 1
    
    // Need at least 0.1 POL to safely mint
    const canMint = balanceInEther >= 0.1

    return {
      balance: balanceInEther.toFixed(4),
      isLow,
      canMint
    }
  } catch (error) {
    console.error('Error checking server wallet balance:', error)
    return {
      balance: '0',
      isLow: true,
      canMint: false
    }
  }
}

/**
 * Get server wallet info for monitoring
 */
export async function getServerWalletInfo(network: 'polygon' | 'mumbai' = 'polygon') {
  const { wallet, chainId } = getServerWallet(network)
  const { balance, isLow, canMint } = await checkServerWalletBalance(network)
  
  return {
    address: wallet.address,
    network,
    chainId,
    balance,
    isLow,
    canMint,
    explorerUrl: `${NETWORK_CONFIGS[network].blockExplorerUrls[0]}/address/${wallet.address}`
  }
}