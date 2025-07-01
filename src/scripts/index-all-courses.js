#!/usr/bin/env node
const path = require('path');
const fs = require('fs').promises;
const { createHash } = require('crypto');

// Import dependencies
require('dotenv').config();
const ora = require('ora');
const chalk = require('chalk');

// Simple course indexer without TypeScript
class CourseIndexer {
  constructor() {
    this.coursesPath = path.join(__dirname, '..', 'lib', 'data', 'course-content');
    this.outputPath = path.join(process.cwd(), '.course-index');
    this.index = [];
  }

  async loadCourses() {
    const spinner = ora('Loading courses...').start();
    
    try {
      // Check if courses directory exists
      try {
        await fs.access(this.coursesPath);
      } catch (error) {
        spinner.warn(chalk.yellow('Course directory not found. Creating mock data...'));
        await this.createMockCourses();
        spinner.succeed(chalk.green('Mock data created'));
        return;
      }

      const courseDirs = await fs.readdir(this.coursesPath);
      let totalLessons = 0;

      if (courseDirs.length === 0) {
        spinner.warn(chalk.yellow('No courses found. Creating mock data...'));
        await this.createMockCourses();
        spinner.succeed(chalk.green('Mock data created'));
        return;
      }

      for (const courseDir of courseDirs) {
        const coursePath = path.join(this.coursesPath, courseDir);
        const stat = await fs.stat(coursePath);
        
        if (stat.isDirectory()) {
          const lessons = await this.indexCourse(courseDir, coursePath);
          totalLessons += lessons;
        }
      }

      spinner.succeed(chalk.green(`Loaded ${this.index.length} courses with ${totalLessons} lessons`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to load courses'));
      throw error;
    }
  }

  async indexCourse(courseId, coursePath) {
    let lessonCount = 0;
    
    try {
      // Try to load course index file
      const indexPath = path.join(coursePath, 'index.ts');
      
      // For now, just count module directories
      const entries = await fs.readdir(coursePath);
      
      for (const entry of entries) {
        if (entry.startsWith('module-')) {
          const modulePath = path.join(coursePath, entry);
          const moduleStat = await fs.stat(modulePath);
          
          if (moduleStat.isDirectory()) {
            const lessons = await fs.readdir(modulePath);
            const lessonFiles = lessons.filter(f => f.startsWith('lesson-') && f.endsWith('.ts'));
            lessonCount += lessonFiles.length;
            
            // Add to index
            for (const lessonFile of lessonFiles) {
              const lessonId = lessonFile.replace('.ts', '');
              this.index.push({
                courseId,
                moduleId: entry,
                lessonId,
                path: path.join(modulePath, lessonFile),
                indexed: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not fully index ${courseId}: ${error.message}`));
    }
    
    return lessonCount;
  }

  async saveIndex() {
    const spinner = ora('Saving index...').start();
    
    try {
      await fs.mkdir(this.outputPath, { recursive: true });
      
      const indexFile = path.join(this.outputPath, 'courses.json');
      await fs.writeFile(indexFile, JSON.stringify(this.index, null, 2));
      
      const statsFile = path.join(this.outputPath, 'stats.json');
      const stats = {
        totalCourses: new Set(this.index.map(i => i.courseId)).size,
        totalModules: new Set(this.index.map(i => `${i.courseId}/${i.moduleId}`)).size,
        totalLessons: this.index.length,
        lastIndexed: new Date().toISOString()
      };
      await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
      
      spinner.succeed(chalk.green('Index saved successfully'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to save index'));
      throw error;
    }
  }

  async run() {
    console.log(chalk.blue.bold('\n📚 GroeimetAI Course Indexer\n'));
    
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      if (command === 'stats') {
        await this.showStats();
      } else if (command === 'search') {
        await this.search(args[1]);
      } else if (command === 'clear') {
        await this.clearIndex();
      } else {
        await this.loadCourses();
        await this.saveIndex();
        console.log(chalk.green.bold('\n✅ Indexing complete!\n'));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  }

  async showStats() {
    try {
      const statsFile = path.join(this.outputPath, 'stats.json');
      const stats = JSON.parse(await fs.readFile(statsFile, 'utf-8'));
      
      console.log(chalk.cyan('\n📊 Index Statistics:'));
      console.log(chalk.white(`  Total Courses: ${stats.totalCourses}`));
      console.log(chalk.white(`  Total Modules: ${stats.totalModules}`));
      console.log(chalk.white(`  Total Lessons: ${stats.totalLessons}`));
      console.log(chalk.white(`  Last Indexed: ${new Date(stats.lastIndexed).toLocaleString()}\n`));
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  No index found. Run indexing first.\n'));
    }
  }

  async search(query) {
    if (!query) {
      console.log(chalk.yellow('\n⚠️  Please provide a search query.\n'));
      return;
    }

    try {
      const indexFile = path.join(this.outputPath, 'courses.json');
      const index = JSON.parse(await fs.readFile(indexFile, 'utf-8'));
      
      const results = index.filter(item => 
        item.courseId.includes(query) || 
        item.moduleId.includes(query) || 
        item.lessonId.includes(query)
      );
      
      console.log(chalk.cyan(`\n🔍 Search results for "${query}":`));
      
      if (results.length === 0) {
        console.log(chalk.yellow('  No results found.\n'));
      } else {
        results.forEach(r => {
          console.log(chalk.white(`  ${r.courseId} > ${r.moduleId} > ${r.lessonId}`));
        });
        console.log(chalk.green(`\n  Found ${results.length} results.\n`));
      }
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  No index found. Run indexing first.\n'));
    }
  }

  async clearIndex() {
    const spinner = ora('Clearing index...').start();
    
    try {
      await fs.rm(this.outputPath, { recursive: true, force: true });
      spinner.succeed(chalk.green('Index cleared successfully'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to clear index'));
    }
  }

  async createMockCourses() {
    // Create a simple mock course structure for development
    const mockCourse = {
      courseId: 'mock-course-development',
      modules: [
        {
          moduleId: 'module-1',
          lessons: ['lesson-1-1', 'lesson-1-2']
        },
        {
          moduleId: 'module-2',
          lessons: ['lesson-2-1', 'lesson-2-2']
        }
      ]
    };

    // Add mock data to index
    for (const module of mockCourse.modules) {
      for (const lessonId of module.lessons) {
        this.index.push({
          courseId: mockCourse.courseId,
          moduleId: module.moduleId,
          lessonId,
          path: path.join(this.coursesPath, mockCourse.courseId, module.moduleId, `${lessonId}.ts`),
          indexed: new Date().toISOString(),
          isMock: true
        });
      }
    }
  }
}

// Run the indexer
const indexer = new CourseIndexer();
indexer.run();