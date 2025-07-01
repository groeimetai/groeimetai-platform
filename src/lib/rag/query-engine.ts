import { CourseData, Module, Lesson } from '@/lib/data/courses';
import { CourseRecommender } from './course-recommender';

// Intent types for query classification
export enum QueryIntent {
  COURSE_SELECTION = 'course_selection',
  CONTENT_QUESTION = 'content_question',
  LEARNING_PATH = 'learning_path',
  SKILL_MATCHING = 'skill_matching',
  GENERAL_INFO = 'general_info',
  TECHNICAL_HELP = 'technical_help',
  PRICING = 'pricing',
  COURSE_COMPARISON = 'course_comparison'
}

// User context for personalized responses
export interface UserContext {
  userId?: string;
  preferredLanguage?: 'nl' | 'en';
  currentSkillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests?: string[];
  completedCourses?: string[];
  currentCourse?: string;
  learningGoals?: string[];
  industry?: string;
  timeAvailability?: 'low' | 'medium' | 'high';
}

// Query result structure
export interface QueryResult {
  intent: QueryIntent;
  confidence: number;
  response: string;
  suggestedCourses?: CourseData[];
  relatedContent?: Array<{
    courseId: string;
    moduleId: string;
    lessonId: string;
    relevance: number;
  }>;
  followUpQuestions?: string[];
  actionLinks?: Array<{
    text: string;
    url: string;
    type: 'course' | 'lesson' | 'external';
  }>;
}

export class RAGQueryEngine {
  private recommender: CourseRecommender;
  private courses: CourseData[];

  constructor(courses: CourseData[]) {
    this.courses = courses;
    this.recommender = new CourseRecommender(courses);
  }

  /**
   * Process a natural language query and return structured response
   */
  async processQuery(
    query: string, 
    context: UserContext = {}
  ): Promise<QueryResult> {
    // Normalize query
    const normalizedQuery = this.normalizeQuery(query);
    
    // Detect language preference from query if not set
    const language = context.preferredLanguage || this.detectLanguage(query);
    
    // Classify intent
    const intent = this.classifyIntent(normalizedQuery);
    
    // Process based on intent
    switch (intent) {
      case QueryIntent.COURSE_SELECTION:
        return this.handleCourseSelection(normalizedQuery, context, language);
      
      case QueryIntent.LEARNING_PATH:
        return this.handleLearningPath(normalizedQuery, context, language);
      
      case QueryIntent.CONTENT_QUESTION:
        return this.handleContentQuestion(normalizedQuery, context, language);
      
      case QueryIntent.SKILL_MATCHING:
        return this.handleSkillMatching(normalizedQuery, context, language);
      
      case QueryIntent.PRICING:
        return this.handlePricing(language);
      
      case QueryIntent.COURSE_COMPARISON:
        return this.handleCourseComparison(normalizedQuery, language);
      
      case QueryIntent.TECHNICAL_HELP:
        return this.handleTechnicalHelp(normalizedQuery, language);
      
      default:
        return this.handleGeneralInfo(normalizedQuery, language);
    }
  }

  /**
   * Normalize and clean query text
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /**
   * Detect language from query text
   */
  private detectLanguage(query: string): 'nl' | 'en' {
    const dutchKeywords = ['wat', 'hoe', 'welke', 'kan', 'wil', 'moet', 'cursus', 'leren', 'kennis'];
    const queryLower = query.toLowerCase();
    
    const dutchCount = dutchKeywords.filter(word => queryLower.includes(word)).length;
    return dutchCount >= 2 ? 'nl' : 'en';
  }

  /**
   * Classify user intent from query
   */
  private classifyIntent(query: string): QueryIntent {
    // Intent patterns
    const patterns = {
      courseSelection: /\b(which|welke|wat voor|recommend|aanraden|best|course|cursus|suitable|geschikt)\b/i,
      learningPath: /\b(path|pad|roadmap|route|journey|traject|sequence|volgorde)\b/i,
      contentQuestion: /\b(what is|wat is|how to|hoe|explain|uitleggen|betekent|means)\b/i,
      skillMatching: /\b(skill|vaardigheid|background|achtergrond|experience|ervaring|level|niveau)\b/i,
      pricing: /\b(price|prijs|cost|kosten|fee|tarief|discount|korting)\b/i,
      comparison: /\b(versus|vs|compare|vergelijk|difference|verschil|better|beter)\b/i,
      technical: /\b(problem|probleem|error|fout|help|hulp|access|toegang|login)\b/i
    };

    // Check patterns
    if (patterns.courseSelection.test(query)) return QueryIntent.COURSE_SELECTION;
    if (patterns.learningPath.test(query)) return QueryIntent.LEARNING_PATH;
    if (patterns.contentQuestion.test(query)) return QueryIntent.CONTENT_QUESTION;
    if (patterns.skillMatching.test(query)) return QueryIntent.SKILL_MATCHING;
    if (patterns.pricing.test(query)) return QueryIntent.PRICING;
    if (patterns.comparison.test(query)) return QueryIntent.COURSE_COMPARISON;
    if (patterns.technical.test(query)) return QueryIntent.TECHNICAL_HELP;

    return QueryIntent.GENERAL_INFO;
  }

  /**
   * Handle course selection queries
   */
  private async handleCourseSelection(
    query: string, 
    context: UserContext,
    language: 'nl' | 'en'
  ): Promise<QueryResult> {
    // Extract keywords for matching
    const keywords = this.extractKeywords(query);
    
    // Get recommendations
    const recommendations = this.recommender.recommendCourses(
      context.learningGoals?.join(' ') || query,
      context
    );

    // Format response
    const response = language === 'nl' 
      ? this.formatDutchCourseRecommendations(recommendations, keywords)
      : this.formatEnglishCourseRecommendations(recommendations, keywords);

    return {
      intent: QueryIntent.COURSE_SELECTION,
      confidence: 0.9,
      response,
      suggestedCourses: recommendations.slice(0, 3),
      followUpQuestions: this.getFollowUpQuestions(QueryIntent.COURSE_SELECTION, language),
      actionLinks: recommendations.slice(0, 3).map(course => ({
        text: course.title,
        url: `/courses/${course.id}`,
        type: 'course' as const
      }))
    };
  }

  /**
   * Handle learning path queries
   */
  private async handleLearningPath(
    query: string,
    context: UserContext,
    language: 'nl' | 'en'
  ): Promise<QueryResult> {
    const learningPath = this.recommender.createLearningPath(
      context.learningGoals?.join(' ') || query,
      context
    );

    const response = language === 'nl'
      ? this.formatDutchLearningPath(learningPath)
      : this.formatEnglishLearningPath(learningPath);

    return {
      intent: QueryIntent.LEARNING_PATH,
      confidence: 0.85,
      response,
      suggestedCourses: learningPath,
      followUpQuestions: this.getFollowUpQuestions(QueryIntent.LEARNING_PATH, language),
      actionLinks: learningPath.map((course, index) => ({
        text: `${index + 1}. ${course.title}`,
        url: `/courses/${course.id}`,
        type: 'course' as const
      }))
    };
  }

  /**
   * Handle content-specific questions
   */
  private async handleContentQuestion(
    query: string,
    context: UserContext,
    language: 'nl' | 'en'
  ): Promise<QueryResult> {
    // Search for relevant content across all courses
    const relevantContent = this.searchContent(query);

    const response = language === 'nl'
      ? this.formatDutchContentAnswer(query, relevantContent)
      : this.formatEnglishContentAnswer(query, relevantContent);

    return {
      intent: QueryIntent.CONTENT_QUESTION,
      confidence: 0.8,
      response,
      relatedContent: relevantContent.slice(0, 5),
      followUpQuestions: this.getFollowUpQuestions(QueryIntent.CONTENT_QUESTION, language),
      actionLinks: relevantContent.slice(0, 3).map(content => {
        const course = this.courses.find(c => c.id === content.courseId);
        return {
          text: course?.title || 'Related Course',
          url: `/courses/${content.courseId}/modules/${content.moduleId}/lessons/${content.lessonId}`,
          type: 'lesson' as const
        };
      })
    };
  }

  /**
   * Handle skill matching queries
   */
  private async handleSkillMatching(
    query: string,
    context: UserContext,
    language: 'nl' | 'en'
  ): Promise<QueryResult> {
    const matchedCourses = this.recommender.matchBySkillLevel(
      context.currentSkillLevel || 'beginner',
      context
    );

    const response = language === 'nl'
      ? this.formatDutchSkillMatching(context.currentSkillLevel || 'beginner', matchedCourses)
      : this.formatEnglishSkillMatching(context.currentSkillLevel || 'beginner', matchedCourses);

    return {
      intent: QueryIntent.SKILL_MATCHING,
      confidence: 0.85,
      response,
      suggestedCourses: matchedCourses,
      followUpQuestions: this.getFollowUpQuestions(QueryIntent.SKILL_MATCHING, language)
    };
  }

  /**
   * Handle pricing queries
   */
  private handlePricing(language: 'nl' | 'en'): QueryResult {
    const response = language === 'nl'
      ? `Onze cursussen variëren in prijs afhankelijk van de inhoud en het niveau:
      
• Beginner cursussen: €29 - €49
• Gevorderde cursussen: €49 - €99
• Expert cursussen: €99 - €199
• Complete learning paths: €149 - €299

We bieden regelmatig kortingen aan voor bundels en vroege vogels. Neem contact op voor zakelijke tarieven.`
      : `Our courses vary in price depending on content and level:
      
• Beginner courses: €29 - €49
• Advanced courses: €49 - €99
• Expert courses: €99 - €199
• Complete learning paths: €149 - €299

We regularly offer discounts for bundles and early birds. Contact us for business rates.`;

    return {
      intent: QueryIntent.PRICING,
      confidence: 1.0,
      response,
      followUpQuestions: this.getFollowUpQuestions(QueryIntent.PRICING, language),
      actionLinks: [{
        text: language === 'nl' ? 'Bekijk alle cursussen' : 'View all courses',
        url: '/courses',
        type: 'external' as const
      }]
    };
  }

  /**
   * Handle course comparison queries
   */
  private handleCourseComparison(query: string, language: 'nl' | 'en'): QueryResult {
    // Extract course names from query
    const courseNames = this.extractCourseNames(query);
    
    if (courseNames.length < 2) {
      return {
        intent: QueryIntent.COURSE_COMPARISON,
        confidence: 0.6,
        response: language === 'nl' 
          ? 'Welke cursussen wilt u vergelijken? Geef alstublieft twee of meer cursusnamen op.'
          : 'Which courses would you like to compare? Please specify two or more course names.',
        followUpQuestions: this.getFollowUpQuestions(QueryIntent.COURSE_COMPARISON, language)
      };
    }

    const comparison = this.compareCourses(courseNames, language);
    
    return {
      intent: QueryIntent.COURSE_COMPARISON,
      confidence: 0.9,
      response: comparison,
      followUpQuestions: this.getFollowUpQuestions(QueryIntent.COURSE_COMPARISON, language)
    };
  }

  /**
   * Handle technical help queries
   */
  private handleTechnicalHelp(query: string, language: 'nl' | 'en'): QueryResult {
    const response = language === 'nl'
      ? `Voor technische hulp:

1. **Inlogproblemen**: Gebruik de "Wachtwoord vergeten" link op de inlogpagina
2. **Video afspelen**: Controleer uw internetverbinding en browser (Chrome/Firefox aanbevolen)
3. **Voortgang niet opgeslagen**: Ververs de pagina en log opnieuw in

Voor verdere hulp, email support@groeimetai.com`
      : `For technical help:

1. **Login issues**: Use the "Forgot password" link on the login page
2. **Video playback**: Check your internet connection and browser (Chrome/Firefox recommended)
3. **Progress not saving**: Refresh the page and log in again

For further assistance, email support@groeimetai.com`;

    return {
      intent: QueryIntent.TECHNICAL_HELP,
      confidence: 0.9,
      response,
      followUpQuestions: this.getFollowUpQuestions(QueryIntent.TECHNICAL_HELP, language),
      actionLinks: [{
        text: language === 'nl' ? 'Contact Support' : 'Contact Support',
        url: 'mailto:support@groeimetai.com',
        type: 'external' as const
      }]
    };
  }

  /**
   * Handle general information queries
   */
  private handleGeneralInfo(query: string, language: 'nl' | 'en'): QueryResult {
    const response = language === 'nl'
      ? `GroeimetAI is hét platform voor AI-educatie in Nederland. We bieden:

• Praktische AI-cursussen voor alle niveaus
• Focus op direct toepasbare kennis
• Nederlandstalige content met internationale kwaliteit
• Begeleiding door AI-experts

Waar kan ik u mee helpen? U kunt vragen stellen over cursussen, leertrajecten, of specifieke AI-onderwerpen.`
      : `GroeimetAI is the leading AI education platform. We offer:

• Practical AI courses for all levels
• Focus on immediately applicable knowledge
• High-quality content in Dutch and English
• Guidance from AI experts

How can I help you? You can ask about courses, learning paths, or specific AI topics.`;

    return {
      intent: QueryIntent.GENERAL_INFO,
      confidence: 0.7,
      response,
      followUpQuestions: this.getFollowUpQuestions(QueryIntent.GENERAL_INFO, language)
    };
  }

  /**
   * Extract keywords from query
   */
  private extractKeywords(query: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'de', 'het', 'een', 'en', 'of', 'maar', 'in', 'op', 'aan', 'voor', 'van']);
    
    return query
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.has(word))
      .map(word => word.toLowerCase());
  }

  /**
   * Search content across all courses
   */
  private searchContent(query: string): Array<{
    courseId: string;
    moduleId: string;
    lessonId: string;
    relevance: number;
  }> {
    const results: Array<{
      courseId: string;
      moduleId: string;
      lessonId: string;
      relevance: number;
    }> = [];

    const keywords = this.extractKeywords(query);

    this.courses.forEach(course => {
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          const relevance = this.calculateRelevance(
            keywords,
            `${lesson.title} ${lesson.content} ${module.title} ${course.title}`
          );

          if (relevance > 0.3) {
            results.push({
              courseId: course.id,
              moduleId: module.id,
              lessonId: lesson.id,
              relevance
            });
          }
        });
      });
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(keywords: string[], content: string): number {
    const contentLower = content.toLowerCase();
    let score = 0;
    let matches = 0;

    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        matches++;
        // Count occurrences
        const count = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
        score += count * 0.1;
      }
    });

    return Math.min((matches / keywords.length) + (score * 0.1), 1.0);
  }

  /**
   * Format Dutch course recommendations
   */
  private formatDutchCourseRecommendations(courses: CourseData[], keywords: string[]): string {
    if (courses.length === 0) {
      return 'Er zijn geen cursussen gevonden die aan uw criteria voldoen. Probeer andere zoektermen.';
    }

    let response = `Op basis van uw vraag over "${keywords.join(', ')}", raad ik de volgende cursussen aan:\n\n`;

    courses.slice(0, 3).forEach((course, index) => {
      response += `**${index + 1}. ${course.title}**\n`;
      response += `• Niveau: ${course.level}\n`;
      response += `• Duur: ${course.duration}\n`;
      response += `• ${course.description}\n`;
      response += `• Prijs: €${course.price}\n\n`;
    });

    return response;
  }

  /**
   * Format English course recommendations
   */
  private formatEnglishCourseRecommendations(courses: CourseData[], keywords: string[]): string {
    if (courses.length === 0) {
      return 'No courses found matching your criteria. Please try different search terms.';
    }

    let response = `Based on your query about "${keywords.join(', ')}", I recommend the following courses:\n\n`;

    courses.slice(0, 3).forEach((course, index) => {
      response += `**${index + 1}. ${course.title}**\n`;
      response += `• Level: ${course.level}\n`;
      response += `• Duration: ${course.duration}\n`;
      response += `• ${course.description}\n`;
      response += `• Price: €${course.price}\n\n`;
    });

    return response;
  }

  /**
   * Format Dutch learning path
   */
  private formatDutchLearningPath(courses: CourseData[]): string {
    let response = 'Hier is een aanbevolen leertraject voor u:\n\n';

    courses.forEach((course, index) => {
      response += `**Stap ${index + 1}: ${course.title}**\n`;
      response += `• Niveau: ${course.level}\n`;
      response += `• Geschatte tijd: ${course.duration}\n`;
      response += `• Focus: ${course.shortDescription || course.description}\n\n`;
    });

    response += 'Dit traject bouwt geleidelijk uw kennis op van basis tot geavanceerd niveau.';
    return response;
  }

  /**
   * Format English learning path
   */
  private formatEnglishLearningPath(courses: CourseData[]): string {
    let response = 'Here is a recommended learning path for you:\n\n';

    courses.forEach((course, index) => {
      response += `**Step ${index + 1}: ${course.title}**\n`;
      response += `• Level: ${course.level}\n`;
      response += `• Estimated time: ${course.duration}\n`;
      response += `• Focus: ${course.shortDescription || course.description}\n\n`;
    });

    response += 'This path gradually builds your knowledge from foundation to advanced level.';
    return response;
  }

  /**
   * Format Dutch content answer
   */
  private formatDutchContentAnswer(query: string, relatedContent: any[]): string {
    if (relatedContent.length === 0) {
      return `Ik kon geen specifieke informatie vinden over "${query}". Kunt u uw vraag anders formuleren?`;
    }

    return `Hier is relevante informatie over "${query}":\n\n` +
      'Ik heb gerelateerde content gevonden in onze cursussen. ' +
      'Klik op de links hieronder om de specifieke lessen te bekijken waar dit onderwerp wordt behandeld.';
  }

  /**
   * Format English content answer
   */
  private formatEnglishContentAnswer(query: string, relatedContent: any[]): string {
    if (relatedContent.length === 0) {
      return `I couldn't find specific information about "${query}". Could you rephrase your question?`;
    }

    return `Here's relevant information about "${query}":\n\n` +
      'I found related content in our courses. ' +
      'Click the links below to view specific lessons where this topic is covered.';
  }

  /**
   * Format Dutch skill matching response
   */
  private formatDutchSkillMatching(level: string, courses: CourseData[]): string {
    const levelMap = {
      'beginner': 'beginner',
      'intermediate': 'gevorderd',
      'advanced': 'gevorderd',
      'expert': 'expert'
    };

    return `Voor uw niveau (${levelMap[level] || level}) zijn deze cursussen het meest geschikt:\n\n` +
      courses.slice(0, 3).map((course, i) => 
        `${i + 1}. **${course.title}** - ${course.level}`
      ).join('\n');
  }

  /**
   * Format English skill matching response
   */
  private formatEnglishSkillMatching(level: string, courses: CourseData[]): string {
    return `For your skill level (${level}), these courses are most suitable:\n\n` +
      courses.slice(0, 3).map((course, i) => 
        `${i + 1}. **${course.title}** - ${course.level}`
      ).join('\n');
  }

  /**
   * Extract course names from comparison query
   */
  private extractCourseNames(query: string): string[] {
    // Simple extraction - in production, use NLP
    const courseKeywords = ['chatgpt', 'gemini', 'claude', 'langchain', 'rag', 'n8n', 'make', 'blockchain'];
    return courseKeywords.filter(keyword => query.toLowerCase().includes(keyword));
  }

  /**
   * Compare courses
   */
  private compareCourses(courseNames: string[], language: 'nl' | 'en'): string {
    // Simplified comparison - in production, generate detailed comparison
    return language === 'nl'
      ? `Vergelijking tussen ${courseNames.join(' en ')}:\n\nBeide cursussen bieden waardevolle kennis, maar verschillen in focus en aanpak. Vraag om een gedetailleerde vergelijking van specifieke aspecten.`
      : `Comparison between ${courseNames.join(' and ')}:\n\nBoth courses offer valuable knowledge but differ in focus and approach. Ask for a detailed comparison of specific aspects.`;
  }

  /**
   * Get follow-up questions based on intent
   */
  private getFollowUpQuestions(intent: QueryIntent, language: 'nl' | 'en'): string[] {
    const questions = {
      nl: {
        [QueryIntent.COURSE_SELECTION]: [
          'Wat is uw huidige ervaringsniveau met AI?',
          'Hoeveel tijd heeft u per week beschikbaar?',
          'Bent u geïnteresseerd in technische of praktische toepassingen?'
        ],
        [QueryIntent.LEARNING_PATH]: [
          'Wat is uw uiteindelijke leerdoel?',
          'Heeft u al ervaring met programmeren?',
          'Wilt u zich specialiseren in een bepaald gebied?'
        ],
        [QueryIntent.CONTENT_QUESTION]: [
          'Wilt u meer weten over de praktische toepassingen?',
          'Zoekt u beginners- of gevorderde informatie?',
          'Heeft u interesse in gerelateerde onderwerpen?'
        ],
        [QueryIntent.SKILL_MATCHING]: [
          'Wat zijn uw huidige vaardigheden?',
          'Welke tools gebruikt u momenteel?',
          'Wat wilt u kunnen na de cursus?'
        ],
        [QueryIntent.PRICING]: [
          'Bent u geïnteresseerd in een specifieke cursus?',
          'Zoekt u zakelijke tarieven?',
          'Wilt u informatie over bundels?'
        ],
        [QueryIntent.COURSE_COMPARISON]: [
          'Welke aspecten wilt u vergelijken?',
          'Wat is voor u het belangrijkste: prijs, inhoud of niveau?',
          'Heeft u een voorkeur voor een bepaalde aanpak?'
        ],
        [QueryIntent.TECHNICAL_HELP]: [
          'Is het probleem opgelost?',
          'Heeft u nog andere technische vragen?',
          'Wilt u contact met support?'
        ],
        [QueryIntent.GENERAL_INFO]: [
          'Waar bent u specifiek in geïnteresseerd?',
          'Wilt u onze cursussen bekijken?',
          'Heeft u vragen over AI-toepassingen?'
        ]
      },
      en: {
        [QueryIntent.COURSE_SELECTION]: [
          'What is your current experience level with AI?',
          'How much time do you have available per week?',
          'Are you interested in technical or practical applications?'
        ],
        [QueryIntent.LEARNING_PATH]: [
          'What is your ultimate learning goal?',
          'Do you have programming experience?',
          'Do you want to specialize in a specific area?'
        ],
        [QueryIntent.CONTENT_QUESTION]: [
          'Would you like to know more about practical applications?',
          'Are you looking for beginner or advanced information?',
          'Are you interested in related topics?'
        ],
        [QueryIntent.SKILL_MATCHING]: [
          'What are your current skills?',
          'Which tools do you currently use?',
          'What do you want to be able to do after the course?'
        ],
        [QueryIntent.PRICING]: [
          'Are you interested in a specific course?',
          'Are you looking for business rates?',
          'Would you like information about bundles?'
        ],
        [QueryIntent.COURSE_COMPARISON]: [
          'Which aspects would you like to compare?',
          'What is most important to you: price, content, or level?',
          'Do you have a preference for a certain approach?'
        ],
        [QueryIntent.TECHNICAL_HELP]: [
          'Has the issue been resolved?',
          'Do you have other technical questions?',
          'Would you like to contact support?'
        ],
        [QueryIntent.GENERAL_INFO]: [
          'What are you specifically interested in?',
          'Would you like to browse our courses?',
          'Do you have questions about AI applications?'
        ]
      }
    };

    return questions[language][intent] || questions[language][QueryIntent.GENERAL_INFO];
  }
}

// Example usage
export const exampleQueries = {
  nl: [
    {
      query: "Welke cursus is het beste voor een beginner in AI?",
      expectedIntent: QueryIntent.COURSE_SELECTION,
      context: { preferredLanguage: 'nl', currentSkillLevel: 'beginner' }
    },
    {
      query: "Ik wil leren hoe ik een chatbot kan maken voor klantenservice",
      expectedIntent: QueryIntent.LEARNING_PATH,
      context: { preferredLanguage: 'nl', learningGoals: ['chatbot development'] }
    },
    {
      query: "Wat is RAG en hoe werkt het?",
      expectedIntent: QueryIntent.CONTENT_QUESTION,
      context: { preferredLanguage: 'nl' }
    },
    {
      query: "Hoeveel kost de ChatGPT cursus?",
      expectedIntent: QueryIntent.PRICING,
      context: { preferredLanguage: 'nl' }
    }
  ],
  en: [
    {
      query: "Which course is best for an AI beginner?",
      expectedIntent: QueryIntent.COURSE_SELECTION,
      context: { preferredLanguage: 'en', currentSkillLevel: 'beginner' }
    },
    {
      query: "I want to learn how to build a customer service chatbot",
      expectedIntent: QueryIntent.LEARNING_PATH,
      context: { preferredLanguage: 'en', learningGoals: ['chatbot development'] }
    },
    {
      query: "What is RAG and how does it work?",
      expectedIntent: QueryIntent.CONTENT_QUESTION,
      context: { preferredLanguage: 'en' }
    },
    {
      query: "Compare ChatGPT course with Claude course",
      expectedIntent: QueryIntent.COURSE_COMPARISON,
      context: { preferredLanguage: 'en' }
    }
  ]
};