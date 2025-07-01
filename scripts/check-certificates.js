#!/usr/bin/env node
/**
 * Script to check certificates in the database
 */

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function checkCertificates(userEmail, userPassword, certificateId) {
  try {
    // Sign in
    console.log('🔐 Signing in...')
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword)
    const userId = userCredential.user.uid
    console.log('✅ Signed in as:', userEmail)
    
    if (certificateId) {
      // Check specific certificate
      console.log(`\n🔍 Looking for certificate with ID: ${certificateId}`)
      
      const certificateRef = doc(db, 'certificates', certificateId)
      const certificateDoc = await getDoc(certificateRef)
      
      if (certificateDoc.exists()) {
        console.log('✅ Certificate found!')
        console.log('Certificate data:', JSON.stringify(certificateDoc.data(), null, 2))
      } else {
        console.log('❌ Certificate not found with this ID')
      }
    }
    
    // Get all certificates for the user
    console.log(`\n📚 Fetching all certificates for user...`)
    const certificatesQuery = query(
      collection(db, 'certificates'),
      where('userId', '==', userId)
    )
    const certificatesSnapshot = await getDocs(certificatesQuery)
    
    console.log(`\nFound ${certificatesSnapshot.size} certificates for this user:`)
    
    certificatesSnapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`\n📜 Certificate ID: ${doc.id}`)
      console.log(`   Course: ${data.courseName}`)
      console.log(`   Date: ${data.completionDate?.toDate ? data.completionDate.toDate() : data.completionDate}`)
      console.log(`   Grade: ${data.grade || 'N/A'}`)
      console.log(`   Score: ${data.score || 'N/A'}%`)
      console.log(`   Valid: ${data.isValid}`)
      console.log(`   Certificate Number: ${data.certificateNumber || 'N/A'}`)
    })
    
    if (certificatesSnapshot.size === 0) {
      console.log('\n💡 No certificates found. Have you completed any courses?')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Get arguments
const userEmail = process.argv[2]
const userPassword = process.argv[3]
const certificateId = process.argv[4]

if (!userEmail || !userPassword) {
  console.log('Usage: node check-certificates.js <email> <password> [certificateId]')
  console.log('Example: node check-certificates.js user@example.com password123')
  console.log('Example with ID: node check-certificates.js user@example.com password123 5wlcgAFT6pZjUlE1dCQ1')
  process.exit(1)
}

// Run the check
checkCertificates(userEmail, userPassword, certificateId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })