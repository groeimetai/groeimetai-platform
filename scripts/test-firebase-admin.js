// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Firebase Admin configuration...\n');

// Check environment variables
const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;

console.log('Environment variables check:');
console.log(`✓ FIREBASE_PROJECT_ID: ${hasProjectId ? '✅ Set' : '❌ Missing'}`);
console.log(`✓ FIREBASE_CLIENT_EMAIL: ${hasClientEmail ? '✅ Set' : '❌ Missing'}`);
console.log(`✓ FIREBASE_PRIVATE_KEY: ${hasPrivateKey ? '✅ Set' : '❌ Missing'}`);

if (!hasProjectId || !hasClientEmail || !hasPrivateKey) {
  console.log('\n❌ Firebase Admin environment variables are missing!');
  console.log('Run: node scripts/setup-firebase-admin.js <path-to-service-account-key.json>');
  process.exit(1);
}

console.log('\n🔧 Attempting to initialize Firebase Admin...');

try {
  // Try to initialize Firebase Admin
  const { initializeApp, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  
  console.log('✅ Firebase Admin initialized successfully!');
  
  // Try to access Firestore
  console.log('\n📊 Testing Firestore connection...');
  const db = getFirestore(app);
  
  // Try to read a collection (certificates)
  db.collection('certificates')
    .limit(1)
    .get()
    .then((snapshot) => {
      console.log('✅ Firestore connection successful!');
      console.log(`   Found ${snapshot.size} certificate(s) in test query`);
      
      console.log('\n🎉 All tests passed! Firebase Admin is properly configured.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Firestore connection failed:', error.message);
      console.log('\nThis might be due to:');
      console.log('1. Network issues');
      console.log('2. Incorrect project configuration');
      console.log('3. Missing Firestore database');
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  console.log('\nCheck that your service account credentials are correct.');
  process.exit(1);
}