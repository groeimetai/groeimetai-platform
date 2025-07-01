const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Import course data
const coursesFile = fs.readFileSync(path.join(__dirname, '../src/lib/data/courses.ts'), 'utf-8');

// Extract course IDs and titles using regex
const courseMatches = coursesFile.matchAll(/{\s*id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'/g);
const courses = Array.from(courseMatches).map(match => ({
  id: match[1],
  title: match[2],
  category: match[3]
}));

console.log(`Found ${courses.length} courses to generate images for:\n`);
courses.forEach(course => {
  console.log(`- ${course.id}: ${course.title}`);
});

// Color schemes for different categories with beautiful gradients
const categoryColors = {
  'Fundamenten': {
    gradient: { r: 99, g: 102, b: 241 }, // Indigo
    gradientEnd: { r: 139, g: 92, b: 246 }, // Purple
    text: '#FFFFFF'
  },
  'Automation': {
    gradient: { r: 16, g: 185, b: 129 }, // Emerald
    gradientEnd: { r: 6, g: 182, b: 212 }, // Cyan
    text: '#FFFFFF'
  },
  'Development': {
    gradient: { r: 245, g: 158, b: 11 }, // Amber
    gradientEnd: { r: 239, g: 68, b: 68 }, // Red
    text: '#FFFFFF'
  },
  'Praktijk': {
    gradient: { r: 139, g: 92, b: 246 }, // Purple
    gradientEnd: { r: 99, g: 102, b: 241 }, // Indigo
    text: '#FFFFFF'
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

// SVG patterns for visual interest
const patterns = {
  'circuit': `
    <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="3" fill="white" opacity="0.1"/>
      <circle cx="80" cy="80" r="3" fill="white" opacity="0.1"/>
      <circle cx="80" cy="20" r="3" fill="white" opacity="0.1"/>
      <circle cx="20" cy="80" r="3" fill="white" opacity="0.1"/>
      <line x1="20" y1="20" x2="80" y2="20" stroke="white" stroke-width="1" opacity="0.1"/>
      <line x1="20" y1="80" x2="80" y2="80" stroke="white" stroke-width="1" opacity="0.1"/>
      <line x1="20" y1="20" x2="20" y2="80" stroke="white" stroke-width="1" opacity="0.1"/>
      <line x1="80" y1="20" x2="80" y2="80" stroke="white" stroke-width="1" opacity="0.1"/>
    </pattern>
  `,
  'dots': `
    <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="2" fill="white" opacity="0.2"/>
    </pattern>
  `,
  'hexagon': `
    <pattern id="hexagon" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
      <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="white" stroke-width="1" opacity="0.1"/>
    </pattern>
  `,
  'waves': `
    <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
      <path d="M 0 10 Q 25 5 50 10 T 100 10" stroke="white" stroke-width="1" fill="none" opacity="0.1"/>
    </pattern>
  `
};

// Function to wrap text for SVG
function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  const approxCharWidth = 30; // Approximate character width for font size 64

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
  return lines;
}

// Generate hero image (1200x630 - good for social sharing)
async function generateHeroImage(course) {
  const width = 1200;
  const height = 630;
  
  const colors = categoryColors[course.category] || categoryColors['Fundamenten'];
  const patternTypes = Object.keys(patterns);
  const selectedPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
  
  // Create SVG for the image
  const titleLines = wrapText(course.title, width * 0.7);
  const titleY = height / 2 - (titleLines.length * 80) / 2;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${colors.gradient.r},${colors.gradient.g},${colors.gradient.b});stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(${colors.gradientEnd.r},${colors.gradientEnd.g},${colors.gradientEnd.b});stop-opacity:1" />
        </linearGradient>
        
        <!-- Pattern -->
        ${patterns[selectedPattern]}
        
        <!-- Shadow filter -->
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
      
      <!-- Pattern overlay -->
      <rect width="${width}" height="${height}" fill="url(#${selectedPattern})" opacity="0.5"/>
      
      <!-- Dark overlay shape -->
      <path d="M 0 ${height * 0.3} L ${width * 0.7} ${height * 0.2} L ${width * 0.8} ${height} L 0 ${height} Z" 
            fill="black" opacity="0.5"/>
      
      <!-- Title -->
      <text x="60" y="${titleY}" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="bold" fill="white" filter="url(#shadow)">
        ${titleLines.map((line, index) => 
          `<tspan x="60" dy="${index === 0 ? 0 : 80}">${line}</tspan>`
        ).join('')}
      </text>
      
      <!-- Category badge -->
      <rect x="60" y="${height - 120}" width="${course.category.length * 20 + 40}" height="50" rx="25" 
            fill="white" opacity="0.9"/>
      <text x="${80}" y="${height - 85}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="24" font-weight="bold" fill="rgb(${colors.gradient.r},${colors.gradient.g},${colors.gradient.b})">
        ${course.category}
      </text>
      
      <!-- GroeimetAI branding -->
      <text x="${width - 250}" y="${height - 50}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="32" font-weight="bold" fill="white" opacity="0.9">
        GroeimetAI
      </text>
      
      <!-- Decorative elements -->
      <circle cx="${width * 0.85}" cy="${height * 0.15}" r="80" fill="white" opacity="0.1"/>
      <circle cx="${width * 0.9}" cy="${height * 0.25}" r="50" fill="white" opacity="0.08"/>
    </svg>
  `;
  
  // Convert SVG to image
  const heroPath = path.join(outputDirs.courses, `${course.id}-hero.jpg`);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toFile(heroPath);
  
  return heroPath;
}

// Generate thumbnail image (400x300)
async function generateThumbnail(course) {
  const width = 400;
  const height = 300;
  
  const colors = categoryColors[course.category] || categoryColors['Fundamenten'];
  
  // Create SVG for the thumbnail
  const titleLines = wrapText(course.title, width - 60);
  const titleY = height / 2 - (titleLines.length * 36) / 2;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient -->
        <linearGradient id="thumbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${colors.gradient.r},${colors.gradient.g},${colors.gradient.b});stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(${colors.gradientEnd.r},${colors.gradientEnd.g},${colors.gradientEnd.b});stop-opacity:1" />
        </linearGradient>
        
        <!-- Shadow filter -->
        <filter id="textShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.5"/>
        </filter>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#thumbGradient)"/>
      
      <!-- Dark overlay -->
      <rect width="${width}" height="${height}" fill="black" opacity="0.3"/>
      
      <!-- Decorative circle -->
      <circle cx="${width}" cy="0" r="120" fill="white" opacity="0.1"/>
      
      <!-- Title -->
      <text x="${width/2}" y="${titleY}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="28" font-weight="bold" fill="white" text-anchor="middle" filter="url(#textShadow)">
        ${titleLines.map((line, index) => 
          `<tspan x="${width/2}" dy="${index === 0 ? 0 : 36}">${line}</tspan>`
        ).join('')}
      </text>
      
      <!-- Category -->
      <text x="${width/2}" y="${height - 30}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="18" fill="white" text-anchor="middle" opacity="0.9">
        ${course.category}
      </text>
    </svg>
  `;
  
  // Convert SVG to image
  const thumbnailPath = path.join(outputDirs.courseThumbnails, `${course.id}.jpg`);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
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