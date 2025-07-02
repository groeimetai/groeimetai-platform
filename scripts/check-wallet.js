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
    
    // Mumbai provider using ethers v6
    const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
    const wallet = new ethers.Wallet(formattedKey, provider);
    
    console.log('🔑 Wallet Address:', wallet.address);
    console.log('🌐 Network: Mumbai Testnet');
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInMatic = ethers.formatEther(balance);
    
    console.log('\n💰 Mumbai Testnet Balance:');
    console.log(`   ${balanceInMatic} MATIC`);
    
    if (parseFloat(balanceInMatic) < 0.1) {
      console.log('\n⚠️  Je hebt meer test MATIC nodig!');
      console.log('   Ga naar een van deze faucets:');
      console.log('   1. https://faucet.polygon.technology/');
      console.log('   2. https://mumbaifaucet.com/');
      console.log('   3. https://faucet.quicknode.com/polygon/mumbai');
      console.log(`\n   Kopieer dit adres: ${wallet.address}`);
      console.log('   En plak het in de faucet website\n');
    } else {
      console.log('\n✅ Je hebt genoeg MATIC voor deployment!');
    }
    
    // Check network
    const network = await provider.getNetwork();
    console.log(`\n🔗 Connected to: ${network.name} (chainId: ${network.chainId})`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('invalid private key')) {
      console.log('\n💡 Tip: Zorg dat je private key correct is (64 karakters hex)');
    }
  }
}

checkWallet();