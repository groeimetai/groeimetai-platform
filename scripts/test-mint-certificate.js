const { ethers } = require('hardhat');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

async function testMintCertificate() {
  console.log('🚀 Test Certificate Minting on Polygon Mainnet\n');
  
  try {
    // 1. Get contract
    const contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Contract address not found in .env');
    }
    
    console.log('📝 Contract Address:', contractAddress);
    
    // 2. Create test certificate metadata
    const testCertificate = {
      studentName: "Test Student",
      studentAddress: "0xa4B8eE764e82EeB1D6e9035a98E124F80277621A", // Your wallet
      courseName: "Blockchain Integration Test",
      courseId: "test-course-001",
      instructorName: "GroeimetAI Academy",
      completionDate: new Date().toISOString(),
      certificateNumber: "TEST-" + Date.now(),
      score: 100,
      grade: "A+",
      achievements: ["First Blockchain Certificate", "Test Achievement"],
      institution: "GroeimetAI Academy",
      description: "Successfully completed the Blockchain Integration Test course"
    };
    
    console.log('\n📋 Certificate Metadata:');
    console.log(JSON.stringify(testCertificate, null, 2));
    
    // 3. Upload to IPFS via Pinata
    console.log('\n📤 Uploading to IPFS...');
    
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_API_KEY;
    
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const response = await axios.post(url, testCertificate, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey
      }
    });
    
    const ipfsHash = response.data.IpfsHash;
    console.log('✅ IPFS Hash:', ipfsHash);
    console.log('🔗 View on IPFS:', `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    
    // 4. Mint on blockchain
    console.log('\n⛓️  Minting certificate on blockchain...');
    
    // Connect to Polygon mainnet with our wallet
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com');
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('👤 Minting from:', wallet.address);
    
    // Get contract ABI
    // Get contract ABI
    const contractArtifact = require('../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json');
    const contract = new ethers.Contract(contractAddress, contractArtifact.abi, wallet);
    
    // Check if signer has MINTER_ROLE
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const hasMinterRole = await contract["hasRole(bytes32,address)"](MINTER_ROLE, wallet.address);
    
    if (!hasMinterRole) {
      console.log('\n⚠️  Note: This wallet does not have MINTER_ROLE.');
      console.log('   The contract owner needs to grant this role first.');
      console.log('   For now, the transaction might fail.');
    } else {
      console.log('✅ Wallet has MINTER_ROLE');
    }
    
    // Mint certificate
    const tx = await contract.mintCertificate(
      testCertificate.studentAddress,
      testCertificate.courseId,
      testCertificate.courseName,
      Math.floor(new Date(testCertificate.completionDate).getTime() / 1000),
      ipfsHash
    );
    
    console.log('📡 Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('⛽ Gas used:', receipt.gasUsed.toString());
    
    // Get certificate ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'CertificateMinted';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      const certificateId = parsed.args.certificateId;
      console.log('\n🎉 Certificate minted successfully!');
      console.log('📜 Certificate ID:', certificateId.toString());
      console.log('🔗 View on Polygonscan:');
      console.log(`   https://polygonscan.com/tx/${tx.hash}`);
      
      // Verify certificate
      console.log('\n🔍 Verifying certificate...');
      const certData = await contract.getCertificate(certificateId);
      console.log('✅ Certificate verified on blockchain:');
      console.log('   Student:', certData.student);
      console.log('   Course:', certData.courseName);
      console.log('   IPFS Hash:', certData.ipfsHash);
      console.log('   Valid:', certData.isValid);
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  }
}

// Run test
testMintCertificate();