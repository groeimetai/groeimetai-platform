// GroeimetAI Platform MVP - Data Validation Schemas
// Comprehensive validation schemas using Zod for runtime validation

import { z } from 'zod';

// =============================================================================
// COMMON VALIDATION HELPERS
// =============================================================================

const emailSchema = z.string().email().max(255);
const passwordSchema = z.string().min(8).max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain uppercase, lowercase, number, and special character');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/).optional();
const urlSchema = z.string().url().max(2048);
const slugSchema = z.string().regex(/^[a-z0-9-]+$/).min(1).max(100);
const currencySchema = z.enum(['EUR', 'USD', 'GBP']);
const languageSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/); // ISO 639-1 with optional region
const timezoneSchema = z.string().max(50);
const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

// =============================================================================
// USER VALIDATION SCHEMAS
// =============================================================================

export const UserProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  profession: z.string().max(100).optional(),
  learningGoals: z.array(z.string().max(200)).max(10).optional(),
  bio: z.string().max(500).optional(),
  linkedInProfile: urlSchema.optional(),
  website: urlSchema.optional(),
  location: z.string().max(100).optional(),
  timezone: timezoneSchema,
});

export const UserPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  language: languageSchema,
  videoQuality: z.enum(['auto', '720p', '1080p']),
  playbackSpeed: z.number().min(0.25).max(3.0),
  subtitlesEnabled: z.boolean(),
  darkMode: z.boolean(),
});

export const UserSubscriptionSchema = z.object({
  planId: z.string().min(1).max(50),
  status: z.enum(['active', 'cancelled', 'expired']),
  startDate: z.date(),
  endDate: z.date().optional(),
  autoRenew: z.boolean(),
  paymentMethodId: z.string().max(100).optional(),
});

export const UserSchema = z.object({
  uid: z.string().min(1).max(128),
  email: emailSchema,
  displayName: z.string().min(1).max(100),
  photoURL: urlSchema.optional(),
  role: z.enum(['student', 'admin', 'instructor']),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
  isActive: z.boolean(),
  profile: UserProfileSchema,
  preferences: UserPreferencesSchema,
  subscription: UserSubscriptionSchema.optional(),
});

// Registration/Update schemas (subset of full User schema)
export const UserRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(1).max(100),
  role: z.enum(['student']).default('student'),
  profile: UserProfileSchema.pick({
    firstName: true,
    lastName: true,
    profession: true,
    learningGoals: true,
    timezone: true,
  }),
});

export const UserUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  profile: UserProfileSchema.partial().optional(),
  preferences: UserPreferencesSchema.partial().optional(),
});

// =============================================================================
// COURSE VALIDATION SCHEMAS
// =============================================================================

export const CourseCategorySchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  slug: slugSchema,
  parentId: z.string().max(50).optional(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export const CertificateRequirementsSchema = z.object({
  passPercentage: z.number().int().min(0).max(100).default(80),
  assessmentRequired: z.boolean().default(true),
  allLessonsRequired: z.boolean().default(true),
  timeRequirement: z.number().int().min(0).optional(),
});

export const CourseSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  slug: slugSchema,
  description: z.string().min(10).max(5000),
  shortDescription: z.string().min(10).max(500),
  category: CourseCategorySchema,
  subcategory: z.string().max(100).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: languageSchema,
  
  lessons: z.array(z.string()).max(200),
  totalLessons: z.number().int().min(0).max(200),
  estimatedDuration: z.number().int().min(1), // in minutes
  
  price: z.number().min(0).max(9999.99),
  currency: currencySchema,
  discountPrice: z.number().min(0).max(9999.99).optional(),
  discountValidUntil: z.date().optional(),
  
  thumbnailURL: urlSchema,
  previewVideoURL: urlSchema.optional(),
  
  instructorId: z.string().min(1).max(128),
  tags: z.array(z.string().max(50)).max(20),
  skills: z.array(z.string().max(100)).max(20),
  prerequisites: z.array(z.string().max(200)).max(10),
  
  enrollmentCount: z.number().int().min(0).default(0),
  averageRating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  completionRate: z.number().min(0).max(1).default(0),
  
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.array(z.string().max(50)).max(10).optional(),
  
  certificateTemplate: z.string().max(100).optional(),
  certificateRequirements: CertificateRequirementsSchema,
});

export const CourseCreateSchema = CourseSchema.pick({
  title: true,
  description: true,
  shortDescription: true,
  level: true,
  language: true,
  price: true,
  currency: true,
  tags: true,
  skills: true,
  prerequisites: true,
  thumbnailURL: true,
  previewVideoURL: true,
  certificateRequirements: true,
}).extend({
  categoryId: z.string().min(1).max(50),
  subcategory: z.string().max(100).optional(),
});

export const CourseUpdateSchema = CourseCreateSchema.partial();

// =============================================================================
// LESSON VALIDATION SCHEMAS
// =============================================================================

export const SubtitleTrackSchema = z.object({
  language: languageSchema,
  label: z.string().min(1).max(50),
  src: urlSchema,
  default: z.boolean().optional(),
});

export const LessonResourceSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  type: z.enum(['pdf', 'doc', 'zip', 'code', 'image', 'audio']),
  fileURL: urlSchema,
  fileSize: z.number().int().min(0).max(1073741824), // 1GB max
  downloadCount: z.number().int().min(0).default(0),
  isRequired: z.boolean().default(false),
});

export const AssessmentQuestionSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum(['multiple_choice', 'multiple_select', 'true_false', 'short_answer', 'essay', 'code']),
  question: z.string().min(1).max(2000),
  options: z.array(z.string().max(500)).max(10).optional(),
  correctAnswers: z.array(z.string().max(1000)),
  points: z.number().int().min(1).max(100),
  explanation: z.string().max(1000).optional(),
  codeLanguage: z.string().max(20).optional(),
  codeTemplate: z.string().max(10000).optional(),
});

export const QuizSchema = z.object({
  questions: z.array(AssessmentQuestionSchema).min(1).max(50),
  timeLimit: z.number().int().min(1).max(480).optional(), // max 8 hours
  passingScore: z.number().int().min(0).max(100).default(80),
  allowRetake: z.boolean().default(true),
  showResultsImmediately: z.boolean().default(true),
});

export const GradingLevelSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200),
  points: z.number().int().min(0),
});

export const GradingCriteriaSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  maxPoints: z.number().int().min(1).max(100),
  levels: z.array(GradingLevelSchema).min(2).max(10),
});

export const GradingRubricSchema = z.object({
  criteria: z.array(GradingCriteriaSchema).min(1).max(20),
  totalPoints: z.number().int().min(1).max(1000),
});

export const AssignmentSchema = z.object({
  instructions: z.string().min(1).max(5000),
  submissionType: z.enum(['text', 'file', 'url', 'code']),
  maxFileSize: z.number().int().min(0).max(104857600).optional(), // 100MB max
  allowedFileTypes: z.array(z.string().max(10)).max(20).optional(),
  dueDate: z.date().optional(),
  gradingRubric: GradingRubricSchema.optional(),
});

export const LessonContentSchema = z.object({
  videoURL: urlSchema.optional(),
  videoDuration: z.number().int().min(0).optional(),
  videoSubtitles: z.array(SubtitleTrackSchema).max(10).optional(),
  textContent: z.string().max(50000).optional(), // 50KB markdown
  resources: z.array(LessonResourceSchema).max(20).optional(),
  quiz: QuizSchema.optional(),
  assignment: AssignmentSchema.optional(),
});

export const LessonSchema = z.object({
  id: z.string().min(1).max(50),
  courseId: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  slug: slugSchema,
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0),
  
  type: z.enum(['video', 'text', 'quiz', 'assignment', 'resource']),
  content: LessonContentSchema,
  
  estimatedDuration: z.number().int().min(1).max(480), // max 8 hours
  
  isFree: z.boolean().default(false),
  isRequired: z.boolean().default(true),
  
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
  
  completionCount: z.number().int().min(0).default(0),
  averageWatchTime: z.number().int().min(0).optional(),
});

export const LessonCreateSchema = LessonSchema.pick({
  courseId: true,
  title: true,
  description: true,
  type: true,
  content: true,
  estimatedDuration: true,
  order: true,
  isFree: true,
  isRequired: true,
});

export const LessonUpdateSchema = LessonCreateSchema.partial().omit({ courseId: true });

// =============================================================================
// ASSESSMENT VALIDATION SCHEMAS
// =============================================================================

export const AssessmentSchema = z.object({
  id: z.string().min(1).max(50),
  courseId: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  type: z.enum(['quiz', 'exam', 'project', 'assignment']),
  
  questions: z.array(AssessmentQuestionSchema).min(1).max(100),
  timeLimit: z.number().int().min(1).max(480).optional(), // max 8 hours
  attemptsAllowed: z.number().int().min(1).max(10),
  passingScore: z.number().int().min(0).max(100),
  randomizeQuestions: z.boolean().default(false),
  randomizeAnswers: z.boolean().default(false),
  
  autoGrade: z.boolean().default(true),
  showResults: z.enum(['immediately', 'after_submission', 'manual']),
  showCorrectAnswers: z.boolean().default(true),
  
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AssessmentCreateSchema = AssessmentSchema.pick({
  courseId: true,
  title: true,
  description: true,
  type: true,
  questions: true,
  timeLimit: true,
  attemptsAllowed: true,
  passingScore: true,
  randomizeQuestions: true,
  randomizeAnswers: true,
  autoGrade: true,
  showResults: true,
  showCorrectAnswers: true,
});

export const AssessmentUpdateSchema = AssessmentCreateSchema.partial().omit({ courseId: true });

// =============================================================================
// PROGRESS TRACKING SCHEMAS
// =============================================================================

export const BookmarkSchema = z.object({
  id: z.string().min(1).max(50),
  lessonId: z.string().min(1).max(50),
  timestamp: z.number().int().min(0).optional(),
  note: z.string().max(500).optional(),
  createdAt: z.date(),
});

export const NoteSchema = z.object({
  id: z.string().min(1).max(50),
  lessonId: z.string().min(1).max(50),
  content: z.string().min(1).max(2000),
  timestamp: z.number().int().min(0).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AssessmentAnswerSchema = z.object({
  questionId: z.string().min(1).max(50),
  answer: z.union([z.string(), z.array(z.string())]).refine(
    (val) => typeof val === 'string' ? val.length <= 5000 : val.every(s => s.length <= 1000),
    'Answer too long'
  ),
  isCorrect: z.boolean().optional(),
  pointsEarned: z.number().int().min(0).optional(),
  feedback: z.string().max(1000).optional(),
});

export const AssessmentAttemptSchema = z.object({
  attemptId: z.string().min(1).max(50),
  startedAt: z.date(),
  submittedAt: z.date().optional(),
  score: z.number().int().min(0).max(100).optional(),
  maxScore: z.number().int().min(1),
  passed: z.boolean(),
  answers: z.array(AssessmentAnswerSchema),
  timeSpent: z.number().int().min(0), // in seconds
  feedback: z.string().max(2000).optional(),
});

export const LessonProgressSchema = z.object({
  lessonId: z.string().min(1).max(50),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  timeSpent: z.number().int().min(0), // in minutes
  videoProgress: z.number().min(0).max(1).optional(), // percentage
  lastWatchedPosition: z.number().int().min(0).optional(), // in seconds
  resourcesDownloaded: z.array(z.string()).default([]),
});

export const UserProgressSchema = z.object({
  userId: z.string().min(1).max(128),
  courseId: z.string().min(1).max(50),
  
  enrollmentDate: z.date(),
  completionDate: z.date().optional(),
  completionPercentage: z.number().min(0).max(1),
  lastAccessDate: z.date(),
  totalTimeSpent: z.number().int().min(0), // in minutes
  
  lessonsCompleted: z.array(z.string()),
  lessonProgress: z.record(z.string(), LessonProgressSchema),
  
  assessmentAttempts: z.record(z.string(), z.array(AssessmentAttemptSchema)),
  bestScores: z.record(z.string(), z.number().int().min(0).max(100)),
  
  certificateEarned: z.boolean().default(false),
  certificateId: z.string().max(50).optional(),
  certificateEarnedAt: z.date().optional(),
  
  bookmarks: z.array(BookmarkSchema).max(100),
  notes: z.array(NoteSchema).max(200),
  
  currentStreak: z.number().int().min(0).default(0),
  longestStreak: z.number().int().min(0).default(0),
  lastStudyDate: z.date().optional(),
  achievements: z.array(z.string().max(50)).default([]),
});

// =============================================================================
// CERTIFICATE SCHEMAS
// =============================================================================

export const CertificateCustomizationsSchema = z.object({
  backgroundColor: colorSchema.optional(),
  textColor: colorSchema.optional(),
  logoURL: urlSchema.optional(),
  signatureURL: urlSchema.optional(),
  additionalText: z.string().max(500).optional(),
});

export const CertificateSchema = z.object({
  id: z.string().min(1).max(50),
  userId: z.string().min(1).max(128),
  courseId: z.string().min(1).max(50),
  
  certificateNumber: z.string().regex(/^[A-Z0-9]{12}$/),
  studentName: z.string().min(1).max(200),
  courseName: z.string().min(1).max(200),
  instructorName: z.string().min(1).max(200),
  issueDate: z.date(),
  expirationDate: z.date().optional(),
  
  qrCode: z.string().min(1).max(1000),
  verificationURL: urlSchema,
  digitalSignature: z.string().min(1).max(2000),
  
  finalScore: z.number().int().min(0).max(100),
  totalPossibleScore: z.number().int().min(1),
  passingScore: z.number().int().min(0).max(100),
  
  templateId: z.string().min(1).max(50),
  customizations: CertificateCustomizationsSchema.optional(),
  
  isValid: z.boolean().default(true),
  revokedAt: z.date().optional(),
  revokedReason: z.string().max(500).optional(),
  
  linkedInShared: z.boolean().default(false),
  linkedInSharedAt: z.date().optional(),
});

// =============================================================================
// PAYMENT SCHEMAS
// =============================================================================

export const BillingAddressSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  vatNumber: z.string().max(20).optional(),
});

export const PaymentItemSchema = z.object({
  type: z.enum(['course', 'subscription', 'bundle']),
  itemId: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(100),
  unitPrice: z.number().min(0).max(9999.99),
  totalPrice: z.number().min(0).max(999999.99),
  discountApplied: z.number().min(0).max(9999.99).optional(),
  couponCode: z.string().max(50).optional(),
});

export const PaymentSchema = z.object({
  id: z.string().min(1).max(50),
  userId: z.string().min(1).max(128),
  
  items: z.array(PaymentItemSchema).min(1).max(50),
  subtotal: z.number().min(0).max(999999.99),
  tax: z.number().min(0).max(99999.99),
  total: z.number().min(0).max(999999.99),
  currency: currencySchema,
  
  paymentMethodId: z.string().min(1).max(100),
  paymentIntentId: z.string().max(100).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded']),
  
  billingAddress: BillingAddressSchema,
  
  createdAt: z.date(),
  processedAt: z.date().optional(),
  refundedAt: z.date().optional(),
  
  metadata: z.record(z.any()).optional(),
  receiptURL: urlSchema.optional(),
  invoiceURL: urlSchema.optional(),
  
  refundAmount: z.number().min(0).max(999999.99).optional(),
  refundReason: z.string().max(500).optional(),
  refundedBy: z.string().max(128).optional(),
});

export const PaymentCreateSchema = z.object({
  items: z.array(PaymentItemSchema.pick({
    type: true,
    itemId: true,
    quantity: true,
  })).min(1).max(10),
  billingAddress: BillingAddressSchema,
  couponCode: z.string().max(50).optional(),
});

// =============================================================================
// REVIEW SCHEMAS
// =============================================================================

export const ReviewSchema = z.object({
  id: z.string().min(1).max(50),
  courseId: z.string().min(1).max(50),
  userId: z.string().min(1).max(128),
  
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(2000),
  
  isVerifiedPurchase: z.boolean(),
  isVisible: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  
  reportCount: z.number().int().min(0).default(0),
  isApproved: z.boolean().default(false),
  moderatedBy: z.string().max(128).optional(),
  moderatedAt: z.date().optional(),
  
  helpfulCount: z.number().int().min(0).default(0),
  unhelpfulCount: z.number().int().min(0).default(0),
});

export const ReviewCreateSchema = ReviewSchema.pick({
  courseId: true,
  rating: true,
  title: true,
  content: true,
});

export const ReviewUpdateSchema = ReviewCreateSchema.partial().omit({ courseId: true });

// =============================================================================
// NOTIFICATION SCHEMAS
// =============================================================================

export const NotificationSchema = z.object({
  id: z.string().min(1).max(50),
  userId: z.string().min(1).max(128),
  
  type: z.enum(['course_update', 'assignment_due', 'certificate_earned', 'new_course', 'system']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  actionURL: urlSchema.optional(),
  
  isRead: z.boolean().default(false),
  readAt: z.date().optional(),
  createdAt: z.date(),
  
  deliveryMethod: z.enum(['in_app', 'email', 'push']),
  sentAt: z.date().optional(),
  
  relatedCourseId: z.string().max(50).optional(),
  relatedLessonId: z.string().max(50).optional(),
  relatedAssessmentId: z.string().max(50).optional(),
});

// =============================================================================
// ANALYTICS SCHEMAS
// =============================================================================

export const AnalyticsSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum(['user_action', 'course_view', 'lesson_complete', 'purchase', 'certificate_earned']),
  
  userId: z.string().max(128).optional(),
  courseId: z.string().max(50).optional(),
  lessonId: z.string().max(50).optional(),
  
  timestamp: z.date(),
  sessionId: z.string().min(1).max(100),
  userAgent: z.string().max(500),
  ipAddress: z.string().max(45), // IPv6 max length
  referrer: urlSchema.optional(),
  
  properties: z.record(z.any()),
});

// =============================================================================
// SYSTEM SETTINGS SCHEMAS
// =============================================================================

export const EmailTemplateSchema = z.object({
  subject: z.string().min(1).max(200),
  htmlContent: z.string().min(1).max(50000),
  textContent: z.string().min(1).max(50000),
  variables: z.array(z.string().max(50)).max(50),
});

export const SystemSettingsSchema = z.object({
  id: z.literal('global'),
  
  platformName: z.string().min(1).max(100),
  platformURL: urlSchema,
  supportEmail: emailSchema,
  
  stripePubKey: z.string().min(1).max(200),
  paypalClientId: z.string().min(1).max(200),
  defaultCurrency: currencySchema,
  taxRate: z.number().min(0).max(1),
  
  certificateValidityPeriod: z.number().int().min(1).optional(),
  qrCodeBaseURL: urlSchema,
  
  emailTemplates: z.record(z.string(), EmailTemplateSchema),
  
  features: z.object({
    socialLogin: z.boolean(),
    offlineDownload: z.boolean(),
    certificates: z.boolean(),
    subscriptions: z.boolean(),
    multiLanguage: z.boolean(),
  }),
  
  maxFileUploadSize: z.number().int().min(1).max(1073741824), // 1GB max
  maxVideoLength: z.number().int().min(1).max(43200), // 12 hours max
  maxAssessmentAttempts: z.number().int().min(1).max(10),
  
  updatedAt: z.date(),
  updatedBy: z.string().min(1).max(128),
});

// =============================================================================
// API REQUEST/RESPONSE SCHEMAS
// =============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const SortSchema = z.object({
  field: z.string().min(1).max(50),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

export const FilterSchema = z.object({
  field: z.string().min(1).max(50),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains']),
  value: z.any(),
});

export const QuerySchema = z.object({
  pagination: PaginationSchema.optional(),
  sort: z.array(SortSchema).max(5).optional(),
  filters: z.array(FilterSchema).max(20).optional(),
  search: z.string().max(200).optional(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string().max(50),
    message: z.string().max(500),
    details: z.any().optional(),
  }).optional(),
  metadata: z.object({
    timestamp: z.string(),
    requestId: z.string().max(100),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }).optional(),
  }),
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const validateUrl = (url: string): boolean => {
  return urlSchema.safeParse(url).success;
};

export const validateSlug = (slug: string): boolean => {
  return slugSchema.safeParse(slug).success;
};

// Custom validation functions
export const validateCourseProgress = (progress: any): boolean => {
  // Ensure completion percentage matches completed lessons
  if (progress.lessonsCompleted && progress.completionPercentage !== undefined) {
    const totalLessons = Object.keys(progress.lessonProgress || {}).length;
    const expectedPercentage = totalLessons > 0 ? progress.lessonsCompleted.length / totalLessons : 0;
    return Math.abs(progress.completionPercentage - expectedPercentage) < 0.01; // Allow small floating point differences
  }
  return true;
};

export const validateAssessmentScore = (attempt: any): boolean => {
  // Ensure score is within valid range based on answers
  if (attempt.answers && attempt.score !== undefined && attempt.maxScore !== undefined) {
    const totalPoints = attempt.answers.reduce((sum: number, answer: any) => sum + (answer.pointsEarned || 0), 0);
    const calculatedScore = Math.round((totalPoints / attempt.maxScore) * 100);
    return Math.abs(attempt.score - calculatedScore) <= 1; // Allow 1% difference for rounding
  }
  return true;
};

export const validateCertificateEligibility = (progress: any, course: any): boolean => {
  // Check if user meets certificate requirements
  if (!course.certificateRequirements) return false;
  
  const requirements = course.certificateRequirements;
  
  // Check pass percentage
  if (progress.bestScores) {
    const scores = Object.values(progress.bestScores) as number[];
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    if (averageScore < requirements.passPercentage) return false;
  }
  
  // Check lesson completion
  if (requirements.allLessonsRequired && progress.completionPercentage < 1) return false;
  
  // Check time requirement
  if (requirements.timeRequirement && progress.totalTimeSpent < requirements.timeRequirement) return false;
  
  return true;
};

// Export all schemas for use in API validation
export const ValidationSchemas = {
  User: UserSchema,
  UserRegistration: UserRegistrationSchema,
  UserUpdate: UserUpdateSchema,
  Course: CourseSchema,
  CourseCreate: CourseCreateSchema,
  CourseUpdate: CourseUpdateSchema,
  Lesson: LessonSchema,
  LessonCreate: LessonCreateSchema,
  LessonUpdate: LessonUpdateSchema,
  Assessment: AssessmentSchema,
  AssessmentCreate: AssessmentCreateSchema,
  AssessmentUpdate: AssessmentUpdateSchema,
  UserProgress: UserProgressSchema,
  Certificate: CertificateSchema,
  Payment: PaymentSchema,
  PaymentCreate: PaymentCreateSchema,
  Review: ReviewSchema,
  ReviewCreate: ReviewCreateSchema,
  ReviewUpdate: ReviewUpdateSchema,
  Notification: NotificationSchema,
  Analytics: AnalyticsSchema,
  SystemSettings: SystemSettingsSchema,
  Query: QuerySchema,
  ApiResponse: ApiResponseSchema,
};