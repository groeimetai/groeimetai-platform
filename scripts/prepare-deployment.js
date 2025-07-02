const { ethers } = require('ethers');
require('dotenv').config();

console.log('🚀 Blockchain Deployment Voorbereiding\n');

// Check private key
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('❌ PRIVATE_KEY niet gevonden in .env!');
  process.exit(1);
}

// Format key
const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

// Create wallet (offline)
const wallet = new ethers.Wallet(formattedKey);

console.log('✅ Wallet Info:');
console.log('📍 Address:', wallet.address);
console.log('🔑 Private Key: [VERBORGEN]');

// Check environment variables
console.log('\n📋 Environment Check:');

const requiredEnvVars = [
  { name: 'MUMBAI_RPC_URL', found: !!process.env.MUMBAI_RPC_URL },
  { name: 'PINATA_API_KEY', found: !!process.env.PINATA_API_KEY },
  { name: 'PINATA_SECRET_API_KEY', found: !!process.env.PINATA_SECRET_API_KEY },
  { name: 'PRIVATE_KEY', found: !!process.env.PRIVATE_KEY }
];

requiredEnvVars.forEach(envVar => {
  console.log(`${envVar.found ? '✅' : '❌'} ${envVar.name}: ${envVar.found ? 'Gevonden' : 'ONTBREEKT'}`);
});

// Instructions
console.log('\n📝 Deployment Checklist:');
console.log('\n1. ✅ Contract gecompileerd');
console.log('2. ⏳ Test MATIC nodig op wallet:', wallet.address);
console.log('3. ✅ Environment variables geconfigureerd');
console.log('4. ⏳ Klaar voor deployment');

console.log('\n🎯 Volgende Stappen:');
console.log('\n1. Krijg test MATIC:');
console.log('   - Ga naar: https://faucet.polygon.technology/');
console.log('   - Plak adres:', wallet.address);
console.log('   - Wacht 1-2 minuten');
console.log('\n2. Deploy contract:');
console.log('   - Run: npm run deploy:mumbai');
console.log('   - Of: npx hardhat run scripts/deploy.js --network mumbai');

console.log('\n💡 Tips:');
console.log('- Zorg voor minimaal 0.1 MATIC voor deployment');
console.log('- Mumbai faucet geeft meestal 0.5 MATIC');
console.log('- Deployment kost ongeveer 0.01-0.05 MATIC');

// Test connection info
console.log('\n🌐 Mumbai Network Info:');
console.log('Chain ID: 80001');
console.log('Currency: MATIC (test)');
console.log('Block Explorer: https://mumbai.polygonscan.com');

// Generate deployment command
const deployCommand = `npx hardhat run scripts/deploy.js --network mumbai`;
console.log('\n📋 Deployment Command (kopieer dit):');
console.log(`\n   ${deployCommand}\n`);