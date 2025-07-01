# Gecorrigeerde Firestore Security Rules

Vervang je huidige rules met deze gecorrigeerde versie:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users can read/write their own user document
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) && (
        // Allow updating stats for certificates
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['stats', 'updatedAt']) ||
        // Or other profile fields
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['displayName', 'photoURL', 'bio', 'updatedAt'])
      );
    }
    
    // Courses - anyone authenticated can read
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admins via Admin SDK
    }
    
    // Enrollments - users can only access their own
    match /enrollments/{enrollmentId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        enrollmentId == request.auth.uid + '_' + resource.data.courseId ||
        enrollmentId.matches(request.auth.uid + '_.*')
      );
      
      // Allow creating enrollment (needed for trial access)
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        enrollmentId.matches(request.auth.uid + '_.*');
      
      // Allow updating progress
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Payments - users can only read their own
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false; // Only server-side writes
    }
    
    // Video Progress - FIXED RULES
    match /videoProgress/{progressId} {
      // Read: check if user owns it
      allow read: if isAuthenticated() && (
        progressId.matches(request.auth.uid + '_.*') ||
        (resource != null && resource.data.userId == request.auth.uid)
      );
      
      // Create: check the userId in the new data
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        progressId.matches(request.auth.uid + '_.*');
      
      // Update: check if user owns the existing document
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Course Progress - FIXED RULES
    match /courseProgress/{progressId} {
      // Read: check if user owns it
      allow read: if isAuthenticated() && (
        progressId.matches(request.auth.uid + '_.*') ||
        (resource != null && resource.data.userId == request.auth.uid)
      );
      
      // Create: check the userId in the new data
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        progressId.matches(request.auth.uid + '_.*');
      
      // Update: check if user owns the existing document
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Objectives/Doelstellingen
    match /objectives/{objectiveId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Objective Progress
    match /objective_progress/{progressId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Assessment Attempts
    match /assessmentAttempts/{attemptId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Certificates - SINGLE RULE SET
    match /certificates/{certificateId} {
      // Public read for verification
      allow read: if true;
      
      // Users can create their own certificates
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.isValid == true;
      
      // Users can update their own certificates (limited fields)
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['sharedWith', 'certificateUrl', 'linkedinShareUrl', 'updatedAt']);
    }
    
    // Certificate Events
    match /certificateEvents/{eventId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false; // Only system writes
    }
    
    // Referral Programs
    match /referralPrograms/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Discounts
    match /discounts/{discountCode} {
      allow read: if isAuthenticated();
      allow write: if false; // Only system writes
    }
    
    // Course Access (for trial lessons)
    match /courseAccess/{accessId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        accessId.matches(request.auth.uid + '_.*')
      );
      allow write: if false; // Only system writes
    }
    
    // Admin collections - no access except via Admin SDK
    match /admin/{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Belangrijkste fixes:

1. **VideoProgress & CourseProgress**: 
   - Aparte rules voor `create` en `update`
   - Bij create: check `request.resource.data.userId`
   - Bij update: check `resource.data.userId`

2. **Verwijderde duplicates**:
   - Slechts één set rules per collection
   - Duidelijke scheiding tussen create/update/read

3. **Enrollment fix**:
   - Allow create voor trial access
   - Betere pattern matching

## Stappen:
1. Kopieer de complete rules hierboven
2. Ga naar Firebase Console → Firestore → Rules
3. Vervang ALLE huidige rules met deze nieuwe
4. Klik op "Publish"

Dit zou alle permission errors moeten oplossen!