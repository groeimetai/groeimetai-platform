// Certificate Types with Blockchain Verification

export interface Certificate {
  id: string
  userId: string
  courseId: string
  title: string
  studentName: string
  courseName: string
  instructorName: string
  completionDate: Date
  qrCode: string
  certificateUrl: string
  isValid: boolean
  createdAt: Date
  
  // Blockchain verification data
  blockchain?: BlockchainCertificate
}

export interface BlockchainCertificate {
  hash: string                    // Unique blockchain hash
  blockNumber: number            // Block number on the blockchain
  transactionId: string          // Transaction ID/hash
  networkId: string              // Blockchain network identifier (e.g., 'ethereum', 'polygon')
  contractAddress?: string       // Smart contract address if applicable
  timestamp: Date                // Blockchain timestamp
  explorerUrl: string            // URL to view on blockchain explorer
  gasUsed?: string              // Gas used for transaction
  status: 'pending' | 'confirmed' | 'failed'
}

export interface CertificateVerification {
  certificateId: string
  isValid: boolean
  verifiedAt: Date
  blockchainStatus: 'verified' | 'pending' | 'not_found' | 'invalid'
  details: {
    originalHash: string
    currentHash: string
    matchesBlockchain: boolean
    certificateData: {
      studentName: string
      courseName: string
      completionDate: Date
      issuer: string
    }
  }
  verificationProof?: {
    merkleRoot?: string
    merkleProof?: string[]
    signature?: string
  }
}

export interface CertificateMetadata {
  version: string
  issuer: {
    name: string
    organizationId: string
    website: string
    verificationUrl: string
  }
  certificateType: 'completion' | 'achievement' | 'participation' | 'excellence'
  validityPeriod?: {
    from: Date
    to?: Date  // Optional expiration
  }
  skills?: string[]
  competencies?: string[]
  score?: {
    achieved: number
    total: number
    percentage: number
  }
}

export interface BlockchainTransaction {
  from: string
  to: string
  data: string
  value: string
  gas: string
  gasPrice: string
  nonce: number
  signature: {
    v: string
    r: string
    s: string
  }
}

export interface CertificateGenerationRequest {
  userId: string
  courseId: string
  studentName: string
  courseName: string
  instructorName: string
  completionDate: Date
  score?: number
  enableBlockchain: boolean
  metadata?: Partial<CertificateMetadata>
}

export interface CertificateVerificationRequest {
  certificateId?: string
  hash?: string
  qrCode?: string
}

export interface BlockchainConfig {
  enabled: boolean
  network: 'ethereum' | 'polygon' | 'binance' | 'test' | 'mock'
  contractAddress?: string
  explorerBaseUrl: string
  rpcUrl?: string
  chainId: number
}