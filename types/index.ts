/**
 * GroeimetAI Platform - Core TypeScript Interfaces
 * Comprehensive type definitions for the entire application
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Core Entity Types
// ============================================================================

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  profile: UserProfile;
  subscription: UserSubscription;
  preferences: UserPreferences;
  progress: UserProgress;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
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
}

export interface UserSubscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  validUntil: Timestamp;
  paymentMethod?: string;
  autoRenew: boolean;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UserProgress {
  coursesEnrolled: string[];
  coursesCompleted: string[];
  totalStudyTime: number;
  certificatesEarned: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  instructor: CourseInstructor;
  content: CourseContent;
  pricing: CoursePricing;
  metadata: CourseMetadata;
  analytics: CourseAnalytics;
}

export interface CourseInstructor {
  uid: string;
  name: string;
  avatar?: string;
  bio: string;
  expertise: string[];
  rating: number;
  totalStudents: number;
}

export interface CourseContent {
  modules: CourseModule[];
  totalDuration: number;
  difficulty: CourseDifficulty;
  learningObjectives: string[];
  prerequisites: string[];
  resources: CourseResource[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  quiz?: CourseQuiz;
  duration: number;
  order: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  content: LessonContent;
  duration: number;
  order: number;
  isPreview: boolean;
}

export interface LessonContent {
  videoUrl?: string;
  transcript?: string;
  slides?: string[];
  documents?: string[];
  codeExamples?: CodeExample[];
  interactiveElements?: InteractiveElement[];
}

export interface CourseQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  attempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface CoursePricing {
  amount: number;
  currency: Currency;
  originalPrice?: number;
  discount?: {
    percentage: number;
    code?: string;
    validUntil: Timestamp;
  };
  paymentOptions: PaymentOption[];
}

export interface CourseMetadata {
  tags: string[];
  category: CourseCategory;
  language: string;
  published: boolean;
  featured: boolean;
  level: CourseLevel;
  estimatedHours: number;
  lastUpdated: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CourseAnalytics {
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  totalRatings: number;
  revenue: number;
  refundRate: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  qrCode: CertificateQR;
  completion: CertificateCompletion;
  validation: CertificateValidation;
  design: CertificateDesign;
}

export interface CertificateQR {
  code: string;
  verificationUrl: string;
  generatedAt: Timestamp;
  scanCount: number;
}

export interface CertificateCompletion {
  completedAt: Timestamp;
  finalScore: number;
  totalTime: number;
  modules: {
    moduleId: string;
    completedAt: Timestamp;
    score: number;
  }[];
}

export interface CertificateValidation {
  isValid: boolean;
  expiresAt?: Timestamp;
  revokedAt?: Timestamp;
  revokedReason?: string;
}

export interface CertificateDesign {
  template: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo: string;
  signature: string;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  method: PaymentMethod;
  molliePaymentId: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  refundedAt?: Timestamp;
  failureReason?: string;
}

// ============================================================================
// Enums and Union Types
// ============================================================================

export type UserRole = 'student' | 'instructor' | 'admin' | 'moderator';

export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type CourseCategory = 
  | 'web-development'
  | 'mobile-development'
  | 'data-science'
  | 'machine-learning'
  | 'design'
  | 'business'
  | 'marketing'
  | 'personal-development';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type LessonType = 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';

export type Currency = 'EUR' | 'USD' | 'GBP';

export type PaymentOption = 'one-time' | 'subscription';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export type PaymentMethod = 'credit-card' | 'ideal' | 'paypal' | 'bancontact' | 'sofort';

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// Form and Validation Types
// ============================================================================

export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  newsletter: boolean;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
}

export interface PaymentForm {
  method: PaymentMethod;
  email: string;
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CourseCardProps extends BaseComponentProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onPreview?: (courseId: string) => void;
  showProgress?: boolean;
  progress?: number;
}

export interface LessonPlayerProps extends BaseComponentProps {
  lesson: CourseLesson;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  autoPlay?: boolean;
}

export interface QuizProps extends BaseComponentProps {
  quiz: CourseQuiz;
  onComplete?: (score: number) => void;
  onRetake?: () => void;
  allowRetake?: boolean;
}

export interface CertificateProps extends BaseComponentProps {
  certificate: Certificate;
  onDownload?: () => void;
  onShare?: () => void;
  onVerify?: () => void;
}

export interface PaymentComponentProps extends BaseComponentProps {
  course: Course;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export interface UseCourseReturn {
  course: Course | null;
  loading: boolean;
  error: string | null;
  enroll: () => Promise<void>;
  unenroll: () => Promise<void>;
  markComplete: () => Promise<void>;
  updateProgress: (lessonId: string) => Promise<void>;
}

export interface UsePaymentReturn {
  loading: boolean;
  error: string | null;
  createPayment: (courseId: string, method: PaymentMethod) => Promise<string>;
  verifyPayment: (paymentId: string) => Promise<boolean>;
  refundPayment: (paymentId: string) => Promise<void>;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface CodeExample {
  language: string;
  title: string;
  code: string;
  description?: string;
}

export interface InteractiveElement {
  type: 'exercise' | 'simulation' | 'quiz' | 'poll';
  title: string;
  content: any;
  points?: number;
}

export interface CourseResource {
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'zip' | 'link';
  url: string;
  size?: number;
  description?: string;
}

export interface SearchFilters {
  category?: CourseCategory;
  level?: CourseLevel;
  duration?: {
    min: number;
    max: number;
  };
  price?: {
    min: number;
    max: number;
  };
  rating?: number;
  language?: string;
}

export interface SortOptions {
  field: 'title' | 'price' | 'rating' | 'popularity' | 'newest';
  direction: 'asc' | 'desc';
}

// ============================================================================
// State Management Types
// ============================================================================

export interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: Notification[];
}

export interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  enrolledCourses: Course[];
  loading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  loading: boolean;
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    show: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface MollieConfig {
  apiKey: string;
  testMode: boolean;
  webhookUrl: string;
  redirectUrl: string;
}

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    socialLogin: boolean;
    certificates: boolean;
    analytics: boolean;
    chat: boolean;
  };
}