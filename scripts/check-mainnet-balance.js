const { ethers } = require('ethers');
require('dotenv').config();

async function checkMainnetBalance() {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ PRIVATE_KEY niet gevonden in .env!');
      return;
    }
    
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // Polygon Mainnet RPC
    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const wallet = new ethers.Wallet(formattedKey, provider);
    
    console.log('🔍 Checking Polygon Mainnet Balance...\n');
    console.log('📍 Wallet Address:', wallet.address);
    
    try {
      const balance = await provider.getBalance(wallet.address);
      const balanceInPOL = ethers.formatEther(balance);
      const balanceInEUR = parseFloat(balanceInPOL) * 0.40; // Approx POL price
      
      console.log('\n💰 Mainnet Balance:');
      console.log(`   ${balanceInPOL} POL`);
      console.log(`   ≈ €${balanceInEUR.toFixed(2)}`);
      
      if (parseFloat(balanceInPOL) > 0.1) {
        console.log('\n✅ Genoeg POL voor deployment!');
        console.log('   Een deployment kost ongeveer 0.01-0.05 POL');
        
        // Check gas price
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        console.log('\n⛽ Huidige gas prijs:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
      } else {
        console.log('\n⚠️  Balance lijkt laag. Wacht tot je POL is aangekomen.');
      }
      
    } catch (error) {
      console.log('\n⚠️  Kon balance niet ophalen. Probeer het opnieuw.');
      console.log('Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMainnetBalance();