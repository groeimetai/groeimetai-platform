const { ethers } = require('hardhat');
require('dotenv').config();

async function checkWallet() {
  try {
    // Je wallet address van de private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ PRIVATE_KEY niet gevonden in .env!');
      return;
    }
    
    // Format private key (add 0x if missing)
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // Verschillende RPC opties
    const rpcOptions = [
      { name: 'Alchemy', url: process.env.MUMBAI_RPC_URL },
      { name: 'Public Mumbai', url: 'https://rpc-mumbai.maticvigil.com' },
      { name: 'Ankr', url: 'https://rpc.ankr.com/polygon_mumbai' },
      { name: 'Polygon Official', url: 'https://mumbai.rpc.thirdweb.com' }
    ];
    
    let provider = null;
    let providerName = '';
    
    // Probeer verschillende RPCs
    for (const rpc of rpcOptions) {
      try {
        console.log(`🔍 Probeer ${rpc.name}...`);
        const testProvider = new ethers.JsonRpcProvider(rpc.url);
        
        // Timeout na 5 seconden
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        await Promise.race([
          testProvider.getNetwork(),
          timeoutPromise
        ]);
        
        provider = testProvider;
        providerName = rpc.name;
        console.log(`✅ Verbonden via ${rpc.name}!`);
        break;
      } catch (e) {
        console.log(`❌ ${rpc.name} faalde: ${e.message}`);
      }
    }
    
    if (!provider) {
      console.error('\\n❌ Kon geen werkende RPC vinden!');
      console.log('\\n💡 Mogelijke oplossingen:');
      console.log('1. Check je internetverbinding');
      console.log('2. Probeer het later opnieuw');
      console.log('3. Gebruik een VPN als je achter een firewall zit');
      return;
    }
    
    const wallet = new ethers.Wallet(formattedKey, provider);
    
    console.log('\\n🔑 Wallet Address:', wallet.address);
    console.log('🌐 Network: Mumbai Testnet via', providerName);
    
    try {
      // Check balance met timeout
      const balancePromise = provider.getBalance(wallet.address);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Balance check timeout')), 10000)
      );
      
      const balance = await Promise.race([balancePromise, timeoutPromise]);
      const balanceInMatic = ethers.formatEther(balance);
      
      console.log('\\n💰 Mumbai Testnet Balance:');
      console.log(`   ${balanceInMatic} MATIC`);
      
      if (parseFloat(balanceInMatic) < 0.1) {
        console.log('\\n⚠️  Je hebt meer test MATIC nodig!');
        console.log('   Ga naar een van deze faucets:');
        console.log('   1. https://faucet.polygon.technology/');
        console.log('   2. https://mumbaifaucet.com/');
        console.log('   3. https://faucet.quicknode.com/polygon/mumbai');
        console.log(`\\n   📋 Kopieer dit adres: ${wallet.address}`);
        console.log('   En plak het in de faucet website\\n');
        
        // Copy to clipboard hint
        console.log('   💡 Tip: Selecteer het adres hierboven en kopieer met Cmd+C\\n');
      } else {
        console.log('\\n✅ Je hebt genoeg MATIC voor deployment!');
        console.log('   Klaar om te deployen! 🚀\\n');
      }
    } catch (balanceError) {
      console.log('\\n⚠️  Kon balance niet ophalen:', balanceError.message);
      console.log('   Maar je wallet is wel geldig!');
      console.log(`\\n   📋 Je wallet adres: ${wallet.address}`);
      console.log('   Gebruik dit adres om test MATIC te krijgen van een faucet\\n');
    }
    
  } catch (error) {
    console.error('\\n❌ Error:', error.message);
    if (error.message.includes('invalid private key')) {
      console.log('\\n💡 Tips voor private key:');
      console.log('   - Moet 64 karakters lang zijn (zonder 0x)');
      console.log('   - Alleen hexadecimale karakters (0-9, a-f)');
      console.log('   - Haal het uit MetaMask: Account Details > Export Private Key');
    }
  }
}

// Run de check
console.log('🔍 Blockchain Wallet Checker\\n');
checkWallet();