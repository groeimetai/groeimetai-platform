import { Contract } from 'ethers'
import { getServerWallet } from '@/lib/blockchain/server-wallet'
import { getContractAddress } from '@/lib/blockchain/config'
import { getIPFSService } from '@/lib/blockchain/ipfs-service'
import CertificateRegistryABI from '../../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json'
import type { 
  MintCertificateParams, 
  MintResult,
  BlockchainCertificate 
} from './blockchainService'

/**
 * Server-side blockchain service for automatic certificate minting
 * This service uses GroeimetAI's wallet to mint certificates automatically
 */
export class ServerBlockchainService {
  private static instance: ServerBlockchainService
  private network: 'polygon' | 'mumbai'
  
  private constructor() {
    // Use polygon mainnet by default, can be overridden with env variable
    this.network = (process.env.NEXT_PUBLIC_DEFAULT_NETWORK as 'polygon' | 'mumbai') || 'polygon'
  }

  static getInstance(): ServerBlockchainService {
    if (!ServerBlockchainService.instance) {
      ServerBlockchainService.instance = new ServerBlockchainService()
    }
    return ServerBlockchainService.instance
  }

  /**
   * Mint a certificate using the server wallet
   * This is called automatically when a certificate is generated
   */
  async mintCertificate(params: MintCertificateParams): Promise<MintResult> {
    try {
      // Get server wallet
      const { wallet, provider } = getServerWallet(this.network)
      
      // Check balance
      const balance = await provider.getBalance(wallet.address)
      const balanceInEther = parseFloat(balance.toString()) / 1e18
      
      if (balanceInEther < 0.1) {
        throw new Error('Insufficient balance in server wallet for minting')
      }

      // Upload metadata to IPFS
      const ipfsService = getIPFSService()
      const metadata = {
        studentName: params.studentName,
        studentAddress: params.studentAddress,
        courseName: params.courseName,
        courseId: params.courseId,
        instructorName: params.instructorName,
        completionDate: params.completionDate.toISOString(),
        certificateNumber: params.certificateNumber,
        certificateId: params.certificateId,
        grade: params.grade,
        score: params.score,
        achievements: params.achievements,
        issuer: 'GroeimetAI Academy',
        timestamp: Date.now(),
      }

      const ipfsResult = await ipfsService.uploadJSON(metadata, {
        name: `Certificate-${params.certificateNumber}`,
        keyvalues: {
          studentName: params.studentName,
          courseName: params.courseName,
          certificateId: params.certificateId,
        }
      })

      if (!ipfsResult.success || !ipfsResult.ipfsHash) {
        throw new Error('Failed to upload metadata to IPFS')
      }

      // Get contract
      const contractAddress = getContractAddress('certificateRegistry', this.network)
      const contract = new Contract(
        contractAddress,
        CertificateRegistryABI.abi,
        wallet
      )

      // Mint certificate
      console.log('🔨 Minting certificate on blockchain...')
      const tx = await contract.mintCertificate(
        params.studentAddress,
        params.courseId,
        params.courseName,
        Math.floor(params.completionDate.getTime() / 1000), // Convert to Unix timestamp
        ipfsResult.ipfsHash
      )

      console.log('📡 Transaction sent:', tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait(2) // Wait for 2 confirmations
      console.log('✅ Transaction confirmed')

      // Get certificate ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'CertificateMinted'
        } catch {
          return false
        }
      })

      if (!event) {
        throw new Error('Certificate minted but event not found')
      }

      const parsed = contract.interface.parseLog(event)
      const blockchainCertificateId = parsed?.args?.certificateId?.toString()

      // Create blockchain certificate data
      const blockchainCertificate: BlockchainCertificate = {
        id: blockchainCertificateId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
        network: this.network,
        contractAddress,
        ipfsHash: ipfsResult.ipfsHash,
        gasUsed: receipt.gasUsed.toString(),
        status: 'confirmed'
      }

      return {
        success: true,
        transactionHash: tx.hash,
        blockchainCertificate,
        ipfsHash: ipfsResult.ipfsHash
      }

    } catch (error) {
      console.error('Server blockchain minting error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during minting'
      }
    }
  }

  /**
   * Check if server wallet can mint (has sufficient balance and permissions)
   */
  async canMint(): Promise<boolean> {
    try {
      const { wallet, provider } = getServerWallet(this.network)
      
      // Check balance
      const balance = await provider.getBalance(wallet.address)
      const balanceInEther = parseFloat(balance.toString()) / 1e18
      
      if (balanceInEther < 0.1) {
        console.warn('Server wallet balance too low:', balanceInEther, 'POL')
        return false
      }

      // Check if wallet has MINTER_ROLE
      const contractAddress = getContractAddress('certificateRegistry', this.network)
      const contract = new Contract(
        contractAddress,
        CertificateRegistryABI.abi,
        provider
      )

      const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6' // keccak256("MINTER_ROLE")
      const hasMinterRole = await contract.hasRole(MINTER_ROLE, wallet.address)

      if (!hasMinterRole) {
        console.warn('Server wallet does not have MINTER_ROLE')
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking server mint capability:', error)
      return false
    }
  }

  /**
   * Get server wallet info
   */
  async getWalletInfo() {
    const { wallet } = getServerWallet(this.network)
    const { balance } = await this.getBalance()
    
    return {
      address: wallet.address,
      network: this.network,
      balance,
      canMint: await this.canMint()
    }
  }

  /**
   * Get current balance
   */
  private async getBalance() {
    const { wallet, provider } = getServerWallet(this.network)
    const balance = await provider.getBalance(wallet.address)
    return {
      wei: balance.toString(),
      ether: (parseFloat(balance.toString()) / 1e18).toFixed(4)
    }
  }
}

// Export singleton instance getter
export function getServerBlockchainService(): ServerBlockchainService {
  return ServerBlockchainService.getInstance()
}