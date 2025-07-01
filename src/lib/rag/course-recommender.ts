import { CourseData } from '@/lib/data/courses';
import { UserContext } from './query-engine';

// Skill categories and their relationships
export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
  relatedCategories: string[];
}

// Learning path recommendation
export interface LearningPathRecommendation {
  courses: CourseData[];
  estimatedDuration: string;
  reason: string;
  alternativePaths?: LearningPathRecommendation[];
}

// Difficulty level mapping
export enum DifficultyLevel {
  ABSOLUTE_BEGINNER = 0,
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
  EXPERT = 4
}

export class CourseRecommender {
  private courses: CourseData[];
  private skillCategories: Map<string, SkillCategory>;

  constructor(courses: CourseData[]) {
    this.courses = courses;
    this.skillCategories = this.initializeSkillCategories();
  }

  /**
   * Initialize skill categories for better matching
   */
  private initializeSkillCategories(): Map<string, SkillCategory> {
    const categories = new Map<string, SkillCategory>();

    categories.set('ai-fundamentals', {
      id: 'ai-fundamentals',
      name: 'AI Fundamentals',
      skills: ['machine learning', 'neural networks', 'ai basics', 'llm', 'prompting'],
      relatedCategories: ['practical-ai', 'ai-development']
    });

    categories.set('practical-ai', {
      id: 'practical-ai',
      name: 'Practical AI Applications',
      skills: ['chatgpt', 'gemini', 'claude', 'ai tools', 'prompt engineering'],
      relatedCategories: ['ai-fundamentals', 'automation']
    });

    categories.set('automation', {
      id: 'automation',
      name: 'Automation & Integration',
      skills: ['n8n', 'make', 'zapier', 'workflow', 'api', 'webhooks'],
      relatedCategories: ['practical-ai', 'ai-development']
    });

    categories.set('ai-development', {
      id: 'ai-development',
      name: 'AI Development',
      skills: ['langchain', 'rag', 'vector databases', 'crewai', 'agent development'],
      relatedCategories: ['ai-fundamentals', 'programming']
    });

    categories.set('programming', {
      id: 'programming',
      name: 'Programming & Technical',
      skills: ['python', 'javascript', 'apis', 'coding', 'development'],
      relatedCategories: ['ai-development', 'automation']
    });

    categories.set('business', {
      id: 'business',
      name: 'Business Applications',
      skills: ['marketing', 'customer service', 'content creation', 'strategy'],
      relatedCategories: ['practical-ai', 'automation']
    });

    return categories;
  }

  /**
   * Recommend courses based on user goals and context
   */
  recommendCourses(
    userGoal: string,
    context: UserContext = {}
  ): CourseData[] {
    // Extract skills and interests from goal
    const extractedSkills = this.extractSkills(userGoal);
    const userLevel = this.mapSkillLevel(context.currentSkillLevel);

    // Score courses based on multiple factors
    const scoredCourses = this.courses.map(course => ({
      course,
      score: this.calculateCourseScore(course, extractedSkills, userLevel, context)
    }));

    // Sort by score and return top recommendations
    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .map(item => item.course)
      .filter(course => !context.completedCourses?.includes(course.id));
  }

  /**
   * Create a learning path based on goals
   */
  createLearningPath(
    goal: string,
    context: UserContext = {}
  ): CourseData[] {
    const skillsNeeded = this.extractSkills(goal);
    const currentLevel = this.mapSkillLevel(context.currentSkillLevel);
    
    // Identify skill categories involved
    const relevantCategories = this.identifyRelevantCategories(skillsNeeded);
    
    // Build progressive path
    const path: CourseData[] = [];
    
    // Start with fundamentals if beginner
    if (currentLevel <= DifficultyLevel.BEGINNER) {
      const fundamentalCourses = this.getFoundationalCourses(relevantCategories);
      path.push(...fundamentalCourses);
    }

    // Add intermediate courses
    const intermediateCourses = this.getIntermediateCourses(relevantCategories, skillsNeeded);
    path.push(...intermediateCourses);

    // Add specialized courses for the specific goal
    const specializedCourses = this.getSpecializedCourses(goal, skillsNeeded);
    path.push(...specializedCourses);

    // Remove duplicates and already completed courses
    return this.optimizeLearningPath(path, context);
  }

  /**
   * Match courses by skill level
   */
  matchBySkillLevel(
    skillLevel: string,
    context: UserContext = {}
  ): CourseData[] {
    const level = this.mapSkillLevel(skillLevel);
    
    return this.courses
      .filter(course => {
        const courseLevel = this.mapCourseLevel(course.level);
        // Match courses within one level up or down
        return Math.abs(courseLevel - level) <= 1;
      })
      .filter(course => !context.completedCourses?.includes(course.id))
      .sort((a, b) => {
        // Prioritize exact matches
        const aLevel = this.mapCourseLevel(a.level);
        const bLevel = this.mapCourseLevel(b.level);
        const aDiff = Math.abs(aLevel - level);
        const bDiff = Math.abs(bLevel - level);
        return aDiff - bDiff;
      });
  }

  /**
   * Analyze user background and suggest improvements
   */
  analyzeSkillGaps(
    currentSkills: string[],
    targetGoal: string
  ): {
    missingSkills: string[];
    recommendedCourses: CourseData[];
    estimatedTime: string;
  } {
    const targetSkills = this.extractSkills(targetGoal);
    const missingSkills = targetSkills.filter(skill => 
      !currentSkills.some(current => 
        current.toLowerCase().includes(skill) || 
        skill.includes(current.toLowerCase())
      )
    );

    // Find courses that teach missing skills
    const recommendedCourses = this.courses
      .filter(course => {
        const courseSkills = this.extractCourseSkills(course);
        return missingSkills.some(skill => 
          courseSkills.some(courseSkill => 
            courseSkill.includes(skill) || skill.includes(courseSkill)
          )
        );
      })
      .slice(0, 5);

    // Calculate estimated time
    const totalHours = recommendedCourses.reduce((sum, course) => {
      const hours = this.extractHoursFromDuration(course.duration);
      return sum + hours;
    }, 0);

    return {
      missingSkills,
      recommendedCourses,
      estimatedTime: this.formatDuration(totalHours)
    };
  }

  /**
   * Extract skills from text
   */
  private extractSkills(text: string): string[] {
    const textLower = text.toLowerCase();
    const skills: string[] = [];

    // Check against all skill categories
    this.skillCategories.forEach(category => {
      category.skills.forEach(skill => {
        if (textLower.includes(skill.toLowerCase())) {
          skills.push(skill);
        }
      });
    });

    // Add common AI-related terms
    const aiTerms = ['ai', 'artificial intelligence', 'machine learning', 'automation', 
                     'chatbot', 'llm', 'prompt', 'api', 'integration', 'workflow'];
    
    aiTerms.forEach(term => {
      if (textLower.includes(term) && !skills.includes(term)) {
        skills.push(term);
      }
    });

    return [...new Set(skills)];
  }

  /**
   * Calculate course score based on multiple factors
   */
  private calculateCourseScore(
    course: CourseData,
    userSkills: string[],
    userLevel: DifficultyLevel,
    context: UserContext
  ): number {
    let score = 0;

    // Skill match score (0-40 points)
    const courseSkills = this.extractCourseSkills(course);
    const skillMatchCount = userSkills.filter(skill =>
      courseSkills.some(courseSkill => 
        courseSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(courseSkill.toLowerCase())
      )
    ).length;
    score += (skillMatchCount / Math.max(userSkills.length, 1)) * 40;

    // Level appropriateness (0-30 points)
    const courseLevel = this.mapCourseLevel(course.level);
    const levelDiff = Math.abs(courseLevel - userLevel);
    score += Math.max(0, 30 - (levelDiff * 10));

    // Interest alignment (0-20 points)
    if (context.interests) {
      const interestMatch = context.interests.some(interest =>
        course.title.toLowerCase().includes(interest.toLowerCase()) ||
        course.description.toLowerCase().includes(interest.toLowerCase())
      );
      if (interestMatch) score += 20;
    }

    // Time availability match (0-10 points)
    if (context.timeAvailability) {
      const courseHours = this.extractHoursFromDuration(course.duration);
      if (
        (context.timeAvailability === 'low' && courseHours <= 10) ||
        (context.timeAvailability === 'medium' && courseHours <= 20) ||
        (context.timeAvailability === 'high')
      ) {
        score += 10;
      }
    }

    // Category bonus for related courses
    if (context.completedCourses && context.completedCourses.length > 0) {
      const completedCategories = this.getCoursesCategories(
        context.completedCourses.map(id => this.courses.find(c => c.id === id)!).filter(Boolean)
      );
      const currentCategories = this.getCoursesCategories([course]);
      
      const hasRelatedCategory = currentCategories.some(cat =>
        completedCategories.some(completed =>
          this.skillCategories.get(completed)?.relatedCategories.includes(cat)
        )
      );
      
      if (hasRelatedCategory) score += 15;
    }

    return score;
  }

  /**
   * Extract skills from course content
   */
  private extractCourseSkills(course: CourseData): string[] {
    const skills: string[] = [];
    
    // Extract from title and description
    const content = `${course.title} ${course.description} ${course.tags.join(' ')}`.toLowerCase();
    
    this.skillCategories.forEach(category => {
      category.skills.forEach(skill => {
        if (content.includes(skill.toLowerCase())) {
          skills.push(skill);
        }
      });
    });

    // Add course-specific keywords
    if (course.id.includes('chatgpt')) skills.push('chatgpt', 'openai');
    if (course.id.includes('gemini')) skills.push('gemini', 'google ai');
    if (course.id.includes('claude')) skills.push('claude', 'anthropic');
    if (course.id.includes('langchain')) skills.push('langchain', 'llm development');
    if (course.id.includes('rag')) skills.push('rag', 'retrieval augmented generation');
    if (course.id.includes('n8n') || course.id.includes('make')) skills.push('automation', 'workflow');
    
    return [...new Set(skills)];
  }

  /**
   * Map skill level to difficulty
   */
  private mapSkillLevel(level?: string): DifficultyLevel {
    switch (level?.toLowerCase()) {
      case 'beginner': return DifficultyLevel.BEGINNER;
      case 'intermediate': return DifficultyLevel.INTERMEDIATE;
      case 'advanced': return DifficultyLevel.ADVANCED;
      case 'expert': return DifficultyLevel.EXPERT;
      default: return DifficultyLevel.ABSOLUTE_BEGINNER;
    }
  }

  /**
   * Map course level to difficulty
   */
  private mapCourseLevel(level: string): DifficultyLevel {
    switch (level.toLowerCase()) {
      case 'beginner': return DifficultyLevel.BEGINNER;
      case 'gevorderd': return DifficultyLevel.INTERMEDIATE;
      case 'expert': return DifficultyLevel.EXPERT;
      default: return DifficultyLevel.INTERMEDIATE;
    }
  }

  /**
   * Identify relevant skill categories
   */
  private identifyRelevantCategories(skills: string[]): string[] {
    const categories = new Set<string>();

    this.skillCategories.forEach((category, id) => {
      const hasRelevantSkill = skills.some(skill =>
        category.skills.some(catSkill =>
          catSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(catSkill.toLowerCase())
        )
      );
      
      if (hasRelevantSkill) {
        categories.add(id);
      }
    });

    return Array.from(categories);
  }

  /**
   * Get foundational courses for categories
   */
  private getFoundationalCourses(categories: string[]): CourseData[] {
    return this.courses.filter(course => {
      const courseLevel = this.mapCourseLevel(course.level);
      if (courseLevel > DifficultyLevel.BEGINNER) return false;

      const courseCategories = this.getCoursesCategories([course]);
      return courseCategories.some(cat => categories.includes(cat));
    });
  }

  /**
   * Get intermediate courses
   */
  private getIntermediateCourses(categories: string[], skills: string[]): CourseData[] {
    return this.courses.filter(course => {
      const courseLevel = this.mapCourseLevel(course.level);
      if (courseLevel !== DifficultyLevel.INTERMEDIATE) return false;

      const courseSkills = this.extractCourseSkills(course);
      return skills.some(skill =>
        courseSkills.some(courseSkill =>
          courseSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
    });
  }

  /**
   * Get specialized courses for specific goals
   */
  private getSpecializedCourses(goal: string, skills: string[]): CourseData[] {
    const goalLower = goal.toLowerCase();
    
    return this.courses.filter(course => {
      // Direct goal match in title or description
      if (
        course.title.toLowerCase().includes(goalLower) ||
        course.description.toLowerCase().includes(goalLower)
      ) {
        return true;
      }

      // High skill overlap
      const courseSkills = this.extractCourseSkills(course);
      const overlap = skills.filter(skill =>
        courseSkills.some(courseSkill =>
          courseSkill.toLowerCase().includes(skill.toLowerCase())
        )
      ).length;

      return overlap >= Math.ceil(skills.length * 0.6);
    });
  }

  /**
   * Optimize learning path by removing duplicates and ordering
   */
  private optimizeLearningPath(
    path: CourseData[],
    context: UserContext
  ): CourseData[] {
    // Remove duplicates
    const uniquePath = Array.from(
      new Map(path.map(course => [course.id, course])).values()
    );

    // Filter out completed courses
    const filtered = uniquePath.filter(
      course => !context.completedCourses?.includes(course.id)
    );

    // Sort by difficulty level
    return filtered.sort((a, b) => {
      const aLevel = this.mapCourseLevel(a.level);
      const bLevel = this.mapCourseLevel(b.level);
      return aLevel - bLevel;
    });
  }

  /**
   * Get course categories
   */
  private getCoursesCategories(courses: CourseData[]): string[] {
    const categories = new Set<string>();

    courses.forEach(course => {
      const courseSkills = this.extractCourseSkills(course);
      
      this.skillCategories.forEach((category, id) => {
        const hasSkillMatch = courseSkills.some(skill =>
          category.skills.some(catSkill =>
            skill.toLowerCase().includes(catSkill.toLowerCase()) ||
            catSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        
        if (hasSkillMatch) {
          categories.add(id);
        }
      });
    });

    return Array.from(categories);
  }

  /**
   * Extract hours from duration string
   */
  private extractHoursFromDuration(duration: string): number {
    const hourMatch = duration.match(/(\d+)\s*(?:hours?|uur|uren)/i);
    const weekMatch = duration.match(/(\d+)\s*(?:weeks?|weken?)/i);
    
    if (hourMatch) {
      return parseInt(hourMatch[1]);
    } else if (weekMatch) {
      // Assume 5 hours per week
      return parseInt(weekMatch[1]) * 5;
    }
    
    // Default estimate
    return 10;
  }

  /**
   * Format duration for display
   */
  private formatDuration(hours: number): string {
    if (hours < 10) {
      return `${hours} hours`;
    } else if (hours < 40) {
      return `${Math.ceil(hours / 5)} weeks (${hours} hours)`;
    } else {
      return `${Math.ceil(hours / 20)} months (${hours} hours)`;
    }
  }
}

// Example usage and test cases
export const exampleRecommendations = {
  beginnerAI: {
    goal: "I want to learn AI from scratch and build my first chatbot",
    context: {
      currentSkillLevel: 'beginner' as const,
      timeAvailability: 'medium' as const,
      interests: ['chatbots', 'customer service']
    },
    expectedPath: [
      'ChatGPT & Gemini Masterclass',
      'AI Customer Service Bot',
      'N8N & Make Automation Basics'
    ]
  },
  
  advancedDeveloper: {
    goal: "Build production-ready RAG applications with LangChain",
    context: {
      currentSkillLevel: 'advanced' as const,
      interests: ['development', 'rag', 'langchain'],
      completedCourses: ['chatgpt-gemini-masterclass']
    },
    expectedPath: [
      'LangChain Fundamentals',
      'RAG Knowledge Base Systems',
      'Advanced AI Workflows'
    ]
  },
  
  businessAutomation: {
    goal: "Automate marketing workflows without coding",
    context: {
      currentSkillLevel: 'intermediate' as const,
      timeAvailability: 'low' as const,
      interests: ['marketing', 'automation', 'no-code']
    },
    expectedPath: [
      'N8N & Make Automation Basics',
      'AI Marketing Content Creation',
      'Webhooks & APIs Mastery'
    ]
  }
};