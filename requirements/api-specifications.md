# GroeimetAI Platform MVP - API Specifications

## Base Configuration

- **Base URL**: `https://api.groeimetai.com/v1`
- **Authentication**: Bearer token (Firebase JWT)
- **Content-Type**: `application/json`
- **Rate Limiting**: 100 requests/minute per user, 1000/minute for admins

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": any,
  "error": {
    "code": string,
    "message": string,
    "details": any
  },
  "metadata": {
    "timestamp": string,
    "requestId": string,
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "hasNext": boolean,
      "hasPrev": boolean
    }
  }
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "displayName": "string",
  "role": "student",
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "profession": "string",
    "learningGoals": ["string"],
    "timezone": "string"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": "User",
    "token": "string",
    "refreshToken": "string"
  }
}
```

### POST /auth/login
Authenticate user and get access token

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": "User",
    "token": "string",
    "refreshToken": "string",
    "expiresIn": "number"
  }
}
```

### POST /auth/social
Social authentication (Google, LinkedIn)

**Request Body:**
```json
{
  "provider": "google | linkedin",
  "accessToken": "string",
  "idToken": "string"
}
```

### POST /auth/logout
Logout user and invalidate tokens

### POST /auth/refresh
Refresh access token

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

### POST /auth/forgot-password
Send password reset email

**Request Body:**
```json
{
  "email": "string"
}
```

### POST /auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

## User Management Endpoints

### GET /users/profile
Get current user profile

**Response (200):**
```json
{
  "success": true,
  "data": "User"
}
```

### PUT /users/profile
Update user profile

**Request Body:**
```json
{
  "profile": "UserProfile",
  "preferences": "UserPreferences"
}
```

### GET /users/{userId}/progress
Get user's learning progress

**Query Parameters:**
- `courseId` (optional): Filter by specific course

**Response (200):**
```json
{
  "success": true,
  "data": {
    "progress": ["UserProgress"],
    "statistics": {
      "totalCoursesEnrolled": "number",
      "coursesCompleted": "number",
      "certificatesEarned": "number",
      "totalTimeSpent": "number",
      "currentStreak": "number"
    }
  }
}
```

### POST /users/{userId}/enroll
Enroll user in a course (admin only)

**Request Body:**
```json
{
  "courseId": "string"
}
```

## Course Management Endpoints

### GET /courses
Get list of courses with filtering and pagination

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `category`: Filter by category
- `level`: Filter by difficulty level
- `price`: Filter by price range (free, paid, min-max)
- `search`: Search in title and description
- `sort`: Sort by (popularity, rating, newest, price)
- `published`: Filter published courses only (default: true)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": ["Course"],
    "categories": ["CourseCategory"],
    "filters": {
      "levels": ["string"],
      "priceRange": {
        "min": "number",
        "max": "number"
      }
    }
  },
  "metadata": {
    "pagination": "PaginationInfo"
  }
}
```

### GET /courses/{courseId}
Get detailed course information

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course": "Course",
    "lessons": ["Lesson"],
    "instructor": "User",
    "reviews": {
      "average": "number",
      "count": "number",
      "distribution": {
        "5": "number",
        "4": "number",
        "3": "number",
        "2": "number",
        "1": "number"
      }
    },
    "isEnrolled": "boolean",
    "progress": "UserProgress | null"
  }
}
```

### POST /courses
Create new course (admin only)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "shortDescription": "string",
  "category": "string",
  "level": "beginner | intermediate | advanced",
  "price": "number",
  "currency": "string",
  "tags": ["string"],
  "skills": ["string"],
  "prerequisites": ["string"],
  "thumbnailURL": "string",
  "certificateRequirements": "CertificateRequirements"
}
```

### PUT /courses/{courseId}
Update course (admin only)

### DELETE /courses/{courseId}
Delete course (admin only)

### POST /courses/{courseId}/publish
Publish course (admin only)

### POST /courses/{courseId}/unpublish
Unpublish course (admin only)

## Lesson Management Endpoints

### GET /courses/{courseId}/lessons
Get course lessons

**Response (200):**
```json
{
  "success": true,
  "data": {
    "lessons": ["Lesson"],
    "totalDuration": "number"
  }
}
```

### GET /lessons/{lessonId}
Get lesson details and content

**Response (200):**
```json
{
  "success": true,
  "data": {
    "lesson": "Lesson",
    "nextLesson": "Lesson | null",
    "previousLesson": "Lesson | null",
    "userProgress": "LessonProgress | null"
  }
}
```

### POST /lessons
Create new lesson (admin only)

**Request Body:**
```json
{
  "courseId": "string",
  "title": "string",
  "description": "string",
  "type": "video | text | quiz | assignment | resource",
  "content": "LessonContent",
  "estimatedDuration": "number",
  "order": "number",
  "isFree": "boolean",
  "isRequired": "boolean"
}
```

### PUT /lessons/{lessonId}
Update lesson (admin only)

### DELETE /lessons/{lessonId}
Delete lesson (admin only)

### POST /lessons/{lessonId}/complete
Mark lesson as completed

**Request Body:**
```json
{
  "timeSpent": "number",
  "videoProgress": "number",
  "lastWatchedPosition": "number"
}
```

## Assessment Endpoints

### GET /courses/{courseId}/assessments
Get course assessments

### GET /assessments/{assessmentId}
Get assessment details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assessment": "Assessment",
    "userAttempts": ["AssessmentAttempt"],
    "attemptsRemaining": "number",
    "bestScore": "number | null"
  }
}
```

### POST /assessments/{assessmentId}/start
Start new assessment attempt

**Response (201):**
```json
{
  "success": true,
  "data": {
    "attemptId": "string",
    "questions": ["AssessmentQuestion"],
    "timeLimit": "number",
    "startedAt": "string"
  }
}
```

### PUT /assessments/{assessmentId}/attempts/{attemptId}
Submit assessment answers

**Request Body:**
```json
{
  "answers": ["AssessmentAnswer"],
  "timeSpent": "number"
}
```

### GET /assessments/{assessmentId}/attempts/{attemptId}/results
Get assessment results

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attempt": "AssessmentAttempt",
    "passed": "boolean",
    "certificateEligible": "boolean",
    "feedback": "string",
    "correctAnswers": ["AssessmentAnswer"] // Only if configured
  }
}
```

## Payment Endpoints

### POST /payments/create-intent
Create payment intent for course purchase

**Request Body:**
```json
{
  "items": ["PaymentItem"],
  "billingAddress": "BillingAddress",
  "couponCode": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "paymentIntent": {
      "id": "string",
      "clientSecret": "string",
      "amount": "number",
      "currency": "string"
    },
    "payment": "Payment"
  }
}
```

### POST /payments/{paymentId}/confirm
Confirm payment after successful processing

**Request Body:**
```json
{
  "paymentIntentId": "string",
  "paymentMethodId": "string"
}
```

### GET /payments
Get user's payment history

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by payment status

### GET /payments/{paymentId}
Get payment details

### POST /payments/{paymentId}/refund
Process refund (admin only)

**Request Body:**
```json
{
  "amount": "number",
  "reason": "string"
}
```

## Certificate Endpoints

### GET /certificates
Get user's certificates

**Response (200):**
```json
{
  "success": true,
  "data": {
    "certificates": ["Certificate"]
  }
}
```

### GET /certificates/{certificateId}
Get certificate details

### GET /certificates/{certificateId}/download
Download certificate PDF

**Response:** PDF binary data

### POST /certificates/{certificateId}/share-linkedin
Share certificate on LinkedIn

**Request Body:**
```json
{
  "accessToken": "string",
  "message": "string"
}
```

### GET /certificates/verify/{certificateNumber}
Verify certificate authenticity (public endpoint)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "certificate": "Certificate",
    "isValid": "boolean",
    "verificationDetails": {
      "studentName": "string",
      "courseName": "string",
      "issueDate": "string",
      "score": "number"
    }
  }
}
```

## Progress Tracking Endpoints

### POST /progress/bookmark
Create bookmark

**Request Body:**
```json
{
  "lessonId": "string",
  "timestamp": "number",
  "note": "string"
}
```

### GET /progress/bookmarks
Get user bookmarks

### DELETE /progress/bookmarks/{bookmarkId}
Delete bookmark

### POST /progress/notes
Create note

**Request Body:**
```json
{
  "lessonId": "string",
  "content": "string",
  "timestamp": "number"
}
```

### GET /progress/notes
Get user notes

### PUT /progress/notes/{noteId}
Update note

### DELETE /progress/notes/{noteId}
Delete note

## Review and Rating Endpoints

### GET /courses/{courseId}/reviews
Get course reviews

**Query Parameters:**
- `page`, `limit`: Pagination
- `rating`: Filter by rating
- `sort`: Sort by (newest, oldest, helpful)

### POST /courses/{courseId}/reviews
Create course review

**Request Body:**
```json
{
  "rating": "number",
  "title": "string",
  "content": "string"
}
```

### PUT /reviews/{reviewId}
Update review

### DELETE /reviews/{reviewId}
Delete review

### POST /reviews/{reviewId}/helpful
Mark review as helpful

### POST /reviews/{reviewId}/report
Report inappropriate review

## Notification Endpoints

### GET /notifications
Get user notifications

**Query Parameters:**
- `page`, `limit`: Pagination
- `unread`: Filter unread notifications

### PUT /notifications/{notificationId}/read
Mark notification as read

### PUT /notifications/read-all
Mark all notifications as read

### DELETE /notifications/{notificationId}
Delete notification

## Admin Endpoints

### GET /admin/users
Get all users (admin only)

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role
- `status`: Filter by status
- `search`: Search by name or email

### PUT /admin/users/{userId}/status
Update user status (admin only)

**Request Body:**
```json
{
  "isActive": "boolean",
  "reason": "string"
}
```

### GET /admin/analytics/dashboard
Get admin dashboard analytics

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": "number",
      "totalCourses": "number",
      "totalRevenue": "number",
      "monthlyRevenue": "number"
    },
    "userMetrics": {
      "newUsersThisMonth": "number",
      "activeUsers": "number",
      "retentionRate": "number"
    },
    "courseMetrics": {
      "mostPopularCourses": ["Course"],
      "averageCompletion": "number",
      "totalEnrollments": "number"
    },
    "revenueMetrics": {
      "monthlyRevenue": ["MonthlyRevenue"],
      "topPayingUsers": ["User"]
    }
  }
}
```

### GET /admin/analytics/courses/{courseId}
Get course-specific analytics

### GET /admin/payments
Get all payments (admin only)

### POST /admin/courses/{courseId}/bulk-enroll
Bulk enroll users in course

**Request Body:**
```json
{
  "userIds": ["string"],
  "sendNotification": "boolean"
}
```

## File Upload Endpoints

### POST /upload/video
Upload video file (admin only)

**Request:** Multipart form data
- `file`: Video file
- `lessonId`: Associated lesson ID

**Response (201):**
```json
{
  "success": true,
  "data": {
    "fileURL": "string",
    "duration": "number",
    "processingStatus": "pending | processing | completed | failed"
  }
}
```

### POST /upload/resource
Upload lesson resource

**Request:** Multipart form data
- `file`: Resource file
- `lessonId`: Associated lesson ID
- `title`: Resource title
- `description`: Resource description

### POST /upload/image
Upload image (thumbnails, avatars, etc.)

### GET /upload/status/{uploadId}
Check upload processing status

## Webhook Endpoints

### POST /webhooks/stripe
Stripe payment webhook

### POST /webhooks/video-processing
Video processing completion webhook

## Error Codes

Standard HTTP status codes are used along with custom error codes:

- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Insufficient permissions
- `COURSE_001`: Course not found
- `COURSE_002`: Course not published
- `COURSE_003`: Already enrolled
- `PAYMENT_001`: Payment processing failed
- `PAYMENT_002`: Insufficient funds
- `ASSESS_001`: Assessment not available
- `ASSESS_002`: No attempts remaining
- `ASSESS_003`: Time limit exceeded
- `CERT_001`: Certificate not earned
- `CERT_002`: Invalid certificate
- `UPLOAD_001`: File too large
- `UPLOAD_002`: Invalid file type
- `RATE_001`: Rate limit exceeded
- `VALID_001`: Validation error

## Rate Limiting

- **Students**: 100 requests/minute
- **Admins**: 1000 requests/minute
- **File uploads**: 10 requests/minute
- **Payment endpoints**: 20 requests/minute

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when window resets

## Caching Strategy

- **Course listings**: Cache for 5 minutes
- **Course content**: Cache for 1 hour
- **User progress**: Real-time (no cache)
- **Static assets**: Cache for 24 hours
- **Certificates**: Cache for 1 hour

## Security Considerations

- All endpoints require HTTPS
- Authentication required except for public endpoints
- Input validation on all requests
- Rate limiting to prevent abuse
- CORS configured for web clients
- File upload restrictions (type, size)
- SQL injection prevention
- XSS protection
- CSRF tokens for state-changing operations