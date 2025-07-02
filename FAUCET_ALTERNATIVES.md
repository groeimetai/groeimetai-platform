# 🚰 Mumbai/Amoy Testnet Faucet Alternatieven

## Het Probleem
Polygon is aan het overstappen van Mumbai (chainId: 80001) naar Amoy (chainId: 80002) testnet. Veel faucets vereisen nu dat je eerst mainnet POL hebt.

## 🆓 Gratis Mumbai Faucets (Geen Mainnet Vereist)

### 1. **QuickNode Mumbai Faucet** ⭐ Aanbevolen
- URL: https://faucet.quicknode.com/polygon/mumbai
- Geen mainnet POL nodig
- 0.2 MATIC per request
- Wallet: `0xa4B8eE764e82EeB1D6e9035a98E124F80277621A`

### 2. **Polygon Discord Faucet**
- Join Polygon Discord: https://discord.gg/polygon
- Ga naar #mumbai-faucet channel
- Type: `!faucet 0xa4B8eE764e82EeB1D6e9035a98E124F80277621A`

### 3. **Direct Mumbai Faucets**
- https://mumbaifaucet.com/
- https://faucet.dsolutions.mn/
- https://testmatic.vercel.app/

### 4. **AllThatNode Faucet**
- https://www.allthatnode.com/faucet/polygon.dsrv
- Selecteer Mumbai network

## 🔄 Als Je Wilt Overstappen naar Amoy

### Stap 1: Krijg 0.001 POL op Mainnet
Kleinste hoeveelheid POL kopen (€0.001):
1. Via exchange (Binance, Coinbase)
2. Via DEX (Uniswap, QuickSwap)
3. Vraag iemand om 0.001 POL te sturen

### Stap 2: Update je config
```bash
# In .env
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Deploy command
npm run deploy:amoy
```

## 🎯 Snelste Oplossing Nu

1. **Gebruik QuickNode faucet** voor Mumbai
2. **Deploy naar Mumbai** (werkt nog steeds prima)
3. **Later migreren** naar Amoy wanneer het makkelijker is

## 💡 Tips

- Mumbai blijft nog minstens 6 maanden actief
- Je certificaten blijven gewoon werken op Mumbai
- Migratie naar Amoy kan later altijd nog

## 🚀 Direct Aan De Slag

```bash
# 1. Ga naar QuickNode faucet
# https://faucet.quicknode.com/polygon/mumbai

# 2. Plak dit adres:
0xa4B8eE764e82EeB1D6e9035a98E124F80277621A

# 3. Wacht 1 minuut

# 4. Deploy!
npm run deploy:mumbai
```