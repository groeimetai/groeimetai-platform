const fs = require('fs');
const path = require('path');

const courses = [
  { file: 'prompt-engineering-hero.jpg', title: 'Prompt Engineering', color: '#3B82F6' },
  { file: 'chatgpt-gemini-hero.jpg', title: 'ChatGPT & Gemini', color: '#8B5CF6' },
  { file: 'automation-basics-hero.jpg', title: 'Automation Basics', color: '#10B981' },
  { file: 'advanced-workflows-hero.jpg', title: 'Advanced Workflows', color: '#F59E0B' },
  { file: 'webhooks-apis-hero.jpg', title: 'Webhooks & APIs', color: '#EF4444' },
  { file: 'blockchain-fundamentals-hero.jpg', title: 'Blockchain', color: '#6366F1' },
  { file: 'claude-basics-hero.jpg', title: 'Claude Basics', color: '#EC4899' },
  { file: 'claude-code-hero.jpg', title: 'Claude Code', color: '#14B8A6' },
  { file: 'claude-flow-hero.jpg', title: 'Claude Flow', color: '#F97316' },
  { file: 'langchain-hero.jpg', title: 'LangChain', color: '#84CC16' },
  { file: 'rag-knowledge-hero.jpg', title: 'RAG Systems', color: '#06B6D4' },
  { file: 'crewai-teams-hero.jpg', title: 'CrewAI Teams', color: '#A855F7' },
  { file: 'ai-marketing-hero.jpg', title: 'AI Marketing', color: '#DC2626' },
  { file: 'ai-chatbot-hero.jpg', title: 'AI Chatbot', color: '#0EA5E9' },
  { file: 'data-analysis-hero.jpg', title: 'Data Analysis', color: '#7C3AED' },
  { file: 'blockchain-verification-hero.jpg', title: 'Blockchain Verify', color: '#059669' },
];

const outputDir = path.join(__dirname, '../public/images/courses');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create placeholder SVGs
courses.forEach(course => {
  const svg = `<svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="600" fill="${course.color}"/>
  <rect width="1200" height="600" fill="black" opacity="0.1"/>
  <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white">${course.title}</text>
  <text x="50%" y="90%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white" opacity="0.8">GroeimetAI Course</text>
</svg>`;

  // Write as .svg first
  const svgPath = path.join(outputDir, course.file.replace('.jpg', '.svg'));
  fs.writeFileSync(svgPath, svg);
  
  // For .jpg, we'll use the SVG as a placeholder for now
  // In production, you'd convert these to actual images
  fs.writeFileSync(path.join(outputDir, course.file), svg);
});

console.log(`✅ Created ${courses.length} placeholder course images in ${outputDir}`);