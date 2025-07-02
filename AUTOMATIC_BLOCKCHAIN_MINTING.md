# 🤖 Automatische Blockchain Certificate Minting

## Overzicht

Elk certificaat dat wordt gegenereerd in GroeimetAI wordt **automatisch** op de blockchain vastgelegd. Gebruikers hoeven hier niets voor te doen - het gebeurt volledig automatisch op kosten van GroeimetAI.

## 🔄 Hoe het werkt

### 1. **Automatische Minting bij Generatie**
Wanneer een gebruiker een cursus voltooit:
1. Certificaat wordt gegenereerd
2. Metadata wordt geüpload naar IPFS (Pinata)
3. Certificate wordt **direct** gemint op Polygon blockchain
4. GroeimetAI betaalt de gas fees (~€0.02 per certificaat)
5. Gebruiker ontvangt blockchain-verified certificaat

### 2. **Server Wallet**
- GroeimetAI gebruikt een dedicated server wallet
- Wallet address: `0xa4B8eE764e82EeB1D6e9035a98E124F80277621A`
- Balance: 30.4 POL (genoeg voor ~600 certificaten)
- Automatische waarschuwingen bij lage balance

### 3. **Queue Systeem**
Als directe minting faalt (bijv. tijdelijk netwerkprobleem):
- Certificaat komt in een queue
- Queue wordt elke 5 minuten automatisch verwerkt
- Tot 3 retry pogingen per certificaat
- Admin dashboard voor monitoring

## 📊 Admin Dashboard

### Toegang
```
https://jouw-domein.com/admin/blockchain
```

### Features
- Real-time wallet balance monitoring
- Queue status (pending, processing, completed, failed)
- Cost analysis (€ per certificaat)
- Manual queue processing optie
- Success rate statistieken

## 🔧 Technische Setup

### 1. **Environment Variables**
```env
# Server wallet private key (GEHEIM!)
PRIVATE_KEY=jouw_private_key_hier

# Blockchain netwerk (polygon of mumbai)
NEXT_PUBLIC_DEFAULT_NETWORK=polygon

# Blockchain enabled
NEXT_PUBLIC_BLOCKCHAIN_ENABLED=true

# Webhook secret voor queue processing
BLOCKCHAIN_WEBHOOK_SECRET=een-geheim-token
```

### 2. **Automatische Queue Processing**
Voeg een cron job toe die elke 5 minuten draait:

**Vercel Cron (vercel.json):**
```json
{
  "crons": [{
    "path": "/api/blockchain/process-queue",
    "schedule": "*/5 * * * *"
  }]
}
```

**Of externe cron service:**
```bash
# Elke 5 minuten
*/5 * * * * curl -X POST https://jouw-domein.com/api/blockchain/process-queue \
  -H "Authorization: Bearer $BLOCKCHAIN_WEBHOOK_SECRET"
```

### 3. **Monitoring**
Check regelmatig:
- Wallet balance (waarschuwing bij < 1 POL)
- Failed queue items
- Gas prijzen op Polygon

## 💰 Kosten

### Per Certificaat
- Gas fee: ~0.05 POL
- In EUR: ~€0.02
- IPFS opslag: Gratis (Pinata free tier)

### Maandelijkse Schatting
- 100 certificaten: ~€2
- 500 certificaten: ~€10
- 1000 certificaten: ~€20

### Wallet Bijvullen
1. Koop POL op exchange (Binance, Coinbase)
2. Stuur naar: `0xa4B8eE764e82EeB1D6e9035a98E124F80277621A`
3. **BELANGRIJK**: Gebruik Polygon network, niet Ethereum!

## 🚨 Alerts & Monitoring

### Automatische Waarschuwingen
- Wallet balance < 1 POL
- Queue processing failures > 10
- Gas price spike > 200 gwei

### Manual Check
```bash
# Check wallet balance
curl https://jouw-domein.com/api/blockchain/process-queue

# Process queue manually
curl -X POST https://jouw-domein.com/api/blockchain/process-queue \
  -H "Authorization: Bearer $BLOCKCHAIN_WEBHOOK_SECRET"
```

## 🔐 Security

1. **Private Key**
   - NOOIT in code committen
   - Alleen in environment variables
   - Gebruik separate wallet voor server operations

2. **Webhook Secret**
   - Verander regelmatig
   - Gebruik sterke random string
   - Check altijd in production

3. **Rate Limiting**
   - Max 10 certificaten per queue run
   - Prevents gas spike attacks
   - Manual override mogelijk via admin

## 📈 Toekomstige Verbeteringen

1. **Multi-wallet Support**
   - Load balancing over meerdere wallets
   - Automatic failover

2. **Gas Optimalisatie**
   - Batch minting voor lagere kosten
   - Dynamic gas pricing

3. **User Wallets**
   - Optie voor gebruikers om eigen wallet te koppelen
   - Certificaten direct naar user wallet

## 🆘 Troubleshooting

### "Server wallet cannot mint"
- Check wallet balance
- Verify MINTER_ROLE op contract
- Check RPC endpoint status

### "Queue not processing"
- Verify cron job actief
- Check webhook secret
- Manual trigger via admin panel

### "High failure rate"
- Check Polygon network status
- Verify Pinata API limits
- Review gas price settings

## 📞 Support

Voor vragen over de blockchain integratie:
- Email: blockchain@groeimetai.com
- Admin dashboard: /admin/blockchain
- Logs: Check server logs voor details