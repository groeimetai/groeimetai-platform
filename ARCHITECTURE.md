# GroeimetAI Platform MVP - Technical Architecture

## System Overview

The GroeimetAI platform is an e-learning SaaS application built with modern web technologies, designed for scalability and user experience.

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Frontend Layer                           │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                      Next.js 14 App Router                     │ │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────┐ │ │
│  │  │   Landing     │ │   Dashboard   │ │      Course Player    │ │ │
│  │  │     Pages     │ │     Pages     │ │       & Content       │ │ │
│  │  └───────────────┘ └───────────────┘ └───────────────────────┘ │ │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────┐ │ │
│  │  │  Auth Pages   │ │ Payment Pages │ │    Certificate        │ │ │
│  │  │   & Flows     │ │   & Checkout  │ │    Management         │ │ │
│  │  └───────────────┘ └───────────────┘ └───────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                              ┌─────▼─────┐
                              │  API Layer │
                              └─────┬─────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                          Backend Services                           │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                      Firebase Platform                         │ │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────┐ │ │
│  │  │   Firebase    │ │   Firestore   │ │    Cloud Functions    │ │ │
│  │  │     Auth      │ │   Database    │ │    (Business Logic)   │ │ │
│  │  └───────────────┘ └───────────────┘ └───────────────────────┘ │ │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────┐ │ │
│  │  │    Cloud      │ │   Firebase    │ │       Firebase        │ │ │
│  │  │   Storage     │ │   Security    │ │      Extensions       │ │ │
│  │  └───────────────┘ └───────────────┘ └───────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                       ┌────────────┼────────────┐
                       │            │            │
                 ┌─────▼─────┐ ┌───▼────┐ ┌────▼────┐
                 │   Mollie  │ │  QR     │ │  Email  │
                 │  Payment  │ │ Code    │ │ Service │
                 │  Gateway  │ │ Service │ │ (SMTP)  │
                 └───────────┘ └────────┘ └─────────┘
```

## Core Architecture Principles

1. **Serverless-First**: Leverage Firebase Functions for backend logic
2. **TypeScript-First**: Type safety throughout the application
3. **Component-Based**: Reusable React components with clear interfaces
4. **Security-by-Design**: Firebase Security Rules and authentication flows
5. **Payment-Secure**: PCI-compliant payment processing with Mollie
6. **Certificate-Verified**: QR code-based certificate verification system

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand + TanStack Query
- **Authentication**: Firebase Auth SDK
- **Payment UI**: Mollie Components

### Backend
- **Platform**: Firebase
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Functions**: Cloud Functions (Node.js/TypeScript)
- **Storage**: Cloud Storage
- **Security**: Firebase Security Rules

### External Services
- **Payments**: Mollie Payment API
- **QR Codes**: QR code generation libraries
- **Email**: Firebase Extensions (SMTP)
- **CDN**: Firebase Hosting

## Data Architecture

### User Entity
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'instructor' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    phone?: string;
  };
  subscription: {
    status: 'active' | 'inactive' | 'trial';
    plan: string;
    validUntil: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Course Entity
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    uid: string;
    name: string;
    avatar?: string;
  };
  content: {
    modules: Module[];
    totalDuration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  pricing: {
    amount: number;
    currency: 'EUR';
    discount?: {
      percentage: number;
      validUntil: Timestamp;
    };
  };
  metadata: {
    tags: string[];
    category: string;
    language: string;
    published: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}
```

### Certificate Entity
```typescript
interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  qrCode: {
    code: string;
    verificationUrl: string;
    generatedAt: Timestamp;
  };
  completion: {
    completedAt: Timestamp;
    score?: number;
    duration: number;
  };
  validation: {
    isValid: boolean;
    expiresAt?: Timestamp;
  };
}
```

### Enrollment Entity
```typescript
interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // percentage 0-100
  completedLessons?: string[];
  currentLessonId?: string;
  enrolledAt: Timestamp;
  completedAt?: Timestamp;
}
```

## Security Architecture

### Authentication Flows
1. **Email/Password** with email verification
2. **Social Login** (Google, Facebook, LinkedIn)
3. **Password Reset** with secure token-based flow
4. **Two-Factor Authentication** (optional)

### Authorization Levels
- **Public**: Landing pages, course previews
- **Authenticated**: Dashboard, profile, purchased courses
- **Premium**: Full course access, certificates
- **Admin**: Content management, user management

### Data Security
- Firestore Security Rules for fine-grained access control
- HTTPS-only communication
- Input validation and sanitization
- Rate limiting on sensitive operations

## Payment Architecture

### Mollie Integration Flow
```
User Selection → Course Checkout → Mollie Payment → Webhook Verification → Access Grant
```

1. **Payment Creation**: Secure payment intent with Mollie
2. **Payment Processing**: Redirect to Mollie hosted payment page
3. **Webhook Handling**: Server-side payment verification
4. **Access Control**: Update user permissions in Firestore
5. **Receipt Generation**: Email confirmation and receipt

## Certificate System Architecture

### QR Code Generation
1. **Completion Trigger**: Course completion detected
2. **Certificate Creation**: Generate unique certificate ID
3. **QR Code Generation**: Create verifiable QR code
4. **Storage**: Store certificate data in Firestore
5. **Distribution**: Email certificate to user

### Verification System
1. **QR Code Scan**: Mobile/web QR scanner
2. **Verification API**: Cloud Function validates certificate
3. **Response**: Return certificate details and validity
4. **Audit Trail**: Log all verification attempts

## Performance Architecture

### Frontend Optimization
- **Code Splitting**: Route-based and component-based
- **Image Optimization**: Next.js Image component
- **Caching**: SWR/TanStack Query for API responses
- **CDN**: Firebase Hosting with global CDN

### Backend Optimization
- **Firestore Indexing**: Optimized queries
- **Caching**: Cloud Functions response caching
- **Connection Pooling**: Efficient database connections
- **Background Jobs**: Async processing for heavy operations

## Deployment Architecture

### Development Environment
- **Local Development**: Firebase Emulator Suite
- **Hot Reload**: Next.js development server
- **Type Checking**: Real-time TypeScript validation

### Production Environment
- **Hosting**: Firebase Hosting
- **Functions**: Cloud Functions deployment
- **Database**: Firestore production instance
- **Monitoring**: Firebase Performance Monitoring

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Firebase Crashlytics
- **Performance**: Firebase Performance Monitoring
- **Analytics**: Firebase Analytics
- **Logging**: Cloud Functions logs

### Business Metrics
- **User Engagement**: Course completion rates
- **Payment Success**: Transaction monitoring
- **Certificate Validity**: Verification rates

This architecture provides a robust, scalable foundation for the GroeimetAI platform MVP while maintaining security, performance, and user experience standards.