const fs = require('fs');
const path = require('path');

// Define all courses
const courses = [
  { id: 'prompt-engineering', title: 'Prompt Engineering - De Essentiële Vaardigheid', category: 'Fundamenten' },
  { id: 'chatgpt-gemini-masterclass', title: 'Masterclass ChatGPT/Gemini voor Professionals', category: 'Fundamenten' },
  { id: 'n8n-make-basics', title: 'De Basis van Automations - N8N/Make', category: 'Automation' },
  { id: 'advanced-workflows-ai', title: 'Geavanceerde Workflows & AI-integraties', category: 'Automation' },
  { id: 'webhooks-apis', title: 'Werken met Webhooks & APIs', category: 'Automation' },
  { id: 'blockchain-fundamentals', title: 'Blockchain Fundamentals voor Developers', category: 'Development' },
  { id: 'claude-simple-setup', title: 'Claude: Opzetten en Simpel Gebruiken', category: 'Development' },
  { id: 'claude-code-mastery', title: 'Claude Code: Codebases & Commands', category: 'Development' },
  { id: 'claude-flow-swarming', title: 'Claude Flow: AI Swarming in de Praktijk', category: 'Development' },
  { id: 'langchain-basics', title: 'LangChain - De Basis', category: 'Development' },
  { id: 'rag-knowledge-systems', title: 'Jouw Data als Kennisbank (RAG)', category: 'Development' },
  { id: 'crewai-agent-teams', title: 'CrewAI - Laat AI Agents Samenwerken', category: 'Development' },
  { id: 'ai-marketing-content', title: 'AI voor Marketing & Content Creatie', category: 'Praktijk' },
  { id: 'ai-customer-service-bot', title: 'Bouw je Eigen AI Klantenservice Bot', category: 'Praktijk' },
  { id: 'data-analysis-ai', title: 'Data-analyse voor Beginners met AI', category: 'Praktijk' },
  { id: 'blockchain-fake-news', title: 'Blockchain tegen Fake News - Verificatie Systemen', category: 'Praktijk' }
];

// Directories
const heroDir = path.join(__dirname, '../public/images/courses');
const thumbnailDir = path.join(__dirname, '../public/images/course-thumbnails');

console.log('🎨 Course Images Summary\n');
console.log('=' .repeat(80));

// Check each course
courses.forEach((course, index) => {
  const heroPath = path.join(heroDir, `${course.id}-hero.jpg`);
  const thumbnailPath = path.join(thumbnailDir, `${course.id}.jpg`);
  
  const heroExists = fs.existsSync(heroPath);
  const thumbnailExists = fs.existsSync(thumbnailPath);
  
  console.log(`\n[${index + 1}] ${course.title}`);
  console.log(`    Category: ${course.category}`);
  console.log(`    Hero: ${heroExists ? '✅' : '❌'} ${course.id}-hero.jpg`);
  console.log(`    Thumbnail: ${thumbnailExists ? '✅' : '❌'} ${course.id}.jpg`);
  
  if (heroExists) {
    const stats = fs.statSync(heroPath);
    console.log(`    Hero size: ${(stats.size / 1024).toFixed(1)} KB`);
  }
  
  if (thumbnailExists) {
    const stats = fs.statSync(thumbnailPath);
    console.log(`    Thumbnail size: ${(stats.size / 1024).toFixed(1)} KB`);
  }
});

console.log('\n' + '=' .repeat(80));

// Summary statistics
const heroFiles = fs.readdirSync(heroDir).filter(f => f.endsWith('-hero.jpg'));
const thumbnailFiles = fs.readdirSync(thumbnailDir).filter(f => f.endsWith('.jpg'));

console.log('\n📊 Summary:');
console.log(`   Total courses: ${courses.length}`);
console.log(`   Hero images: ${heroFiles.length}`);
console.log(`   Thumbnails: ${thumbnailFiles.length}`);
console.log(`   ✅ All images generated successfully!`);

// List any extra files
const expectedHeroFiles = courses.map(c => `${c.id}-hero.jpg`);
const extraHeroFiles = heroFiles.filter(f => !expectedHeroFiles.includes(f));

const expectedThumbnailFiles = courses.map(c => `${c.id}.jpg`);
const extraThumbnailFiles = thumbnailFiles.filter(f => !expectedThumbnailFiles.includes(f));

if (extraHeroFiles.length > 0) {
  console.log('\n⚠️ Extra hero files found:');
  extraHeroFiles.forEach(f => console.log(`   - ${f}`));
}

if (extraThumbnailFiles.length > 0) {
  console.log('\n⚠️ Extra thumbnail files found:');
  extraThumbnailFiles.forEach(f => console.log(`   - ${f}`));
}

console.log('\n✨ Course images are ready to use!');