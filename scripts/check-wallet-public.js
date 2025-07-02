const { ethers } = require('hardhat');
require('dotenv').config();

async function checkWallet() {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ PRIVATE_KEY niet gevonden in .env!');
      return;
    }
    
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // Gebruik de meest betrouwbare publieke RPC
    const RPC_URL = 'https://polygon-testnet.public.blastapi.io';
    
    console.log('🔍 Verbinden met Mumbai testnet...');
    
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const wallet = new ethers.Wallet(formattedKey, provider);
      
      console.log('\\n✅ Wallet Details:');
      console.log('📍 Address:', wallet.address);
      console.log('🌐 Network: Mumbai Testnet');
      
      // Probeer balance op te halen
      console.log('\\n⏳ Balance ophalen...');
      const balance = await provider.getBalance(wallet.address);
      const balanceInMatic = ethers.formatEther(balance);
      
      console.log('💰 Balance:', balanceInMatic, 'MATIC');
      
      if (parseFloat(balanceInMatic) < 0.1) {
        console.log('\\n⚠️  Je hebt test MATIC nodig!');
        console.log('\\n📋 STAPPEN OM TEST MATIC TE KRIJGEN:');
        console.log('\\n1. Kopieer dit adres:');
        console.log(`   ${wallet.address}`);
        console.log('\\n2. Ga naar: https://faucet.polygon.technology/');
        console.log('\\n3. Plak je adres en vraag Mumbai MATIC aan');
        console.log('\\n4. Wacht 1-2 minuten en run dit script opnieuw');
      } else {
        console.log('\\n✅ Perfect! Je hebt genoeg MATIC om te deployen! 🚀');
      }
      
    } catch (rpcError) {
      // Als RPC niet werkt, toon in ieder geval het wallet adres
      const wallet = new ethers.Wallet(formattedKey);
      console.log('\\n⚠️  Kon niet verbinden met Mumbai testnet');
      console.log('\\n✅ Maar je wallet is wel geldig!');
      console.log('📍 Wallet Address:', wallet.address);
      console.log('\\n📋 Gebruik dit adres om test MATIC aan te vragen:');
      console.log(`   ${wallet.address}`);
      console.log('\\n🔗 Faucet: https://faucet.polygon.technology/');
    }
    
  } catch (error) {
    console.error('\\n❌ Error:', error.message);
    if (error.message.includes('invalid private key')) {
      console.log('\\n💡 Check je private key in .env:');
      console.log('   - 64 karakters (zonder 0x prefix)');
      console.log('   - Alleen 0-9 en a-f karakters');
    }
  }
}

console.log('🚀 Mumbai Wallet Checker\\n');
checkWallet();