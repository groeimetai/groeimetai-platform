import { writeFile, readFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { CourseIndexer, IndexingProgress, IndexingStats } from '../lib/rag/course-indexer';

// Configuration
const INDEX_FILE_PATH = join(process.cwd(), '.course-index');
const INDEX_DATA_FILE = join(INDEX_FILE_PATH, 'index.json');
const INDEX_STATS_FILE = join(INDEX_FILE_PATH, 'stats.json');
const INDEX_LOG_FILE = join(INDEX_FILE_PATH, 'indexing.log');

interface IndexMetadata {
  lastIndexed: string;
  version: string;
  totalChunks: number;
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
}

class CourseIndexerCLI {
  private indexer: CourseIndexer;
  private startTime: number = 0;

  constructor() {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
      console.log('Please set it in your .env.local file');
      process.exit(1);
    }

    this.indexer = new CourseIndexer({
      openAIApiKey: process.env.OPENAI_API_KEY,
      progressCallback: this.handleProgress.bind(this)
    });
  }

  /**
   * Main entry point
   */
  async run(args: string[]): Promise<void> {
    const command = args[0] || 'index';

    console.log('🚀 GroeimetAI Course Indexer');
    console.log('================================\n');

    try {
      switch (command) {
        case 'index':
          await this.indexCourses();
          break;
        case 'incremental':
          await this.incrementalIndex();
          break;
        case 'stats':
          await this.showStats();
          break;
        case 'clear':
          await this.clearIndex();
          break;
        case 'search':
          const query = args.slice(1).join(' ');
          await this.searchIndex(query);
          break;
        case 'help':
          this.showHelp();
          break;
        default:
          console.log(`Unknown command: ${command}`);
          this.showHelp();
      }
    } catch (error) {
      console.error('\n❌ Error:', error);
      process.exit(1);
    }
  }

  /**
   * Index all courses
   */
  private async indexCourses(): Promise<void> {
    console.log('📚 Starting course indexing...\n');

    // Ensure index directory exists
    await this.ensureIndexDirectory();

    // Start timing
    this.startTime = Date.now();

    console.log('Scanning course directories...');

    try {
      // Run indexing
      const stats = await this.indexer.indexAllCourses();

      // Show results
      await this.showIndexingResults(stats);

      // Save index
      await this.saveIndex(stats);

      // Log completion
      await this.logIndexing(stats);

    } catch (error) {
      console.error('Indexing failed:', error);
      throw error;
    }
  }

  /**
   * Incremental indexing (only new/modified content)
   */
  private async incrementalIndex(): Promise<void> {
    console.log('📚 Starting incremental indexing...\n');

    // Load existing metadata
    const metadata = await this.loadMetadata();
    
    if (!metadata) {
      console.log('No previous index found. Running full indexing...');
      await this.indexCourses();
      return;
    }

    console.log(`Last indexed: ${new Date(metadata.lastIndexed).toLocaleString()}`);
    console.log(`Previous stats: ${metadata.totalCourses} courses, ${metadata.totalChunks} chunks\n`);

    // For now, we'll do a full reindex
    console.log('⚠️  Incremental indexing not yet implemented. Running full index...');
    await this.indexCourses();
  }

  /**
   * Show indexing statistics
   */
  private async showStats(): Promise<void> {
    const metadata = await this.loadMetadata();
    
    if (!metadata) {
      console.log('No index found. Run "index" command first.');
      return;
    }

    const stats = await this.loadStats();
    
    console.log('📊 Course Index Statistics\n');
    
    console.log('Summary:');
    console.log(`  • Last indexed: ${new Date(metadata.lastIndexed).toLocaleString()}`);
    console.log(`  • Total courses: ${metadata.totalCourses}`);
    console.log(`  • Total modules: ${metadata.totalModules}`);
    console.log(`  • Total lessons: ${metadata.totalLessons}`);
    console.log(`  • Total chunks: ${metadata.totalChunks}`);
    
    if (stats) {
      console.log(`\n  • Code examples: ${stats.totalCodeExamples}`);
      console.log(`  • Indexing time: ${this.formatTime(stats.indexingTime)}`);
      
      if (stats.errors.length > 0) {
        console.log(`\n  • Errors: ${stats.errors.length}`);
        console.log('\nError details:');
        stats.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.courseId || 'General'}: ${error.error}`);
        });
      }
    }
  }

  /**
   * Clear the index
   */
  private async clearIndex(): Promise<void> {
    console.log('Clearing index...');

    try {
      // Clear in-memory index
      await this.indexer.clearIndex();

      // Remove index files
      if (existsSync(INDEX_FILE_PATH)) {
        await rm(INDEX_FILE_PATH, { recursive: true, force: true });
      }

      console.log('✅ Index cleared successfully');
    } catch (error) {
      console.error('Failed to clear index:', error);
      throw error;
    }
  }

  /**
   * Search the index
   */
  private async searchIndex(query: string): Promise<void> {
    if (!query) {
      console.log('Please provide a search query');
      return;
    }

    // Load index
    const indexData = await this.loadIndexData();
    if (!indexData) {
      console.log('No index found. Run "index" command first.');
      return;
    }

    console.log(`🔍 Searching for: "${query}"\n`);

    console.log('Searching...');

    try {
      // Import index data
      await this.indexer.importIndex(indexData);

      // Search
      const results = await this.indexer.search(query, 5);

      if (results.length === 0) {
        console.log('No results found.');
        return;
      }

      console.log(`Found ${results.length} results:\n`);

      results.forEach((result, index) => {
        const metadata = result.metadata;
        console.log(`${index + 1}. ${metadata.lessonTitle}`);
        console.log(`   Course: ${metadata.courseTitle}`);
        console.log(`   Module: ${metadata.moduleTitle}`);
        console.log(`   Type: ${metadata.chunkType}`);
        
        // Show snippet
        const snippet = result.pageContent.substring(0, 150).replace(/\n/g, ' ');
        console.log(`   Preview: ${snippet}...`);
        console.log();
      });
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * Handle progress updates
   */
  private handleProgress(progress: IndexingProgress): void {
    // Clear previous line
    process.stdout.write('\r\x1b[K');
    
    // Show progress
    if (progress.currentCourse) {
      const progressPercent = Math.round(progress.progress || 0);
      const progressBar = this.createProgressBar(progressPercent);
      
      process.stdout.write(
        `${progressBar} ${progressPercent}% | ` +
        `Courses: ${progress.processedCourses}/${progress.totalCourses} | ` +
        `Chunks: ${progress.processedChunks}`
      );
    }
  }

  /**
   * Create a progress bar
   */
  private createProgressBar(percent: number): string {
    const width = 30;
    const filled = Math.round((width * percent) / 100);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${' '.repeat(empty)}]`;
  }

  /**
   * Show indexing results
   */
  private async showIndexingResults(stats: IndexingStats): Promise<void> {
    const duration = this.formatTime(Date.now() - this.startTime);

    console.log('\n\n✅ Indexing completed!\n');

    console.log('Results:');
    console.log(`  • Courses indexed: ${stats.totalCourses}`);
    console.log(`  • Modules processed: ${stats.totalModules}`);
    console.log(`  • Lessons processed: ${stats.totalLessons}`);
    console.log(`  • Chunks created: ${stats.totalChunks}`);
    console.log(`  • Code examples: ${stats.totalCodeExamples}`);
    console.log(`  • Total time: ${duration}`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Warnings: ${stats.errors.length} errors occurred`);
      console.log('Run "stats" command for details');
    }

    // Performance metrics
    const chunksPerSecond = Math.round(stats.totalChunks / (stats.indexingTime / 1000));
    console.log(`\n  • Performance: ${chunksPerSecond} chunks/second`);
  }

  /**
   * Format time duration
   */
  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Ensure index directory exists
   */
  private async ensureIndexDirectory(): Promise<void> {
    if (!existsSync(INDEX_FILE_PATH)) {
      await mkdir(INDEX_FILE_PATH, { recursive: true });
    }
  }

  /**
   * Save index to disk
   */
  private async saveIndex(stats: IndexingStats): Promise<void> {
    console.log('\nSaving index to disk...');

    try {
      // Save index data
      const indexData = await this.indexer.exportIndex();
      await writeFile(INDEX_DATA_FILE, indexData);

      // Save metadata
      const metadata: IndexMetadata = {
        lastIndexed: new Date().toISOString(),
        version: '1.0.0',
        totalChunks: stats.totalChunks,
        totalCourses: stats.totalCourses,
        totalModules: stats.totalModules,
        totalLessons: stats.totalLessons
      };
      await writeFile(join(INDEX_FILE_PATH, 'metadata.json'), JSON.stringify(metadata, null, 2));

      // Save stats
      await writeFile(INDEX_STATS_FILE, JSON.stringify(stats, null, 2));

      console.log('✅ Index saved successfully');
    } catch (error) {
      console.error('Failed to save index:', error);
      throw error;
    }
  }

  /**
   * Load metadata
   */
  private async loadMetadata(): Promise<IndexMetadata | null> {
    const metadataFile = join(INDEX_FILE_PATH, 'metadata.json');
    
    if (!existsSync(metadataFile)) {
      return null;
    }

    try {
      const data = await readFile(metadataFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Load stats
   */
  private async loadStats(): Promise<IndexingStats | null> {
    if (!existsSync(INDEX_STATS_FILE)) {
      return null;
    }

    try {
      const data = await readFile(INDEX_STATS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Load index data
   */
  private async loadIndexData(): Promise<string | null> {
    if (!existsSync(INDEX_DATA_FILE)) {
      return null;
    }

    try {
      return await readFile(INDEX_DATA_FILE, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Log indexing operation
   */
  private async logIndexing(stats: IndexingStats): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      duration: this.formatTime(stats.indexingTime),
      stats: {
        courses: stats.totalCourses,
        modules: stats.totalModules,
        lessons: stats.totalLessons,
        chunks: stats.totalChunks,
        codeExamples: stats.totalCodeExamples,
        errors: stats.errors.length
      }
    };

    try {
      let logs = [];
      if (existsSync(INDEX_LOG_FILE)) {
        const logData = await readFile(INDEX_LOG_FILE, 'utf-8');
        logs = JSON.parse(logData);
      }
      
      logs.push(logEntry);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs = logs.slice(-100);
      }
      
      await writeFile(INDEX_LOG_FILE, JSON.stringify(logs, null, 2));
    } catch {
      // Ignore logging errors
    }
  }

  /**
   * Show help message
   */
  private showHelp(): void {
    console.log('Usage: npm run index-courses [command]\n');
    console.log('Commands:');
    console.log('  index        Index all courses (default)');
    console.log('  incremental  Index only new/modified content');
    console.log('  stats        Show indexing statistics');
    console.log('  clear        Clear the entire index');
    console.log('  search       Search the index');
    console.log('  help         Show this help message');
    console.log();
    console.log('Examples:');
    console.log('  npm run index-courses');
    console.log('  npm run index-courses stats');
    console.log('  npm run index-courses search "langchain memory"');
  }
}

// Run CLI
const cli = new CourseIndexerCLI();
cli.run(process.argv.slice(2)).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});