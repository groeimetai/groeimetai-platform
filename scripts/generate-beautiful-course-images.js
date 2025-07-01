const { createCanvas, registerFont } = require('canvas');
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

// Color schemes for different categories
const categoryColors = {
  'Fundamenten': {
    primary: '#6366F1', // Indigo
    secondary: '#8B5CF6', // Purple
    accent: '#EC4899', // Pink
    gradient: ['#6366F1', '#8B5CF6', '#EC4899']
  },
  'Automation': {
    primary: '#10B981', // Emerald
    secondary: '#14B8A6', // Teal
    accent: '#06B6D4', // Cyan
    gradient: ['#10B981', '#14B8A6', '#06B6D4']
  },
  'Development': {
    primary: '#F59E0B', // Amber
    secondary: '#EF4444', // Red
    accent: '#DC2626', // Red-600
    gradient: ['#F59E0B', '#EF4444', '#DC2626']
  },
  'Praktijk': {
    primary: '#8B5CF6', // Purple
    secondary: '#7C3AED', // Violet
    accent: '#6366F1', // Indigo
    gradient: ['#8B5CF6', '#7C3AED', '#6366F1']
  }
};

// Patterns for visual interest
const patterns = [
  'circuit', // For tech/AI courses
  'waves', // For fundamentals
  'hexagon', // For blockchain
  'dots', // For automation
  'lines', // For development
];

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

// Function to draw gradient background
function drawGradientBackground(ctx, width, height, colors) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Function to draw patterns
function drawPattern(ctx, width, height, patternType, color) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  switch (patternType) {
    case 'circuit':
      // Draw circuit-like pattern
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Connect with lines
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(Math.random() * width, Math.random() * height);
          ctx.stroke();
        }
      }
      break;

    case 'waves':
      // Draw wave pattern
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += 20) {
          ctx.quadraticCurveTo(
            x + 10, y - 20,
            x + 20, y
          );
        }
        ctx.stroke();
      }
      break;

    case 'hexagon':
      // Draw hexagon pattern
      const hexSize = 30;
      for (let y = 0; y < height; y += hexSize * 1.5) {
        for (let x = 0; x < width; x += hexSize * 2) {
          drawHexagon(ctx, x + (y % 2 === 0 ? 0 : hexSize), y, hexSize);
        }
      }
      break;

    case 'dots':
      // Draw dot pattern
      for (let y = 20; y < height; y += 30) {
        for (let x = 20; x < width; x += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;

    case 'lines':
      // Draw diagonal lines
      for (let i = -height; i < width + height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      break;
  }

  ctx.restore();
}

function drawHexagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const xPos = x + size * Math.cos(angle);
    const yPos = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

// Function to wrap text
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
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
function generateHeroImage(course) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const colors = categoryColors[course.category] || categoryColors['Fundamenten'];
  const patternType = patterns[Math.floor(Math.random() * patterns.length)];

  // Draw gradient background
  drawGradientBackground(ctx, width, height, colors.gradient);

  // Draw pattern overlay
  drawPattern(ctx, width, height, patternType, '#ffffff');

  // Draw overlay shape
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.3);
  ctx.lineTo(width * 0.7, height * 0.2);
  ctx.lineTo(width * 0.8, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Draw title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px Arial';
  const lines = wrapText(ctx, course.title, width * 0.6);
  
  const lineHeight = 80;
  const startY = height / 2 - (lines.length * lineHeight) / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, 60, startY + (index * lineHeight));
  });

  // Draw category badge
  ctx.save();
  ctx.fillStyle = colors.accent;
  ctx.roundRect = ctx.roundRect || function(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  };
  
  ctx.font = 'bold 24px Arial';
  const categoryWidth = ctx.measureText(course.category).width + 40;
  ctx.roundRect(60, height - 120, categoryWidth, 50, 25);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillText(course.category, 80, height - 85);
  ctx.restore();

  // Draw GroeimetAI branding
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('GroeimetAI', width - 250, height - 50);
  ctx.restore();

  // Save hero image
  const heroPath = path.join(outputDirs.courses, `${course.id}-hero.jpg`);
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(heroPath, buffer);
  
  return heroPath;
}

// Generate thumbnail image (400x300)
function generateThumbnail(course) {
  const width = 400;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const colors = categoryColors[course.category] || categoryColors['Fundamenten'];

  // Draw gradient background
  drawGradientBackground(ctx, width, height, colors.gradient);

  // Draw overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, width, height);

  // Draw title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  const lines = wrapText(ctx, course.title, width - 40);
  
  const lineHeight = 36;
  const startY = height / 2 - (lines.length * lineHeight) / 2;
  
  lines.forEach((line, index) => {
    const textWidth = ctx.measureText(line).width;
    const x = (width - textWidth) / 2;
    ctx.fillText(line, x, startY + (index * lineHeight));
  });

  // Draw category
  ctx.font = '18px Arial';
  ctx.fillStyle = colors.accent;
  const categoryWidth = ctx.measureText(course.category).width;
  ctx.fillText(course.category, (width - categoryWidth) / 2, height - 30);

  // Save thumbnail
  const thumbnailPath = path.join(outputDirs.courseThumbnails, `${course.id}.jpg`);
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(thumbnailPath, buffer);
  
  return thumbnailPath;
}

// Generate images for all courses
console.log('\n🎨 Generating beautiful course images...\n');

courses.forEach((course, index) => {
  console.log(`[${index + 1}/${courses.length}] Generating images for: ${course.title}`);
  
  try {
    const heroPath = generateHeroImage(course);
    const thumbnailPath = generateThumbnail(course);
    
    console.log(`  ✅ Hero image: ${heroPath}`);
    console.log(`  ✅ Thumbnail: ${thumbnailPath}`);
  } catch (error) {
    console.error(`  ❌ Error generating images for ${course.id}:`, error.message);
  }
});

console.log('\n✨ All course images generated successfully!');
console.log(`📁 Hero images: ${outputDirs.courses}`);
console.log(`📁 Thumbnails: ${outputDirs.courseThumbnails}`);