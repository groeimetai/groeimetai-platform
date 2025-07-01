#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying GroeimetAI Platform Setup...\n');

let issues = 0;

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 18) {
  console.log('✅ Node.js version:', nodeVersion);
} else {
  console.log('❌ Node.js version too old:', nodeVersion, '(need 18+)');
  issues++;
}

// Check required directories
const requiredDirs = [
  'public/images/course-thumbnails',
  'public/images/courses',
  'public/sounds',
  'src/lib/data',
  'reports',
  'memory/data'
];

console.log('\n📁 Checking directories:');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log('✅', dir);
  } else {
    console.log('❌', dir, '(missing)');
    issues++;
  }
});

// Check environment files
const envFiles = ['.env', '.env.local'];
console.log('\n🔐 Checking environment files:');
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log('✅', file);
  } else {
    console.log('⚠️ ', file, '(missing - copy from', file + '.example)');
  }
});

// Check package.json
if (fs.existsSync('package.json')) {
  console.log('\n📦 package.json found');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('   Name:', pkg.name);
  console.log('   Version:', pkg.version);
} else {
  console.log('\n❌ package.json not found!');
  issues++;
}

// Check if node_modules exists
if (fs.existsSync('node_modules')) {
  console.log('\n✅ node_modules directory exists');
} else {
  console.log('\n⚠️  node_modules missing - run: npm install');
}

// Summary
console.log('\n' + '='.repeat(50));
if (issues === 0) {
  console.log('✨ Setup verification passed!');
  console.log('\nYou can now run:');
  console.log('  npm run dev    - Start development server');
  console.log('  npm run build  - Build for production');
} else {
  console.log(`⚠️  Found ${issues} issues that need attention`);
  console.log('\nRun the following to fix:');
  console.log('  npm run setup  - Run setup script');
  console.log('  npm install    - Install dependencies');
}
console.log('='.repeat(50) + '\n');

process.exit(issues > 0 ? 1 : 0);