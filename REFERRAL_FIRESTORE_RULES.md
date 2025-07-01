# Firestore Security Rules voor Referral System

Voeg deze regels toe aan je Firestore Security Rules:

```
// Referral Programs
match /referralPrograms/{userId} {
  // Users can read and create their own referral program
  allow read: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null && request.auth.uid == userId;
  allow update: if request.auth != null && request.auth.uid == userId;
  
  // Allow reading referral programs by referral code (for signup process)
  allow read: if request.auth != null;
}

// Discounts
match /discounts/{discountCode} {
  // Only authenticated users can read discounts
  allow read: if request.auth != null;
  // Only the system (via Admin SDK) can create/update discounts
  allow write: if false;
}

// Course Access (for trial lessons)
match /courseAccess/{accessId} {
  // Users can read their own course access
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     accessId.matches(request.auth.uid + '_.*'));
  // Only the system (via Admin SDK) can create/update course access
  allow write: if false;
}
```

## Instructies:

1. Ga naar Firebase Console
2. Selecteer je project
3. Ga naar Firestore Database
4. Klik op "Rules" tab
5. Voeg bovenstaande regels toe aan je bestaande regels
6. Klik op "Publish"

## Let op:

- De `allow write: if false` regels betekenen dat alleen server-side code (via Admin SDK) deze documenten kan aanmaken/updaten
- Dit voorkomt dat gebruikers zelf kortingscodes of gratis toegang kunnen aanmaken
- Voor productie moet je mogelijk extra validatie toevoegen