# Affiliate System Usage Guide

## Overview
The affiliate system allows users to generate unique referral links for courses and earn commission on successful sales.

## Components

### 1. AffiliateLink Component
The main component for displaying and managing affiliate links.

```tsx
import { AffiliateLink } from '@/components/affiliate'

// Basic usage
<AffiliateLink 
  courseId="course-123"
  userId="user-456"
  courseName="React Mastery Course"
/>
```

### 2. AffiliatePartnerList Component
Admin component for managing affiliate partners.

```tsx
import { AffiliatePartnerList } from '@/components/affiliate'

<AffiliatePartnerList 
  partners={partners}
  onUpdateStatus={(partnerId, status) => handleUpdateStatus(partnerId, status)}
  onUpdateCommission={(partnerId, rate) => handleUpdateCommission(partnerId, rate)}
/>
```

### 3. AffiliateAdminDashboard Component
Complete admin dashboard for affiliate program management.

```tsx
import { AffiliateAdminDashboard } from '@/components/affiliate'

// In your admin page
<AffiliateAdminDashboard />
```

## Integration Steps

### 1. Course Page Integration
Add the affiliate link component to your course pages:

```tsx
import { AffiliateLink } from '@/components/affiliate'
import { useAuth } from '@/hooks/useAuth'

function CoursePage({ course }) {
  const { user } = useAuth()
  
  return (
    <div>
      {/* Course content */}
      
      {/* Affiliate section */}
      {user && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Share & Earn</h3>
          <AffiliateLink 
            courseId={course.id}
            userId={user.id}
            courseName={course.title}
          />
        </div>
      )}
    </div>
  )
}
```

### 2. User Dashboard Integration
Add affiliate stats to user dashboard:

```tsx
import { AffiliateLink } from '@/components/affiliate'

function UserDashboard({ user, enrolledCourses }) {
  return (
    <div>
      <h2>Your Affiliate Links</h2>
      {enrolledCourses.map(course => (
        <AffiliateLink 
          key={course.id}
          courseId={course.id}
          userId={user.id}
          courseName={course.title}
        />
      ))}
    </div>
  )
}
```

### 3. Admin Panel Integration
Add the admin dashboard to your admin routes:

```tsx
// app/admin/affiliates/page.tsx
import { AffiliateAdminDashboard } from '@/components/affiliate'

export default function AffiliatesAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Affiliate Program Management</h1>
      <AffiliateAdminDashboard />
    </div>
  )
}
```

## Affiliate Flow

### 1. Link Generation
- User clicks "Generate Affiliate Link"
- System creates unique 8-character code
- Link format: `/ref/{code}?course={courseId}`

### 2. Click Tracking
- When someone clicks affiliate link
- System records click in database
- Sets 30-day cookie with affiliate code

### 3. Conversion Tracking
- During checkout, system checks for affiliate cookie
- After successful payment, processes commission
- Updates affiliate stats and creates transaction record

### 4. Commission Management
- Default commission rate: 20%
- Admins can adjust rates per partner
- Transactions tracked with status (pending/paid/cancelled)

## API Endpoints

### Affiliate Redirect
`GET /ref/[code]`
- Tracks click
- Sets affiliate cookie
- Redirects to course page

### Checkout Integration
The checkout API automatically:
- Reads affiliate cookies
- Stores affiliate data with payment
- Processes conversion on successful payment

## Database Structure

### Collections
1. **affiliateLinks**
   - Stores unique affiliate links
   - Tracks clicks and conversions
   - Links users to courses

2. **affiliatePartners**
   - Partner information
   - Commission rates
   - Status management

3. **affiliateTransactions**
   - Records all conversions
   - Tracks commission amounts
   - Payment status

## Best Practices

1. **Security**
   - Always verify user authentication
   - Validate affiliate codes server-side
   - Use secure cookies for tracking

2. **Performance**
   - Cache affiliate stats where possible
   - Use indexes on affiliate code field
   - Batch process commission calculations

3. **User Experience**
   - Clear call-to-action for link generation
   - Real-time stats updates
   - Easy sharing options

4. **Compliance**
   - Clear disclosure of affiliate relationships
   - Transparent commission structure
   - GDPR-compliant cookie usage