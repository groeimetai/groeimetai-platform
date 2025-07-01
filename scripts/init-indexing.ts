#!/usr/bin/env node

import { getIndexingService } from '../src/services/indexing-service';
import { IndexingQueue } from '../src/lib/rag/indexing-queue';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.indexing' });

async function initializeIndexing() {
  console.log('🚀 Initializing Course Indexing System...\n');

  // Validate environment
  const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.log('Please copy .env.indexing.example to .env.indexing and fill in the values.');
    process.exit(1);
  }

  const contentPath = process.env.COURSE_CONTENT_PATH || './src/lib/data/course-content';
  
  try {
    // Check if content directory exists
    await fs.access(contentPath);
    console.log('✅ Content directory found:', contentPath);
  } catch {
    console.error('❌ Content directory not found:', contentPath);
    process.exit(1);
  }

  // Initialize indexing service
  const indexingService = getIndexingService({
    contentPath,
    redisConfig: {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD
    },
    openAIApiKey: process.env.OPENAI_API_KEY!,
    enableFileWatcher: false // Disable for initial indexing
  });

  console.log('\n📊 Starting indexing service...');
  await indexingService.start();

  // Get all courses
  const courses = await fs.readdir(contentPath);
  const courseDirs = [];

  for (const item of courses) {
    const itemPath = path.join(contentPath, item);
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory() && !item.startsWith('.')) {
      courseDirs.push(item);
    }
  }

  console.log(`\n📚 Found ${courseDirs.length} courses to index:`);
  courseDirs.forEach(course => console.log(`  - ${course}`));

  // Queue all courses for indexing
  const queue = new IndexingQueue({
    redis: {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD
    }
  });

  console.log('\n🔄 Queueing courses for indexing...');
  
  const jobs = await queue.addBatch(
    courseDirs.map((courseId, index) => ({
      type: 'course' as const,
      action: 'index' as const,
      courseId,
      priority: courseDirs.length - index // Higher priority for first courses
    }))
  );

  console.log(`✅ Queued ${jobs.length} indexing jobs\n`);

  // Monitor progress
  console.log('📈 Monitoring indexing progress...');
  console.log('Press Ctrl+C to stop monitoring (indexing will continue in background)\n');

  const progressInterval = setInterval(async () => {
    const stats = await queue.getStats();
    const status = `⏳ Queue Status - Waiting: ${stats.waiting} | Active: ${stats.active} | Completed: ${stats.completed} | Failed: ${stats.failed}`;
    
    // Clear line and write status
    process.stdout.write('\r' + status);
    
    // If all jobs are completed, exit
    if (stats.waiting === 0 && stats.active === 0 && stats.completed === courseDirs.length) {
      clearInterval(progressInterval);
      console.log('\n\n✅ All courses indexed successfully!');
      
      // Show final stats
      const finalStats = await indexingService.getStatus();
      console.log('\n📊 Final Statistics:');
      console.log(JSON.stringify(finalStats, null, 2));
      
      process.exit(0);
    }
  }, 2000);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Stopping monitoring...');
    clearInterval(progressInterval);
    
    const stats = await queue.getStats();
    console.log('\n📊 Current Status:');
    console.log(`  - Completed: ${stats.completed}`);
    console.log(`  - Remaining: ${stats.waiting + stats.active}`);
    console.log(`  - Failed: ${stats.failed}`);
    console.log('\nIndexing will continue in the background.');
    
    process.exit(0);
  });
}

// Run the initialization
initializeIndexing().catch(error => {
  console.error('\n❌ Initialization failed:', error);
  process.exit(1);
});