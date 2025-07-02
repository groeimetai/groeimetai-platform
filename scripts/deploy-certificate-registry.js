const hre = require("hardhat");

async function main() {
  console.log("Deploying CertificateRegistry to Polygon...");

  // Get the contract factory
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const certificateRegistry = await CertificateRegistry.deploy();
  
  // Wait for deployment
  await certificateRegistry.deployed();
  
  console.log("CertificateRegistry deployed to:", certificateRegistry.address);
  
  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Grant additional minters if needed (example)
  // const MINTER_ROLE = await certificateRegistry.MINTER_ROLE();
  // await certificateRegistry.grantRole(MINTER_ROLE, "0x..."); // Add minter address
  
  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await certificateRegistry.deployTransaction.wait(5);
  
  // Verify the contract on Polygonscan
  if (hre.network.name === "polygon" || hre.network.name === "mumbai") {
    console.log("Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: certificateRegistry.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }
  
  // Log deployment info
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", certificateRegistry.address);
  console.log("Deployer Address:", deployer.address);
  console.log("Block Number:", await hre.ethers.provider.getBlockNumber());
  console.log("Gas Price:", (await deployer.getGasPrice()).toString());
  console.log("========================\n");
  
  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: certificateRegistry.address,
    deployerAddress: deployer.address,
    deploymentBlock: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    contractName: "CertificateRegistry",
  };
  
  const deploymentPath = "./deployments";
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath);
  }
  
  fs.writeFileSync(
    `${deploymentPath}/CertificateRegistry-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to:", `${deploymentPath}/CertificateRegistry-${hre.network.name}.json`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });