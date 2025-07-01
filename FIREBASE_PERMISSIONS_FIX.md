# Firebase Permissions Fix

## Het probleem

Je krijgt de error: `FirebaseError: Missing or insufficient permissions`

Dit komt omdat de Firebase Firestore security rules niet correct zijn ingesteld.

## Oplossing

### Optie 1: Tijdelijke oplossing voor development (NIET voor productie!)

1. Ga naar Firebase Console: https://console.firebase.google.com
2. Selecteer je project
3. Ga naar **Firestore Database** → **Rules**
4. Vervang de rules tijdelijk met:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tijdelijk alles toestaan voor development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Klik op **Publish**

### Optie 2: Veilige oplossing (aanbevolen)

Update je Firestore rules met:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Gebruikers kunnen hun eigen data lezen/schrijven
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Iedereen kan cursussen lezen
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Ingeschreven gebruikers kunnen enrollments lezen
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.admin == true);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if false;
    }
    
    // Instructeurs kunnen hun eigen cursussen beheren
    match /instructors/{instructorId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == instructorId;
    }
  }
}
```

### Optie 3: Disable de instructor check tijdelijk

Als je alleen wilt testen zonder auth, kun je de instructor check uitschakelen in de code:

1. Zoek naar de code die `instructor status` checkt
2. Comment deze tijdelijk uit of return een dummy response

## Voor productie

Voor productie moet je:
1. Proper authentication implementeren
2. Security rules correct instellen
3. Admin roles toewijzen aan instructeurs
4. Alle test rules verwijderen

## Andere Firebase gerelateerde fixes

Als je Firebase helemaal wilt uitschakelen voor nu:
1. Comment alle Firebase imports uit
2. Mock de authentication service
3. Focus op de chatbot functionaliteit eerst