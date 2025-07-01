# GroeiMetAI Certificate Registry Smart Contract

## Overview

The CertificateRegistry smart contract manages course certificates for the GroeiMetAI platform on the Polygon blockchain. It provides secure, gas-efficient certificate minting, verification, and management with role-based access control.

## Features

- **Certificate Minting**: Authorized minters can create certificates with metadata stored on IPFS
- **Verification System**: Anyone can verify certificate authenticity by ID
- **Student Tracking**: Query all certificates for a specific student address
- **Revocation**: Admins can revoke certificates if needed
- **Gas Optimized**: Designed for efficient deployment on Polygon
- **Access Control**: Role-based permissions (Admin, Minter)
- **Emergency Pause**: Contract can be paused in emergencies

## Contract Architecture

### Roles
- `DEFAULT_ADMIN_ROLE`: Can grant/revoke other roles
- `ADMIN_ROLE`: Can revoke certificates and pause/unpause
- `MINTER_ROLE`: Can mint new certificates

### Key Functions

#### Minting
```solidity
mintCertificate(
    address student,
    string courseId,
    string courseName,
    uint256 completionDate,
    string ipfsHash
) returns (uint256 certificateId)
```

#### Verification
```solidity
verifyCertificate(uint256 certificateId) returns (
    bool isValid,
    address student,
    string courseId,
    string courseName,
    uint256 completionDate,
    string ipfsHash
)
```

#### Query Functions
- `getStudentCertificates(address student)`: Get all certificate IDs for a student
- `getCertificate(uint256 id)`: Get full certificate details
- `totalCertificates()`: Get total number of issued certificates

## Deployment

### Install Dependencies
```bash
npm install
```

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm run test:contracts
```

### Deploy to Mumbai Testnet
```bash
npm run deploy:mumbai
```

### Deploy to Polygon Mainnet
```bash
npm run deploy:polygon
```

## Configuration

Create a `.env` file with:
```
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_api_key_here
```

## Gas Optimization

The contract is optimized for Polygon with:
- Efficient storage patterns
- Minimal state changes per transaction
- Optimized compiler settings
- IR-based code generation

Average gas costs:
- Minting: ~250,000 gas
- Verification: ~30,000 gas (view function)

## Security Features

- OpenZeppelin AccessControl for role management
- Pausable for emergency stops
- ReentrancyGuard for reentrancy protection
- Input validation on all functions
- Duplicate prevention via IPFS hash tracking

## Events

- `CertificateMinted`: Emitted when a new certificate is created
- `CertificateVerified`: Emitted when a certificate is verified
- `CertificateRevoked`: Emitted when a certificate is revoked

## Integration

### Frontend Integration
```javascript
// Connect to contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(contractAddress, abi, provider);

// Verify certificate
const result = await contract.verifyCertificate(certificateId);
```

### Backend Integration
```javascript
// Using ethers.js
const contract = new ethers.Contract(
    contractAddress,
    abi,
    wallet.connect(provider)
);

// Mint certificate
const tx = await contract.mintCertificate(
    studentAddress,
    courseId,
    courseName,
    completionDate,
    ipfsHash
);
```

## Testing

The test suite covers:
- Role management
- Certificate minting
- Verification flows
- Revocation
- Edge cases and security
- Gas optimization

Run tests with coverage:
```bash
npx hardhat coverage
```

## License

MIT