// User Types
export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: 'student' | 'instructor' | 'admin'
  createdAt: Date
  updatedAt: Date
}

// Course Types
export interface Course {
  id: string
  title: string
  description: string
  shortDescription: string
  imageUrl?: string
  price: number
  currency: string
  instructorId: string
  instructor: User
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  lessonsCount: number
  studentsCount: number
  rating: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

// Lesson Types
export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  content: string
  videoUrl?: string
  duration: number // in minutes
  order: number
  isPreview: boolean
  createdAt: Date
  updatedAt: Date
}

// Enrollment Types
export interface Enrollment {
  id: string
  userId: string
  courseId: string
  progress: number // percentage 0-100
  completedLessons?: string[]
  currentLessonId?: string
  enrolledAt: Date
  completedAt?: Date
}

// Assessment Types
export interface Assessment {
  id: string
  courseId: string
  title: string
  description: string
  questions: Question[]
  passingScore: number
  timeLimit?: number // in minutes
  maxAttempts?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'text' | 'multiple_select'
  options?: string[]
  correctAnswer: string | string[]
  points: number
  explanation?: string
}

export interface AssessmentAttempt {
  id: string
  assessmentId: string
  userId: string
  answers: Answer[]
  score: number
  passed: boolean
  startedAt: Date
  completedAt?: Date
  timeSpent: number // in seconds
}

export interface Answer {
  questionId: string
  answer: string | string[]
  isCorrect: boolean
  points: number
}

// Certificate Types are now in ./certificate.ts

// Author Types
export interface Author {
  id: string
  userId: string // Firebase auth user ID
  name: string
  bio: string
  avatar?: string
  revenueSharePercentage: number // 0-100
  email: string
  expertise: string[]
  linkedIn?: string
  website?: string
  createdAt: Date
  updatedAt: Date
}

export interface CourseAuthor {
  courseId: string
  authorId: string
  role: 'primary' | 'co-author' | 'contributor'
  revenueShare?: number // Override for specific course if different from default
  addedAt: Date
}

// Payment Types
export interface Payment {
  id: string
  userId: string
  courseId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  molliePaymentId?: string
  createdAt: Date
  updatedAt: Date
}

// Progress Types
export interface Progress {
  userId: string
  courseId: string
  lessonsCompleted: number
  totalLessons: number
  percentage: number
  timeSpent: number // in minutes
  lastAccessedAt: Date
}

// Objective Types (Doelstelling)
export interface Objective {
  id: string
  userId: string
  title: string
  description: string
  category: 'skill' | 'course' | 'certificate' | 'personal' | 'career'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  targetDate: Date
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  
  // Progress tracking
  progress: {
    current: number // 0-100
    milestones: Milestone[]
    lastUpdate: Date
  }
  
  // Related entities
  relatedCourses?: string[] // Course IDs
  relatedSkills?: string[]
  requiredCertificates?: string[] // Certificate IDs
  
  // Goal details
  measurableTargets: {
    type: 'courses_completed' | 'hours_studied' | 'certificates_earned' | 'skills_acquired' | 'custom'
    target: number
    current: number
    unit: string
    description?: string
  }[]
  
  // Reminders and notifications
  reminders: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    nextReminder?: Date
  }
  
  // Notes and reflection
  notes?: string
  reflections: {
    date: Date
    content: string
    progressAtTime: number
  }[]
}

export interface Milestone {
  id: string
  title: string
  description?: string
  targetDate: Date
  completed: boolean
  completedAt?: Date
  order: number
}

export interface ObjectiveCategory {
  id: string
  name: string
  description: string
  icon: string
  suggestedObjectives: {
    title: string
    description: string
    estimatedDuration: number // in days
    relatedSkills: string[]
  }[]
}

export interface ObjectiveProgress {
  objectiveId: string
  userId: string
  date: Date
  progressDelta: number // Change in progress
  activities: {
    type: 'course_completed' | 'lesson_completed' | 'quiz_passed' | 'time_studied' | 'skill_acquired'
    description: string
    relatedId?: string
    points?: number
  }[]
  totalProgress: number
  streak: number
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// Export Affiliate Types
export type {
  AffiliateLink,
  AffiliatePartner,
  AffiliateTransaction,
  AffiliateStats
} from './affiliate'

// Export Certificate Types
export type {
  Certificate,
  BlockchainCertificate,
  CertificateVerification,
  CertificateMetadata,
  BlockchainTransaction,
  CertificateGenerationRequest,
  CertificateVerificationRequest,
  BlockchainConfig
} from './certificate'