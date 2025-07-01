# Blockchain Certificate Integration Guide

## Overview

This guide explains how to integrate the blockchain-based certificate system with the existing GroeiMetAI platform.

## Integration Steps

### 1. Environment Setup

Add the following to your `.env.local`:
```bash
# Polygon Network
NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON=0x... # Production contract address
NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI=0x... # Testnet contract address

# Private key for server-side minting (store securely!)
CERTIFICATE_MINTER_PRIVATE_KEY=your_minter_private_key
```

### 2. Install Additional Dependencies

```bash
npm install ethers@^5.7.0
```

### 3. Server-Side Integration

Create a service for minting certificates when a course is completed:

```typescript
// src/services/certificate-minter.ts
import { ethers } from 'ethers';
import { CertificateContract } from '@/lib/blockchain/certificate-contract';

export class CertificateMinter {
  private contract: CertificateContract;
  private wallet: ethers.Wallet;

  constructor() {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL
    );
    
    this.wallet = new ethers.Wallet(
      process.env.CERTIFICATE_MINTER_PRIVATE_KEY!,
      provider
    );
    
    this.contract = new CertificateContract(provider, this.wallet);
  }

  async mintCertificate(
    studentAddress: string,
    courseId: string,
    courseName: string,
    completionDate: Date,
    certificateData: any
  ): Promise<string> {
    // Upload certificate metadata to IPFS first
    const ipfsHash = await this.uploadToIPFS(certificateData);
    
    // Mint on blockchain
    const certificateId = await this.contract.mintCertificate(
      studentAddress,
      courseId,
      courseName,
      completionDate,
      ipfsHash
    );
    
    return certificateId!;
  }

  private async uploadToIPFS(data: any): Promise<string> {
    // Implement IPFS upload logic
    // Return IPFS hash
    return 'QmExampleHash...';
  }
}
```

### 4. Update Course Completion Handler

Modify the existing course completion logic:

```typescript
// In your course completion API route
import { CertificateMinter } from '@/services/certificate-minter';

async function handleCourseCompletion(userId: string, courseId: string) {
  // Existing completion logic...
  
  // Add blockchain certificate minting
  if (process.env.ENABLE_BLOCKCHAIN_CERTIFICATES === 'true') {
    const minter = new CertificateMinter();
    
    try {
      const certificateId = await minter.mintCertificate(
        userWalletAddress, // Need to get this from user profile
        courseId,
        courseName,
        new Date(),
        {
          studentName: userName,
          courseTitle: courseName,
          completionDate: new Date().toISOString(),
          score: finalScore,
          // ... other metadata
        }
      );
      
      // Store certificate ID in database
      await saveCertificateId(userId, courseId, certificateId);
      
    } catch (error) {
      console.error('Failed to mint certificate:', error);
      // Continue without blockchain certificate
    }
  }
}
```

### 5. Frontend Certificate Verification

Create a verification page component:

```typescript
// src/components/certificate-verifier.tsx
import { useState } from 'react';
import { ethers } from 'ethers';
import { CertificateContract } from '@/lib/blockchain/certificate-contract';

export function CertificateVerifier() {
  const [certificateId, setCertificateId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyCertificate = async () => {
    setLoading(true);
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new CertificateContract(provider);
      
      const cert = await contract.verifyCertificate(certificateId);
      setCertificate(cert);
      
      // Log verification event
      await contract.logVerification(certificateId);
      
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Certificate ID"
        value={certificateId}
        onChange={(e) => setCertificateId(e.target.value)}
      />
      <button onClick={verifyCertificate} disabled={loading}>
        Verify Certificate
      </button>
      
      {certificate && (
        <div>
          <h3>Certificate Valid!</h3>
          <p>Student: {certificate.student}</p>
          <p>Course: {certificate.courseName}</p>
          <p>Completion Date: {certificate.completionDate.toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
```

### 6. User Wallet Integration

Add wallet connection for users to view their certificates:

```typescript
// src/hooks/use-wallet.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      setAddress(address);
      setSigner(signer);
    }
  };

  return { address, signer, connectWallet };
}
```

### 7. Migration Strategy

For existing certificates:

1. **Gradual Migration**: Start issuing blockchain certificates for new completions
2. **Batch Migration**: Create a script to mint certificates for historical completions
3. **Hybrid Approach**: Maintain both systems during transition

Example migration script:
```typescript
// scripts/migrate-certificates.ts
async function migrateCertificates() {
  const existingCertificates = await getExistingCertificates();
  const minter = new CertificateMinter();
  
  for (const cert of existingCertificates) {
    try {
      const blockchainId = await minter.mintCertificate(
        cert.userWalletAddress,
        cert.courseId,
        cert.courseName,
        cert.completionDate,
        cert.metadata
      );
      
      await updateCertificateRecord(cert.id, blockchainId);
      
    } catch (error) {
      console.error(`Failed to migrate certificate ${cert.id}:`, error);
    }
  }
}
```

## Security Considerations

1. **Private Key Management**: Never expose minter private keys in frontend code
2. **Access Control**: Implement proper authentication before minting
3. **Rate Limiting**: Add rate limits to prevent spam
4. **Gas Management**: Monitor and optimize gas costs

## Testing

1. Deploy to Mumbai testnet first
2. Test all user flows
3. Verify gas costs are acceptable
4. Test error scenarios

## Monitoring

Set up monitoring for:
- Failed minting attempts
- Gas price spikes
- Contract pause status
- Certificate verification rates

## Support

For issues or questions:
- Check contract logs on Polygonscan
- Review test suite for examples
- Contact blockchain team for assistance