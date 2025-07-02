import { ethers } from 'ethers';
import { CertificateContract } from '../lib/blockchain/certificate-contract';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import pinataSDK from '@pinata/sdk';
import { config } from 'dotenv';
import ora from 'ora';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load environment variables
config();

// Types
interface FirebaseCertificate {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseName: string;
  completedAt: Date;
  certificateUrl?: string;
  progress: {
    completedModules: string[];
    totalScore: number;
  };
}

interface MigrationOptions {
  network: 'hardhat' | 'mumbai' | 'polygon';
  batchSize: number;
  dryRun: boolean;
  fromDate?: Date;
  specificCourses?: string[];
}

interface MigrationResult {
  certificateId: string;
  firebaseId: string;
  transactionHash: string;
  ipfsHash: string;
  gasUsed: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

// Initialize services
const initializeServices = async () => {
  // Initialize Firebase Admin
  const serviceAccount = require('../../service-account.json');
  initializeApp({
    credential: cert(serviceAccount),
  });
  
  const db = getFirestore();
  
  // Initialize Pinata
  const pinata = pinataSDK(
    process.env.PINATA_API_KEY!,
    process.env.PINATA_SECRET_API_KEY!
  );
  
  // Test Pinata connection
  try {
    await pinata.testAuthentication();
    console.log(chalk.green('✓ Pinata authentication successful'));
  } catch (error) {
    throw new Error(`Pinata authentication failed: ${error}`);
  }
  
  return { db, pinata };
};

// Get provider based on network
const getProvider = (network: string): ethers.providers.Provider => {
  switch (network) {
    case 'hardhat':
      return new ethers.providers.JsonRpcProvider('http://localhost:8545');
    case 'mumbai':
      return new ethers.providers.JsonRpcProvider(
        process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com'
      );
    case 'polygon':
      return new ethers.providers.JsonRpcProvider(
        process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
      );
    default:
      throw new Error(`Unknown network: ${network}`);
  }
};

// Generate certificate metadata for IPFS
const generateCertificateMetadata = (cert: FirebaseCertificate) => {
  return {
    name: `GroeiMetAI Certificate - ${cert.courseName}`,
    description: `Certificate of completion for ${cert.courseName} course`,
    image: cert.certificateUrl || 'ipfs://QmDefault...', // Default template
    attributes: [
      {
        trait_type: 'Student Name',
        value: cert.userName,
      },
      {
        trait_type: 'Student Email',
        value: cert.userEmail,
      },
      {
        trait_type: 'Course',
        value: cert.courseName,
      },
      {
        trait_type: 'Course ID',
        value: cert.courseId,
      },
      {
        trait_type: 'Completion Date',
        value: cert.completedAt.toISOString().split('T')[0],
      },
      {
        trait_type: 'Firebase Certificate ID',
        value: cert.id,
      },
      {
        trait_type: 'Total Score',
        value: cert.progress.totalScore.toString(),
      },
      {
        trait_type: 'Completed Modules',
        value: cert.progress.completedModules.length.toString(),
      },
    ],
  };
};

// Upload certificate to IPFS
const uploadToIPFS = async (
  pinata: any,
  certificate: FirebaseCertificate
): Promise<string> => {
  const metadata = generateCertificateMetadata(certificate);
  
  try {
    const result = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `certificate-${certificate.id}`,
        keyvalues: {
          courseId: certificate.courseId,
          userId: certificate.userId,
          completionDate: certificate.completedAt.toISOString(),
        },
      },
    });
    
    return result.IpfsHash;
  } catch (error) {
    throw new Error(`Failed to upload to IPFS: ${error}`);
  }
};

// Mint certificate on blockchain
const mintCertificate = async (
  contract: CertificateContract,
  certificate: FirebaseCertificate,
  ipfsHash: string,
  dryRun: boolean
): Promise<{ txHash: string; certificateId: string; gasUsed: string } | null> => {
  if (dryRun) {
    console.log(chalk.yellow('DRY RUN: Would mint certificate:'), {
      student: certificate.userId,
      courseId: certificate.courseId,
      ipfsHash,
    });
    return null;
  }
  
  try {
    // Get user's wallet address (you might need to map this from Firebase user)
    // For now, we'll use a placeholder - in production, you'd have a mapping
    const studentAddress = await getStudentWalletAddress(certificate.userId);
    
    const certificateId = await contract.mintCertificate(
      studentAddress,
      certificate.courseId,
      certificate.courseName,
      certificate.completedAt,
      ipfsHash
    );
    
    // Get transaction details
    const filter = contract.contract.filters.CertificateMinted(
      null,
      studentAddress,
      certificate.courseId
    );
    const events = await contract.contract.queryFilter(filter);
    const lastEvent = events[events.length - 1];
    
    return {
      txHash: lastEvent.transactionHash,
      certificateId: certificateId!,
      gasUsed: lastEvent.gasUsed?.toString() || '0',
    };
  } catch (error) {
    throw error;
  }
};

// Get student wallet address (implement based on your user mapping)
const getStudentWalletAddress = async (userId: string): Promise<string> => {
  // TODO: Implement actual mapping from Firebase userId to Ethereum address
  // This could be stored in Firebase, or users could register their addresses
  
  // For migration, you might want to:
  // 1. Use a default recipient address
  // 2. Map from a CSV file
  // 3. Query from Firebase user profiles
  
  // Placeholder - returns a test address
  return '0x0000000000000000000000000000000000000000';
};

// Process batch of certificates
const processBatch = async (
  certificates: FirebaseCertificate[],
  contract: CertificateContract,
  pinata: any,
  options: MigrationOptions,
  progressCallback: (result: MigrationResult) => void
): Promise<MigrationResult[]> => {
  const results: MigrationResult[] = [];
  
  for (const cert of certificates) {
    const spinner = ora(`Processing certificate ${cert.id}...`).start();
    
    try {
      // Upload to IPFS
      spinner.text = `Uploading metadata to IPFS for ${cert.id}...`;
      const ipfsHash = await uploadToIPFS(pinata, cert);
      
      // Mint on blockchain
      spinner.text = `Minting certificate ${cert.id} on blockchain...`;
      const mintResult = await mintCertificate(contract, cert, ipfsHash, options.dryRun);
      
      const result: MigrationResult = {
        certificateId: mintResult?.certificateId || 'dry-run',
        firebaseId: cert.id,
        transactionHash: mintResult?.txHash || 'dry-run',
        ipfsHash,
        gasUsed: mintResult?.gasUsed || '0',
        status: 'success',
      };
      
      results.push(result);
      progressCallback(result);
      spinner.succeed(`Certificate ${cert.id} migrated successfully`);
      
      // Add delay between transactions to avoid rate limits
      if (!options.dryRun) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      const result: MigrationResult = {
        certificateId: '',
        firebaseId: cert.id,
        transactionHash: '',
        ipfsHash: '',
        gasUsed: '0',
        status: 'failed',
        error: error.message,
      };
      
      results.push(result);
      progressCallback(result);
      spinner.fail(`Failed to migrate certificate ${cert.id}: ${error.message}`);
    }
  }
  
  return results;
};

// Main migration function
export const migrateCertificates = async (options: MigrationOptions) => {
  console.log(chalk.blue('\n🚀 Starting Certificate Migration to Blockchain\n'));
  console.log('Configuration:', {
    network: options.network,
    batchSize: options.batchSize,
    dryRun: options.dryRun,
    fromDate: options.fromDate?.toISOString(),
    specificCourses: options.specificCourses,
  });
  
  try {
    // Initialize services
    const { db, pinata } = await initializeServices();
    
    // Setup blockchain connection
    const provider = getProvider(options.network);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contract = new CertificateContract(provider, wallet);
    
    // Wait for contract to be initialized
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(chalk.green('✓ Connected to blockchain'));
    console.log(`Wallet address: ${wallet.address}`);
    
    // Check if wallet has minter role
    const isMinter = await contract.isMinter(wallet.address);
    if (!isMinter && !options.dryRun) {
      throw new Error('Wallet does not have minter role');
    }
    
    // Query certificates from Firebase
    let query = db.collection('certificates').orderBy('completedAt', 'asc');
    
    if (options.fromDate) {
      query = query.where('completedAt', '>=', options.fromDate);
    }
    
    if (options.specificCourses && options.specificCourses.length > 0) {
      query = query.where('courseId', 'in', options.specificCourses);
    }
    
    const snapshot = await query.get();
    const certificates: FirebaseCertificate[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      certificates.push({
        id: doc.id,
        ...data,
        completedAt: data.completedAt.toDate(),
      } as FirebaseCertificate);
    });
    
    console.log(chalk.green(`\n✓ Found ${certificates.length} certificates to migrate\n`));
    
    // Process in batches
    const allResults: MigrationResult[] = [];
    const totalBatches = Math.ceil(certificates.length / options.batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * options.batchSize;
      const end = Math.min(start + options.batchSize, certificates.length);
      const batch = certificates.slice(start, end);
      
      console.log(chalk.blue(`\nProcessing batch ${i + 1}/${totalBatches} (${batch.length} certificates)`));
      
      const results = await processBatch(
        batch,
        contract,
        pinata,
        options,
        (result) => {
          // Progress callback
          if (result.status === 'success') {
            console.log(chalk.green(`  ✓ ${result.firebaseId} → ${result.certificateId}`));
          } else {
            console.log(chalk.red(`  ✗ ${result.firebaseId}: ${result.error}`));
          }
        }
      );
      
      allResults.push(...results);
      
      // Save checkpoint after each batch
      await saveCheckpoint(allResults);
    }
    
    // Generate final report
    await generateReport(allResults, options);
    
    // Summary
    const successful = allResults.filter(r => r.status === 'success').length;
    const failed = allResults.filter(r => r.status === 'failed').length;
    const totalGas = allResults.reduce((sum, r) => sum + parseFloat(r.gasUsed || '0'), 0);
    
    console.log(chalk.blue('\n📊 Migration Summary:'));
    console.log(`  Total certificates: ${certificates.length}`);
    console.log(chalk.green(`  Successful: ${successful}`));
    console.log(chalk.red(`  Failed: ${failed}`));
    console.log(`  Total gas used: ${totalGas}`);
    
    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️  This was a dry run. No actual transactions were made.'));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Migration failed:'), error);
    process.exit(1);
  }
};

// Save checkpoint for recovery
const saveCheckpoint = async (results: MigrationResult[]) => {
  const checkpointPath = path.join(process.cwd(), 'migration-checkpoint.json');
  await fs.writeFile(checkpointPath, JSON.stringify(results, null, 2));
};

// Generate migration report
const generateReport = async (results: MigrationResult[], options: MigrationOptions) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(
    process.cwd(),
    'reports',
    `migration-report-${options.network}-${timestamp}.json`
  );
  
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  
  const report = {
    timestamp: new Date().toISOString(),
    network: options.network,
    options,
    summary: {
      total: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      totalGasUsed: results.reduce((sum, r) => sum + parseFloat(r.gasUsed || '0'), 0),
    },
    results,
  };
  
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(chalk.green(`\n✓ Report saved to: ${reportPath}`));
};

// CLI interface
if (require.main === module) {
  const argv = require('yargs')
    .option('network', {
      describe: 'Blockchain network',
      choices: ['hardhat', 'mumbai', 'polygon'],
      default: 'mumbai',
    })
    .option('batch-size', {
      describe: 'Number of certificates per batch',
      type: 'number',
      default: 10,
    })
    .option('dry-run', {
      describe: 'Simulate migration without actual transactions',
      type: 'boolean',
      default: false,
    })
    .option('from-date', {
      describe: 'Migrate certificates from this date (YYYY-MM-DD)',
      type: 'string',
    })
    .option('courses', {
      describe: 'Specific course IDs to migrate (comma-separated)',
      type: 'string',
    })
    .help()
    .argv;
  
  const options: MigrationOptions = {
    network: argv.network,
    batchSize: argv['batch-size'],
    dryRun: argv['dry-run'],
    fromDate: argv['from-date'] ? new Date(argv['from-date']) : undefined,
    specificCourses: argv.courses ? argv.courses.split(',') : undefined,
  };
  
  migrateCertificates(options);
}