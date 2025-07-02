const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Mumbai testnet...\n");

  // Get the contract factory
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  
  console.log("📝 Deploying CertificateRegistry contract...");
  
  // Deploy the contract
  const certificateRegistry = await CertificateRegistry.deploy();
  
  // Wait for deployment
  await certificateRegistry.waitForDeployment();
  
  const contractAddress = await certificateRegistry.getAddress();
  
  console.log("\n✅ CertificateRegistry deployed to:", contractAddress);
  console.log("\n📋 BELANGRIJKE STAPPEN:");
  console.log("1. Kopieer het contract address hierboven");
  console.log("2. Plak het in je .env file als:");
  console.log(`   CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n3. Verifieer het contract op Polygonscan Mumbai:");
  console.log(`   https://mumbai.polygonscan.com/address/${contractAddress}`);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "mumbai",
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.provider.getSigner()).address
  };
  
  fs.writeFileSync(
    './deployment-mumbai.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📄 Deployment info saved to deployment-mumbai.json");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });