# GroeiMetAI Blockchain Certificate System Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Wallet Configuration](#wallet-configuration)
5. [IPFS/Pinata Setup](#ipfspinata-setup)
6. [Smart Contract Deployment](#smart-contract-deployment)
7. [Frontend Integration](#frontend-integration)
8. [Certificate Migration](#certificate-migration)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## Overview

The GroeiMetAI platform uses blockchain technology to issue tamper-proof, verifiable course completion certificates on the Polygon network. This guide covers the complete setup process from development to production deployment.

### Architecture Components
- **Smart Contract**: CertificateRegistry.sol on Polygon
- **Storage**: IPFS via Pinata for certificate metadata
- **Frontend**: Next.js integration with ethers.js
- **Networks**: Polygon Mainnet & Mumbai Testnet

## Prerequisites

### Required Software
- Node.js v16+ and npm
- Git
- MetaMask or similar Web3 wallet
- jq (for JSON processing in scripts)

### Installation Commands
```bash
# macOS
brew install node jq

# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm jq

# Verify installations
node --version
npm --version
jq --version
```

### Required Accounts
1. **Polygon Wallet**: For deploying contracts
2. **Polygonscan Account**: For contract verification
3. **Pinata Account**: For IPFS storage
4. **Alchemy/Infura Account**: For RPC endpoints (optional but recommended)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd groeimetai-cursus-platform
npm install
```

### 2. Environment Variables
Create a `.env` file based on `.env.example`:

```bash
# Blockchain RPC URLs (Use Alchemy/Infura for production)
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Deployment wallet private key (NEVER commit!)
PRIVATE_KEY=your_wallet_private_key_here

# Contract addresses (populated after deployment)
NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON=
NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI=
NEXT_PUBLIC_CERTIFICATE_CONTRACT_LOCAL=

# Polygonscan API key for verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# IPFS/Pinata Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

# Optional: Gas price tracking
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Minter wallet addresses (comma-separated)
AUTHORIZED_MINTERS=0x...,0x...

# Admin wallet addresses
ADMIN_WALLETS=0x...
```

### 3. Security Best Practices
- **NEVER** commit private keys or secrets to version control
- Use hardware wallets for production deployments
- Implement multi-signature wallets for admin functions
- Use separate wallets for deployment and minting
- Enable 2FA on all service accounts

## Wallet Configuration

### 1. Create Deployment Wallet
```bash
# Generate new wallet (save the output securely!)
npx hardhat accounts
```

### 2. Fund Wallet
- **Mumbai Testnet**: Get test MATIC from [Mumbai Faucet](https://faucet.polygon.technology/)
- **Polygon Mainnet**: Purchase MATIC from an exchange and transfer to wallet

### 3. MetaMask Setup
1. Install MetaMask browser extension
2. Add Polygon networks:
   - **Polygon Mainnet**
     - Network Name: Polygon
     - RPC URL: https://polygon-rpc.com
     - Chain ID: 137
     - Currency Symbol: MATIC
     - Block Explorer: https://polygonscan.com
   
   - **Mumbai Testnet**
     - Network Name: Mumbai
     - RPC URL: https://rpc-mumbai.maticvigil.com
     - Chain ID: 80001
     - Currency Symbol: MATIC
     - Block Explorer: https://mumbai.polygonscan.com

## IPFS/Pinata Setup

### 1. Create Pinata Account
1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Generate API keys:
   - Go to API Keys section
   - Create new key with permissions:
     - `pinFileToIPFS`
     - `pinJSONToIPFS`
     - `unpin`
   - Save keys to `.env` file

### 2. Certificate Metadata Structure
```json
{
  "name": "GroeiMetAI Course Certificate",
  "description": "Certificate of completion for [Course Name]",
  "image": "ipfs://QmXxx...", // Certificate image
  "attributes": [
    {
      "trait_type": "Student Name",
      "value": "John Doe"
    },
    {
      "trait_type": "Course",
      "value": "N8n & Make.com Basics"
    },
    {
      "trait_type": "Completion Date",
      "value": "2024-01-15"
    },
    {
      "trait_type": "Certificate ID",
      "value": "CERT-2024-001"
    },
    {
      "trait_type": "Instructor",
      "value": "GroeiMetAI Team"
    }
  ]
}
```

### 3. Upload Certificate Template
```javascript
// scripts/upload-certificate-template.js
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

async function uploadTemplate() {
  const readableStreamForFile = fs.createReadStream('./templates/certificate.png');
  const result = await pinata.pinFileToIPFS(readableStreamForFile);
  console.log('Template uploaded:', result.IpfsHash);
}
```

## Smart Contract Deployment

### 1. Compile Contracts
```bash
npx hardhat compile
```

### 2. Run Tests
```bash
npx hardhat test
npx hardhat coverage  # Check test coverage
```

### 3. Deploy Contract

#### Option A: Using deployment script
```bash
# Make script executable
chmod +x scripts/deploy-blockchain.sh

# Run deployment
./scripts/deploy-blockchain.sh
```

#### Option B: Manual deployment
```bash
# Deploy to Mumbai testnet
npx hardhat run scripts/deploy-certificate-registry.js --network mumbai

# Deploy to Polygon mainnet (be careful!)
npx hardhat run scripts/deploy-certificate-registry.js --network polygon
```

### 4. Verify Contract
```bash
# Verify on Mumbai
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>

# Verify on Polygon
npx hardhat verify --network polygon <CONTRACT_ADDRESS>
```

### 5. Post-Deployment Configuration

#### Grant Roles
```javascript
// scripts/setup-roles.js
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON;
  const contract = await ethers.getContractAt("CertificateRegistry", contractAddress);
  
  // Grant minter roles
  const MINTER_ROLE = await contract.MINTER_ROLE();
  const minters = process.env.AUTHORIZED_MINTERS.split(',');
  
  for (const minter of minters) {
    await contract.grantRole(MINTER_ROLE, minter.trim());
    console.log(`Granted minter role to: ${minter}`);
  }
}

main();
```

## Frontend Integration

### 1. Update Next.js Configuration
Update `next.config.js` with blockchain environment variables (see updated file).

### 2. Initialize Web3 Provider
```typescript
// src/hooks/useWeb3.ts
import { ethers } from 'ethers';
import { useMemo } from 'react';

export function useWeb3() {
  const provider = useMemo(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.providers.Web3Provider(window.ethereum);
    }
    // Fallback to read-only provider
    return new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL
    );
  }, []);
  
  return { provider };
}
```

### 3. Certificate Verification Component
```typescript
// src/components/CertificateVerification.tsx
import { useState } from 'react';
import { useCertificateContract } from '@/lib/blockchain/certificate-contract';

export function CertificateVerification() {
  const [certificateId, setCertificateId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const contract = useCertificateContract();
  
  const verifyCertificate = async () => {
    const result = await contract.verifyCertificate(certificateId);
    setCertificate(result);
    
    // Log verification event
    await contract.logVerification(certificateId);
  };
  
  // Component implementation...
}
```

## Certificate Migration

### 1. Export Existing Certificates
```bash
# Export from database
npm run export:certificates
```

### 2. Run Migration Script
```bash
# Migrate to blockchain
npm run migrate:certificates -- --network mumbai --batch-size 10
```

### 3. Verify Migration
```bash
# Check migration status
npm run verify:migration
```

## Monitoring & Maintenance

### 1. Contract Monitoring
- Set up Polygonscan email alerts for contract activity
- Monitor gas prices at [Polygon Gas Station](https://gasstation-mainnet.matic.network/)
- Track certificate minting events

### 2. IPFS Monitoring
- Monitor Pinata usage and limits
- Set up backup pinning service
- Implement regular metadata backups

### 3. Health Checks
```bash
# Run health check script
./scripts/health-check.sh
```

## Troubleshooting

### Common Issues

#### 1. "Insufficient funds for gas"
- **Solution**: Add more MATIC to deployment wallet
- Check current gas prices and adjust in config

#### 2. "Contract verification failed"
- **Solution**: Ensure Polygonscan API key is correct
- Wait a few minutes after deployment before verifying
- Check constructor arguments match

#### 3. "IPFS upload failed"
- **Solution**: Verify Pinata API keys
- Check Pinata account limits
- Ensure file size is within limits (max 100MB)

#### 4. "Transaction failed"
- **Solution**: Check wallet has minter/admin role
- Verify contract is not paused
- Check certificate data validity

#### 5. "MetaMask connection issues"
- **Solution**: Clear MetaMask cache
- Reset account in MetaMask settings
- Ensure correct network is selected

### Debug Commands
```bash
# Check contract state
npx hardhat console --network mumbai

# In console:
const contract = await ethers.getContractAt("CertificateRegistry", "CONTRACT_ADDRESS")
await contract.paused()
await contract.totalCertificates()

# Check roles
const MINTER_ROLE = await contract.MINTER_ROLE()
await contract.hasRole(MINTER_ROLE, "YOUR_ADDRESS")
```

### Support Resources
- [Polygon Documentation](https://docs.polygon.technology/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Pinata Documentation](https://docs.pinata.cloud/)

### Emergency Procedures

#### Contract Pause
```javascript
// Only admin can pause
await contract.pause();
```

#### Role Revocation
```javascript
// Revoke compromised minter
const MINTER_ROLE = await contract.MINTER_ROLE();
await contract.revokeRole(MINTER_ROLE, "COMPROMISED_ADDRESS");
```

#### Certificate Revocation
```javascript
// Revoke invalid certificate
await contract.revokeCertificate(certificateId);
```

## Production Checklist

- [ ] All tests passing
- [ ] Contract audited (recommended for mainnet)
- [ ] Multi-sig wallet setup for admin functions
- [ ] Backup strategies in place
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team trained on procedures
- [ ] Emergency contacts documented
- [ ] Gas optimization completed
- [ ] Rate limiting implemented

---

For additional support, contact the GroeiMetAI development team or create an issue in the repository.