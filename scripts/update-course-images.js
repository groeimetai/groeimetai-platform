const fs = require('fs');
const path = require('path');

// Map of old names to new names
const imageMapping = {
  'prompt-engineering-hero.jpg': 'prompt-engineering-hero.jpg',
  'chatgpt-gemini-hero.jpg': 'chatgpt-gemini-masterclass-hero.jpg',
  'automation-basics-hero.jpg': 'n8n-make-basics-hero.jpg',
  'advanced-workflows-hero.jpg': 'advanced-workflows-ai-hero.jpg',
  'webhooks-apis-hero.jpg': 'webhooks-apis-hero.jpg',
  'blockchain-fundamentals-hero.jpg': 'blockchain-fundamentals-hero.jpg',
  'claude-basics-hero.jpg': 'claude-simple-setup-hero.jpg',
  'claude-code-hero.jpg': 'claude-code-mastery-hero.jpg',
  'claude-flow-hero.jpg': 'claude-flow-swarming-hero.jpg',
  'langchain-hero.jpg': 'langchain-basics-hero.jpg',
  'rag-knowledge-hero.jpg': 'rag-knowledge-systems-hero.jpg',
  'crewai-teams-hero.jpg': 'crewai-agent-teams-hero.jpg',
  'ai-marketing-hero.jpg': 'ai-marketing-content-hero.jpg',
  'ai-chatbot-hero.jpg': 'ai-customer-service-bot-hero.jpg',
  'data-analysis-hero.jpg': 'data-analysis-ai-hero.jpg',
  'blockchain-verification-hero.jpg': 'blockchain-fake-news-hero.jpg'
};

// Read the courses file
const coursesPath = path.join(__dirname, '../src/lib/data/courses.ts');
let coursesContent = fs.readFileSync(coursesPath, 'utf-8');

// Replace each old image path with the new one
Object.entries(imageMapping).forEach(([oldName, newName]) => {
  const oldPath = `/images/courses/${oldName}`;
  const newPath = `/images/courses/${newName}`;
  
  if (coursesContent.includes(oldPath)) {
    coursesContent = coursesContent.replace(oldPath, newPath);
    console.log(`✅ Updated: ${oldPath} → ${newPath}`);
  }
});

// Write the updated content back
fs.writeFileSync(coursesPath, coursesContent);

console.log('\n✨ All course image URLs have been updated!');