/**
 * GroeimetAI Platform - Doelstelling (Learning Objectives) Types
 * Type definitions for course learning objectives and goals
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Core Doelstelling Types
// ============================================================================

export interface Doelstelling {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  type: DoelstellingType;
  level: DoelstellingLevel;
  category: DoelstellingCategory;
  status: DoelstellingStatus;
  
  // Learning outcomes
  outcomes: LearningOutcome[];
  
  // Assessment criteria
  assessmentCriteria: AssessmentCriterion[];
  
  // Dependencies
  prerequisites: string[]; // IDs of prerequisite doelstellingen
  enablesNext: string[]; // IDs of doelstellingen this enables
  
  // Metadata
  estimatedTime: number; // in minutes
  points: number;
  weight: number; // importance weight (0-1)
  order: number;
  
  // Tracking
  tracking: {
    viewCount: number;
    averageCompletionTime: number;
    completionRate: number;
    averageScore: number;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LearningOutcome {
  id: string;
  description: string;
  measurable: boolean;
  bloomLevel: BloomTaxonomyLevel;
  assessmentMethod: AssessmentMethod;
  requiredScore: number; // percentage
}

export interface AssessmentCriterion {
  id: string;
  description: string;
  weight: number; // 0-1
  rubric: RubricLevel[];
  evidenceRequired: string[];
}

export interface RubricLevel {
  level: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement';
  description: string;
  score: number; // 0-100
  examples: string[];
}

export interface UserDoelstellingProgress {
  id: string; // userId_doelstellingId
  userId: string;
  doelstellingId: string;
  courseId: string;
  
  // Progress tracking
  status: DoelstellingProgressStatus;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  lastActivityAt: Timestamp;
  
  // Performance data
  attempts: DoelstellingAttempt[];
  bestScore: number;
  currentScore: number;
  timeSpent: number; // in minutes
  
  // Learning outcomes progress
  outcomesProgress: {
    outcomeId: string;
    achieved: boolean;
    score: number;
    achievedAt?: Timestamp;
    evidence: string[];
  }[];
  
  // Notes and reflections
  notes: string;
  reflections: {
    content: string;
    createdAt: Timestamp;
  }[];
  
  // Feedback
  feedback: {
    instructorId: string;
    content: string;
    rating: number;
    createdAt: Timestamp;
  }[];
}

export interface DoelstellingAttempt {
  attemptNumber: number;
  startedAt: Timestamp;
  completedAt: Timestamp;
  score: number;
  timeSpent: number;
  
  // Detailed results
  outcomeScores: {
    outcomeId: string;
    achieved: boolean;
    score: number;
  }[];
  
  // Assessment results
  assessmentResults: {
    criterionId: string;
    score: number;
    feedback: string;
  }[];
}

// ============================================================================
// Enums and Union Types
// ============================================================================

export type DoelstellingType = 
  | 'knowledge' // Theoretical understanding
  | 'skill' // Practical ability
  | 'competency' // Combined knowledge and skill
  | 'attitude' // Behavioral change
  | 'certification'; // Formal qualification

export type DoelstellingLevel = 
  | 'foundation' // Basic understanding
  | 'intermediate' // Application level
  | 'advanced' // Analysis and synthesis
  | 'expert'; // Evaluation and creation

export type DoelstellingCategory = 
  | 'technical' // Technical skills
  | 'conceptual' // Theoretical concepts
  | 'practical' // Hands-on application
  | 'professional' // Career-related
  | 'personal'; // Personal development

export type DoelstellingStatus = 
  | 'draft'
  | 'published'
  | 'archived'
  | 'deprecated';

export type DoelstellingProgressStatus = 
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'mastered';

export type BloomTaxonomyLevel = 
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export type AssessmentMethod = 
  | 'quiz'
  | 'assignment'
  | 'project'
  | 'peer-review'
  | 'self-assessment'
  | 'portfolio'
  | 'observation';

// ============================================================================
// Validation Schemas
// ============================================================================

export const DOELSTELLING_VALIDATION = {
  title: {
    minLength: 5,
    maxLength: 200,
    required: true
  },
  description: {
    minLength: 20,
    maxLength: 1000,
    required: true
  },
  outcomes: {
    minItems: 1,
    maxItems: 10,
    required: true
  },
  assessmentCriteria: {
    minItems: 1,
    maxItems: 5,
    required: true
  },
  estimatedTime: {
    min: 5,
    max: 480, // 8 hours
    required: true
  },
  points: {
    min: 0,
    max: 1000,
    required: true
  },
  weight: {
    min: 0,
    max: 1,
    required: true
  }
};

// ============================================================================
// Helper Types
// ============================================================================

export interface DoelstellingFilter {
  courseId?: string;
  moduleId?: string;
  type?: DoelstellingType;
  level?: DoelstellingLevel;
  category?: DoelstellingCategory;
  status?: DoelstellingStatus;
}

export interface DoelstellingSort {
  field: 'order' | 'title' | 'points' | 'estimatedTime' | 'completionRate';
  direction: 'asc' | 'desc';
}

export interface DoelstellingStatistics {
  totalDoelstellingen: number;
  completedDoelstellingen: number;
  inProgressDoelstellingen: number;
  averageScore: number;
  totalTimeSpent: number;
  masteryLevel: number; // 0-100
  strengthAreas: DoelstellingCategory[];
  improvementAreas: DoelstellingCategory[];
}