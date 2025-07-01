const fs = require('fs');
const path = require('path');

// Get service account file path from command line
const serviceAccountPath = process.argv[2];

if (!serviceAccountPath) {
  console.error(`
❌ Gebruik: node scripts/setup-firebase-admin.js <path-to-service-account-key.json>

Voorbeeld:
  node scripts/setup-firebase-admin.js ~/Downloads/groeimetai-firebase-adminsdk.json

Stappen om service account key te krijgen:
1. Ga naar https://console.firebase.google.com
2. Selecteer je project
3. Project Settings → Service accounts
4. Generate new private key
5. Download het JSON bestand
`);
  process.exit(1);
}

try {
  // Read service account file
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  // Extract required fields
  const projectId = serviceAccount.project_id;
  const clientEmail = serviceAccount.client_email;
  const privateKey = serviceAccount.private_key;
  
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Service account bestand mist required fields');
  }
  
  // Create .env.local content
  const envContent = `# Firebase Admin SDK
FIREBASE_PROJECT_ID="${projectId}"
FIREBASE_CLIENT_EMAIL="${clientEmail}"
FIREBASE_PRIVATE_KEY="${privateKey}"
`;
  
  // Write to .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Check if .env.local exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local bestaat al!');
    
    // Check if Firebase Admin vars already exist
    const existingContent = fs.readFileSync(envPath, 'utf8');
    if (existingContent.includes('FIREBASE_PROJECT_ID') || existingContent.includes('FIREBASE_CLIENT_EMAIL') || existingContent.includes('FIREBASE_PRIVATE_KEY')) {
      console.log('Firebase Admin variables bestaan al in .env.local');
      console.log('Wil je ze overschrijven? (y/n)');
      
      process.stdin.on('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        if (answer === 'y') {
          // Remove existing Firebase Admin vars
          const updatedContent = existingContent
            .split('\n')
            .filter(line => !line.startsWith('FIREBASE_PROJECT_ID') && !line.startsWith('FIREBASE_CLIENT_EMAIL') && !line.startsWith('FIREBASE_PRIVATE_KEY'))
            .join('\n');
          
          fs.writeFileSync(envPath, updatedContent + '\n' + envContent);
          console.log('✅ Firebase Admin variables bijgewerkt in .env.local');
        } else {
          console.log('❌ Setup geannuleerd');
        }
        process.exit(0);
      });
      return;
    } else {
      // Append to existing file
      fs.appendFileSync(envPath, '\n' + envContent);
      console.log('✅ Firebase Admin variables toegevoegd aan .env.local');
    }
  } else {
    // Create new file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local aangemaakt met Firebase Admin credentials');
  }
  
  // Show success message and next steps
  console.log(`
🎉 Setup succesvol!

📋 Voor Google Cloud Run deployment, voeg deze environment variables toe:

FIREBASE_PROJECT_ID="${projectId}"
FIREBASE_CLIENT_EMAIL="${clientEmail}"
FIREBASE_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"

⚠️  BELANGRIJK:
1. Voeg .env.local toe aan je .gitignore (als het er nog niet in staat)
2. Deel NOOIT je private key publiekelijk
3. Start je development server opnieuw: npm run dev

🧪 Test of het werkt:
- Check de console logs voor "Firebase Admin initialized successfully"
- Of ga naar: http://localhost:3000/certificate/verify/[CERTIFICATE_ID]
`);
  
  // Check if .env.local is in .gitignore
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('.env.local')) {
      console.log('\n⚠️  WAARSCHUWING: .env.local staat niet in .gitignore!');
      console.log('Voeg het toe om te voorkomen dat je credentials per ongeluk commit.');
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nZorg ervoor dat je het juiste service account JSON bestand gebruikt.');
  process.exit(1);
}