#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🔍 Checking RAG Setup\n'));

// Check environment variables
console.log(chalk.cyan('1. Environment Variables:'));
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_INDEX',
];

let allEnvVarsPresent = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(chalk.red(`   ❌ ${varName}: Missing`));
    allEnvVarsPresent = false;
  } else {
    const maskedValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    console.log(chalk.green(`   ✅ ${varName}: ${maskedValue}`));
  }
});

// Test OpenAI connection
console.log(chalk.cyan('\n2. Testing OpenAI Connection:'));
if (process.env.OPENAI_API_KEY) {
  const { OpenAI } = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  openai.models.list()
    .then(() => console.log(chalk.green('   ✅ OpenAI API Key is valid')))
    .catch(() => console.log(chalk.red('   ❌ OpenAI API Key is invalid')));
} else {
  console.log(chalk.red('   ❌ Cannot test - API key missing'));
}

// Test Pinecone connection
console.log(chalk.cyan('\n3. Testing Pinecone Connection:'));
if (process.env.PINECONE_API_KEY) {
  const { Pinecone } = require('@pinecone-database/pinecone');
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  
  pinecone.listIndexes()
    .then(response => {
      console.log(chalk.green('   ✅ Pinecone API Key is valid'));
      const indexName = process.env.PINECONE_INDEX || 'groeimetai-courses';
      const indexExists = response.indexes?.some(idx => idx.name === indexName);
      
      if (indexExists) {
        console.log(chalk.green(`   ✅ Index '${indexName}' exists`));
        
        // Check index stats
        const index = pinecone.index(indexName);
        index.describeIndexStats()
          .then(stats => {
            console.log(chalk.cyan(`\n4. Index Statistics:`));
            console.log(chalk.white(`   Total vectors: ${stats.totalRecordCount || 0}`));
            if (stats.totalRecordCount === 0) {
              console.log(chalk.yellow(`   ⚠️  No vectors found - run 'npm run index-pinecone' to index courses`));
            }
          })
          .catch(err => console.log(chalk.red('   ❌ Could not get index stats')));
      } else {
        console.log(chalk.red(`   ❌ Index '${indexName}' not found`));
        console.log(chalk.yellow(`   ℹ️  Available indexes: ${response.indexes?.map(i => i.name).join(', ') || 'none'}`));
      }
    })
    .catch(err => {
      console.log(chalk.red('   ❌ Pinecone API Key is invalid or connection failed'));
      console.error('   Error:', err.message);
    });
} else {
  console.log(chalk.red('   ❌ Cannot test - API key missing'));
}

// Test chat endpoint
console.log(chalk.cyan('\n5. Testing Chat Endpoint:'));
fetch('http://localhost:3000/api/chat', {
  method: 'GET'
})
  .then(res => res.json())
  .then(data => {
    console.log(chalk.green('   ✅ Chat endpoint is accessible'));
    console.log(chalk.white(`   Mode: ${data.mode}`));
    console.log(chalk.white(`   OpenAI configured: ${data.config?.openai ? 'Yes' : 'No'}`));
    console.log(chalk.white(`   Pinecone configured: ${data.config?.pinecone ? 'Yes' : 'No'}`));
  })
  .catch(() => {
    console.log(chalk.yellow('   ⚠️  Cannot reach chat endpoint - is the server running?'));
  });

// Summary
setTimeout(() => {
  console.log(chalk.cyan('\n📋 Summary:'));
  if (allEnvVarsPresent) {
    console.log(chalk.green('   ✅ All environment variables are set'));
    console.log(chalk.cyan('\n🚀 Next Steps:'));
    console.log(chalk.white('   1. If index is empty, run: npm run index-pinecone'));
    console.log(chalk.white('   2. Start the server: npm run dev'));
    console.log(chalk.white('   3. Test the chatbot!'));
  } else {
    console.log(chalk.red('   ❌ Some environment variables are missing'));
    console.log(chalk.yellow('\n⚠️  Please add the missing variables to .env.local'));
  }
  console.log('');
}, 2000);