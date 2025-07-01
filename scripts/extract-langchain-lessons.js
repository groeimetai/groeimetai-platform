#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the original file
const originalPath = path.join(__dirname, '../src/lib/data/course-content/langchain-basics.ts');
const content = fs.readFileSync(originalPath, 'utf8');

// Parse the file to extract modules and lessons
const moduleRegex = /\{\s*id:\s*'module-(\d+)',[\s\S]*?lessons:\s*\[([\s\S]*?)\]\s*\}/g;
const lessonRegex = /\{\s*id:\s*'lesson-(\d+)-(\d+)',[\s\S]*?\}\s*(?=,\s*\{|]\s*\})/g;

// Extract all content
const lines = content.split('\n');
const exportStart = lines.findIndex(line => line.includes('export const langchainBasicsModules'));
const moduleStart = lines.findIndex(line => line.includes("id: 'module-1'"));

// Find the boundaries of each module
const moduleIndices = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("id: 'module-")) {
    moduleIndices.push(i);
  }
}

// Add the end index
moduleIndices.push(lines.length);

// Process each module
for (let m = 0; m < moduleIndices.length - 1; m++) {
  const moduleNum = m + 1;
  const moduleDir = path.join(__dirname, `../src/lib/data/course-content/langchain-basics/module-${moduleNum}`);
  
  // Create module directory if it doesn't exist
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true });
  }
  
  // Find lessons within this module
  const moduleStartLine = moduleIndices[m];
  const moduleEndLine = moduleIndices[m + 1];
  
  const lessonIndices = [];
  for (let i = moduleStartLine; i < moduleEndLine; i++) {
    if (lines[i].includes(`id: 'lesson-${moduleNum}-`)) {
      lessonIndices.push(i);
    }
  }
  
  // Add the end of the last lesson (either next module or end of lessons array)
  for (let i = lessonIndices[lessonIndices.length - 1] + 1; i < moduleEndLine; i++) {
    if (lines[i].trim() === '},') {
      // Find the closing of the lesson object
      let braceCount = 1;
      for (let j = i + 1; j < moduleEndLine; j++) {
        if (lines[j].includes('{')) braceCount++;
        if (lines[j].includes('}')) braceCount--;
        if (braceCount === 0) {
          lessonIndices.push(j + 1);
          break;
        }
      }
      break;
    }
  }
  
  // Extract and save each lesson
  for (let l = 0; l < lessonIndices.length - 1; l++) {
    const lessonNum = l + 1;
    const lessonStart = lessonIndices[l];
    const lessonEnd = lessonIndices[l + 1];
    
    // Extract lesson content
    const lessonLines = lines.slice(lessonStart, lessonEnd);
    
    // Clean up the content
    let lessonContent = lessonLines.join('\n');
    
    // Remove trailing comma and whitespace
    lessonContent = lessonContent.trim().replace(/,\s*$/, '');
    
    // Create the lesson file content
    const lessonFileContent = `import { Lesson } from '@/lib/data/courses'

export const lesson${moduleNum}${lessonNum}: Lesson = ${lessonContent}
`;
    
    // Write the lesson file
    const lessonPath = path.join(moduleDir, `lesson-${lessonNum}.ts`);
    fs.writeFileSync(lessonPath, lessonFileContent);
    console.log(`Created ${lessonPath}`);
  }
  
  // Create module index file
  const moduleIndexContent = `import { lesson${moduleNum}1 } from './lesson-1'
import { lesson${moduleNum}2 } from './lesson-2'
import { lesson${moduleNum}3 } from './lesson-3'

export { lesson${moduleNum}1, lesson${moduleNum}2, lesson${moduleNum}3 }
`;
  
  const moduleIndexPath = path.join(moduleDir, 'index.ts');
  fs.writeFileSync(moduleIndexPath, moduleIndexContent);
  console.log(`Created ${moduleIndexPath}`);
}

// Extract module metadata
const module1Start = lines.findIndex(line => line.includes("id: 'module-1'"));
const module1Title = lines.find(line => line.includes("title: 'LangChain fundamenten'"));
const module1Desc = lines.find(line => line.includes("description: 'Ontdek wat LangChain"));

const module2Start = lines.findIndex(line => line.includes("id: 'module-2'"));
const module2Title = lines.find((line, i) => i > module2Start && line.includes("title: 'Prompt Templates"));
const module2Desc = lines.find((line, i) => i > module2Start && line.includes("description: 'Beheers prompts"));

const module3Start = lines.findIndex(line => line.includes("id: 'module-3'"));
const module3Title = lines.find((line, i) => i > module3Start && line.includes("title: 'Chains en Sequential"));
const module3Desc = lines.find((line, i) => i > module3Start && line.includes("description: 'Leer hoe je"));

// Create main index file
const mainIndexContent = `import { Module } from '@/lib/data/courses'
import { lesson11, lesson12, lesson13 } from './module-1'
import { lesson21, lesson22, lesson23 } from './module-2'
import { lesson31, lesson32, lesson33 } from './module-3'

export const langchainBasicsModules: Module[] = [
  {
    id: 'module-1',
    title: 'LangChain fundamenten',
    description: 'Ontdek wat LangChain is, waarom het gebruikt wordt, en hoe je aan de slag gaat',
    lessons: [lesson11, lesson12, lesson13]
  },
  {
    id: 'module-2',
    title: 'Prompt Templates en Output Parsers',
    description: 'Beheers prompts professioneel en parse AI output naar structured data',
    lessons: [lesson21, lesson22, lesson23]
  },
  {
    id: 'module-3',
    title: 'Chains en Sequential Processing',
    description: 'Leer hoe je complexe workflows bouwt met LangChain chains',
    lessons: [lesson31, lesson32, lesson33]
  }
]
`;

const mainIndexPath = path.join(__dirname, '../src/lib/data/course-content/langchain-basics/index.ts');
fs.writeFileSync(mainIndexPath, mainIndexContent);
console.log(`Created ${mainIndexPath}`);

console.log('\nExtraction complete! Now update the main langchain-basics.ts file to import from the new structure.');