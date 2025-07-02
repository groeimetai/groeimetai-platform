const { ethers } = require('ethers');
require('dotenv').config();

async function waitForPOL() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY niet gevonden!');
    return;
  }
  
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
  const wallet = new ethers.Wallet(formattedKey, provider);
  
  console.log('🚀 Polygon Mainnet Deployment Helper\n');
  console.log('📍 Je wallet:', wallet.address);
  console.log('⏳ Wachten op POL...\n');
  
  let previousBalance = '0';
  let checkCount = 0;
  
  const checkBalance = async () => {
    try {
      const balance = await provider.getBalance(wallet.address);
      const balanceInPOL = ethers.formatEther(balance);
      
      if (balanceInPOL !== previousBalance) {
        console.log(`\n💰 Balance Update: ${balanceInPOL} POL (≈ €${(parseFloat(balanceInPOL) * 0.40).toFixed(2)})`);
        previousBalance = balanceInPOL;
        
        if (parseFloat(balanceInPOL) > 0.1) {
          console.log('\n✅ POL ontvangen! Je kunt nu deployen!\n');
          
          // Check gas price
          const feeData = await provider.getFeeData();
          const gasPrice = feeData.gasPrice;
          console.log('⛽ Huidige gas prijs:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
          console.log('💸 Geschatte deployment kosten: 0.01-0.05 POL\n');
          
          console.log('🎯 Deploy met dit commando:');
          console.log('   npm run deploy:polygon\n');
          
          console.log('📋 Of voor extra veiligheid, test eerst op Mumbai:');
          console.log('   npm run deploy:mumbai\n');
          
          return true;
        }
      }
      
      // Show waiting animation
      const dots = '.'.repeat((checkCount % 3) + 1);
      process.stdout.write(`\r⏳ Checking${dots}   `);
      checkCount++;
      
    } catch (error) {
      console.log('\n⚠️  Network error, retrying...');
    }
    
    return false;
  };
  
  // Check every 5 seconds
  while (true) {
    const hasBalance = await checkBalance();
    if (hasBalance) break;
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

// Start monitoring
waitForPOL().catch(console.error);