#!/usr/bin/env node
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: '.env.local' });
const ora = require('ora');
const chalk = require('chalk');
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');

class PineconeIndexer {
  constructor() {
    this.coursesPath = path.join(__dirname, '..', 'lib', 'data', 'course-content');
    
    // Initialize OpenAI
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Pinecone
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY not found in environment variables');
    }
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    this.indexName = process.env.PINECONE_INDEX || 'groeimetai-courses';
  }

  async initialize() {
    const spinner = ora('Initializing Pinecone...').start();
    
    try {
      // Get the index
      this.index = this.pinecone.index(this.indexName);
      
      // Check if index exists
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(idx => idx.name === this.indexName);
      
      if (!indexExists) {
        spinner.fail(chalk.red(`Index '${this.indexName}' not found in Pinecone`));
        console.log(chalk.yellow('\nPlease create the index first in Pinecone dashboard:'));
        console.log(chalk.white(`1. Go to https://app.pinecone.io`));
        console.log(chalk.white(`2. Create a new index named: ${this.indexName}`));
        console.log(chalk.white(`3. Dimension: 1536 (for OpenAI embeddings)`));
        console.log(chalk.white(`4. Metric: cosine`));
        process.exit(1);
      }
      
      spinner.succeed(chalk.green('Pinecone initialized'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to initialize Pinecone'));
      throw error;
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 1024, // Match je Pinecone index dimensie!
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  chunkText(text, maxChunkSize = 1000, overlap = 200) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      if ((currentChunk + ' ' + trimmedSentence).length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          // Add overlap
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.floor(overlap / 5));
          currentChunk = overlapWords.join(' ') + ' ' + trimmedSentence;
        } else {
          currentChunk = trimmedSentence;
        }
      } else {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  async parseLessonFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract title
      const titleMatch = content.match(/title:\s*['"](.+?)['"]/);
      const title = titleMatch ? titleMatch[1] : 'Untitled Lesson';
      
      // Extract description
      const descMatch = content.match(/description:\s*['"](.+?)['"]/);
      const description = descMatch ? descMatch[1] : '';
      
      // Extract main content (between content: ` and `)
      const contentMatch = content.match(/content:\s*`([\s\S]+?)`/);
      const mainContent = contentMatch ? contentMatch[1] : '';
      
      // Extract code examples
      const codeMatches = [...content.matchAll(/```[\s\S]+?```/g)];
      const codeExamples = codeMatches.map(match => match[0]).join('\n\n');
      
      // Combine all content
      const fullContent = `# ${title}\n\n${description}\n\n${mainContent}\n\n${codeExamples}`;
      
      return {
        title,
        description,
        content: fullContent,
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return null;
    }
  }

  async indexCourse(courseId, coursePath) {
    const spinner = ora(`Indexing course: ${courseId}`).start();
    let totalVectors = 0;
    
    try {
      const modules = await fs.readdir(coursePath);
      
      for (const moduleDir of modules) {
        if (!moduleDir.startsWith('module-')) continue;
        
        const modulePath = path.join(coursePath, moduleDir);
        const stat = await fs.stat(modulePath);
        
        if (stat.isDirectory()) {
          const lessons = await fs.readdir(modulePath);
          
          for (const lessonFile of lessons) {
            if (!lessonFile.endsWith('.ts')) continue;
            
            const lessonPath = path.join(modulePath, lessonFile);
            const lessonData = await this.parseLessonFile(lessonPath);
            
            if (!lessonData) continue;
            
            // Chunk the content
            const chunks = this.chunkText(lessonData.content);
            
            // Create vectors for each chunk
            const vectors = [];
            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];
              const embedding = await this.generateEmbedding(chunk);
              
              vectors.push({
                id: `${courseId}_${moduleDir}_${lessonFile}_chunk${i}`,
                values: embedding,
                metadata: {
                  courseId,
                  moduleId: moduleDir,
                  lessonId: lessonFile.replace('.ts', ''),
                  lessonTitle: lessonData.title,
                  chunkIndex: i,
                  totalChunks: chunks.length,
                  content: chunk,
                  contentType: 'lesson',
                },
              });
              
              // Small delay to avoid rate limits
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Upsert to Pinecone in batches
            if (vectors.length > 0) {
              const batchSize = 100;
              for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                await this.index.upsert(batch);
                totalVectors += batch.length;
              }
            }
          }
        }
      }
      
      spinner.succeed(chalk.green(`Indexed ${courseId}: ${totalVectors} vectors created`));
      return totalVectors;
    } catch (error) {
      spinner.fail(chalk.red(`Failed to index ${courseId}`));
      console.error(error);
      return 0;
    }
  }

  async run() {
    console.log(chalk.blue.bold('\n📚 GroeimetAI Pinecone Indexer\n'));
    
    // Check environment variables
    console.log(chalk.cyan('Environment check:'));
    console.log(chalk.white(`  OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`));
    console.log(chalk.white(`  Pinecone API Key: ${process.env.PINECONE_API_KEY ? '✅' : '❌'}`));
    console.log(chalk.white(`  Pinecone Index: ${this.indexName}\n`));
    
    if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY) {
      console.log(chalk.red('❌ Missing required API keys in .env.local'));
      process.exit(1);
    }
    
    try {
      await this.initialize();
      
      // Get all courses
      const courseDirs = await fs.readdir(this.coursesPath);
      let totalVectors = 0;
      
      console.log(chalk.cyan(`Found ${courseDirs.length} courses to index\n`));
      
      for (const courseDir of courseDirs) {
        const coursePath = path.join(this.coursesPath, courseDir);
        const stat = await fs.stat(coursePath);
        
        if (stat.isDirectory()) {
          const vectors = await this.indexCourse(courseDir, coursePath);
          totalVectors += vectors;
        }
      }
      
      console.log(chalk.green.bold(`\n✅ Indexing complete! Total vectors: ${totalVectors}\n`));
      console.log(chalk.cyan('You can now check your Pinecone dashboard to see the vectors.'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  }
}

// Run the indexer
const indexer = new PineconeIndexer();
indexer.run();