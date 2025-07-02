# Blockchain Integration voor GroeiMetAI Platform

Deze documentatie beschrijft de blockchain integratie voor het GroeiMetAI certificaten systeem.

## Overzicht

De blockchain integratie biedt de mogelijkheid om certificaten te minten en verifiëren op de blockchain, waardoor de authenticiteit en onveranderlijkheid van certificaten gegarandeerd wordt.

### Kernfunctionaliteiten

- **Wallet Connectie**: Ondersteuning voor MetaMask en andere Web3 wallets
- **Certificate Minting**: Certificaten worden als NFTs gemint op de blockchain
- **IPFS Metadata**: Certificate metadata wordt opgeslagen op IPFS
- **Verificatie**: On-chain verificatie van certificaat authenticiteit
- **Multi-network**: Ondersteuning voor Polygon mainnet en Mumbai testnet

## Architectuur

### Services

1. **Web3Provider** (`/src/lib/blockchain/web3-provider.ts`)
   - Beheert wallet connecties
   - Handelt network switching af
   - Biedt transaction management

2. **IPFSService** (`/src/lib/blockchain/ipfs-service.ts`)
   - Upload certificate metadata naar IPFS
   - Retrieval van metadata
   - Pinning via Pinata

3. **BlockchainService** (`/src/services/blockchainService.ts`)
   - Hoofdservice voor blockchain operaties
   - Certificate minting
   - Certificate verificatie
   - Event listeners

4. **CertificateContract** (`/src/lib/blockchain/certificate-contract.ts`)
   - Smart contract wrapper
   - Direct contract interactie

## Configuratie

### Environment Variables

```env
# Blockchain
NEXT_PUBLIC_BLOCKCHAIN_ENABLED=true
NEXT_PUBLIC_DEFAULT_NETWORK=mumbai
NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON=0x...
NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI=0x...
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key

# IPFS (Pinata)
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_IPFS_API_URL=https://api.pinata.cloud
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Optional
NEXT_PUBLIC_AUTO_CONNECT=false
NEXT_PUBLIC_READ_ONLY_MODE=false
NEXT_PUBLIC_TX_TIMEOUT=300000
NEXT_PUBLIC_MAX_RETRIES=3
NEXT_PUBLIC_CONFIRMATIONS=2
```

## Gebruik

### 1. Wallet Connectie

```typescript
import { useBlockchainService } from '@/services/blockchainService'

function MyComponent() {
  const { connectWallet, isConnected, address } = useBlockchainService()
  
  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }
  
  return (
    <button onClick={handleConnect}>
      {isConnected ? `Connected: ${address}` : 'Connect Wallet'}
    </button>
  )
}
```

### 2. Certificate Minting

```typescript
const { mintCertificate } = useBlockchainService()

const mintResult = await mintCertificate({
  studentAddress: '0x...',
  studentName: 'John Doe',
  courseId: 'course-123',
  courseName: 'AI Fundamentals',
  instructorName: 'Jane Smith',
  completionDate: new Date(),
  certificateNumber: 'CERT-2024-001',
  certificateId: 'cert-abc123',
  grade: 'A',
  score: 95,
  achievements: ['Perfect Score'],
})

if (mintResult.success) {
  console.log('Certificate minted:', mintResult.transactionHash)
}
```

### 3. Certificate Verificatie

```typescript
const { verifyCertificate } = useBlockchainService()

const verifyResult = await verifyCertificate('cert-abc123')

if (verifyResult.isValid) {
  console.log('Certificate is valid!')
  console.log('Verification:', verifyResult.verification)
}
```

### 4. UI Component

```tsx
import { BlockchainVerification } from '@/components/certificate'

<BlockchainVerification 
  certificate={certificate}
  onVerificationComplete={(verification) => {
    console.log('Verification complete:', verification)
  }}
/>
```

## Mock Mode

Voor development zonder blockchain connectie wordt automatisch een mock mode gebruikt:

- Mock blockchain hashes en transacties
- Simuleert IPFS uploads
- Geen echte wallet connectie vereist

## Security Overwegingen

1. **Private Keys**: Worden nooit opgeslagen, alleen wallet providers gebruiken
2. **Minting Permissions**: Alleen geautoriseerde adressen kunnen certificaten minten
3. **IPFS Pinning**: Metadata wordt gepind om beschikbaarheid te garanderen
4. **Transaction Validation**: Alle transacties worden gevalideerd voor verzending

## Testing

### Lokaal Testen

1. Zet `NEXT_PUBLIC_BLOCKCHAIN_ENABLED=false` voor mock mode
2. Of gebruik Mumbai testnet met test MATIC

### Testnet Setup

1. Voeg Mumbai testnet toe aan MetaMask
2. Krijg test MATIC van een faucet
3. Deploy contract naar Mumbai
4. Update environment variables

## Troubleshooting

### Wallet Connectie Problemen

- Zorg dat MetaMask is geïnstalleerd
- Check of de juiste network is geselecteerd
- Clear browser cache bij persistente problemen

### Transaction Failures

- Check wallet balance voor gas fees
- Verifieer network configuratie
- Controleer contract permissions

### IPFS Upload Errors

- Verifieer Pinata API credentials
- Check API rate limits
- Test met kleinere metadata objecten

## Toekomstige Verbeteringen

- [ ] Multi-signature minting voor extra security
- [ ] Batch minting voor efficiency
- [ ] Cross-chain certificaten
- [ ] Decentralized storage alternatieven
- [ ] Certificate revocation mechanisme