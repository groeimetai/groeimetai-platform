// GroeimetAI Platform MVP - Firestore Data Models
// TypeScript interfaces for all collections and documents

// =============================================================================
// USER MANAGEMENT
// =============================================================================

export interface User {
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'admin' | 'instructor';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  profile: UserProfile;
  preferences: UserPreferences;
  subscription?: UserSubscription;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  profession?: string;
  learningGoals?: string[];
  bio?: string;
  linkedInProfile?: string;
  website?: string;
  location?: string;
  timezone: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string; // ISO 639-1 code
  videoQuality: 'auto' | '720p' | '1080p';
  playbackSpeed: number;
  subtitlesEnabled: boolean;
  darkMode: boolean;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  paymentMethodId?: string;
}

// =============================================================================
// COURSE MANAGEMENT
// =============================================================================

export interface Course {
  id: string;
  title: string;
  slug: string; // URL-friendly version of title
  description: string;
  shortDescription: string;
  category: CourseCategory;
  subcategory?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  
  // Content structure
  lessons: string[]; // Array of lesson IDs
  totalLessons: number;
  estimatedDuration: number; // in minutes
  
  // Pricing
  price: number;
  currency: string;
  discountPrice?: number;
  discountValidUntil?: Date;
  
  // Media
  thumbnailURL: string;
  previewVideoURL?: string;
  
  // Metadata
  instructorId: string;
  tags: string[];
  skills: string[]; // Skills students will learn
  prerequisites: string[];
  
  // Analytics
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  completionRate: number;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Certificate
  certificateTemplate?: string;
  certificateRequirements: CertificateRequirements;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string; // For subcategories
  order: number;
  isActive: boolean;
}

export interface CertificateRequirements {
  passPercentage: number; // Default 80%
  assessmentRequired: boolean;
  allLessonsRequired: boolean;
  timeRequirement?: number; // Minimum time spent
}

// =============================================================================
// LESSON MANAGEMENT
// =============================================================================

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  
  // Content
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'resource';
  content: LessonContent;
  
  // Duration
  estimatedDuration: number; // in minutes
  
  // Access control
  isFree: boolean; // For preview lessons
  isRequired: boolean; // For course completion
  
  // Status
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  
  // Analytics
  completionCount: number;
  averageWatchTime?: number; // For video lessons
}

export interface LessonContent {
  videoURL?: string;
  videoDuration?: number; // in seconds
  videoSubtitles?: SubtitleTrack[];
  textContent?: string; // Markdown format
  resources?: LessonResource[];
  quiz?: Quiz;
  assignment?: Assignment;
}

export interface SubtitleTrack {
  language: string;
  label: string;
  src: string; // VTT file URL
  default?: boolean;
}

export interface LessonResource {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'doc' | 'zip' | 'code' | 'image' | 'audio';
  fileURL: string;
  fileSize: number; // in bytes
  downloadCount: number;
  isRequired: boolean;
}

// =============================================================================
// ASSESSMENT SYSTEM
// =============================================================================

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: 'quiz' | 'exam' | 'project' | 'assignment';
  
  // Configuration
  questions: AssessmentQuestion[];
  timeLimit?: number; // in minutes
  attemptsAllowed: number;
  passingScore: number; // percentage
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  
  // Grading
  autoGrade: boolean;
  showResults: 'immediately' | 'after_submission' | 'manual';
  showCorrectAnswers: boolean;
  
  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'essay' | 'code';
  question: string;
  options?: string[]; // For multiple choice/select
  correctAnswers: string[]; // Answer keys
  points: number;
  explanation?: string;
  codeLanguage?: string; // For code questions
  codeTemplate?: string;
}

export interface Quiz {
  questions: AssessmentQuestion[];
  timeLimit?: number;
  passingScore: number;
  allowRetake: boolean;
  showResultsImmediately: boolean;
}

export interface Assignment {
  instructions: string;
  submissionType: 'text' | 'file' | 'url' | 'code';
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  dueDate?: Date;
  gradingRubric?: GradingRubric;
}

export interface GradingRubric {
  criteria: GradingCriteria[];
  totalPoints: number;
}

export interface GradingCriteria {
  name: string;
  description: string;
  maxPoints: number;
  levels: GradingLevel[];
}

export interface GradingLevel {
  name: string;
  description: string;
  points: number;
}

// =============================================================================
// PROGRESS TRACKING
// =============================================================================

export interface UserProgress {
  userId: string;
  courseId: string;
  
  // Overall progress
  enrollmentDate: Date;
  completionDate?: Date;
  completionPercentage: number;
  lastAccessDate: Date;
  totalTimeSpent: number; // in minutes
  
  // Lesson progress
  lessonsCompleted: string[]; // Array of lesson IDs
  lessonProgress: { [lessonId: string]: LessonProgress };
  
  // Assessment progress
  assessmentAttempts: { [assessmentId: string]: AssessmentAttempt[] };
  bestScores: { [assessmentId: string]: number };
  
  // Certificate
  certificateEarned: boolean;
  certificateId?: string;
  certificateEarnedAt?: Date;
  
  // Bookmarks and notes
  bookmarks: Bookmark[];
  notes: Note[];
  
  // Streak and achievements
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: Date;
  achievements: string[]; // Achievement IDs
}

export interface LessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // in minutes
  videoProgress?: number; // percentage for video lessons
  lastWatchedPosition?: number; // in seconds
  resourcesDownloaded: string[]; // Resource IDs
}

export interface AssessmentAttempt {
  attemptId: string;
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
  maxScore: number;
  passed: boolean;
  answers: AssessmentAnswer[];
  timeSpent: number; // in seconds
  feedback?: string;
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | string[]; // Single answer or multiple for multi-select
  isCorrect?: boolean;
  pointsEarned?: number;
  feedback?: string;
}

export interface Bookmark {
  id: string;
  lessonId: string;
  timestamp?: number; // For video bookmarks (in seconds)
  note?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  lessonId: string;
  content: string;
  timestamp?: number; // For video notes (in seconds)
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// CERTIFICATE SYSTEM
// =============================================================================

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  
  // Certificate details
  certificateNumber: string; // Unique identifier
  studentName: string;
  courseName: string;
  instructorName: string;
  issueDate: Date;
  expirationDate?: Date;
  
  // Verification
  qrCode: string; // QR code data
  verificationURL: string;
  digitalSignature: string;
  
  // Score details
  finalScore: number;
  totalPossibleScore: number;
  passingScore: number;
  
  // Template and styling
  templateId: string;
  customizations?: CertificateCustomizations;
  
  // Status
  isValid: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  
  // LinkedIn integration
  linkedInShared: boolean;
  linkedInSharedAt?: Date;
}

export interface CertificateCustomizations {
  backgroundColor?: string;
  textColor?: string;
  logoURL?: string;
  signatureURL?: string;
  additionalText?: string;
}

// =============================================================================
// PAYMENT SYSTEM
// =============================================================================

export interface Payment {
  id: string;
  userId: string;
  
  // Order details
  items: PaymentItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  
  // Payment processing
  paymentMethodId: string;
  paymentIntentId?: string; // Stripe Payment Intent ID
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  
  // Billing information
  billingAddress: BillingAddress;
  
  // Timestamps
  createdAt: Date;
  processedAt?: Date;
  refundedAt?: Date;
  
  // Metadata
  metadata?: { [key: string]: any };
  receiptURL?: string;
  invoiceURL?: string;
  
  // Refund details
  refundAmount?: number;
  refundReason?: string;
  refundedBy?: string; // Admin user ID
}

export interface PaymentItem {
  type: 'course' | 'subscription' | 'bundle';
  itemId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountApplied?: number;
  couponCode?: string;
}

export interface BillingAddress {
  name: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  vatNumber?: string; // For EU businesses
}

// =============================================================================
// REVIEWS AND RATINGS
// =============================================================================

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  
  // Review content
  rating: number; // 1-5 stars
  title: string;
  content: string;
  
  // Metadata
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Moderation
  reportCount: number;
  isApproved: boolean;
  moderatedBy?: string; // Admin user ID
  moderatedAt?: Date;
  
  // Helpfulness
  helpfulCount: number;
  unhelpfulCount: number;
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export interface Notification {
  id: string;
  userId: string;
  
  // Content
  type: 'course_update' | 'assignment_due' | 'certificate_earned' | 'new_course' | 'system';
  title: string;
  message: string;
  actionURL?: string;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  
  // Delivery
  deliveryMethod: 'in_app' | 'email' | 'push';
  sentAt?: Date;
  
  // Related entities
  relatedCourseId?: string;
  relatedLessonId?: string;
  relatedAssessmentId?: string;
}

// =============================================================================
// ANALYTICS
// =============================================================================

export interface Analytics {
  id: string;
  type: 'user_action' | 'course_view' | 'lesson_complete' | 'purchase' | 'certificate_earned';
  
  // Event data
  userId?: string;
  courseId?: string;
  lessonId?: string;
  
  // Metadata
  timestamp: Date;
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  
  // Custom properties
  properties: { [key: string]: any };
}

// =============================================================================
// SYSTEM CONFIGURATION
// =============================================================================

export interface SystemSettings {
  id: 'global';
  
  // Platform settings
  platformName: string;
  platformURL: string;
  supportEmail: string;
  
  // Payment settings
  stripePubKey: string;
  paypalClientId: string;
  defaultCurrency: string;
  taxRate: number;
  
  // Certificate settings
  certificateValidityPeriod?: number; // in days
  qrCodeBaseURL: string;
  
  // Email settings
  emailTemplates: { [key: string]: EmailTemplate };
  
  // Feature flags
  features: {
    socialLogin: boolean;
    offlineDownload: boolean;
    certificates: boolean;
    subscriptions: boolean;
    multiLanguage: boolean;
  };
  
  // Limits
  maxFileUploadSize: number; // in bytes
  maxVideoLength: number; // in minutes
  maxAssessmentAttempts: number;
  
  updatedAt: Date;
  updatedBy: string; // Admin user ID
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // Available template variables
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Timestamp = Date;
export type DocumentId = string;

// Firebase Firestore subcollections
export interface FirestoreCollections {
  users: User;
  courses: Course;
  lessons: Lesson;
  assessments: Assessment;
  userProgress: UserProgress;
  certificates: Certificate;
  payments: Payment;
  reviews: Review;
  notifications: Notification;
  analytics: Analytics;
  systemSettings: SystemSettings;
  categories: CourseCategory;
}

// Collection paths
export const COLLECTION_PATHS = {
  USERS: 'users',
  COURSES: 'courses',
  LESSONS: 'lessons',
  ASSESSMENTS: 'assessments',
  USER_PROGRESS: 'userProgress',
  CERTIFICATES: 'certificates',
  PAYMENTS: 'payments',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  SYSTEM_SETTINGS: 'systemSettings',
  CATEGORIES: 'categories',
} as const;