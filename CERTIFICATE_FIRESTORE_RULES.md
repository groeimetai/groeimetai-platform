# Firestore Security Rules voor Certificate System

Voeg deze regels toe aan je Firestore Security Rules:

```
// Certificates
match /certificates/{certificateId} {
  // Users can read their own certificates
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     request.auth.uid in resource.data.sharedWith);
  
  // Public verification - anyone can read if they have the certificate ID
  allow read: if true;
  
  // Only authenticated users can create certificates for themselves
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.userId &&
    request.resource.data.isValid == true;
  
  // Users can update their own certificates (for sharing)
  allow update: if request.auth != null && 
    resource.data.userId == request.auth.uid &&
    // Only allow updating certain fields
    request.resource.data.keys().hasAll(['sharedWith', 'updatedAt']) ||
    request.resource.data.keys().hasAll(['certificateUrl', 'linkedinShareUrl', 'updatedAt']);
}

// Certificate Events (for tracking)
match /certificateEvents/{eventId} {
  // Only the system can write events
  allow write: if false;
  
  // Users can read their own events
  allow read: if request.auth != null && 
    resource.data.userId == request.auth.uid;
}

// Certificate Templates (if used)
match /certificateTemplates/{templateId} {
  // Everyone can read templates
  allow read: if true;
  
  // Only admins can write templates
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// Update Users collection rules to allow certificate stats updates
match /users/{userId} {
  // ... existing rules ...
  
  // Allow users to update their own stats for certificates
  allow update: if request.auth != null && 
    request.auth.uid == userId &&
    // Only allow updating specific stats fields
    (request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['stats.certificatesEarned', 'updatedAt']) ||
     // Or other allowed fields from your existing rules
     request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['displayName', 'photoURL', 'bio', 'updatedAt']));
}

// Enrollments (for certificate eligibility check)
match /enrollments/{enrollmentId} {
  // ... existing rules if any ...
  
  // Allow reading enrollment to check completion status
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid ||
     enrollmentId.matches(request.auth.uid + '_.*'));
  
  // Allow updating progress
  allow update: if request.auth != null && 
    resource.data.userId == request.auth.uid &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['progress', 'status', 'completedAt', 'updatedAt']);
}
```

## Instructies:

1. Ga naar Firebase Console
2. Selecteer je project
3. Ga naar Firestore Database
4. Klik op "Rules" tab
5. Voeg bovenstaande regels toe aan je bestaande regels
6. **BELANGRIJK**: Pas de `users` collection regel aan om de stats update toe te staan
7. Klik op "Publish"

## Alternatieve Oplossing (Tijdelijk):

Als je snel wilt testen zonder de rules aan te passen, kun je tijdelijk deze simpele regel gebruiken voor certificates:

```
// Tijdelijke regel voor testen
match /certificates/{document=**} {
  allow read, write: if request.auth != null;
}
```

**LET OP**: Dit is NIET veilig voor productie! Gebruik alleen voor development/testing.

## Belangrijke Opmerkingen:

1. De `allow read: if true;` regel voor certificates is nodig zodat mensen certificaten kunnen verifiëren zonder in te loggen
2. De update regel voor users is belangrijk om de certificaat statistieken bij te werken
3. Voor productie moet je mogelijk extra validatie toevoegen
4. Zorg ervoor dat de certificate generation via een Cloud Function gebeurt voor betere security