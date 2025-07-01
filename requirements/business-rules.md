# GroeimetAI Platform MVP - Business Rules Documentation

## 1. User Management Rules

### 1.1 User Registration
- **Email Uniqueness**: Each email address can only be associated with one account
- **Password Requirements**: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- **Email Verification**: All email registrations must be verified before account activation
- **Social Login**: Google and LinkedIn OAuth are supported; profile information is automatically populated
- **Default Role**: New users are assigned 'student' role by default
- **Profile Completion**: Basic profile information (first name, last name, timezone) is required
- **Terms Acceptance**: Users must accept Terms of Service and Privacy Policy before registration

### 1.2 Account Status Management
- **Active Status**: Required for platform access
- **Suspension Rules**: Accounts can be suspended for policy violations, payment issues, or security concerns
- **Reactivation**: Suspended accounts can be reactivated by admin approval
- **Data Retention**: Inactive accounts (no login for 365 days) are archived but not deleted
- **Deletion Request**: Users can request account deletion with 30-day cooling period

### 1.3 Authentication Rules
- **Session Management**: JWT tokens expire after 24 hours
- **Refresh Tokens**: Valid for 30 days, automatically renewed on active use
- **Failed Login Attempts**: Account locked for 30 minutes after 5 failed attempts
- **Password Reset**: Reset tokens expire after 1 hour
- **Two-Factor Authentication**: Optional for students, required for admins

## 2. Course Management Rules

### 2.1 Course Creation and Publishing
- **Draft Status**: New courses start in draft status
- **Publishing Requirements**:
  - Minimum 3 lessons
  - Course thumbnail image
  - Complete course description
  - At least one assessment (if certificate-eligible)
  - Pricing information
  - Category assignment
- **Admin Approval**: All courses require admin approval before publishing
- **Version Control**: Course updates create new versions; students access enrolled version

### 2.2 Course Enrollment Rules
- **Payment Requirement**: Paid courses require successful payment before enrollment
- **Free Courses**: Instant enrollment without payment
- **Enrollment Limits**: No limit on course enrollments per user
- **Duplicate Enrollment**: Users cannot enroll in the same course twice
- **Refund Impact**: Refunded purchases result in course access revocation after 48-hour grace period

### 2.3 Course Access Rules
- **Enrollment Requirement**: Must be enrolled to access course content
- **Sequential Access**: Lessons must be completed in order (configurable per course)
- **Preview Access**: First lesson of paid courses can be marked as free preview
- **Lifetime Access**: Course access is permanent unless revoked or refunded
- **Content Updates**: Enrolled students get access to course updates automatically

## 3. Assessment and Scoring Rules

### 3.1 Assessment Attempts
- **Default Attempts**: 3 attempts per assessment unless specified otherwise
- **Attempt Cooldown**: 24-hour cooldown between attempts after first failure
- **Progressive Scoring**: Best attempt score is recorded
- **Time Limits**: Assessments can have time limits (default: no limit)
- **Auto-Save**: Answers are automatically saved every 30 seconds
- **Submission Finality**: Once submitted, answers cannot be changed

### 3.2 Scoring Rules
- **Passing Score**: Default 80% required for certification
- **Question Types Scoring**:
  - Multiple Choice: 1 point per correct answer
  - Multiple Select: Partial credit (percentage of correct selections)
  - True/False: 1 point per correct answer
  - Short Answer: Manual grading required
  - Essay: Manual grading with rubric
  - Code: Automated testing with partial credit
- **Negative Scoring**: No negative points for incorrect answers
- **Rounding**: Scores rounded to nearest whole percentage
- **Grade Calculation**: Weighted average if multiple assessments exist

### 3.3 Assessment Security
- **Question Randomization**: Questions can be randomized per attempt
- **Answer Shuffling**: Multiple choice answers can be shuffled
- **Proctoring**: Basic browser-based proctoring (disable copy/paste, full screen)
- **Plagiarism Detection**: Text similarity checking for essay questions
- **Time Tracking**: Total time spent on assessment is recorded
- **Suspicious Activity**: Flagged attempts require manual review

## 4. Certificate Generation Rules

### 4.1 Certificate Eligibility
- **Course Completion**: All required lessons must be marked complete
- **Assessment Requirement**: Must pass final assessment with minimum score (default 80%)
- **Time Requirement**: Minimum time spent in course (configurable, default: 50% of estimated duration)
- **Payment Status**: Course must be paid for (no certificates for refunded courses)
- **Account Status**: User account must be active and in good standing

### 4.2 Certificate Generation Process
- **Automatic Generation**: Certificates generated immediately upon meeting requirements
- **Unique Identifier**: Each certificate gets unique alphanumeric ID (12 characters)
- **QR Code Generation**: QR code contains verification URL with certificate ID
- **Digital Signature**: Certificates signed with platform private key
- **Template Application**: Course-specific or default template applied
- **PDF Generation**: High-quality PDF with embedded metadata
- **Blockchain Recording**: Certificate hash recorded on blockchain for immutability

### 4.3 Certificate Validation
- **Verification URL**: Public verification endpoint for authenticity checking
- **QR Code Scanning**: QR codes link to verification page
- **Expiration Rules**: Certificates valid indefinitely unless revoked
- **Revocation Conditions**:
  - Course refund processed
  - Academic dishonesty discovered
  - Technical errors in generation
  - Course accreditation withdrawn
- **Reissuance**: Certificates can be reissued for legitimate reasons (name changes, etc.)

### 4.4 LinkedIn Integration
- **Automatic Sharing**: Option to automatically post to LinkedIn upon certificate earning
- **Credential Format**: LinkedIn professional certification format
- **Verification Link**: LinkedIn post includes verification URL
- **Privacy Settings**: Users can control LinkedIn sharing preferences
- **Profile Updates**: Certificates can be added to LinkedIn profile skills section

## 5. Payment Processing Rules

### 5.1 Payment Methods
- **Supported Methods**: Credit/debit cards, PayPal, bank transfers (EU)
- **Currency Support**: EUR, USD, GBP (primary), with automatic conversion
- **Payment Processor**: Stripe for card payments, PayPal for PayPal payments
- **Stored Payment Methods**: Users can save payment methods for future use
- **Security Compliance**: PCI DSS compliance for all payment processing

### 5.2 Pricing Rules
- **Base Currency**: EUR (European base)
- **Price Display**: Prices shown in user's local currency when possible
- **Tax Calculation**: VAT/taxes calculated based on billing address
- **Discounts**: Percentage or fixed amount discounts supported
- **Coupon Codes**: Single-use or multi-use coupons with expiration dates
- **Bundle Pricing**: Discounted pricing for multiple course purchases

### 5.3 Payment Processing Flow
1. **Cart Creation**: Items added to cart with price calculation
2. **Tax Calculation**: Taxes calculated based on billing address
3. **Payment Intent**: Stripe payment intent created
4. **Payment Confirmation**: User completes payment with Stripe
5. **Webhook Processing**: Stripe webhook confirms payment
6. **Course Enrollment**: Automatic enrollment upon payment confirmation
7. **Receipt Generation**: PDF receipt generated and emailed
8. **Failure Handling**: Failed payments retry up to 3 times

### 5.4 Refund Policy
- **Refund Window**: 30 days from purchase date
- **Refund Conditions**:
  - Less than 30% course completion
  - Technical issues preventing access
  - Course significantly different from description
  - Accidental duplicate purchase
- **Refund Process**: Automatic refund to original payment method
- **Partial Refunds**: Prorated refunds for subscription services
- **Refund Restrictions**: No refunds after course completion or certificate issuance

## 6. Content Delivery Rules

### 6.1 Video Content
- **Supported Formats**: MP4, WebM, AVI (converted to MP4/WebM)
- **Quality Levels**: 720p, 1080p, 4K (adaptive streaming)
- **Playback Controls**: Standard controls plus speed adjustment (0.5x to 2x)
- **Subtitles**: Support for multiple languages, auto-generated available
- **Download Restrictions**: Offline download for mobile apps only
- **Watermarking**: Optional watermarking with user identifier
- **Analytics**: Detailed viewing analytics (watch time, drop-off points)

### 6.2 Content Protection
- **DRM Protection**: Widevine DRM for premium content
- **Hotlink Protection**: Prevent direct linking to video files
- **Geographic Restrictions**: Content can be restricted by region
- **Session Validation**: Video URLs expire after session timeout
- **Download Limits**: Offline downloads limited to 3 devices per user
- **Sharing Prevention**: Technical measures to prevent easy sharing

### 6.3 Resource Downloads
- **File Types**: PDF, DOCX, XLSX, ZIP, code files
- **Size Limits**: 100MB per file, 1GB total per course
- **Download Tracking**: Track download counts and user access
- **Version Control**: Resources can be updated with version tracking
- **Access Control**: Downloads only available to enrolled students
- **Bandwidth Limits**: Download speed throttling during peak hours

## 7. Progress Tracking Rules

### 7.1 Progress Calculation
- **Lesson Completion**: Marked complete when user clicks "Mark Complete" or reaches video end
- **Course Progress**: Percentage based on completed lessons vs. total lessons
- **Time Tracking**: Accurate time tracking for video content and text reading
- **Resume Functionality**: Users can resume from last position
- **Offline Sync**: Offline progress synced when connection restored
- **Progress Validation**: Server-side validation of progress claims

### 7.2 Learning Streaks
- **Daily Streaks**: Consecutive days with learning activity
- **Activity Threshold**: Minimum 10 minutes of learning per day
- **Streak Rewards**: Badges and achievements for milestone streaks
- **Streak Recovery**: One "freeze" per month to maintain streak
- **Timezone Handling**: Streaks calculated in user's timezone
- **Streak Sharing**: Option to share streak achievements on social media

### 7.3 Bookmarks and Notes
- **Bookmark Limits**: 100 bookmarks per course
- **Note Length**: 500 characters per note
- **Video Timestamps**: Bookmarks can include specific video timestamps
- **Search Functionality**: Users can search through their notes
- **Export Options**: Export notes as PDF or text file
- **Privacy**: Notes are private to individual users

## 8. Quality Assurance Rules

### 8.1 Content Moderation
- **Review Process**: All user-generated content reviewed within 24 hours
- **Automated Screening**: AI-powered content screening for inappropriate material
- **Community Reporting**: Users can report inappropriate content
- **Moderation Actions**: Warning, content removal, account suspension
- **Appeal Process**: Users can appeal moderation decisions
- **Transparency**: Clear community guidelines and moderation policies

### 8.2 Course Quality Standards
- **Minimum Standards**: 
  - Audio quality: Clear, no background noise
  - Video quality: Minimum 720p resolution
  - Content accuracy: Factually correct information
  - Engagement: Interactive elements in long lessons
- **Quality Review**: New courses undergo quality review before publishing
- **Student Feedback**: Course ratings and feedback influence quality scores
- **Continuous Improvement**: Regular review and updates based on student feedback

### 8.3 Platform Performance
- **Uptime Target**: 99.9% uptime guarantee
- **Response Times**: API responses under 200ms for 95% of requests
- **Video Buffering**: Less than 5% buffering ratio for video content
- **Global CDN**: Content delivered from geographically distributed servers
- **Load Balancing**: Automatic scaling during peak usage
- **Monitoring**: Real-time monitoring with automated alerts

## 9. Data Privacy and Security Rules

### 9.1 Data Collection
- **Minimal Collection**: Only collect data necessary for platform functionality
- **Consent Management**: Clear consent for data collection and processing
- **Third-Party Sharing**: No sharing of personal data with third parties without consent
- **Analytics Data**: Anonymized analytics data for platform improvement
- **Retention Periods**: Data retention according to legal requirements and user preferences

### 9.2 Security Measures
- **Encryption**: All data encrypted in transit and at rest
- **Access Controls**: Role-based access control for all sensitive data
- **Audit Logging**: Comprehensive audit logs for all data access
- **Regular Security Audits**: Quarterly security assessments
- **Incident Response**: Documented incident response procedures
- **Compliance**: GDPR, CCPA, and other relevant privacy law compliance

### 9.3 User Rights
- **Data Access**: Users can request copies of their data
- **Data Portability**: Data provided in machine-readable format
- **Right to Deletion**: Users can request account and data deletion
- **Correction Rights**: Users can correct inaccurate personal data
- **Opt-out Rights**: Users can opt out of non-essential data processing
- **Notification**: Users notified of data breaches within 72 hours

## 10. Business Logic Validation Rules

### 10.1 Input Validation
- **Server-Side Validation**: All inputs validated on server regardless of client validation
- **Sanitization**: User inputs sanitized to prevent XSS and injection attacks
- **Length Limits**: Enforced maximum lengths for all text inputs
- **Format Validation**: Email, phone, URL format validation
- **File Upload Validation**: File type, size, and content validation
- **Rate Limiting**: API rate limiting to prevent abuse

### 10.2 Business Rule Enforcement
- **Atomic Operations**: Multi-step operations are atomic (enrollment + payment)
- **Consistency Checks**: Regular consistency checks between related data
- **Rollback Procedures**: Automatic rollback on operation failures
- **Duplicate Prevention**: Prevent duplicate operations (double payments, etc.)
- **State Management**: Proper state management for multi-step processes
- **Error Recovery**: Graceful error handling and recovery procedures

This comprehensive business rules documentation ensures consistent implementation across all platform components and provides clear guidelines for developers, testers, and administrators.