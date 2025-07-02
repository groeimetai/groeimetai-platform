const hre = require("hardhat");

async function main() {
  // Detect which network we're on
  const network = await hre.ethers.provider.getNetwork();
  const networkName = network.chainId === 137n ? "Polygon Mainnet" : 
                      network.chainId === 80001n ? "Mumbai Testnet" :
                      network.chainId === 80002n ? "Amoy Testnet" : 
                      "Unknown Network";
  
  console.log(`🚀 Starting deployment to ${networkName}...\n`);
  console.log(`🔗 Chain ID: ${network.chainId}`);
  
  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} POL\n`);
  
  // Deploy contract
  console.log("📝 Deploying CertificateRegistry contract...");
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.deploy();
  
  await certificateRegistry.waitForDeployment();
  const contractAddress = await certificateRegistry.getAddress();
  
  console.log("\n✅ CertificateRegistry deployed to:", contractAddress);
  
  // Different explorer URLs based on network
  const explorerUrl = network.chainId === 137n 
    ? `https://polygonscan.com/address/${contractAddress}`
    : network.chainId === 80001n
    ? `https://mumbai.polygonscan.com/address/${contractAddress}`
    : `https://amoy.polygonscan.com/address/${contractAddress}`;
  
  console.log("\n📋 BELANGRIJKE STAPPEN:");
  console.log("1. Kopieer het contract address hierboven");
  console.log("2. Voeg toe aan je .env file:");
  
  if (network.chainId === 137n) {
    console.log(`   CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON=${contractAddress}`);
  } else {
    console.log(`   CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI=${contractAddress}`);
  }
  
  console.log("\n3. Verifieer het contract:");
  console.log(`   ${explorerUrl}`);
  
  // Save deployment info
  const fs = require('fs');
  const filename = network.chainId === 137n ? 'deployment-polygon.json' : 
                   network.chainId === 80001n ? 'deployment-mumbai.json' :
                   'deployment-amoy.json';
  
  const deploymentInfo = {
    network: networkName.toLowerCase().replace(' ', '-'),
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    explorerUrl: explorerUrl
  };
  
  fs.writeFileSync(
    `./${filename}`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\n📄 Deployment info saved to ${filename}`);
  
  // Final summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("─".repeat(50));
  console.log(`Network: ${networkName}`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("─".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });