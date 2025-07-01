const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Manually define all courses based on the actual course data
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

console.log(`Generating images for ${courses.length} courses:\n`);
courses.forEach(course => {
  console.log(`- ${course.id}: ${course.title}`);
});

// Beautiful color schemes with modern gradients
const categoryColors = {
  'Fundamenten': {
    gradient: { r: 99, g: 102, b: 241 }, // Indigo
    gradientEnd: { r: 139, g: 92, b: 246 }, // Purple
    accent: { r: 236, g: 72, b: 153 } // Pink
  },
  'Automation': {
    gradient: { r: 16, g: 185, b: 129 }, // Emerald
    gradientEnd: { r: 6, g: 182, b: 212 }, // Cyan
    accent: { r: 34, g: 197, b: 94 } // Green
  },
  'Development': {
    gradient: { r: 245, g: 158, b: 11 }, // Amber
    gradientEnd: { r: 239, g: 68, b: 68 }, // Red
    accent: { r: 251, g: 146, b: 60 } // Orange
  },
  'Praktijk': {
    gradient: { r: 139, g: 92, b: 246 }, // Purple
    gradientEnd: { r: 99, g: 102, b: 241 }, // Indigo
    accent: { r: 167, g: 139, b: 250 } // Light Purple
  }
};

// Create output directories
const outputDirs = {
  courses: path.join(__dirname, '../public/images/courses'),
  courseThumbnails: path.join(__dirname, '../public/images/course-thumbnails')
};

Object.values(outputDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Modern patterns for backgrounds
const getPattern = (category) => {
  const patterns = {
    'Fundamenten': `
      <pattern id="pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="30" cy="30" r="2" fill="white" opacity="0.2"/>
        <circle cx="0" cy="0" r="2" fill="white" opacity="0.2"/>
        <circle cx="60" cy="0" r="2" fill="white" opacity="0.2"/>
        <circle cx="0" cy="60" r="2" fill="white" opacity="0.2"/>
        <circle cx="60" cy="60" r="2" fill="white" opacity="0.2"/>
      </pattern>
    `,
    'Automation': `
      <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M 0 50 Q 25 40 50 50 T 100 50" stroke="white" stroke-width="1" fill="none" opacity="0.15"/>
        <path d="M 0 25 Q 25 15 50 25 T 100 25" stroke="white" stroke-width="1" fill="none" opacity="0.1"/>
        <path d="M 0 75 Q 25 65 50 75 T 100 75" stroke="white" stroke-width="1" fill="none" opacity="0.1"/>
      </pattern>
    `,
    'Development': `
      <pattern id="pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="40" height="40" fill="white" opacity="0.05"/>
        <rect x="40" y="40" width="40" height="40" fill="white" opacity="0.05"/>
        <line x1="0" y1="0" x2="80" y2="80" stroke="white" stroke-width="1" opacity="0.1"/>
        <line x1="80" y1="0" x2="0" y2="80" stroke="white" stroke-width="1" opacity="0.1"/>
      </pattern>
    `,
    'Praktijk': `
      <pattern id="pattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
        <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="white" stroke-width="1" opacity="0.1"/>
      </pattern>
    `
  };
  return patterns[category] || patterns['Fundamenten'];
};

// Function to escape XML entities
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Function to wrap text for SVG
function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  const approxCharWidth = 30;

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const lineLength = (currentLine + ' ' + word).length * approxCharWidth;
    if (lineLength < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines.map(line => escapeXml(line));
}

// Generate hero image (1200x630)
async function generateHeroImage(course) {
  const width = 1200;
  const height = 630;
  
  const colors = categoryColors[course.category] || categoryColors['Fundamenten'];
  const pattern = getPattern(course.category);
  
  const titleLines = wrapText(course.title, width * 0.6);
  const titleY = height / 2 - (titleLines.length * 75) / 2 + 20;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${colors.gradient.r},${colors.gradient.g},${colors.gradient.b});stop-opacity:1" />
          <stop offset="50%" style="stop-color:rgb(${colors.gradientEnd.r},${colors.gradientEnd.g},${colors.gradientEnd.b});stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(${colors.gradient.r},${colors.gradient.g},${colors.gradient.b});stop-opacity:0.8" />
        </linearGradient>
        
        <!-- Pattern -->
        ${pattern}
        
        <!-- Text shadow -->
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>
        
        <!-- Glow effect -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
      
      <!-- Pattern overlay -->
      <rect width="${width}" height="${height}" fill="url(#pattern)"/>
      
      <!-- Geometric shapes for visual interest -->
      <circle cx="${width * 0.85}" cy="${height * 0.15}" r="100" fill="white" opacity="0.1" filter="url(#glow)"/>
      <circle cx="${width * 0.9}" cy="${height * 0.3}" r="60" fill="white" opacity="0.08"/>
      <circle cx="${width * 0.1}" cy="${height * 0.8}" r="80" fill="white" opacity="0.06"/>
      
      <!-- Dark overlay for text readability -->
      <rect x="0" y="${height * 0.25}" width="${width * 0.75}" height="${height * 0.5}" 
            fill="black" opacity="0.4" rx="20"/>
      
      <!-- Title -->
      <text x="80" y="${titleY}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="60" font-weight="bold" fill="white" filter="url(#shadow)">
        ${titleLines.map((line, index) => 
          `<tspan x="80" dy="${index === 0 ? 0 : 75}">${line}</tspan>`
        ).join('')}
      </text>
      
      <!-- Category badge -->
      <rect x="80" y="${height - 140}" width="${course.category.length * 18 + 50}" height="45" rx="22.5" 
            fill="white" opacity="0.95"/>
      <text x="${105}" y="${height - 108}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="22" font-weight="600" fill="rgb(${colors.gradient.r},${colors.gradient.g},${colors.gradient.b})">
        ${escapeXml(course.category)}
      </text>
      
      <!-- GroeimetAI branding -->
      <text x="${width - 220}" y="${height - 40}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="28" font-weight="600" fill="white" opacity="0.9">
        GroeimetAI
      </text>
      
      <!-- Decorative line -->
      <rect x="80" y="${titleY + titleLines.length * 75 + 20}" width="120" height="4" 
            fill="rgb(${colors.accent.r},${colors.accent.g},${colors.accent.b})" rx="2"/>
    </svg>
  `;
  
  const heroPath = path.join(outputDirs.courses, `${course.id}-hero.jpg`);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(heroPath);
  
  return heroPath;
}

// Generate thumbnail image (400x300)
async function generateThumbnail(course) {
  const width = 400;
  const height = 300;
  
  const colors = categoryColors[course.category] || categoryColors['Fundamenten'];
  
  const titleLines = wrapText(course.title, width - 80);
  const titleY = height / 2 - (titleLines.length * 32) / 2;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient -->
        <linearGradient id="thumbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${colors.gradient.r},${colors.gradient.g},${colors.gradient.b});stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(${colors.gradientEnd.r},${colors.gradientEnd.g},${colors.gradientEnd.b});stop-opacity:1" />
        </linearGradient>
        
        <!-- Text shadow -->
        <filter id="textShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#thumbGradient)"/>
      
      <!-- Overlay for text contrast -->
      <rect width="${width}" height="${height}" fill="black" opacity="0.25"/>
      
      <!-- Decorative elements -->
      <circle cx="${width}" cy="0" r="100" fill="white" opacity="0.08"/>
      <circle cx="0" cy="${height}" r="80" fill="white" opacity="0.06"/>
      
      <!-- Title -->
      <text x="${width/2}" y="${titleY}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="26" font-weight="bold" fill="white" text-anchor="middle" filter="url(#textShadow)">
        ${titleLines.map((line, index) => 
          `<tspan x="${width/2}" dy="${index === 0 ? 0 : 32}">${line}</tspan>`
        ).join('')}
      </text>
      
      <!-- Category -->
      <rect x="${(width - course.category.length * 10 - 30) / 2}" y="${height - 55}" 
            width="${course.category.length * 10 + 30}" height="25" rx="12.5" 
            fill="white" opacity="0.2"/>
      <text x="${width/2}" y="${height - 36}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="16" font-weight="600" fill="white" text-anchor="middle">
        ${escapeXml(course.category)}
      </text>
    </svg>
  `;
  
  const thumbnailPath = path.join(outputDirs.courseThumbnails, `${course.id}.jpg`);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(thumbnailPath);
  
  return thumbnailPath;
}

// Generate images for all courses
async function generateAllImages() {
  console.log('\n🎨 Generating beautiful course images...\n');
  
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    console.log(`[${i + 1}/${courses.length}] Generating images for: ${course.title}`);
    
    try {
      const heroPath = await generateHeroImage(course);
      const thumbnailPath = await generateThumbnail(course);
      
      console.log(`  ✅ Hero image: ${heroPath}`);
      console.log(`  ✅ Thumbnail: ${thumbnailPath}`);
    } catch (error) {
      console.error(`  ❌ Error generating images for ${course.id}:`, error.message);
    }
  }
  
  console.log('\n✨ All course images generated successfully!');
  console.log(`📁 Hero images: ${outputDirs.courses}`);
  console.log(`📁 Thumbnails: ${outputDirs.courseThumbnails}`);
}

// Run the generation
generateAllImages().catch(console.error);