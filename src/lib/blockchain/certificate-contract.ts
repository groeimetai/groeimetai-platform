import { Contract, BrowserProvider, JsonRpcProvider, Signer } from 'ethers';
import CertificateRegistryABI from '../../../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json';

// Contract addresses per network
const CONTRACT_ADDRESSES = {
  polygon: process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON || '',
  mumbai: process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI || '',
  hardhat: process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_LOCAL || '',
};

// Get the appropriate contract address based on network
function getContractAddress(chainId: number): string {
  switch (chainId) {
    case 137:
      return CONTRACT_ADDRESSES.polygon;
    case 80001:
      return CONTRACT_ADDRESSES.mumbai;
    case 31337:
      return CONTRACT_ADDRESSES.hardhat;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

export interface Certificate {
  id: string;
  student: string;
  courseId: string;
  courseName: string;
  completionDate: Date;
  ipfsHash: string;
  isValid: boolean;
  mintedAt: Date;
}

export class CertificateContract {
  private contract: Contract;
  private provider: BrowserProvider | JsonRpcProvider;

  constructor(provider: BrowserProvider | JsonRpcProvider, signer?: Signer) {
    this.provider = provider;
    
    // Get network and contract address
    provider.getNetwork().then(network => {
      const contractAddress = getContractAddress(network.chainId);
      
      this.contract = new Contract(
        contractAddress,
        CertificateRegistryABI.abi,
        signer || provider
      );
    });
  }

  /**
   * Verify a certificate by ID
   */
  async verifyCertificate(certificateId: string): Promise<Certificate | null> {
    try {
      const result = await this.contract.verifyCertificate(certificateId);
      
      if (!result.isValid) {
        return null;
      }

      return {
        id: certificateId,
        student: result.student,
        courseId: result.courseId,
        courseName: result.courseName,
        completionDate: new Date(result.completionDate.toNumber() * 1000),
        ipfsHash: result.ipfsHash,
        isValid: result.isValid,
        mintedAt: new Date(), // Would need to fetch from contract
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return null;
    }
  }

  /**
   * Get all certificates for a student
   */
  async getStudentCertificates(studentAddress: string): Promise<Certificate[]> {
    try {
      const certificateIds = await this.contract.getStudentCertificates(studentAddress);
      
      const certificates = await Promise.all(
        certificateIds.map(async (id: any) => {
          const cert = await this.contract.getCertificate(id);
          return {
            id: id.toString(),
            student: cert.student,
            courseId: cert.courseId,
            courseName: cert.courseName,
            completionDate: new Date(cert.completionDate.toNumber() * 1000),
            ipfsHash: cert.ipfsHash,
            isValid: cert.isValid,
            mintedAt: new Date(cert.mintedAt.toNumber() * 1000),
          };
        })
      );

      return certificates.filter(cert => cert.isValid);
    } catch (error) {
      console.error('Error fetching student certificates:', error);
      return [];
    }
  }

  /**
   * Mint a new certificate (requires minter role)
   */
  async mintCertificate(
    studentAddress: string,
    courseId: string,
    courseName: string,
    completionDate: Date,
    ipfsHash: string
  ): Promise<string | null> {
    try {
      const tx = await this.contract.mintCertificate(
        studentAddress,
        courseId,
        courseName,
        Math.floor(completionDate.getTime() / 1000), // Convert to Unix timestamp
        ipfsHash
      );

      const receipt = await tx.wait();
      
      // Extract certificate ID from event
      const event = receipt.events?.find((e: any) => e.event === 'CertificateMinted');
      if (event && event.args) {
        return event.args.certificateId.toString();
      }

      return null;
    } catch (error) {
      console.error('Error minting certificate:', error);
      throw error;
    }
  }

  /**
   * Log a verification event
   */
  async logVerification(certificateId: string): Promise<void> {
    try {
      const tx = await this.contract.logVerification(certificateId);
      await tx.wait();
    } catch (error) {
      console.error('Error logging verification:', error);
    }
  }

  /**
   * Get total number of certificates issued
   */
  async getTotalCertificates(): Promise<number> {
    try {
      const total = await this.contract.totalCertificates();
      return total.toNumber();
    } catch (error) {
      console.error('Error getting total certificates:', error);
      return 0;
    }
  }

  /**
   * Check if address has minter role
   */
  async isMinter(address: string): Promise<boolean> {
    try {
      const MINTER_ROLE = await this.contract.MINTER_ROLE();
      return await this.contract.hasRole(address, MINTER_ROLE);
    } catch (error) {
      console.error('Error checking minter role:', error);
      return false;
    }
  }

  /**
   * Check if address has admin role
   */
  async isAdmin(address: string): Promise<boolean> {
    try {
      const ADMIN_ROLE = await this.contract.ADMIN_ROLE();
      return await this.contract.hasRole(address, ADMIN_ROLE);
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  }
}

// Hook for React components
export function useCertificateContract(signer?: Signer) {
  const provider = new BrowserProvider(window.ethereum);
  return new CertificateContract(provider, signer);
}