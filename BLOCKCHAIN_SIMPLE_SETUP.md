# 🚀 Blockchain Setup - Eenvoudige Uitleg

## Wat hebben we gebouwd?

Een systeem dat certificaten **permanent** opslaat op de blockchain, zodat ze:
- ✅ Nooit verloren kunnen gaan
- ✅ Altijd verifieerbaar zijn
- ✅ Niet vervalst kunnen worden

## 📦 De Onderdelen Uitgelegd

### 1. **Blockchain (Polygon)** 
De "digitale kluis" waar certificaten worden opgeslagen.

**Waarom Polygon?**
- Ethereum = €50+ per certificaat 😱
- Polygon = €0.01 per certificaat 😊
- Zelfde veiligheid, 5000x goedkoper!

**Twee versies:**
- **Mumbai** = Testversie (gratis nepgeld)
- **Polygon** = Echte versie (kost echt geld)

### 2. **RPC Endpoint**
De "toegangsdeur" tot de blockchain.

**Wat is het?** Een URL waar je app naartoe praat:
```
App: "Hey, hoeveel MATIC heeft deze wallet?"
RPC: "0.5 MATIC"
```

**Opties:**
- **Gratis publiek** (rpc-mumbai.maticvigil.com) = Soms traag/onbetrouwbaar
- **Alchemy** (aanbevolen) = Betrouwbaar, gratis account mogelijk
- **QuickNode/Infura** = Ook goed, vergelijkbaar met Alchemy

### 3. **IPFS/Pinata**
De "blockchain-vriendelijke Dropbox".

**Waarom?**
- Certificaat data on-chain = Duur (€1+ per certificaat)
- Certificaat data op IPFS = Goedkoop (gratis tot 1GB)
- Blockchain slaat alleen kleine hash op = €0.01

**Hoe werkt het?**
```
1. Upload: "Hier is Jan's certificaat" → IPFS
2. IPFS: "Opgeslagen! Hash: QmX4s6..."
3. Blockchain: "Ik sla hash QmX4s6... op"
4. Later: "Toon certificaat QmX4s6..." → IPFS geeft data
```

## 🛠️ Setup in 10 Minuten

### Stap 1: Alchemy Account (3 min)
1. Ga naar [alchemy.com](https://alchemy.com)
2. Sign up (gratis)
3. Create new app:
   - Chain: Polygon
   - Network: Polygon Mumbai (voor testen)
4. Kopieer je API key

### Stap 2: Pinata Account (2 min)
1. Ga naar [pinata.cloud](https://pinata.cloud)
2. Sign up (gratis, 1GB opslag)
3. API Keys → New Key
4. Kopieer API Key & Secret

### Stap 3: MetaMask Setup (3 min)
1. Installeer [MetaMask](https://metamask.io)
2. Maak wallet aan
3. Voeg Mumbai netwerk toe:
   - Network Name: Mumbai Testnet
   - RPC URL: Je Alchemy URL
   - Chain ID: 80001
   - Symbol: MATIC

### Stap 4: Test MATIC Krijgen (2 min)
1. Ga naar [mumbaifaucet.com](https://mumbaifaucet.com)
2. Plak je wallet adres
3. Krijg gratis test MATIC

### Stap 5: Environment Setup
```bash
# Kopieer .env.example naar .env
cp .env.example .env
```

Vul in:
```env


# Van MetaMask (alleen voor deployment)

```

## 🎮 Testen

### 1. Start Lokaal
```bash
npm run dev
```

### 2. Test Flow
1. Maak/verdien een certificaat
2. Klik "Mint to Blockchain"
3. Connect MetaMask
4. Approve transaction (kost ~0.01 test MATIC)
5. Wacht 10 seconden
6. Certificaat staat nu op blockchain! 🎉

## 💰 Kosten Overzicht

### Testnet (Mumbai)
- **Alles gratis!** Gebruik nep-MATIC van faucet

### Mainnet (Echt)
- **Per certificaat**: ~€0.01-0.05
- **IPFS (Pinata)**: Gratis tot 1GB (~10.000 certificaten)
- **RPC (Alchemy)**: Gratis tot 300M requests/maand

### Voor 1000 certificaten:
- Blockchain: ~€10-50
- Opslag: Gratis
- Totaal: **~€0.01-0.05 per certificaat**

## ❓ Veelgestelde Vragen

**Q: Wat als Pinata offline gaat?**
A: IPFS is gedecentraliseerd. Data staat op meerdere nodes. Pinata is alleen voor het uploaden.

**Q: Kan ik van testnet naar mainnet?**
A: Ja! Deploy gewoon opnieuw op mainnet. Oude certificaten blijven op testnet.

**Q: Wat als ik geen MetaMask wil?**
A: Gebruikers hoeven geen wallet! Alleen jij (admin) voor het minten.

**Q: Hoeveel MATIC heb ik nodig?**
A: Voor testen: 0 (gebruik faucet). Voor productie: ~10 MATIC (~€7) voor 1000+ certificaten.

## 🚨 Belangrijk

1. **NOOIT** je private key delen of committen!
2. **Test eerst** alles op Mumbai
3. **Backup** je wallet seed phrase
4. **Monitor** je MATIC balance

## 🎯 Next Steps

1. ✅ Setup accounts (Alchemy, Pinata, MetaMask)
2. ✅ Krijg test MATIC
3. ✅ Deploy naar Mumbai: `./scripts/deploy-blockchain.sh`
4. ✅ Test een certificaat mint
5. ✅ Als alles werkt → Deploy naar mainnet!

---

**Hulp nodig?** Check `/docs/BLOCKCHAIN_SETUP.md` voor technische details!