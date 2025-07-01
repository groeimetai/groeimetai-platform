import { IPFS_CONFIG } from './config'
import type { CertificateMetadata } from '@/types/certificate'

export interface IPFSUploadResult {
  hash: string
  url: string
  size: number
  timestamp: Date
}

export interface IPFSMetadata extends CertificateMetadata {
  certificate: {
    id: string
    studentName: string
    courseName: string
    instructorName: string
    completionDate: string
    certificateNumber: string
    grade?: string
    score?: number
    achievements?: string[]
  }
  verification: {
    blockchain: {
      network: string
      contractAddress: string
      transactionHash?: string
    }
    qrCode?: string
  }
}

export class IPFSService {
  private static instance: IPFSService

  private constructor() {}

  static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService()
    }
    return IPFSService.instance
  }

  /**
   * Upload certificate metadata to IPFS via Pinata
   */
  async uploadCertificateMetadata(
    metadata: IPFSMetadata
  ): Promise<IPFSUploadResult> {
    try {
      // If in development without Pinata keys, use mock response
      if (!IPFS_CONFIG.pinataApiKey || IPFS_CONFIG.pinataApiKey === '') {
        console.warn('No Pinata API key found, using mock IPFS response')
        return this.mockUpload(metadata)
      }

      const data = new FormData()
      const file = new Blob([JSON.stringify(metadata, null, 2)], { 
        type: 'application/json' 
      })
      
      data.append('file', file, `certificate-${metadata.certificate.id}.json`)
      
      // Optional: Add metadata to pin
      const pinataMetadata = JSON.stringify({
        name: `Certificate ${metadata.certificate.id}`,
        keyvalues: {
          studentName: metadata.certificate.studentName,
          courseName: metadata.certificate.courseName,
          certificateId: metadata.certificate.id,
          completionDate: metadata.certificate.completionDate,
        }
      })
      data.append('pinataMetadata', pinataMetadata)

      // Optional: Pin to IPFS nodes
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      })
      data.append('pinataOptions', pinataOptions)

      const response = await fetch(`${IPFS_CONFIG.apiUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': IPFS_CONFIG.pinataApiKey,
          'pinata_secret_api_key': IPFS_CONFIG.pinataSecretKey,
        },
        body: data,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to upload to IPFS: ${error}`)
      }

      const result = await response.json()
      
      return {
        hash: result.IpfsHash,
        url: `${IPFS_CONFIG.gateway}${result.IpfsHash}`,
        size: result.PinSize,
        timestamp: new Date(result.Timestamp || Date.now()),
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      throw error
    }
  }

  /**
   * Retrieve certificate metadata from IPFS
   */
  async getCertificateMetadata(ipfsHash: string): Promise<IPFSMetadata> {
    try {
      const url = `${IPFS_CONFIG.gateway}${ipfsHash}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to retrieve from IPFS: ${response.statusText}`)
      }

      const metadata = await response.json()
      return metadata as IPFSMetadata
    } catch (error) {
      console.error('Error retrieving from IPFS:', error)
      throw error
    }
  }

  /**
   * Pin existing IPFS hash (ensure it stays available)
   */
  async pinHash(ipfsHash: string, name?: string): Promise<boolean> {
    try {
      if (!IPFS_CONFIG.pinataApiKey) {
        console.warn('No Pinata API key found, skipping pin')
        return true
      }

      const response = await fetch(`${IPFS_CONFIG.apiUrl}/pinning/pinByHash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': IPFS_CONFIG.pinataApiKey,
          'pinata_secret_api_key': IPFS_CONFIG.pinataSecretKey,
        },
        body: JSON.stringify({
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: name || `Pinned ${ipfsHash}`,
          },
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Error pinning hash:', error)
      return false
    }
  }

  /**
   * Unpin IPFS hash (remove from pinning service)
   */
  async unpinHash(ipfsHash: string): Promise<boolean> {
    try {
      if (!IPFS_CONFIG.pinataApiKey) {
        console.warn('No Pinata API key found, skipping unpin')
        return true
      }

      const response = await fetch(
        `${IPFS_CONFIG.apiUrl}/pinning/unpin/${ipfsHash}`,
        {
          method: 'DELETE',
          headers: {
            'pinata_api_key': IPFS_CONFIG.pinataApiKey,
            'pinata_secret_api_key': IPFS_CONFIG.pinataSecretKey,
          },
        }
      )

      return response.ok
    } catch (error) {
      console.error('Error unpinning hash:', error)
      return false
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data: any, filename?: string): Promise<IPFSUploadResult> {
    try {
      const formData = new FormData()
      const file = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      })
      
      formData.append('file', file, filename || 'data.json')
      
      if (!IPFS_CONFIG.pinataApiKey) {
        return this.mockUpload(data)
      }

      const response = await fetch(`${IPFS_CONFIG.apiUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': IPFS_CONFIG.pinataApiKey,
          'pinata_secret_api_key': IPFS_CONFIG.pinataSecretKey,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS')
      }

      const result = await response.json()
      
      return {
        hash: result.IpfsHash,
        url: `${IPFS_CONFIG.gateway}${result.IpfsHash}`,
        size: result.PinSize,
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error)
      throw error
    }
  }

  /**
   * Mock upload for development
   */
  private mockUpload(data: any): IPFSUploadResult {
    // Generate a mock hash based on content
    const content = JSON.stringify(data)
    const mockHash = 'Qm' + Buffer.from(content).toString('base64').slice(0, 44)
    
    return {
      hash: mockHash,
      url: `${IPFS_CONFIG.gateway}${mockHash}`,
      size: content.length,
      timestamp: new Date(),
    }
  }

  /**
   * Generate certificate metadata for IPFS
   */
  static generateCertificateMetadata(params: {
    certificateId: string
    studentName: string
    courseName: string
    instructorName: string
    completionDate: Date
    certificateNumber: string
    grade?: string
    score?: number
    achievements?: string[]
    organizationName: string
    organizationWebsite: string
    contractAddress: string
    network: string
    transactionHash?: string
  }): IPFSMetadata {
    return {
      version: '1.0',
      issuer: {
        name: params.organizationName,
        organizationId: 'groeimetai-academy',
        website: params.organizationWebsite,
        verificationUrl: `${params.organizationWebsite}/certificate/verify/${params.certificateId}`,
      },
      certificateType: params.score && params.score >= 95 ? 'excellence' : 'completion',
      certificate: {
        id: params.certificateId,
        studentName: params.studentName,
        courseName: params.courseName,
        instructorName: params.instructorName,
        completionDate: params.completionDate.toISOString(),
        certificateNumber: params.certificateNumber,
        grade: params.grade,
        score: params.score,
        achievements: params.achievements,
      },
      verification: {
        blockchain: {
          network: params.network,
          contractAddress: params.contractAddress,
          transactionHash: params.transactionHash,
        },
      },
      skills: [], // Could be populated based on course
      competencies: [], // Could be populated based on course
      score: params.score ? {
        achieved: params.score,
        total: 100,
        percentage: params.score,
      } : undefined,
    }
  }

  /**
   * Validate IPFS hash format
   */
  static isValidIPFSHash(hash: string): boolean {
    // Check for CIDv0 (starts with Qm) or CIDv1 (starts with b)
    const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
    const cidv1Regex = /^b[1-9A-HJ-NP-Za-km-z]{58,}$/
    
    return cidv0Regex.test(hash) || cidv1Regex.test(hash)
  }

  /**
   * Get IPFS gateway URL
   */
  static getGatewayUrl(hash: string): string {
    return `${IPFS_CONFIG.gateway}${hash}`
  }
}

// Export singleton instance getter
export const getIPFSService = () => IPFSService.getInstance()

// Export types
export type { IPFSUploadResult, IPFSMetadata }