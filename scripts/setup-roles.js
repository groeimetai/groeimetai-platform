const hre = require("hardhat");
const chalk = require("chalk");

async function main() {
  console.log(chalk.blue("\n🔐 Setting up Certificate Registry Roles\n"));

  // Get network
  const network = hre.network.name;
  console.log(`Network: ${network}`);

  // Get contract address from environment
  let contractAddress;
  switch (network) {
    case "polygon":
      contractAddress = process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON;
      break;
    case "mumbai":
      contractAddress = process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI;
      break;
    case "hardhat":
    case "localhost":
      contractAddress = process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_LOCAL;
      break;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }

  if (!contractAddress) {
    throw new Error(`No contract address found for network ${network}. Deploy the contract first.`);
  }

  console.log(`Contract address: ${contractAddress}`);

  // Get the contract
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const contract = CertificateRegistry.attach(contractAddress);

  // Get role constants
  const MINTER_ROLE = await contract.MINTER_ROLE();
  const ADMIN_ROLE = await contract.ADMIN_ROLE();

  console.log(`MINTER_ROLE: ${MINTER_ROLE}`);
  console.log(`ADMIN_ROLE: ${ADMIN_ROLE}`);

  // Get current signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`\nCurrent signer: ${signer.address}`);

  // Check current roles
  const hasAdminRole = await contract.hasRole(ADMIN_ROLE, signer.address);
  const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address);

  console.log(`Has ADMIN_ROLE: ${hasAdminRole}`);
  console.log(`Has MINTER_ROLE: ${hasMinterRole}`);

  if (!hasAdminRole) {
    console.log(chalk.red("\n❌ Current signer does not have admin role. Cannot proceed."));
    process.exit(1);
  }

  // Get minter addresses from environment
  const minterAddresses = process.env.AUTHORIZED_MINTERS ? 
    process.env.AUTHORIZED_MINTERS.split(",").map(addr => addr.trim()) : [];

  const adminAddresses = process.env.ADMIN_WALLETS ?
    process.env.ADMIN_WALLETS.split(",").map(addr => addr.trim()) : [];

  // Grant minter roles
  if (minterAddresses.length > 0) {
    console.log(chalk.blue("\n📝 Granting MINTER roles..."));
    
    for (const minterAddress of minterAddresses) {
      if (!hre.ethers.utils.isAddress(minterAddress)) {
        console.log(chalk.yellow(`⚠️  Invalid address: ${minterAddress}, skipping...`));
        continue;
      }

      const alreadyHasRole = await contract.hasRole(MINTER_ROLE, minterAddress);
      
      if (alreadyHasRole) {
        console.log(chalk.yellow(`ℹ️  ${minterAddress} already has MINTER_ROLE`));
      } else {
        try {
          console.log(`Granting MINTER_ROLE to ${minterAddress}...`);
          const tx = await contract.grantRole(MINTER_ROLE, minterAddress);
          await tx.wait();
          console.log(chalk.green(`✅ MINTER_ROLE granted to ${minterAddress}`));
          console.log(`   Transaction: ${tx.hash}`);
        } catch (error) {
          console.log(chalk.red(`❌ Failed to grant MINTER_ROLE to ${minterAddress}: ${error.message}`));
        }
      }
    }
  } else {
    console.log(chalk.yellow("\nℹ️  No AUTHORIZED_MINTERS found in environment"));
  }

  // Grant admin roles
  if (adminAddresses.length > 0) {
    console.log(chalk.blue("\n👑 Granting ADMIN roles..."));
    
    for (const adminAddress of adminAddresses) {
      if (!hre.ethers.utils.isAddress(adminAddress)) {
        console.log(chalk.yellow(`⚠️  Invalid address: ${adminAddress}, skipping...`));
        continue;
      }

      const alreadyHasRole = await contract.hasRole(ADMIN_ROLE, adminAddress);
      
      if (alreadyHasRole) {
        console.log(chalk.yellow(`ℹ️  ${adminAddress} already has ADMIN_ROLE`));
      } else {
        try {
          console.log(`Granting ADMIN_ROLE to ${adminAddress}...`);
          const tx = await contract.grantRole(ADMIN_ROLE, adminAddress);
          await tx.wait();
          console.log(chalk.green(`✅ ADMIN_ROLE granted to ${adminAddress}`));
          console.log(`   Transaction: ${tx.hash}`);
        } catch (error) {
          console.log(chalk.red(`❌ Failed to grant ADMIN_ROLE to ${adminAddress}: ${error.message}`));
        }
      }
    }
  } else {
    console.log(chalk.yellow("\nℹ️  No ADMIN_WALLETS found in environment"));
  }

  // List all current role holders
  console.log(chalk.blue("\n📋 Current Role Holders:"));
  
  // Get role member count and list members
  // Note: This requires the contract to have getRoleMemberCount and getRoleMember functions
  // which are not in the current contract. For now, we'll just show known addresses.
  
  console.log("\nKnown MINTER_ROLE holders:");
  console.log(`- ${signer.address} (deployer)`);
  for (const addr of minterAddresses) {
    if (hre.ethers.utils.isAddress(addr)) {
      const hasRole = await contract.hasRole(MINTER_ROLE, addr);
      if (hasRole) console.log(`- ${addr}`);
    }
  }

  console.log("\nKnown ADMIN_ROLE holders:");
  console.log(`- ${signer.address} (deployer)`);
  for (const addr of adminAddresses) {
    if (hre.ethers.utils.isAddress(addr)) {
      const hasRole = await contract.hasRole(ADMIN_ROLE, addr);
      if (hasRole) console.log(`- ${addr}`);
    }
  }

  console.log(chalk.green("\n✅ Role setup complete!\n"));

  // Optional: Test minting capability
  console.log(chalk.blue("🧪 Testing minting capability..."));
  
  try {
    // Check if contract is paused
    const isPaused = await contract.paused();
    if (isPaused) {
      console.log(chalk.yellow("⚠️  Contract is paused. Unpausing for test..."));
      const unpauseTx = await contract.unpause();
      await unpauseTx.wait();
      console.log(chalk.green("✅ Contract unpaused"));
    }

    // Test parameters
    const testStudent = "0x0000000000000000000000000000000000000001";
    const testCourseId = "test-course-001";
    const testCourseName = "Test Course";
    const testCompletionDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday
    const testIpfsHash = "QmTest" + Date.now(); // Unique hash

    console.log("\nAttempting test mint...");
    const mintTx = await contract.mintCertificate(
      testStudent,
      testCourseId,
      testCourseName,
      testCompletionDate,
      testIpfsHash
    );
    
    const receipt = await mintTx.wait();
    const event = receipt.events?.find(e => e.event === "CertificateMinted");
    
    if (event) {
      console.log(chalk.green("✅ Test mint successful!"));
      console.log(`   Certificate ID: ${event.args.certificateId.toString()}`);
      console.log(`   Transaction: ${mintTx.hash}`);
    } else {
      console.log(chalk.yellow("⚠️  Mint transaction succeeded but no event found"));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Test mint failed: ${error.message}`));
    console.log("   This might be expected if you don't have minting permissions");
  }

  console.log(chalk.blue("\n📝 Next steps:"));
  console.log("1. Add more minters by updating AUTHORIZED_MINTERS in .env");
  console.log("2. Run this script again to grant roles");
  console.log("3. Test certificate minting on the frontend");
  console.log("4. Monitor role assignments on block explorer");
}

// Execute
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red("\n❌ Script failed:"), error);
    process.exit(1);
  });