const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load chalk and ora, but fallback if not available
let chalk, ora;
try {
  chalk = require('chalk');
  ora = require('ora');
} catch (error) {
  // Create simple fallbacks
  chalk = {
    bold: { blue: (str) => str, green: (str) => str },
    green: (str) => str,
    yellow: (str) => str,
    red: (str) => str,
    cyan: (str) => str,
    white: (str) => str
  };
  ora = (text) => ({
    start: () => ({ 
      succeed: (msg) => console.log('✅', msg || text),
      fail: (msg) => console.log('❌', msg || text),
      info: (msg) => console.log('ℹ️', msg || text),
      warn: (msg) => console.log('⚠️', msg || text)
    })
  });
}

console.log(chalk.bold.blue('\n🚀 GroeimetAI Course Platform Setup\n'));

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion < 18) {
  console.error(chalk.red(`❌ Node.js version ${nodeVersion} is not supported.`));
  console.error(chalk.yellow('Please install Node.js 18 or higher.'));
  process.exit(1);
}

console.log(chalk.green(`✅ Node.js ${nodeVersion} detected`));

// Function to create directories
function createDirectory(dirPath, description) {
  const spinner = ora(`Creating ${description}`).start();
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      spinner.succeed(`${description} created`);
    } else {
      spinner.info(`${description} already exists`);
    }
  } catch (error) {
    spinner.fail(`Failed to create ${description}: ${error.message}`);
  }
}

// Function to copy environment files
function setupEnvironmentFiles() {
  const spinner = ora('Setting up environment files').start();
  
  const envFiles = [
    { source: '.env.example', target: '.env' },
    { source: '.env.local.example', target: '.env.local' },
    { source: '.env.indexing.example', target: '.env.indexing' }
  ];

  let copied = 0;
  
  envFiles.forEach(({ source, target }) => {
    const sourcePath = path.join(process.cwd(), source);
    const targetPath = path.join(process.cwd(), target);
    
    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
        copied++;
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Could not copy ${source} to ${target}`));
      }
    }
  });

  if (copied > 0) {
    spinner.succeed(`Environment files set up (${copied} files created)`);
    console.log(chalk.yellow('\n⚠️  Please update the .env files with your actual configuration values'));
  } else {
    spinner.info('Environment files already exist');
  }
}

// Function to install dependencies
async function installDependencies() {
  const spinner = ora('Installing dependencies...').start();
  
  try {
    execSync('npm install', { stdio: 'pipe' });
    spinner.succeed('Dependencies installed successfully');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    console.error(chalk.red(error.message));
    console.log(chalk.yellow('\nTry running: npm install --legacy-peer-deps'));
    process.exit(1);
  }
}

// Create necessary directories
async function createDirectories() {
  console.log(chalk.bold('\n📁 Creating project directories...\n'));
  
  const directories = [
    { path: 'public/images/course-thumbnails', desc: 'course thumbnails directory' },
    { path: 'public/images/courses', desc: 'course images directory' },
    { path: 'public/sounds', desc: 'sounds directory' },
    { path: 'src/lib/data/indexes', desc: 'course indexes directory' },
    { path: 'src/lib/data/embeddings', desc: 'embeddings directory' },
    { path: 'reports', desc: 'reports directory' },
    { path: 'memory/data', desc: 'memory data directory' },
    { path: 'memory/backups', desc: 'memory backups directory' }
  ];

  directories.forEach(({ path, desc }) => {
    createDirectory(path, desc);
  });
}

// Create mock data for development
function createMockData() {
  const spinner = ora('Creating mock data for development').start();
  
  try {
    const mockIndexPath = path.join(process.cwd(), 'src/lib/data/indexes');
    const mockIndexFile = path.join(mockIndexPath, 'mock-index.json');
    
    if (!fs.existsSync(mockIndexFile)) {
      const mockData = {
        courses: [],
        embeddings: [],
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      
      fs.writeFileSync(mockIndexFile, JSON.stringify(mockData, null, 2));
      spinner.succeed('Mock data created');
    } else {
      spinner.info('Mock data already exists');
    }
  } catch (error) {
    spinner.warn('Could not create mock data');
  }
}

// Main setup function
async function setup() {
  try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      console.error(chalk.red('❌ No package.json found. Are you in the project root?'));
      process.exit(1);
    }

    // Create directories
    await createDirectories();
    
    // Setup environment files
    setupEnvironmentFiles();
    
    // Install dependencies - Skip to prevent infinite loop
    // await installDependencies();
    
    // Create mock data
    createMockData();
    
    // Success message
    console.log(chalk.bold.green('\n✨ Setup completed successfully!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.white('1. Update your .env files with the correct values'));
    console.log(chalk.white('2. Run "npm run dev" to start the development server'));
    console.log(chalk.white('3. Visit http://localhost:3000 to see your application\n'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), error.message);
    process.exit(1);
  }
}

// Run setup
setup();