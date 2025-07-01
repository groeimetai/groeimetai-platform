import { NextRequest, NextResponse } from 'next/server';

// Mock course database
const courseDatabase = [
  { 
    id: 'chatgpt-gemini-masterclass', 
    title: 'ChatGPT & Gemini Masterclass', 
    level: 'beginner',
    skills: ['ai', 'prompting', 'chatgpt'],
    category: 'ai-basics'
  },
  { 
    id: 'langchain-basics', 
    title: 'LangChain Basics', 
    level: 'intermediate',
    skills: ['python', 'langchain', 'ai-development'],
    category: 'development'
  },
  { 
    id: 'n8n-make-basics', 
    title: 'N8N/Make Basics', 
    level: 'beginner',
    skills: ['automation', 'no-code', 'workflows'],
    category: 'automation'
  },
  { 
    id: 'rag-knowledge-base', 
    title: 'RAG Knowledge Base', 
    level: 'advanced',
    skills: ['rag', 'vector-databases', 'ai-advanced'],
    category: 'advanced-ai'
  },
  { 
    id: 'claude-flow-ai-swarming', 
    title: 'Claude Flow AI Swarming', 
    level: 'advanced',
    skills: ['multi-agent', 'claude', 'ai-orchestration'],
    category: 'advanced-ai'
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      skills = [],
      interests = [],
      skillLevel = 'beginner',
      timeAvailability = 'moderate',
      completedCourses = [],
      goals = [],
      language = 'nl',
    } = body;

    // Mock recommendations based on skill level
    let recommendations = courseDatabase.filter(course => {
      // Filter by skill level
      if (skillLevel === 'beginner' && course.level === 'advanced') return false;
      if (skillLevel === 'intermediate' && course.level === 'advanced') return Math.random() > 0.5;
      
      // Filter out completed courses
      if (completedCourses.includes(course.id)) return false;
      
      // Boost if skills match
      const skillMatch = skills.some(skill => 
        course.skills.some(courseSkill => 
          courseSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      return skillMatch || Math.random() > 0.3;
    });

    // Mock learning paths
    const learningPaths = goals.map(goal => ({
      goal,
      courses: recommendations.slice(0, 3).map(c => ({
        id: c.id,
        title: c.title,
        reason: `This course helps with ${goal}`,
      })),
    }));

    // Mock skill gaps
    const skillGaps = skills.length > 0 ? [
      'Advanced prompting techniques',
      'Vector database management',
      'Multi-agent orchestration',
    ].filter(() => Math.random() > 0.5) : [];

    // Create personalized message
    const personalizedMessage = language === 'nl' 
      ? `Op basis van je ${skillLevel} niveau hebben we ${recommendations.length} cursussen gevonden die perfect bij je passen!`
      : `Based on your ${skillLevel} level, we found ${recommendations.length} courses perfect for you!`;

    return NextResponse.json({
      recommendations: recommendations.map(course => ({
        ...course,
        score: Math.random() * 100,
        matchReason: `Matches your ${skillLevel} level`,
      })),
      learningPaths,
      skillGaps,
      personalizedMessage,
      metadata: {
        totalRecommendations: recommendations.length,
        userProfile: {
          skillLevel,
          interests,
          skills,
          timeAvailability,
        },
      },
      mode: 'mock', // Indicate mock mode
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick recommendations
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Convert query params to recommendation request
  const mockBody = {
    skills: searchParams.get('skills')?.split(',') || [],
    interests: searchParams.get('interests')?.split(',') || [],
    skillLevel: searchParams.get('level') || 'beginner',
    timeAvailability: searchParams.get('time') || 'moderate',
    language: searchParams.get('language') || 'nl',
  };

  // Create a new request with the mock body
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify(mockBody),
  });

  return POST(mockRequest);
}