# Blockchain Certificate Flow - Visueel

## 🎯 Het Complete Proces

```
┌─────────────────┐
│   Gebruiker     │
│ voltooit cursus │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   GroeimetAI    │     │    Database     │
│    Platform     │────▶│  (Certificate)  │
└────────┬────────┘     └─────────────────┘
         │
         │ Auto-mint triggered
         ▼
┌─────────────────┐
│  Check Wallet   │
│   Connected?    │
└────┬───────┬────┘
     │ No    │ Yes
     ▼       ▼
┌─────────┐ ┌──────────────┐
│  Queue  │ │ Start Minting │
└─────────┘ └──────┬───────┘
                   │
                   ▼
         ┌─────────────────┐
         │ 1. Create JSON  │
         │   Metadata      │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐     ┌─────────────┐
         │ 2. Upload to    │────▶│   Pinata    │
         │    IPFS         │     │   (IPFS)    │
         └────────┬────────┘     └─────────────┘
                  │                      │
                  │                      ▼
                  │              Returns: QmX4s6...
                  │
                  ▼
         ┌─────────────────┐     ┌─────────────┐
         │ 3. Mint on      │────▶│   Polygon   │
         │    Blockchain   │     │ Blockchain  │
         └────────┬────────┘     └─────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ 4. Update DB    │
         │ with TX Hash    │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   Certificate   │
         │   On-Chain! 🎉  │
         └─────────────────┘
```

## 📊 Data Storage Breakdown

### On-Chain (Blockchain)
```
{
  certificateId: "cert_abc123",
  ipfsHash: "QmX4s6...",         // 46 chars
  studentAddress: "0x1234...",    // 42 chars
  issueDate: 1703001600,          // timestamp
  courseId: "web3-basics"         // short ID
}
```
**Kosten**: ~€0.01-0.05

### Off-Chain (IPFS via Pinata)
```json
{
  "studentName": "Jan Jansen",
  "courseName": "Web3 Development Basics",
  "instructorName": "Dr. Smith",
  "completionDate": "2024-01-15",
  "score": 95,
  "grade": "A+",
  "achievements": ["Perfect Score", "Fast Learner"],
  "certificateNumber": "CERT-2024-001",
  "institution": "GroeimetAI Academy",
  "description": "Successfully completed all modules...",
  "skills": ["Solidity", "Smart Contracts", "DeFi"]
}
```
**Kosten**: Gratis (tot 1GB)

## 🔄 Verificatie Flow

```
Iemand wil certificaat verifiëren
            │
            ▼
    Scan QR Code / Enter ID
            │
            ▼
┌───────────────────────────┐
│  1. Query Blockchain      │
│     for Certificate ID    │
└────────────┬──────────────┘
             │
             ▼
      Get IPFS Hash
             │
             ▼
┌───────────────────────────┐
│  2. Fetch from IPFS       │
│     via Pinata Gateway    │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│  3. Display Certificate   │
│     with Blockchain Proof │
└───────────────────────────┘
```

## 💡 Waarom Deze Architectuur?

### ❌ Alles On-Chain
```
Certificaat (1KB) → Blockchain
Kosten: €5-50 per certificaat 😱
```

### ✅ Hybrid (Onze Oplossing)
```
Hash (46 bytes) → Blockchain = €0.01
Data (1KB) → IPFS = Gratis
Totaal: €0.01 per certificaat 😊
```

## 🔒 Veiligheid

```
┌─────────────────┐
│   Certificate   │
│      Data       │
└────────┬────────┘
         │
         ▼
    SHA-256 Hash ──────┐
         │             │
         ▼             ▼
   ┌──────────┐  ┌──────────┐
   │   IPFS   │  │Blockchain│
   │  QmX4s6  │  │  QmX4s6  │
   └──────────┘  └──────────┘
         │             │
         └─────┬───────┘
               │
               ▼
         Hashes Match?
         ✅ = Valid
         ❌ = Tampered
```

## 🚀 Scaling

### 1 Certificate
- Blockchain: €0.01
- IPFS: 1KB
- Time: 10 sec

### 1,000 Certificates
- Blockchain: €10-50
- IPFS: 1MB (gratis)
- Time: 3 hours (batched)

### 1,000,000 Certificates
- Blockchain: €10,000-50,000
- IPFS: 1GB (gratis met Pinata)
- Time: Batched over days

### Optimalisaties:
- Batch minting (100 per TX)
- Queue systeem
- Retry mechanisme
- Gas price monitoring