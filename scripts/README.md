# GroeiMetAI Blockchain Scripts

This directory contains scripts for deploying and managing the blockchain certificate system.

## Available Scripts

### 🚀 deploy-blockchain.sh
Main deployment script for smart contracts. Handles deployment to Mumbai testnet and Polygon mainnet with automatic verification.

```bash
./scripts/deploy-blockchain.sh
```

Features:
- Interactive network selection
- Automatic contract compilation and testing
- Contract verification on Polygonscan
- Environment variable updates
- Deployment report generation

### 📋 deploy-certificate-registry.js
JavaScript deployment script for the CertificateRegistry contract. Used by the main deployment script.

```bash
npx hardhat run scripts/deploy-certificate-registry.js --network mumbai
```

### 🔐 setup-roles.js
Configures minter and admin roles for the deployed contract.

```bash
npm run setup:roles
# or
npx hardhat run scripts/setup-roles.js --network mumbai
```

Features:
- Grants MINTER_ROLE to authorized addresses
- Grants ADMIN_ROLE to admin addresses
- Tests minting capability
- Lists current role holders

### 🏥 health-check.sh
Comprehensive health check for the blockchain infrastructure.

```bash
./scripts/health-check.sh
# or
npm run health:check
```

Checks:
- Node.js and dependencies
- Contract compilation status
- Network connectivity
- Deployed contract status
- IPFS/Pinata configuration
- Wallet balances
- Docker services (if applicable)

### 📊 generate-deployment-report.sh
Generates deployment reports after contract deployment.

```bash
./scripts/generate-deployment-report.sh
```

Creates:
- Markdown deployment report
- JSON deployment summary
- Post-deployment checklist

## Usage Examples

### Deploy to Mumbai Testnet
```bash
# Set up environment variables
cp .env.example .env
# Edit .env with your keys

# Run deployment
./scripts/deploy-blockchain.sh
# Select option 2 for Mumbai

# Verify deployment
./scripts/health-check.sh
```

### Deploy to Local Development
```bash
# Start local blockchain
npm run blockchain:local

# Deploy contracts
npm run deploy:local

# Set up roles
npm run setup:roles
```

### Migrate Existing Certificates
```bash
# Dry run first
npm run migrate:certificates -- --network mumbai --dry-run

# Actual migration
npm run migrate:certificates -- --network mumbai --batch-size 10
```

## Environment Variables

Required environment variables for scripts:

```bash
# Deployment wallet
PRIVATE_KEY=your_wallet_private_key

# RPC endpoints
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# API keys
POLYGONSCAN_API_KEY=your_polygonscan_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key

# Authorized addresses
AUTHORIZED_MINTERS=0x123...,0x456...
ADMIN_WALLETS=0x789...
```

## Script Development

When creating new scripts:

1. **Shell Scripts**: Add shebang `#!/bin/bash` and make executable with `chmod +x`
2. **JavaScript Scripts**: Use Hardhat runtime environment with `const hre = require("hardhat")`
3. **TypeScript Scripts**: Use tsx runner and proper type imports
4. **Error Handling**: Always include proper error handling and exit codes
5. **Logging**: Use colored output for better visibility (chalk for JS, ANSI colors for bash)

## Troubleshooting

### Permission Denied
```bash
chmod +x scripts/*.sh
```

### Missing Dependencies
```bash
npm install
```

### Contract Not Found
Ensure contracts are compiled:
```bash
npx hardhat compile
```

### Network Connection Issues
Check RPC endpoints in .env file and network connectivity.

## Security Notes

- **NEVER** commit private keys to version control
- Use hardware wallets for mainnet deployments
- Test thoroughly on testnet before mainnet deployment
- Keep deployment artifacts secure
- Regularly audit role assignments