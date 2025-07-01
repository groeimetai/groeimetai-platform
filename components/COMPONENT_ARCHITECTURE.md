# React Component Architecture

## Component Hierarchy Overview

```
app/
├── layout.tsx (Root Layout)
├── page.tsx (Landing Page)
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (dashboard)/
│   ├── layout.tsx (Dashboard Layout)
│   ├── page.tsx (Dashboard Home)
│   ├── courses/
│   │   ├── page.tsx (Courses List)
│   │   ├── [id]/page.tsx (Course Detail)
│   │   └── [id]/lesson/[lessonId]/page.tsx (Lesson Player)
│   ├── profile/page.tsx
│   ├── certificates/page.tsx
│   └── settings/page.tsx
├── (payment)/
│   ├── checkout/[courseId]/page.tsx
│   └── success/page.tsx
└── certificate/verify/[id]/page.tsx (Public Certificate Verification)
```

## Core Component Specifications

### 1. Layout Components

#### RootLayout
```typescript
interface RootLayoutProps {
  children: React.ReactNode;
}

// Features:
// - Global providers (Auth, Theme, Query)
// - Error boundaries
// - Loading states
// - Toast notifications
```

#### DashboardLayout
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Features:
// - Navigation sidebar
// - User menu
// - Breadcrumbs
// - Mobile responsive menu
```

### 2. Authentication Components

#### LoginForm
```typescript
interface LoginFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

// Features:
// - Email/password validation
// - Social login buttons
// - Remember me checkbox
// - Password strength indicator
```

#### RegisterForm
```typescript
interface RegisterFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

// Features:
// - Multi-step form
// - Field validation
// - Terms acceptance
// - Email verification flow
```

### 3. Course Components

#### CourseCard
```typescript
interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'featured' | 'compact';
  showProgress?: boolean;
  progress?: number;
  onEnroll?: (courseId: string) => void;
  onPreview?: (courseId: string) => void;
}

// Features:
// - Course thumbnail
// - Instructor info
// - Price display
// - Progress bar
// - Enrollment status
```

#### CourseGrid
```typescript
interface CourseGridProps {
  courses: Course[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Features:
// - Responsive grid layout
// - Infinite scroll
// - Loading skeletons
// - Empty state handling
```

#### CoursePlayer
```typescript
interface CoursePlayerProps {
  course: Course;
  currentLesson: CourseLesson;
  onLessonComplete?: (lessonId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  autoNext?: boolean;
}

// Features:
// - Video player with controls
// - Lesson sidebar navigation
// - Progress tracking
// - Note-taking interface
// - Bookmarking
```

### 4. Lesson Components

#### VideoPlayer
```typescript
interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  playbackRate?: number;
  captions?: string;
}

// Features:
// - Custom video controls
// - Playback speed control
// - Fullscreen support
// - Keyboard shortcuts
// - Progress saving
```

#### LessonContent
```typescript
interface LessonContentProps {
  lesson: CourseLesson;
  onComplete?: () => void;
  showNotes?: boolean;
}

// Features:
// - Multi-format content display
// - Interactive elements
// - Code syntax highlighting
// - Downloadable resources
```

### 5. Quiz Components

#### QuizPlayer
```typescript
interface QuizPlayerProps {
  quiz: CourseQuiz;
  onComplete?: (score: number, answers: QuizAnswer[]) => void;
  onRetake?: () => void;
  allowRetake?: boolean;
  timeLimit?: number;
}

// Features:
// - Question navigation
// - Timer display
// - Auto-save answers
// - Review mode
// - Score calculation
```

#### QuizQuestion
```typescript
interface QuizQuestionProps {
  question: QuizQuestion;
  answer?: string | string[];
  onAnswerChange?: (answer: string | string[]) => void;
  showResult?: boolean;
  disabled?: boolean;
}

// Features:
// - Multiple question types
// - Answer validation
// - Explanation display
// - Rich text support
```

### 6. Payment Components

#### CheckoutForm
```typescript
interface CheckoutFormProps {
  course: Course;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

// Features:
// - Mollie payment integration
// - Multiple payment methods
// - Billing address form
// - Order summary
// - Security indicators
```

#### PaymentMethods
```typescript
interface PaymentMethodsProps {
  selectedMethod?: PaymentMethod;
  onMethodChange?: (method: PaymentMethod) => void;
  availableMethods: PaymentMethod[];
}

// Features:
// - Payment method icons
// - Security badges
// - Method descriptions
// - Validation states
```

### 7. Certificate Components

#### Certificate
```typescript
interface CertificateProps {
  certificate: Certificate;
  variant?: 'preview' | 'full' | 'print';
  onDownload?: () => void;
  onShare?: () => void;
}

// Features:
// - Professional certificate design
// - QR code display
// - Print optimization
// - Social sharing
// - Download functionality
```

#### CertificateVerification
```typescript
interface CertificateVerificationProps {
  certificateId: string;
  onVerification?: (result: VerificationResult) => void;
}

// Features:
// - QR code scanner
// - Manual ID input
// - Verification status display
// - Certificate details
// - Fraud prevention
```

### 8. Profile Components

#### ProfileForm
```typescript
interface ProfileFormProps {
  user: User;
  onUpdate?: (user: Partial<User>) => void;
  onError?: (error: string) => void;
}

// Features:
// - Avatar upload
// - Form validation
// - Password change
// - Account settings
// - Data export
```

#### ProgressDashboard
```typescript
interface ProgressDashboardProps {
  userId: string;
}

// Features:
// - Learning statistics
// - Progress charts
// - Achievement badges
// - Streak tracking
// - Goal setting

// Components:
// - EnrolledCoursesWidget
// - ProgressOverviewWidget
// - ActivityTimeline
// - UpcomingLessons
// - AchievementsWidget
// - LearningStreakWidget
// - QuickActions
```

### 8.1. Objectives Components

#### ObjectiveCard
```typescript
interface ObjectiveCardProps {
  objective: Objective;
  onEdit?: (objective: Objective) => void;
  onDelete?: (objective: Objective) => void;
  onStatusChange?: (objective: Objective, status: Objective['status']) => void;
  onViewDetails?: (objective: Objective) => void;
}

// Features:
// - Objective progress display
// - Quick actions (edit, delete, status change)
// - Key metrics (target date, time left)
// - Priority and milestone indicators
```

#### ObjectiveForm
```typescript
interface ObjectiveFormProps {
  objective?: Objective; // For editing
  onSubmit: (objectiveData: Partial<Objective>) => void;
  onCancel: () => void;
}

// Features:
// - Form for creating and editing objectives
// - Validation for all fields
// - Milestone management
// - Measurable target definition
```

### 9. Navigation Components

#### Sidebar
```typescript
interface SidebarProps {
  open?: boolean;
  onToggle?: () => void;
  variant?: 'desktop' | 'mobile';
}

// Features:
// - Collapsible navigation
// - Active state indicators
// - User profile section
// - Course progress
// - Quick actions
```

#### Breadcrumbs
```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

// Features:
// - Dynamic breadcrumb generation
// - Click navigation
// - Overflow handling
// - Accessibility support
```

### 10. UI Components

#### SearchBar
```typescript
interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  suggestions?: string[];
}

// Features:
// - Real-time search
// - Filter dropdown
// - Search suggestions
// - Recent searches
// - Voice search (future)
```

#### FilterPanel
```typescript
interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange?: (filters: SearchFilters) => void;
  onReset?: () => void;
}

// Features:
// - Category filters
// - Price range slider
// - Rating filter
// - Level selection
// - Clear all filters
```

## Component Composition Patterns

### Higher-Order Components (HOCs)

#### withAuth
```typescript
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    // Authentication logic
    // Redirect if not authenticated
    // Loading states
  };
}
```

#### withPaywall
```typescript
function withPaywall<P extends object>(Component: React.ComponentType<P>) {
  return function PaywalledComponent(props: P & { courseId: string }) {
    // Check course access
    // Show upgrade prompt if needed
    // Handle trial access
  };
}
```

### Custom Hooks

#### useAuth
```typescript
function useAuth(): UseAuthReturn {
  // Firebase Auth integration
  // User state management
  // Authentication methods
}
```

#### useCourse
```typescript
function useCourse(courseId: string): UseCourseReturn {
  // Course data fetching
  // Progress tracking
  // Enrollment management
}
```

#### usePayment
```typescript
function usePayment(): UsePaymentReturn {
  // Mollie integration
  // Payment flow management
  // Error handling
}
```

#### useProgress
```typescript
function useProgress(userId: string, courseId?: string) {
  // Progress tracking
  // Analytics integration
  // Local storage sync
}
```

## State Management Architecture

### Zustand Store Structure
```typescript
interface AppStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Course state
  courses: Course[];
  currentCourse: Course | null;
  userCourses: Course[];

  // UI state
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];

  // Actions
  setUser: (user: User | null) => void;
  setCourses: (courses: Course[]) => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
}
```

### TanStack Query Integration
```typescript
// Query keys
export const queryKeys = {
  courses: ['courses'] as const,
  course: (id: string) => ['courses', id] as const,
  userCourses: (userId: string) => ['users', userId, 'courses'] as const,
  progress: (userId: string, courseId: string) => 
    ['users', userId, 'progress', courseId] as const,
  certificates: (userId: string) => ['users', userId, 'certificates'] as const,
};

// Query functions
export const courseQueries = {
  list: () => ({
    queryKey: queryKeys.courses,
    queryFn: fetchCourses,
  }),
  detail: (id: string) => ({
    queryKey: queryKeys.course(id),
    queryFn: () => fetchCourse(id),
  }),
};
```

## Error Handling Strategy

### Error Boundaries
```typescript
class CourseErrorBoundary extends React.Component<Props, State> {
  // Handle course-specific errors
  // Fallback UI for course failures
  // Error reporting to analytics
}

class PaymentErrorBoundary extends React.Component<Props, State> {
  // Handle payment failures
  // Retry mechanisms
  // User-friendly error messages
}
```

### Error Toast System
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Performance Optimization

### Code Splitting
- Route-based splitting for all main pages
- Component-based splitting for heavy components
- Dynamic imports for quiz and payment components

### Memoization
- React.memo for expensive list components
- useMemo for complex calculations
- useCallback for event handlers

### Lazy Loading
- Intersection Observer for course cards
- Progressive image loading
- Video player lazy initialization

This component architecture provides a scalable, maintainable foundation for the GroeimetAI platform with clear separation of concerns and reusable patterns.