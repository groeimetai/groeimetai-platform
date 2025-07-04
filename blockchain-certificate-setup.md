# Blockchain Certificate Setup

## Current Issue
Your certificate wasn't recorded on the blockchain because the server wallet is not configured. The error "Server wallet private key not configured" indicates that the `BLOCKCHAIN_PRIVATE_KEY` environment variable is missing.

## To Enable Blockchain Recording

### 1. Set Environment Variables in GitHub Secrets
Add these secrets to your GitHub repository:
- `BLOCKCHAIN_PRIVATE_KEY`: Your wallet's private key (with minting permissions)
- `NEXT_PUBLIC_BLOCKCHAIN_ENABLED`: Set to `true`
- `NEXT_PUBLIC_DEFAULT_NETWORK`: Set to `polygon` or `mumbai` (testnet)
- `NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON`: Your deployed contract address

### 2. Wallet Requirements
The wallet associated with `BLOCKCHAIN_PRIVATE_KEY` must:
- Have MATIC tokens for gas fees
- Have minting permissions on the certificate smart contract
- Be the owner or authorized minter of the contract

### 3. Current Behavior
When blockchain is not properly configured:
- Certificates are still generated and stored in Firebase
- PDF generation works normally
- Verification works through the database
- Blockchain recording is attempted but fails silently
- Certificates are added to a queue for future minting

## Certificate Access Points
Your certificate is now accessible from:
1. **Dashboard** - "My Courses" widget shows a Certificate button for completed courses
2. **Course Page** - "Bekijk Certificaat" button appears after completion
3. **Achievements Widget** - Shows your recent certificates
4. **My Certificates Page** - `/dashboard/certificates` for all certificates

## Manual Certificate Generation
If you need to regenerate or mint certificates on blockchain later:
1. Certificates are queued in the `certificate_queue` collection
2. Once blockchain is configured, queued certificates can be processed
3. The system will retry failed blockchain recordings automatically