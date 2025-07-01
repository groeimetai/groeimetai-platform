/**
 * GroeimetAI Platform - Firebase Data Model
 * Comprehensive data structure definitions for Firestore
 */

import { Timestamp, DocumentReference } from 'firebase/firestore';

// ============================================================================
// Collection Names (Constants)
// ============================================================================

export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  ENROLLMENTS: 'enrollments',
  PAYMENTS: 'payments',
  CERTIFICATES: 'certificates',
  QUIZ_RESULTS: 'quiz_results',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  SYSTEM: 'system',
  AUDIT_LOGS: 'audit_logs',
  OBJECTIVES: 'objectives',
  OBJECTIVE_PROGRESS: 'objective_progress',
} as const;

// ============================================================================
// Firestore Document Interfaces
// ============================================================================

export interface UserDocument {
  // Authentication fields
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  
  // Profile information
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    company?: string;
    jobTitle?: string;
    bio?: string;
    avatar?: string;
    website?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
  };
  
  // Role and permissions
  role: 'student' | 'instructor' | 'admin' | 'moderator';
  permissions: string[];
  
  // Subscription information
  subscription: {
    status: 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    validUntil: Timestamp;
    paymentMethod?: string;
    autoRenew: boolean;
    trialEndsAt?: Timestamp;
  };
  
  // User preferences
  preferences: {
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    playbackSpeed: number;
    autoplay: boolean;
    subtitles: boolean;
  };
  
  // Learning statistics
  stats: {
    coursesEnrolled: number;
    coursesCompleted: number;
    totalStudyTime: number; // in minutes
    certificatesEarned: number;
    currentStreak: number; // days
    longestStreak: number; // days
    lastActiveAt: Timestamp;
    totalPoints: number;
    level: number;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface CourseDocument {
  // Basic information
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  
  // Media
  thumbnail: string;
  previewVideo?: string;
  gallery?: string[];
  
  // Instructor information
  instructor: {
    uid: string;
    name: string;
    avatar?: string;
    bio: string;
    expertise: string[];
    rating: number;
    totalStudents: number;
    yearsExperience: number;
  };
  
  // Course content structure
  content: {
    modules: CourseModuleDocument[];
    totalDuration: number; // in minutes
    totalLessons: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    learningObjectives: string[];
    prerequisites: string[];
    whatYouWillLearn: string[];
    requirements: string[];
    targetAudience: string[];
  };
  
  // Pricing information
  pricing: {
    amount: number;
    currency: 'EUR' | 'USD' | 'GBP';
    originalPrice?: number;
    discount?: {
      percentage: number;
      code?: string;
      validUntil: Timestamp;
      description?: string;
    };
    paymentOptions: ('one-time' | 'subscription')[];
    refundPolicy: string;
  };
  
  // Course metadata
  metadata: {
    tags: string[];
    category: string;
    subcategory?: string;
    language: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours: number;
    published: boolean;
    featured: boolean;
    approved: boolean;
    approvedBy?: string;
    approvedAt?: Timestamp;
    publishedAt?: Timestamp;
    lastUpdated: Timestamp;
    version: string;
    status: 'draft' | 'review' | 'published' | 'archived';
  };
  
  // SEO and marketing
  seo: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  
  // Analytics and performance
  analytics: {
    enrollmentCount: number;
    completionRate: number;
    averageRating: number;
    totalRatings: number;
    totalRevenue: number;
    refundRate: number;
    viewCount: number;
    wishlistCount: number;
    conversionRate: number;
  };
  
  // Resources and materials
  resources: {
    title: string;
    type: 'pdf' | 'video' | 'audio' | 'zip' | 'link' | 'code';
    url: string;
    size?: number;
    description?: string;
    downloadable: boolean;
  }[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CourseModuleDocument {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  lessons: CourseLessonDocument[];
  quiz?: CourseQuizDocument;
  
  // Module settings
  settings: {
    locked: boolean;
    previewEnabled: boolean;
    prerequisites: string[]; // other module IDs
  };
}

export interface CourseLessonDocument {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment' | 'live';
  order: number;
  duration: number; // in minutes
  
  // Lesson content
  content: {
    videoUrl?: string;
    videoId?: string; // for video platform integration
    transcript?: string;
    slides?: string[];
    documents?: string[];
    htmlContent?: string;
    markdownContent?: string;
    codeExamples?: {
      language: string;
      title: string;
      code: string;
      description?: string;
      runnable: boolean;
    }[];
    interactiveElements?: {
      type: 'exercise' | 'simulation' | 'quiz' | 'poll';
      title: string;
      content: any;
      points?: number;
    }[];
  };
  
  // Lesson settings
  settings: {
    isPreview: boolean;
    downloadable: boolean;
    autoplay: boolean;
    skipable: boolean;
    subtitles?: string[];
    notes?: string;
  };
  
  // Resources
  resources: {
    title: string;
    url: string;
    type: string;
    size?: number;
  }[];
}

export interface CourseQuizDocument {
  id: string;
  title: string;
  description: string;
  instructions: string;
  
  // Quiz settings
  settings: {
    passingScore: number;
    timeLimit?: number; // in minutes
    maxAttempts: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showCorrectAnswers: boolean;
    showResultsImmediately: boolean;
    allowReview: boolean;
  };
  
  // Questions
  questions: {
    id: string;
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'matching';
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    points: number;
    order: number;
    media?: {
      type: 'image' | 'video' | 'audio';
      url: string;
      caption?: string;
    };
  }[];
  
  // Scoring
  totalPoints: number;
  passingPoints: number;
}

export interface EnrollmentDocument {
  id: string; // format: userId_courseId
  userId: string;
  courseId: string;
  
  // Enrollment details
  enrolledAt: Timestamp;
  completedAt?: Timestamp;
  expiresAt?: Timestamp;
  
  // Payment information
  paymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  amountPaid: number;
  currency: string;
  
  // Progress tracking
  progress: {
    completedLessons: string[];
    completedModules: string[];
    currentLesson?: string;
    currentModule?: string;
    overallProgress: number; // percentage
    totalTimeSpent: number; // in minutes
    lastAccessedAt: Timestamp;
    streakDays: number;
    bookmarks: string[]; // lesson IDs
    notes: {
      lessonId: string;
      content: string;
      timestamp: number; // video timestamp
      createdAt: Timestamp;
    }[];
  };
  
  // Quiz results
  quizResults: {
    quizId: string;
    attempts: {
      attemptNumber: number;
      score: number;
      totalPoints: number;
      passed: boolean;
      timeSpent: number; // in minutes
      completedAt: Timestamp;
      answers: {
        questionId: string;
        answer: string | string[];
        correct: boolean;
        points: number;
      }[];
    }[];
    bestScore: number;
    passed: boolean;
  }[];
  
  // Status
  status: 'active' | 'completed' | 'paused' | 'expired' | 'refunded';
  
  // Certificates
  certificateId?: string;
  
  // Timestamps
  updatedAt: Timestamp;
}

export interface PaymentDocument {
  id: string;
  userId: string;
  courseId: string;
  
  // Payment details
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  method: 'credit-card' | 'ideal' | 'paypal' | 'bancontact' | 'sofort' | 'klarna';
  
  // Mollie integration
  molliePaymentId: string;
  mollieCheckoutUrl?: string;
  mollieWebhookUrl: string;
  mollieRedirectUrl: string;
  
  // Billing information
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    vatNumber?: string;
  };
  
  // Transaction details
  description: string;
  metadata: {
    courseTitle: string;
    userEmail: string;
    discountCode?: string;
    discountAmount?: number;
    taxAmount?: number;
    originalAmount?: number;
  };
  
  // Refund information
  refund?: {
    amount: number;
    reason: string;
    refundedAt: Timestamp;
    mollieRefundId: string;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  failedAt?: Timestamp;
  refundedAt?: Timestamp;
  
  // Failure details
  failureReason?: string;
  failureCode?: string;
}

export interface CertificateDocument {
  id: string;
  userId: string;
  courseId: string;
  
  // Certificate details
  certificateNumber: string;
  courseName: string;
  courseDescription: string;
  instructorName: string;
  instructorSignature: string;
  
  // QR Code for verification
  qrCode: {
    code: string;
    verificationUrl: string;
    generatedAt: Timestamp;
    scanCount: number;
    lastScannedAt?: Timestamp;
  };
  
  // Completion details
  completion: {
    completedAt: Timestamp;
    finalScore: number;
    totalTime: number; // in minutes
    grade: 'A' | 'B' | 'C' | 'D' | 'F' | 'Pass' | 'Fail';
    modules: {
      moduleId: string;
      moduleName: string;
      completedAt: Timestamp;
      score: number;
    }[];
    achievements: string[];
  };
  
  // Validation and security
  validation: {
    isValid: boolean;
    validatedAt: Timestamp;
    expiresAt?: Timestamp;
    revokedAt?: Timestamp;
    revokedReason?: string;
    revokedBy?: string;
    blockchainHash?: string; // for future blockchain verification
  };
  
  // Certificate design
  design: {
    template: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
    };
    logo: string;
    backgroundImage?: string;
    fonts: {
      primary: string;
      secondary: string;
    };
  };
  
  // Sharing and download
  sharing: {
    linkedinUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    publicUrl: string;
    downloadUrl: string;
    shareCount: number;
    viewCount: number;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NotificationDocument {
  id: string;
  userId: string;
  
  // Notification content
  type: 'course_update' | 'payment_success' | 'certificate_ready' | 'reminder' | 'system' | 'marketing';
  title: string;
  message: string;
  description?: string;
  
  // Notification metadata
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'info' | 'success' | 'warning' | 'error';
  
  // Related entities
  relatedId?: string; // courseId, paymentId, etc.
  relatedType?: 'course' | 'payment' | 'certificate' | 'user';
  
  // Action buttons
  actions?: {
    label: string;
    url: string;
    type: 'primary' | 'secondary';
  }[];
  
  // Status
  read: boolean;
  readAt?: Timestamp;
  delivered: boolean;
  deliveredAt?: Timestamp;
  
  // Delivery channels
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  
  // Timestamps
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface ObjectiveDocument {
  id: string;
  userId: string;
  
  // Basic information
  title: string;
  description: string;
  category: 'skill' | 'course' | 'certificate' | 'personal' | 'career';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Timeline
  targetDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  pausedAt?: Timestamp;
  
  // Progress tracking
  progress: {
    current: number; // 0-100
    lastUpdate: Timestamp;
    checkpoints: {
      date: Timestamp;
      progress: number;
      note?: string;
    }[];
  };
  
  // Milestones
  milestones: {
    id: string;
    title: string;
    description?: string;
    targetDate: Timestamp;
    completed: boolean;
    completedAt?: Timestamp;
    order: number;
    points?: number;
  }[];
  
  // Related entities
  relatedCourses: string[]; // Course IDs
  relatedSkills: string[];
  requiredCertificates: string[]; // Certificate IDs
  
  // Measurable targets
  measurableTargets: {
    type: 'courses_completed' | 'hours_studied' | 'certificates_earned' | 'skills_acquired' | 'lessons_completed' | 'quizzes_passed' | 'custom';
    target: number;
    current: number;
    unit: string;
    description?: string;
    trackingMethod: 'automatic' | 'manual';
  }[];
  
  // Reminders and notifications
  reminders: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time?: string; // HH:mm format
    nextReminder?: Timestamp;
    lastReminder?: Timestamp;
  };
  
  // Motivation and reflection
  motivation: {
    reason: string;
    rewards: string[];
    obstacles: string[];
    strategies: string[];
  };
  
  reflections: {
    id: string;
    date: Timestamp;
    content: string;
    progressAtTime: number;
    mood?: 'frustrated' | 'challenged' | 'neutral' | 'motivated' | 'accomplished';
    lessonsLearned?: string;
  }[];
  
  // Notes and attachments
  notes?: string;
  attachments: {
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Timestamp;
  }[];
  
  // Sharing and collaboration
  sharing: {
    isPublic: boolean;
    sharedWith: string[]; // User IDs
    allowComments: boolean;
    allowSupport: boolean;
  };
  
  // Analytics
  analytics: {
    totalTimeInvested: number; // in minutes
    averageProgressPerWeek: number;
    streakDays: number;
    longestStreak: number;
    completionRate: number; // for similar objectives
    estimatedCompletionDate?: Timestamp;
  };
}

export interface ObjectiveProgressDocument {
  id: string;
  objectiveId: string;
  userId: string;
  date: Timestamp;
  
  // Progress update
  progressDelta: number; // Change in progress
  newTotalProgress: number;
  
  // Activities that contributed to progress
  activities: {
    type: 'course_started' | 'course_completed' | 'lesson_completed' | 'quiz_passed' | 'quiz_failed' | 'time_studied' | 'skill_acquired' | 'certificate_earned' | 'milestone_completed' | 'manual_update';
    description: string;
    relatedId?: string; // Course, lesson, quiz ID etc
    relatedType?: 'course' | 'lesson' | 'quiz' | 'certificate' | 'milestone';
    points?: number;
    duration?: number; // in minutes
    metadata?: {
      score?: number;
      grade?: string;
      attempts?: number;
      [key: string]: any;
    };
  }[];
  
  // Context
  context: {
    device: 'web' | 'mobile' | 'tablet';
    location?: string;
    mood?: string;
    energyLevel?: number; // 1-5
    focusLevel?: number; // 1-5
  };
  
  // Streak information
  streak: {
    current: number;
    isNewRecord: boolean;
    nextMilestone: number;
  };
  
  // Automated insights
  insights?: {
    productivity: 'low' | 'medium' | 'high';
    consistency: number; // 0-100
    projectedCompletion?: Timestamp;
    recommendations: string[];
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Firestore Query Helpers
// ============================================================================

export interface FirestoreQuery {
  collection: string;
  where?: {
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
    value: any;
  }[];
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  limit?: number;
  startAfter?: any;
  startAt?: any;
  endAt?: any;
  endBefore?: any;
}

export interface FirestoreIndexes {
  collection: string;
  fields: {
    fieldPath: string;
    order?: 'ASCENDING' | 'DESCENDING';
    arrayConfig?: 'CONTAINS';
  }[];
  queryScope?: 'COLLECTION' | 'COLLECTION_GROUP';
}

// ============================================================================
// Required Firestore Indexes
// ============================================================================

export const REQUIRED_INDEXES: FirestoreIndexes[] = [
  // User queries
  {
    collection: 'users',
    fields: [
      { fieldPath: 'role' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  
  // Objective queries
  {
    collection: 'objectives',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'status' },
      { fieldPath: 'priority', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'objectives',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'category' },
      { fieldPath: 'targetDate', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'objectives',
    fields: [
      { fieldPath: 'relatedCourses', arrayConfig: 'CONTAINS' },
      { fieldPath: 'status' },
      { fieldPath: 'progress.current', order: 'DESCENDING' }
    ]
  },
  
  // Objective Progress queries
  {
    collection: 'objective_progress',
    fields: [
      { fieldPath: 'objectiveId' },
      { fieldPath: 'date', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'objective_progress',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'date', order: 'DESCENDING' }
    ]
  },
  
  // Course queries
  {
    collection: 'courses',
    fields: [
      { fieldPath: 'metadata.published' },
      { fieldPath: 'metadata.category' },
      { fieldPath: 'pricing.amount', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'courses',
    fields: [
      { fieldPath: 'metadata.published' },
      { fieldPath: 'analytics.enrollmentCount', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'courses',
    fields: [
      { fieldPath: 'metadata.published' },
      { fieldPath: 'analytics.averageRating', order: 'DESCENDING' }
    ]
  },
  
  // Enrollment queries
  {
    collection: 'enrollments',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'status' },
      { fieldPath: 'enrolledAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'enrollments',
    fields: [
      { fieldPath: 'courseId' },
      { fieldPath: 'status' },
      { fieldPath: 'progress.overallProgress', order: 'DESCENDING' }
    ]
  },
  
  // Payment queries
  {
    collection: 'payments',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'status' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  
  // Certificate queries
  {
    collection: 'certificates',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'validation.isValid' },
      { fieldPath: 'completion.completedAt', order: 'DESCENDING' }
    ]
  },
  
  // Notification queries
  {
    collection: 'notifications',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'read' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  }
];

// ============================================================================
// Data Validation Schemas
// ============================================================================

export const VALIDATION_SCHEMAS = {
  user: {
    required: ['uid', 'email', 'displayName', 'role', 'profile', 'subscription', 'preferences', 'stats', 'createdAt', 'updatedAt'],
    properties: {
      uid: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      displayName: { type: 'string', minLength: 1 },
      role: { type: 'string', enum: ['student', 'instructor', 'admin', 'moderator'] }
    }
  },
  objective: {
    required: ['id', 'userId', 'title', 'description', 'category', 'status', 'priority', 'targetDate', 'progress', 'createdAt', 'updatedAt'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 1000 },
      category: { type: 'string', enum: ['skill', 'course', 'certificate', 'personal', 'career'] },
      status: { type: 'string', enum: ['active', 'completed', 'paused', 'cancelled'] },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      'progress.current': { type: 'number', minimum: 0, maximum: 100 }
    }
  },
  objectiveProgress: {
    required: ['id', 'objectiveId', 'userId', 'date', 'progressDelta', 'newTotalProgress', 'activities', 'createdAt'],
    properties: {
      progressDelta: { type: 'number' },
      newTotalProgress: { type: 'number', minimum: 0, maximum: 100 },
      activities: { type: 'array', minItems: 1 }
    }
  },
  course: {
    required: ['id', 'title', 'description', 'instructor', 'content', 'pricing', 'metadata', 'analytics', 'createdAt', 'updatedAt'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 5000 },
      'pricing.amount': { type: 'number', minimum: 0 },
      'metadata.published': { type: 'boolean' }
    }
  },
  enrollment: {
    required: ['id', 'userId', 'courseId', 'enrolledAt', 'progress', 'status', 'updatedAt'],
    properties: {
      userId: { type: 'string', minLength: 1 },
      courseId: { type: 'string', minLength: 1 },
      'progress.overallProgress': { type: 'number', minimum: 0, maximum: 100 }
    }
  }
};