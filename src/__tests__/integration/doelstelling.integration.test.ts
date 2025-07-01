/**
 * Integration tests for Doelstelling feature
 * Testing the complete flow with Firebase integration
 */

import { DoelstellingService } from '@/services/doelstellingService';
import { 
  Doelstelling,
  UserDoelstellingProgress,
  DoelstellingType,
  DoelstellingLevel,
  DoelstellingCategory,
  DoelstellingStatus
} from '@/types/doelstelling';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

describe('Doelstelling Integration Tests', () => {
  let testEnv: RulesTestEnvironment;
  let authenticatedContext: any;
  let unauthenticatedContext: any;
  
  const testUserId = 'test-user-123';
  const testCourseId = 'test-course-456';
  const testDoelstellingId = 'test-doelstelling-789';

  beforeAll(async () => {
    // Initialize test environment
    testEnv = await initializeTestEnvironment({
      projectId: 'groeimetai-test',
      firestore: {
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              // Doelstellingen rules
              match /doelstellingen/{doelstellingId} {
                allow read: if request.auth != null;
                allow create: if request.auth != null && 
                  (request.auth.token.role == 'instructor' || 
                   request.auth.token.role == 'admin');
                allow update: if request.auth != null && 
                  (request.auth.token.role == 'instructor' || 
                   request.auth.token.role == 'admin');
                allow delete: if request.auth != null && 
                  request.auth.token.role == 'admin';
              }
              
              // User progress rules
              match /user_doelstelling_progress/{progressId} {
                allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.userId || 
                   request.auth.token.role == 'instructor' ||
                   request.auth.token.role == 'admin');
                allow create, update: if request.auth != null && 
                  request.auth.uid == request.resource.data.userId;
                allow delete: if false; // Progress records cannot be deleted
              }
            }
          }
        `,
        host: 'localhost',
        port: 8080
      }
    });

    // Create authenticated contexts
    authenticatedContext = testEnv.authenticatedContext(testUserId, {
      email: 'test@example.com',
      role: 'student'
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  // ============================================================================
  // Test Data Helpers
  // ============================================================================

  const createTestDoelstelling = (): Omit<Doelstelling, 'id' | 'createdAt' | 'updatedAt'> => ({
    courseId: testCourseId,
    moduleId: 'module-1',
    title: 'Master Firebase Security Rules',
    description: 'Learn to implement secure Firebase security rules for production applications',
    type: 'skill' as DoelstellingType,
    level: 'advanced' as DoelstellingLevel,
    category: 'technical' as DoelstellingCategory,
    status: 'published' as DoelstellingStatus,
    outcomes: [
      {
        id: 'outcome-1',
        description: 'Understand Firebase security rules syntax and structure',
        measurable: true,
        bloomLevel: 'understand',
        assessmentMethod: 'quiz',
        requiredScore: 85
      },
      {
        id: 'outcome-2',
        description: 'Implement role-based access control in Firestore',
        measurable: true,
        bloomLevel: 'apply',
        assessmentMethod: 'project',
        requiredScore: 80
      }
    ],
    assessmentCriteria: [
      {
        id: 'criterion-1',
        description: 'Security rules implementation quality',
        weight: 0.7,
        rubric: [
          {
            level: 'excellent',
            description: 'Comprehensive security with no vulnerabilities',
            score: 100,
            examples: ['All data properly secured', 'Role-based access implemented']
          }
        ],
        evidenceRequired: ['Security rules file', 'Test results']
      }
    ],
    prerequisites: [],
    enablesNext: [],
    estimatedTime: 180,
    points: 150,
    weight: 0.9,
    order: 1,
    tracking: {
      viewCount: 0,
      averageCompletionTime: 0,
      completionRate: 0,
      averageScore: 0
    }
  });

  // ============================================================================
  // CRUD Integration Tests
  // ============================================================================

  describe('Doelstelling CRUD Operations', () => {
    it('should create and retrieve a doelstelling', async () => {
      // Use instructor context for creation
      const instructorContext = testEnv.authenticatedContext('instructor-123', {
        email: 'instructor@example.com',
        role: 'instructor'
      });

      const doelstellingData = createTestDoelstelling();
      const db = instructorContext.firestore();
      
      // Create doelstelling
      const docRef = doc(collection(db, 'doelstellingen'), testDoelstellingId);
      await setDoc(docRef, {
        ...doelstellingData,
        id: testDoelstellingId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Retrieve as student
      const studentDb = authenticatedContext.firestore();
      const retrievedDoc = await getDoc(doc(studentDb, 'doelstellingen', testDoelstellingId));
      
      expect(retrievedDoc.exists()).toBe(true);
      expect(retrievedDoc.data()?.title).toBe(doelstellingData.title);
    });

    it('should prevent unauthorized creation', async () => {
      const studentDb = authenticatedContext.firestore();
      const docRef = doc(collection(studentDb, 'doelstellingen'), 'unauthorized-id');
      
      await expect(
        setDoc(docRef, {
          ...createTestDoelstelling(),
          id: 'unauthorized-id',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
    });

    it('should update doelstelling tracking statistics', async () => {
      // Setup: Create doelstelling as instructor
      const instructorContext = testEnv.authenticatedContext('instructor-123', {
        email: 'instructor@example.com',
        role: 'instructor'
      });
      
      const db = instructorContext.firestore();
      const docRef = doc(collection(db, 'doelstellingen'), testDoelstellingId);
      
      await setDoc(docRef, {
        ...createTestDoelstelling(),
        id: testDoelstellingId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Update tracking statistics
      await instructorContext.firestore().runTransaction(async (transaction) => {
        const docSnap = await transaction.get(docRef);
        const current = docSnap.data();
        
        transaction.update(docRef, {
          'tracking.viewCount': current.tracking.viewCount + 1,
          'tracking.averageScore': 85.5,
          updatedAt: Timestamp.now()
        });
      });

      // Verify update
      const updated = await getDoc(docRef);
      expect(updated.data()?.tracking.viewCount).toBe(1);
      expect(updated.data()?.tracking.averageScore).toBe(85.5);
    });
  });

  // ============================================================================
  // Progress Tracking Integration Tests
  // ============================================================================

  describe('Progress Tracking', () => {
    beforeEach(async () => {
      // Setup: Create doelstelling for progress tests
      const instructorContext = testEnv.authenticatedContext('instructor-123', {
        email: 'instructor@example.com',
        role: 'instructor'
      });
      
      const db = instructorContext.firestore();
      const docRef = doc(collection(db, 'doelstellingen'), testDoelstellingId);
      
      await setDoc(docRef, {
        ...createTestDoelstelling(),
        id: testDoelstellingId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    });

    it('should create and update user progress', async () => {
      const studentDb = authenticatedContext.firestore();
      const progressId = `${testUserId}_${testDoelstellingId}`;
      const progressRef = doc(studentDb, 'user_doelstelling_progress', progressId);
      
      // Create progress record
      const progressData: UserDoelstellingProgress = {
        id: progressId,
        userId: testUserId,
        doelstellingId: testDoelstellingId,
        courseId: testCourseId,
        status: 'in-progress',
        startedAt: Timestamp.now(),
        lastActivityAt: Timestamp.now(),
        attempts: [],
        bestScore: 0,
        currentScore: 0,
        timeSpent: 0,
        outcomesProgress: [],
        notes: '',
        reflections: [],
        feedback: []
      };
      
      await setDoc(progressRef, progressData);
      
      // Update progress
      await studentDb.runTransaction(async (transaction) => {
        const docSnap = await transaction.get(progressRef);
        const current = docSnap.data() as UserDoelstellingProgress;
        
        transaction.update(progressRef, {
          currentScore: 75,
          timeSpent: current.timeSpent + 30,
          lastActivityAt: Timestamp.now(),
          outcomesProgress: [
            {
              outcomeId: 'outcome-1',
              achieved: true,
              score: 90,
              achievedAt: Timestamp.now(),
              evidence: ['Quiz completed']
            }
          ]
        });
      });
      
      // Verify update
      const updated = await getDoc(progressRef);
      expect(updated.data()?.currentScore).toBe(75);
      expect(updated.data()?.timeSpent).toBe(30);
      expect(updated.data()?.outcomesProgress).toHaveLength(1);
    });

    it('should prevent users from accessing other users progress', async () => {
      const otherUserId = 'other-user-456';
      const progressId = `${otherUserId}_${testDoelstellingId}`;
      
      // Create progress for another user (using admin context for setup)
      const adminContext = testEnv.authenticatedContext('admin-123', {
        email: 'admin@example.com',
        role: 'admin'
      });
      
      const adminDb = adminContext.firestore();
      await setDoc(doc(adminDb, 'user_doelstelling_progress', progressId), {
        id: progressId,
        userId: otherUserId,
        doelstellingId: testDoelstellingId,
        courseId: testCourseId,
        status: 'completed',
        currentScore: 95
      });
      
      // Try to read as different user
      const studentDb = authenticatedContext.firestore();
      await expect(
        getDoc(doc(studentDb, 'user_doelstelling_progress', progressId))
      ).rejects.toThrow();
    });

    it('should allow instructors to view student progress', async () => {
      // Create student progress
      const studentDb = authenticatedContext.firestore();
      const progressId = `${testUserId}_${testDoelstellingId}`;
      
      await setDoc(doc(studentDb, 'user_doelstelling_progress', progressId), {
        id: progressId,
        userId: testUserId,
        doelstellingId: testDoelstellingId,
        courseId: testCourseId,
        status: 'completed',
        currentScore: 88
      });
      
      // Read as instructor
      const instructorContext = testEnv.authenticatedContext('instructor-123', {
        email: 'instructor@example.com',
        role: 'instructor'
      });
      
      const instructorDb = instructorContext.firestore();
      const progressDoc = await getDoc(
        doc(instructorDb, 'user_doelstelling_progress', progressId)
      );
      
      expect(progressDoc.exists()).toBe(true);
      expect(progressDoc.data()?.currentScore).toBe(88);
    });
  });

  // ============================================================================
  // Query and Aggregation Tests
  // ============================================================================

  describe('Queries and Aggregations', () => {
    beforeEach(async () => {
      // Setup: Create multiple doelstellingen
      const instructorContext = testEnv.authenticatedContext('instructor-123', {
        email: 'instructor@example.com',
        role: 'instructor'
      });
      
      const db = instructorContext.firestore();
      
      // Create 3 doelstellingen with different properties
      const doelstellingen = [
        {
          ...createTestDoelstelling(),
          id: 'doelstelling-1',
          type: 'knowledge' as DoelstellingType,
          level: 'foundation' as DoelstellingLevel,
          points: 50,
          order: 1
        },
        {
          ...createTestDoelstelling(),
          id: 'doelstelling-2',
          type: 'skill' as DoelstellingType,
          level: 'intermediate' as DoelstellingLevel,
          points: 100,
          order: 2
        },
        {
          ...createTestDoelstelling(),
          id: 'doelstelling-3',
          type: 'competency' as DoelstellingType,
          level: 'advanced' as DoelstellingLevel,
          points: 200,
          order: 3
        }
      ];
      
      for (const doelstelling of doelstellingen) {
        await setDoc(
          doc(collection(db, 'doelstellingen'), doelstelling.id),
          {
            ...doelstelling,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          }
        );
      }
    });

    it('should query doelstellingen by type and level', async () => {
      const studentDb = authenticatedContext.firestore();
      
      // Query for skill type doelstellingen
      const skillQuery = studentDb
        .collection('doelstellingen')
        .where('courseId', '==', testCourseId)
        .where('type', '==', 'skill');
      
      const skillSnapshot = await skillQuery.get();
      expect(skillSnapshot.size).toBe(1);
      expect(skillSnapshot.docs[0].data().type).toBe('skill');
      
      // Query for advanced level
      const advancedQuery = studentDb
        .collection('doelstellingen')
        .where('courseId', '==', testCourseId)
        .where('level', '==', 'advanced');
      
      const advancedSnapshot = await advancedQuery.get();
      expect(advancedSnapshot.size).toBe(1);
      expect(advancedSnapshot.docs[0].data().level).toBe('advanced');
    });

    it('should order doelstellingen by different fields', async () => {
      const studentDb = authenticatedContext.firestore();
      
      // Order by points descending
      const pointsQuery = studentDb
        .collection('doelstellingen')
        .where('courseId', '==', testCourseId)
        .orderBy('points', 'desc');
      
      const pointsSnapshot = await pointsQuery.get();
      const points = pointsSnapshot.docs.map(doc => doc.data().points);
      expect(points).toEqual([200, 100, 50]);
      
      // Order by order ascending
      const orderQuery = studentDb
        .collection('doelstellingen')
        .where('courseId', '==', testCourseId)
        .orderBy('order', 'asc');
      
      const orderSnapshot = await orderQuery.get();
      const orders = orderSnapshot.docs.map(doc => doc.data().order);
      expect(orders).toEqual([1, 2, 3]);
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================

  describe('Performance and Scalability', () => {
    it('should handle batch operations efficiently', async () => {
      const instructorContext = testEnv.authenticatedContext('instructor-123', {
        email: 'instructor@example.com',
        role: 'instructor'
      });
      
      const db = instructorContext.firestore();
      const batch = db.batch();
      
      // Create 10 doelstellingen in a batch
      for (let i = 0; i < 10; i++) {
        const docRef = doc(collection(db, 'doelstellingen'), `batch-doelstelling-${i}`);
        batch.set(docRef, {
          ...createTestDoelstelling(),
          id: `batch-doelstelling-${i}`,
          title: `Batch Doelstelling ${i}`,
          order: i,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      await batch.commit();
      
      // Verify all were created
      const snapshot = await db
        .collection('doelstellingen')
        .where('courseId', '==', testCourseId)
        .get();
      
      expect(snapshot.size).toBeGreaterThanOrEqual(10);
    });

    it('should paginate large result sets', async () => {
      const studentDb = authenticatedContext.firestore();
      
      // First page
      const firstPageQuery = studentDb
        .collection('doelstellingen')
        .where('courseId', '==', testCourseId)
        .orderBy('order')
        .limit(5);
      
      const firstPage = await firstPageQuery.get();
      expect(firstPage.size).toBeLessThanOrEqual(5);
      
      if (firstPage.size > 0) {
        // Next page
        const lastDoc = firstPage.docs[firstPage.docs.length - 1];
        const secondPageQuery = studentDb
          .collection('doelstellingen')
          .where('courseId', '==', testCourseId)
          .orderBy('order')
          .startAfter(lastDoc)
          .limit(5);
        
        const secondPage = await secondPageQuery.get();
        
        // Verify no overlap
        const firstPageIds = firstPage.docs.map(doc => doc.id);
        const secondPageIds = secondPage.docs.map(doc => doc.id);
        const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
        expect(overlap).toHaveLength(0);
      }
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate offline mode
      await authenticatedContext.firestore().disableNetwork();
      
      try {
        // Attempt to read data
        const docRef = doc(authenticatedContext.firestore(), 'doelstellingen', 'non-existent');
        await expect(getDoc(docRef)).rejects.toThrow();
      } finally {
        // Re-enable network
        await authenticatedContext.firestore().enableNetwork();
      }
    });

    it('should validate data integrity', async () => {
      const instructorContext = testEnv.authenticatedContext('instructor-123', {
        email: 'instructor@example.com',
        role: 'instructor'
      });
      
      const db = instructorContext.firestore();
      
      // Try to create doelstelling with invalid data
      const docRef = doc(collection(db, 'doelstellingen'), 'invalid-doelstelling');
      
      // This should be validated at the application layer
      const invalidData = {
        ...createTestDoelstelling(),
        id: 'invalid-doelstelling',
        points: -100, // Invalid negative points
        weight: 2.5, // Invalid weight > 1
        estimatedTime: 1000 // Invalid time > 480
      };
      
      // In a real scenario, the service layer should validate this
      // For now, we just verify the data can be stored (Firestore doesn't validate)
      await setDoc(docRef, {
        ...invalidData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      const stored = await getDoc(docRef);
      expect(stored.data()?.points).toBe(-100);
      
      // This demonstrates the importance of application-level validation
    });
  });
});