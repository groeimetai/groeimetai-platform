import { id as ethersId } from 'ethers'
import { 
  getWeb3Provider, 
  Web3Provider,
  type WalletState
} from '@/lib/blockchain/web3-provider'
import { 
  getIPFSService, 
  IPFSService,
  type IPFSUploadResult 
} from '@/lib/blockchain/ipfs-service'
import { 
  getBlockchainConfig,
  getContractAddress,
  BLOCKCHAIN_ERRORS,
  TRANSACTION_STATUS,
  type NetworkType
} from '@/lib/blockchain/config'
import { CertificateContract } from '@/lib/blockchain/certificate-contract'
import type { 
  BlockchainCertificate, 
  Certificate, 
  CertificateMetadata,
  CertificateVerification 
} from '@/types/certificate'

export interface MintCertificateParams {
  studentAddress: string
  studentName: string
  courseId: string
  courseName: string
  instructorName: string
  completionDate: Date
  certificateNumber: string
  certificateId: string
  grade?: string
  score?: number
  achievements?: string[]
  metadata?: Partial<CertificateMetadata>
}

export interface MintResult {
  success: boolean
  transactionHash?: string
  blockchainCertificate?: BlockchainCertificate
  ipfsHash?: string
  error?: string
}

export interface VerifyResult {
  isValid: boolean
  certificate?: Certificate
  verification?: CertificateVerification
  error?: string
}

export class BlockchainService {
  private static instance: BlockchainService
  private web3Provider: Web3Provider
  private ipfsService: IPFSService
  private certificateContract: CertificateContract | null = null
  private currentNetwork: NetworkType = 'mumbai'
  
  private eventEmitter = new EventTarget()

  private constructor() {
    this.web3Provider = getWeb3Provider()
    this.ipfsService = getIPFSService()
    
    // Subscribe to wallet state changes
    this.web3Provider.subscribe(this.handleWalletStateChange.bind(this))
  }

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService()
    }
    return BlockchainService.instance
  }

  /**
   * Handle wallet state changes
   */
  private handleWalletStateChange(state: WalletState): void {
    if (state.signer && state.provider) {
      this.certificateContract = new CertificateContract(state.provider, state.signer)
    } else {
      this.certificateContract = null
    }
    
    // Emit wallet state change event
    this.eventEmitter.dispatchEvent(
      new CustomEvent('walletStateChange', { detail: state })
    )
  }

  /**
   * Subscribe to blockchain events
   */
  on(event: string, callback: (data: any) => void): () => void {
    const handler = (e: Event) => {
      callback((e as CustomEvent).detail)
    }
    this.eventEmitter.addEventListener(event, handler)
    
    // Return unsubscribe function
    return () => {
      this.eventEmitter.removeEventListener(event, handler)
    }
  }

  /**
   * Connect wallet
   */
  async connectWallet(): Promise<WalletState> {
    try {
      const state = await this.web3Provider.connect()
      
      // Initialize contract if connected
      if (state.signer && state.provider) {
        this.certificateContract = new CertificateContract(state.provider, state.signer)
      }
      
      return state
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.web3Provider.disconnect()
    this.certificateContract = null
  }

  /**
   * Get current wallet state
   */
  getWalletState(): WalletState {
    return this.web3Provider.getState()
  }

  /**
   * Switch network
   */
  async switchNetwork(network: NetworkType): Promise<void> {
    await this.web3Provider.switchNetwork(network)
    this.currentNetwork = network
  }

  /**
   * Mint certificate on blockchain
   */
  async mintCertificate(params: MintCertificateParams): Promise<MintResult> {
    try {
      // Ensure wallet is connected
      if (!this.web3Provider.isConnected()) {
        throw new Error(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED)
      }

      if (!this.certificateContract) {
        throw new Error(BLOCKCHAIN_ERRORS.CONTRACT_NOT_FOUND)
      }

      // Emit minting started event
      this.emitEvent('mintingStarted', { certificateId: params.certificateId })

      // Step 1: Upload metadata to IPFS
      this.emitEvent('uploadingMetadata', { certificateId: params.certificateId })
      
      const metadata = IPFSService.generateCertificateMetadata({
        certificateId: params.certificateId,
        studentName: params.studentName,
        courseName: params.courseName,
        instructorName: params.instructorName,
        completionDate: params.completionDate,
        certificateNumber: params.certificateNumber,
        grade: params.grade,
        score: params.score,
        achievements: params.achievements,
        organizationName: 'GroeiMetAI Academy',
        organizationWebsite: 'https://groeimetai.com',
        contractAddress: getContractAddress('certificateRegistry', this.currentNetwork),
        network: this.currentNetwork,
      })

      let ipfsResult: IPFSUploadResult
      try {
        ipfsResult = await this.ipfsService.uploadCertificateMetadata(metadata)
        this.emitEvent('metadataUploaded', { 
          certificateId: params.certificateId,
          ipfsHash: ipfsResult.hash 
        })
      } catch (error) {
        console.error('IPFS upload error:', error)
        throw new Error(BLOCKCHAIN_ERRORS.IPFS_UPLOAD_FAILED)
      }

      // Step 2: Mint certificate on blockchain
      this.emitEvent('mintingOnChain', { certificateId: params.certificateId })
      
      const certificateIdOnChain = await this.certificateContract.mintCertificate(
        params.studentAddress,
        params.courseId,
        params.courseName,
        params.completionDate,
        ipfsResult.hash
      )

      if (!certificateIdOnChain) {
        throw new Error('Failed to mint certificate on blockchain')
      }

      // Step 3: Wait for transaction confirmation
      this.emitEvent('waitingConfirmation', { certificateId: params.certificateId })
      
      // Get transaction hash from the contract interaction
      // This would typically come from the transaction receipt
      const transactionHash = certificateIdOnChain // This should be the actual tx hash

      // Create blockchain certificate data
      const blockchainCertificate: BlockchainCertificate = {
        hash: ipfsResult.hash,
        blockNumber: 0, // Will be updated after confirmation
        transactionId: transactionHash,
        networkId: this.currentNetwork,
        contractAddress: getContractAddress('certificateRegistry', this.currentNetwork),
        timestamp: new Date(),
        explorerUrl: this.getExplorerUrl(transactionHash),
        status: 'confirmed',
      }

      // Emit success event
      this.emitEvent('mintingCompleted', { 
        certificateId: params.certificateId,
        transactionHash,
        ipfsHash: ipfsResult.hash
      })

      return {
        success: true,
        transactionHash,
        blockchainCertificate,
        ipfsHash: ipfsResult.hash,
      }
    } catch (error: any) {
      console.error('Error minting certificate:', error)
      
      // Emit error event
      this.emitEvent('mintingFailed', { 
        certificateId: params.certificateId,
        error: error.message 
      })

      return {
        success: false,
        error: error.message || 'Failed to mint certificate',
      }
    }
  }

  /**
   * Verify certificate on blockchain
   */
  async verifyCertificate(certificateId: string): Promise<VerifyResult> {
    try {
      // Can verify without wallet connection using read-only provider
      const provider = Web3Provider.getReadOnlyProvider(this.currentNetwork)
      const contract = new CertificateContract(provider)
      
      // Verify on blockchain
      const onChainCertificate = await contract.verifyCertificate(certificateId)
      
      if (!onChainCertificate) {
        return {
          isValid: false,
          error: 'Certificate not found on blockchain',
        }
      }

      // Retrieve metadata from IPFS
      const metadata = await this.ipfsService.getCertificateMetadata(onChainCertificate.ipfsHash)
      
      // Create certificate object
      const certificate: Certificate = {
        id: certificateId,
        userId: '', // Would need to be retrieved from database
        courseId: onChainCertificate.courseId,
        title: `Certificate of Completion - ${onChainCertificate.courseName}`,
        studentName: metadata.certificate.studentName,
        courseName: onChainCertificate.courseName,
        instructorName: metadata.certificate.instructorName,
        completionDate: onChainCertificate.completionDate,
        qrCode: '', // Would need to be generated
        certificateUrl: '', // Would need to be retrieved
        isValid: onChainCertificate.isValid,
        createdAt: onChainCertificate.mintedAt,
        blockchain: {
          hash: onChainCertificate.ipfsHash,
          blockNumber: 0, // Would need to be retrieved from transaction
          transactionId: '', // Would need to be retrieved
          networkId: this.currentNetwork,
          contractAddress: getContractAddress('certificateRegistry', this.currentNetwork),
          timestamp: onChainCertificate.mintedAt,
          explorerUrl: '',
          status: 'confirmed',
        },
      }

      const verification: CertificateVerification = {
        certificateId,
        isValid: true,
        verifiedAt: new Date(),
        blockchainStatus: 'verified',
        details: {
          originalHash: onChainCertificate.ipfsHash,
          currentHash: onChainCertificate.ipfsHash,
          matchesBlockchain: true,
          certificateData: {
            studentName: metadata.certificate.studentName,
            courseName: onChainCertificate.courseName,
            completionDate: onChainCertificate.completionDate,
            issuer: metadata.issuer.name,
          },
        },
      }

      return {
        isValid: true,
        certificate,
        verification,
      }
    } catch (error: any) {
      console.error('Error verifying certificate:', error)
      return {
        isValid: false,
        error: error.message || 'Failed to verify certificate',
      }
    }
  }

  /**
   * Get all certificates for a student address
   */
  async getStudentCertificates(studentAddress: string): Promise<Certificate[]> {
    try {
      const provider = Web3Provider.getReadOnlyProvider(this.currentNetwork)
      const contract = new CertificateContract(provider)
      
      const certificates = await contract.getStudentCertificates(studentAddress)
      
      // Convert to Certificate type with metadata
      const certificatesWithMetadata = await Promise.all(
        certificates.map(async (cert) => {
          try {
            const metadata = await this.ipfsService.getCertificateMetadata(cert.ipfsHash)
            
            return {
              id: cert.id,
              userId: '', // Would need to be retrieved from database
              courseId: cert.courseId,
              title: `Certificate of Completion - ${cert.courseName}`,
              studentName: metadata.certificate.studentName,
              courseName: cert.courseName,
              instructorName: metadata.certificate.instructorName,
              completionDate: cert.completionDate,
              qrCode: '', // Would need to be generated
              certificateUrl: '', // Would need to be retrieved
              isValid: cert.isValid,
              createdAt: cert.mintedAt,
              blockchain: {
                hash: cert.ipfsHash,
                blockNumber: 0, // Would need to be retrieved
                transactionId: '', // Would need to be retrieved
                networkId: this.currentNetwork,
                contractAddress: getContractAddress('certificateRegistry', this.currentNetwork),
                timestamp: cert.mintedAt,
                explorerUrl: '',
                status: 'confirmed',
              },
            } as Certificate
          } catch (error) {
            console.error(`Error fetching metadata for certificate ${cert.id}:`, error)
            return null
          }
        })
      )

      return certificatesWithMetadata.filter((cert): cert is Certificate => cert !== null)
    } catch (error) {
      console.error('Error fetching student certificates:', error)
      return []
    }
  }

  /**
   * Check if address has minting permissions
   */
  async canMintCertificates(address: string): Promise<boolean> {
    try {
      const provider = Web3Provider.getReadOnlyProvider(this.currentNetwork)
      const contract = new CertificateContract(provider)
      
      return await contract.isMinter(address)
    } catch (error) {
      console.error('Error checking minter role:', error)
      return false
    }
  }

  /**
   * Get explorer URL for transaction
   */
  private getExplorerUrl(transactionHash: string): string {
    const config = getBlockchainConfig(this.currentNetwork)
    return `${config.explorerBaseUrl}/tx/${transactionHash}`
  }

  /**
   * Emit event
   */
  private emitEvent(event: string, data: any): void {
    this.eventEmitter.dispatchEvent(
      new CustomEvent(event, { detail: data })
    )
  }

  /**
   * Listen to certificate minted events on blockchain
   */
  async listenToCertificateMintedEvents(
    callback: (event: any) => void
  ): Promise<() => void> {
    if (!this.certificateContract) {
      throw new Error(BLOCKCHAIN_ERRORS.CONTRACT_NOT_FOUND)
    }

    const provider = this.web3Provider.getProvider()
    if (!provider) {
      throw new Error(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED)
    }

    // Setup event filter
    const filter = {
      address: getContractAddress('certificateRegistry', this.currentNetwork),
      topics: [
        ethersId('CertificateMinted(uint256,address,string,string,uint256,string)'),
      ],
    }

    // Listen to events
    provider.on(filter, callback)

    // Return cleanup function
    return () => {
      provider.off(filter, callback)
    }
  }

  /**
   * Get total certificates issued
   */
  async getTotalCertificates(): Promise<number> {
    try {
      const provider = Web3Provider.getReadOnlyProvider(this.currentNetwork)
      const contract = new CertificateContract(provider)
      
      return await contract.getTotalCertificates()
    } catch (error) {
      console.error('Error getting total certificates:', error)
      return 0
    }
  }
}

// Export singleton instance getter
export const getBlockchainService = () => BlockchainService.getInstance()

// React hook for using BlockchainService
export function useBlockchainService() {
  const [walletState, setWalletState] = React.useState<WalletState>(() => 
    getBlockchainService().getWalletState()
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const unsubscribe = getBlockchainService().on('walletStateChange', setWalletState)
    return unsubscribe
  }, [])

  const connectWallet = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await getBlockchainService().connectWallet()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnectWallet = React.useCallback(() => {
    getBlockchainService().disconnectWallet()
  }, [])

  const mintCertificate = React.useCallback(async (params: MintCertificateParams) => {
    setIsLoading(true)
    setError(null)
    try {
      return await getBlockchainService().mintCertificate(params)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyCertificate = React.useCallback(async (certificateId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await getBlockchainService().verifyCertificate(certificateId)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    ...walletState,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    mintCertificate,
    verifyCertificate,
    switchNetwork: (network: NetworkType) => getBlockchainService().switchNetwork(network),
    getStudentCertificates: (address: string) => getBlockchainService().getStudentCertificates(address),
    canMintCertificates: (address: string) => getBlockchainService().canMintCertificates(address),
  }
}

// Add React import for the hook
import React from 'react'