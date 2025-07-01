#!/usr/bin/env node
/**
 * Script to sync video progress to enrollments and generate missing certificates
 * This fixes the issue where courses were completed but certificates weren't generated
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
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { EnrollmentService } from '../src/services/enrollmentService.ts'
import { CertificateService } from '../src/services/certificateService.ts'
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

async function syncProgressAndGenerateCertificates(userEmail, userPassword) {
  try {
    // Sign in
    console.log('🔐 Signing in...')
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword)
    const userId = userCredential.user.uid
    console.log('✅ Signed in as:', userEmail)
    
    // Get all enrollments for the user
    console.log('\\n📚 Fetching enrollments...')
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    )
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
    
    console.log(`Found ${enrollmentsSnapshot.size} enrollments`)
    
    for (const enrollmentDoc of enrollmentsSnapshot.docs) {
      const enrollment = { id: enrollmentDoc.id, ...enrollmentDoc.data() }
      console.log(`\\n📖 Processing course: ${enrollment.courseId}`)
      
      // Get video progress for this course
      const progressQuery = query(
        collection(db, 'videoProgress'),
        where('userId', '==', userId),
        where('courseId', '==', enrollment.courseId),
        where('completed', '==', true)
      )
      const progressSnapshot = await getDocs(progressQuery)
      
      const completedLessons = progressSnapshot.docs.map(doc => doc.data().lessonId)
      console.log(`  - Found ${completedLessons.length} completed lessons from video progress`)
      
      // Get course to determine total lessons
      const courseDoc = await getDoc(doc(db, 'courses', enrollment.courseId))
      if (!courseDoc.exists()) {
        console.log(`  ❌ Course ${enrollment.courseId} not found`)
        continue
      }
      
      const courseData = courseDoc.data()
      
      // Import course content to get lesson structure
      try {
        const { getCourseWithContent } = await import('../src/lib/data/course-loader.ts')
        const courseWithContent = await getCourseWithContent(enrollment.courseId)
        
        if (!courseWithContent || !courseWithContent.modules) {
          console.log(`  ⚠️  No content found for course ${enrollment.courseId}`)
          continue
        }
        
        // Get all lesson IDs
        const allLessonIds = courseWithContent.modules.flatMap(module => 
          module.lessons.map(lesson => lesson.id)
        )
        
        console.log(`  - Course has ${allLessonIds.length} total lessons`)
        
        // Sync completed lessons to enrollment
        let needsUpdate = false
        const currentCompletedLessons = enrollment.completedLessons || []
        
        for (const lessonId of completedLessons) {
          if (!currentCompletedLessons.includes(lessonId)) {
            needsUpdate = true
          }
        }
        
        if (needsUpdate) {
          console.log(`  - Syncing ${completedLessons.length} completed lessons to enrollment`)
          
          // Update enrollment with all completed lessons
          const updatedCompletedLessons = [...new Set([...currentCompletedLessons, ...completedLessons])]
          const progress = Math.round((updatedCompletedLessons.length / allLessonIds.length) * 100)
          
          await updateDoc(doc(db, 'enrollments', enrollment.id), {
            completedLessons: updatedCompletedLessons,
            progress: progress,
            lastAccessedAt: serverTimestamp()
          })
          
          console.log(`  ✅ Updated enrollment progress to ${progress}%`)
          
          // Check if course is complete
          if (progress === 100 && !enrollment.completedAt) {
            console.log(`  🎉 Course is complete! Marking as completed...`)
            await updateDoc(doc(db, 'enrollments', enrollment.id), {
              completedAt: serverTimestamp(),
              status: 'completed'
            })
            
            // Generate certificate
            console.log(`  🎓 Generating certificate...`)
            try {
              const certificateId = await CertificateService.generateCertificateForCourseCompletion(
                userId,
                enrollment.courseId
              )
              console.log(`  ✅ Certificate generated with ID: ${certificateId}`)
            } catch (certError) {
              console.error(`  ❌ Error generating certificate:`, certError.message)
            }
          }
        } else if (enrollment.progress === 100 && enrollment.completedAt) {
          // Check if certificate exists
          const existingCert = await CertificateService.getUserCourseCertificate(userId, enrollment.courseId)
          if (!existingCert) {
            console.log(`  🎓 Course already complete but missing certificate. Generating...`)
            try {
              const certificateId = await CertificateService.generateCertificateForCourseCompletion(
                userId,
                enrollment.courseId
              )
              console.log(`  ✅ Certificate generated with ID: ${certificateId}`)
            } catch (certError) {
              console.error(`  ❌ Error generating certificate:`, certError.message)
            }
          } else {
            console.log(`  ✅ Certificate already exists`)
          }
        } else {
          console.log(`  ℹ️  No updates needed (${enrollment.progress || 0}% complete)`)
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing course ${enrollment.courseId}:`, error.message)
      }
    }
    
    console.log('\\n✨ Done! All progress synced and certificates generated.')
    
  } catch (error) {
    console.error('Fatal error:', error)
  }
}

// Get user credentials from command line
const userEmail = process.argv[2]
const userPassword = process.argv[3]

if (!userEmail || !userPassword) {
  console.log('Usage: node sync-progress-and-generate-certificates.js <email> <password>')
  process.exit(1)
}

// Run the sync
syncProgressAndGenerateCertificates(userEmail, userPassword)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })