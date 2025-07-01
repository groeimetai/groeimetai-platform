'use client';

import React from 'react';
import { LessonInteractiveFeatures } from '@/components/Interactive';
import { Question } from '@/components/Quiz';
import { Challenge } from '@/components/LiveCoding';

// Example of how to integrate interactive features into a lesson page

// Example quiz questions
const exampleQuizQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is the primary benefit of using AI for content creation?',
    options: [
      'It replaces human creativity entirely',
      'It speeds up the ideation and drafting process',
      'It guarantees viral content',
      'It eliminates the need for editing'
    ],
    correctAnswer: 'It speeds up the ideation and drafting process',
    explanation: 'AI serves as a powerful tool to accelerate content creation while still requiring human oversight and creativity.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'q2',
    type: 'code-completion',
    question: 'Complete this Python function to generate AI prompts for social media posts:',
    codeTemplate: `def generate_social_prompt(topic, platform, tone):
    """
    Generate an AI prompt for social media content.
    
    Args:
        topic: The main subject of the post
        platform: 'twitter', 'linkedin', or 'instagram'
        tone: 'professional', 'casual', or 'humorous'
    """
    # TODO: Create a prompt string that includes all parameters
    pass`,
    testCases: [
      {
        input: "('AI tools', 'twitter', 'casual')",
        expectedOutput: "Write a casual Twitter post about AI tools"
      },
      {
        input: "('productivity', 'linkedin', 'professional')",
        expectedOutput: "Write a professional LinkedIn post about productivity"
      }
    ],
    hint: 'Use f-strings to combine the parameters into a coherent prompt',
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q3',
    type: 'drag-drop',
    question: 'Order these steps for creating AI-powered content:',
    items: [
      { id: '1', content: 'Define your target audience and goals' },
      { id: '2', content: 'Create detailed prompts with context' },
      { id: '3', content: 'Generate initial content with AI' },
      { id: '4', content: 'Review and edit the AI output' },
      { id: '5', content: 'Publish and monitor performance' }
    ],
    correctOrder: ['1', '2', '3', '4', '5'],
    points: 15,
    difficulty: 'easy'
  }
];

// Example coding challenges
const exampleChallenges: Challenge[] = [
  {
    id: 'content-analyzer',
    title: 'Build a Content Quality Analyzer',
    description: 'Create a function that analyzes AI-generated content for quality metrics like readability, keyword density, and sentiment.',
    difficulty: 'medium',
    category: 'Text Analysis',
    timeLimit: 900, // 15 minutes
    starterCode: {
      javascript: `function analyzeContent(text) {
  // Return an object with:
  // - wordCount: number of words
  // - readabilityScore: 1-10 scale
  // - sentiment: 'positive', 'neutral', or 'negative'
  // - keywordDensity: object with word frequencies
  
  // TODO: Implement analysis logic
}`,
      python: `def analyze_content(text):
    """
    Analyze AI-generated content for quality metrics.
    
    Returns:
        dict: Analysis results including word count, readability, etc.
    """
    # TODO: Implement analysis logic
    pass`
    },
    testCases: [
      {
        id: 'tc1',
        input: 'AI is transforming how we create content.',
        expectedOutput: {
          wordCount: 8,
          readabilityScore: 9,
          sentiment: 'positive'
        },
        description: 'Simple positive sentence'
      }
    ],
    hints: [
      'Use split() to count words',
      'Simple sentences have higher readability',
      'Look for positive/negative keywords for sentiment'
    ],
    points: 100,
    tags: ['text-processing', 'analysis', 'AI']
  }
];

// Example component usage
export function InteractiveLessonExample() {
  const handleLessonComplete = () => {
    console.log('Lesson completed! Unlocking next lesson...');
    // Navigate to next lesson or update progress
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AI Marketing Content Creation</h1>
      
      {/* Regular lesson content would go here */}
      <div className="prose dark:prose-invert max-w-none mb-8">
        <h2>Learning AI-Powered Content Creation</h2>
        <p>
          In this lesson, we'll explore how to leverage AI tools like ChatGPT and 
          Claude to create compelling marketing content at scale.
        </p>
        {/* More lesson content... */}
      </div>

      {/* Interactive features section */}
      <LessonInteractiveFeatures
        lessonId="ai-marketing-lesson-1"
        lessonTitle="AI Marketing Content Creation"
        quizQuestions={exampleQuizQuestions}
        codingChallenges={exampleChallenges}
        enableDiscussion={true}
        nextLessonId="ai-marketing-lesson-2"
        onLessonComplete={handleLessonComplete}
      />
    </div>
  );
}

// Integration with existing lesson structure
export function integrateWithLesson(lesson: any) {
  // This shows how to add interactive features to existing lessons
  
  // 1. Import quiz questions and challenges for the specific lesson
  const quizModule = require(`@/lib/data/course-content/${lesson.courseId}/${lesson.moduleId}/${lesson.id}-interactive`);
  
  // 2. Add the interactive component at the end of lesson content
  return {
    ...lesson,
    interactiveQuestions: quizModule.questions || [],
    interactiveChallenges: quizModule.challenges || [],
    hasInteractiveContent: true
  };
}