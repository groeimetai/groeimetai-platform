#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');
const chalk = require('chalk');

async function checkDimension() {
  console.log(chalk.blue.bold('\n🔍 Checking Pinecone Index Dimension\n'));

  if (!process.env.PINECONE_API_KEY) {
    console.log(chalk.red('❌ PINECONE_API_KEY not found in .env.local'));
    process.exit(1);
  }

  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = process.env.PINECONE_INDEX || 'groeimetai-courses';
    
    // List all indexes
    const response = await pinecone.listIndexes();
    console.log(chalk.cyan('Available indexes:'));
    
    for (const index of response.indexes || []) {
      console.log(chalk.white(`\n  Index: ${index.name}`));
      console.log(chalk.white(`  Dimension: ${index.dimension}`));
      console.log(chalk.white(`  Metric: ${index.metric}`));
      console.log(chalk.white(`  Status: ${index.status?.state || 'unknown'}`));
      
      if (index.name === indexName) {
        console.log(chalk.green(`  ✅ This is your configured index`));
        
        if (index.dimension !== 1024) {
          console.log(chalk.yellow(`\n⚠️  Your index has dimension ${index.dimension}, but the code is now set to 1024`));
          console.log(chalk.yellow(`    Please update the dimension in the code to ${index.dimension}`));
        } else {
          console.log(chalk.green(`\n✅ Dimension matches! Your index uses 1024 dimensions.`));
        }
      }
    }
    
    if (!response.indexes?.some(idx => idx.name === indexName)) {
      console.log(chalk.red(`\n❌ Index '${indexName}' not found!`));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
  }
}

checkDimension();