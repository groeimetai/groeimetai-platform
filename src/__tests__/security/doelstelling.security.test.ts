/**
 * Security validation tests for Doelstelling feature
 * Testing access control, data validation, and security best practices
 */

import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

describe('Doelstelling Security Tests', () => {
  let testEnv: RulesTestEnvironment;
  
  const testDoelstellingId = 'security-test-doelstelling';
  const testProgressId = 'user123_doelstelling456';

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'groeimetai-security-test',
      firestore: {
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              // Helper functions
              function isAuthenticated() {
                return request.auth != null;
              }
              
              function hasRole(role) {
                return isAuthenticated() && request.auth.token.role == role;
              }
              
              function isOwner(userId) {
                return isAuthenticated() && request.auth.uid == userId;
              }
              
              function isInstructor() {
                return hasRole('instructor');
              }
              
              function isAdmin() {
                return hasRole('admin');
              }
              
              function isStudent() {
                return hasRole('student');
              }
              
              // Validation functions
              function isValidDoelstelling() {
                let data = request.resource.data;
                return data.title is string && 
                       data.title.size() >= 5 && 
                       data.title.size() <= 200 &&
                       data.description is string &&
                       data.description.size() >= 20 &&
                       data.description.size() <= 1000 &&
                       data.type in ['knowledge', 'skill', 'competency', 'attitude', 'certification'] &&
                       data.level in ['foundation', 'intermediate', 'advanced', 'expert'] &&
                       data.points >= 0 &&
                       data.points <= 1000 &&
                       data.weight >= 0 &&
                       data.weight <= 1 &&
                       data.estimatedTime >= 5 &&
                       data.estimatedTime <= 480;
              }
              
              function isValidProgress() {
                let data = request.resource.data;
                return data.userId is string &&
                       data.doelstellingId is string &&
                       data.courseId is string &&
                       data.status in ['not-started', 'in-progress', 'completed', 'mastered'] &&
                       data.currentScore >= 0 &&
                       data.currentScore <= 100 &&
                       data.timeSpent >= 0;
              }
              
              // Doelstellingen collection rules
              match /doelstellingen/{doelstellingId} {
                // Read: Any authenticated user
                allow read: if isAuthenticated();
                
                // Create: Only instructors and admins with valid data
                allow create: if (isInstructor() || isAdmin()) && 
                              isValidDoelstelling() &&
                              request.resource.data.createdAt == request.time &&
                              request.resource.data.updatedAt == request.time;
                
                // Update: Only instructors and admins with valid data
                allow update: if (isInstructor() || isAdmin()) && 
                              isValidDoelstelling() &&
                              request.resource.data.createdAt == resource.data.createdAt &&
                              request.resource.data.updatedAt == request.time;
                
                // Delete: Only admins
                allow delete: if isAdmin();
              }
              
              // User progress collection rules
              match /user_doelstelling_progress/{progressId} {
                // Read: Owner, instructors, or admins
                allow read: if isOwner(resource.data.userId) || 
                            isInstructor() || 
                            isAdmin();
                
                // Create: Only the user themselves with valid data
                allow create: if isOwner(request.resource.data.userId) &&
                              isValidProgress() &&
                              request.resource.data.startedAt == request.time &&
                              request.resource.data.lastActivityAt == request.time;
                
                // Update: Only the user themselves with valid data
                allow update: if isOwner(resource.data.userId) &&
                              isOwner(request.resource.data.userId) &&
                              isValidProgress() &&
                              request.resource.data.userId == resource.data.userId &&
                              request.resource.data.doelstellingId == resource.data.doelstellingId &&
                              request.resource.data.startedAt == resource.data.startedAt &&
                              request.resource.data.lastActivityAt == request.time;
                
                // Delete: Not allowed
                allow delete: if false;
              }
            }
          }
        `
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  // ============================================================================
  // Authentication Tests
  // ============================================================================

  describe('Authentication Requirements', () => {
    it('should deny all operations for unauthenticated users', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthedDb, 'doelstellingen', testDoelstellingId);
      
      // Test read
      await expect(getDoc(docRef)).rejects.toThrow();
      
      // Test create
      await expect(setDoc(docRef, { title: 'Test' })).rejects.toThrow();
      
      // Test update
      await expect(updateDoc(docRef, { title: 'Updated' })).rejects.toThrow();
      
      // Test delete
      await expect(deleteDoc(docRef)).rejects.toThrow();
    });

    it('should allow authenticated users to read doelstellingen', async () => {
      // First create as admin
      const adminDb = testEnv.authenticatedContext('admin-user', {
        email: 'admin@test.com',
        role: 'admin'
      }).firestore();
      
      await setDoc(doc(adminDb, 'doelstellingen', testDoelstellingId), {
        title: 'Test Doelstelling',
        description: 'This is a test doelstelling for security validation',
        type: 'skill',
        level: 'intermediate',
        points: 100,
        weight: 0.8,
        estimatedTime: 60,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Then read as student
      const studentDb = testEnv.authenticatedContext('student-user', {
        email: 'student@test.com',
        role: 'student'
      }).firestore();
      
      const doc = await getDoc(doc(studentDb, 'doelstellingen', testDoelstellingId));
      expect(doc.exists()).toBe(true);
    });
  });

  // ============================================================================
  // Role-Based Access Control Tests
  // ============================================================================

  describe('Role-Based Access Control', () => {
    const validDoelstelling = {
      title: 'Valid Test Doelstelling',
      description: 'This is a valid test doelstelling with proper length',
      type: 'skill',
      level: 'intermediate',
      category: 'technical',
      status: 'published',
      outcomes: [],
      assessmentCriteria: [],
      prerequisites: [],
      enablesNext: [],
      points: 100,
      weight: 0.8,
      estimatedTime: 60,
      order: 1,
      tracking: {
        viewCount: 0,
        averageCompletionTime: 0,
        completionRate: 0,
        averageScore: 0
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    it('should allow instructors to create doelstellingen', async () => {
      const instructorDb = testEnv.authenticatedContext('instructor-user', {
        email: 'instructor@test.com',
        role: 'instructor'
      }).firestore();
      
      await setDoc(
        doc(instructorDb, 'doelstellingen', testDoelstellingId),
        validDoelstelling
      );
      
      const created = await getDoc(doc(instructorDb, 'doelstellingen', testDoelstellingId));
      expect(created.exists()).toBe(true);
    });

    it('should deny students from creating doelstellingen', async () => {
      const studentDb = testEnv.authenticatedContext('student-user', {
        email: 'student@test.com',
        role: 'student'
      }).firestore();
      
      await expect(
        setDoc(doc(studentDb, 'doelstellingen', testDoelstellingId), validDoelstelling)
      ).rejects.toThrow();
    });

    it('should allow only admins to delete doelstellingen', async () => {
      // Create as instructor
      const instructorDb = testEnv.authenticatedContext('instructor-user', {
        email: 'instructor@test.com',
        role: 'instructor'
      }).firestore();
      
      await setDoc(
        doc(instructorDb, 'doelstellingen', testDoelstellingId),
        validDoelstelling
      );
      
      // Try to delete as instructor (should fail)
      await expect(
        deleteDoc(doc(instructorDb, 'doelstellingen', testDoelstellingId))
      ).rejects.toThrow();
      
      // Delete as admin (should succeed)
      const adminDb = testEnv.authenticatedContext('admin-user', {
        email: 'admin@test.com',
        role: 'admin'
      }).firestore();
      
      await deleteDoc(doc(adminDb, 'doelstellingen', testDoelstellingId));
      
      const deleted = await getDoc(doc(adminDb, 'doelstellingen', testDoelstellingId));
      expect(deleted.exists()).toBe(false);
    });
  });

  // ============================================================================
  // Data Validation Tests
  // ============================================================================

  describe('Data Validation', () => {
    const instructorContext = () => testEnv.authenticatedContext('instructor-user', {
      email: 'instructor@test.com',
      role: 'instructor'
    });

    it('should reject doelstelling with invalid title length', async () => {
      const db = instructorContext().firestore();
      
      // Too short
      await expect(
        setDoc(doc(db, 'doelstellingen', 'invalid-1'), {
          title: 'Bad', // Less than 5 characters
          description: 'This is a valid description with proper length',
          type: 'skill',
          level: 'intermediate',
          points: 100,
          weight: 0.8,
          estimatedTime: 60,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
      
      // Too long
      const longTitle = 'A'.repeat(201); // More than 200 characters
      await expect(
        setDoc(doc(db, 'doelstellingen', 'invalid-2'), {
          title: longTitle,
          description: 'This is a valid description with proper length',
          type: 'skill',
          level: 'intermediate',
          points: 100,
          weight: 0.8,
          estimatedTime: 60,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
    });

    it('should reject doelstelling with invalid type or level', async () => {
      const db = instructorContext().firestore();
      
      await expect(
        setDoc(doc(db, 'doelstellingen', 'invalid-type'), {
          title: 'Valid Title',
          description: 'This is a valid description with proper length',
          type: 'invalid-type', // Invalid type
          level: 'intermediate',
          points: 100,
          weight: 0.8,
          estimatedTime: 60,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
      
      await expect(
        setDoc(doc(db, 'doelstellingen', 'invalid-level'), {
          title: 'Valid Title',
          description: 'This is a valid description with proper length',
          type: 'skill',
          level: 'invalid-level', // Invalid level
          points: 100,
          weight: 0.8,
          estimatedTime: 60,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
    });

    it('should reject doelstelling with out-of-range numeric values', async () => {
      const db = instructorContext().firestore();
      
      // Negative points
      await expect(
        setDoc(doc(db, 'doelstellingen', 'negative-points'), {
          title: 'Valid Title',
          description: 'This is a valid description with proper length',
          type: 'skill',
          level: 'intermediate',
          points: -50, // Negative points
          weight: 0.8,
          estimatedTime: 60,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
      
      // Weight > 1
      await expect(
        setDoc(doc(db, 'doelstellingen', 'invalid-weight'), {
          title: 'Valid Title',
          description: 'This is a valid description with proper length',
          type: 'skill',
          level: 'intermediate',
          points: 100,
          weight: 1.5, // Weight > 1
          estimatedTime: 60,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
      
      // Estimated time > 480
      await expect(
        setDoc(doc(db, 'doelstellingen', 'invalid-time'), {
          title: 'Valid Title',
          description: 'This is a valid description with proper length',
          type: 'skill',
          level: 'intermediate',
          points: 100,
          weight: 0.8,
          estimatedTime: 500, // > 480 minutes
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
    });
  });

  // ============================================================================
  // Progress Security Tests
  // ============================================================================

  describe('Progress Security', () => {
    const userId = 'test-user-123';
    const otherUserId = 'other-user-456';
    const progressId = `${userId}_${testDoelstellingId}`;
    const otherProgressId = `${otherUserId}_${testDoelstellingId}`;

    beforeEach(async () => {
      // Create test doelstelling
      const adminDb = testEnv.authenticatedContext('admin-user', {
        email: 'admin@test.com',
        role: 'admin'
      }).firestore();
      
      await setDoc(doc(adminDb, 'doelstellingen', testDoelstellingId), {
        title: 'Test Doelstelling',
        description: 'This is a test doelstelling for progress security',
        type: 'skill',
        level: 'intermediate',
        points: 100,
        weight: 0.8,
        estimatedTime: 60,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    });

    it('should allow users to create and update their own progress', async () => {
      const userDb = testEnv.authenticatedContext(userId, {
        email: 'user@test.com',
        role: 'student'
      }).firestore();
      
      const progressData = {
        userId: userId,
        doelstellingId: testDoelstellingId,
        courseId: 'course-123',
        status: 'in-progress',
        currentScore: 0,
        bestScore: 0,
        timeSpent: 0,
        startedAt: Timestamp.now(),
        lastActivityAt: Timestamp.now()
      };
      
      // Create progress
      await setDoc(doc(userDb, 'user_doelstelling_progress', progressId), progressData);
      
      // Update progress
      await updateDoc(doc(userDb, 'user_doelstelling_progress', progressId), {
        currentScore: 75,
        timeSpent: 30,
        lastActivityAt: Timestamp.now()
      });
      
      const updated = await getDoc(doc(userDb, 'user_doelstelling_progress', progressId));
      expect(updated.data()?.currentScore).toBe(75);
    });

    it('should prevent users from accessing other users progress', async () => {
      // Create progress for other user
      const otherUserDb = testEnv.authenticatedContext(otherUserId, {
        email: 'other@test.com',
        role: 'student'
      }).firestore();
      
      await setDoc(doc(otherUserDb, 'user_doelstelling_progress', otherProgressId), {
        userId: otherUserId,
        doelstellingId: testDoelstellingId,
        courseId: 'course-123',
        status: 'completed',
        currentScore: 95,
        bestScore: 95,
        timeSpent: 120,
        startedAt: Timestamp.now(),
        lastActivityAt: Timestamp.now()
      });
      
      // Try to read as different user
      const userDb = testEnv.authenticatedContext(userId, {
        email: 'user@test.com',
        role: 'student'
      }).firestore();
      
      await expect(
        getDoc(doc(userDb, 'user_doelstelling_progress', otherProgressId))
      ).rejects.toThrow();
    });

    it('should prevent users from modifying userId in progress updates', async () => {
      const userDb = testEnv.authenticatedContext(userId, {
        email: 'user@test.com',
        role: 'student'
      }).firestore();
      
      // Create initial progress
      await setDoc(doc(userDb, 'user_doelstelling_progress', progressId), {
        userId: userId,
        doelstellingId: testDoelstellingId,
        courseId: 'course-123',
        status: 'in-progress',
        currentScore: 50,
        bestScore: 50,
        timeSpent: 30,
        startedAt: Timestamp.now(),
        lastActivityAt: Timestamp.now()
      });
      
      // Try to update with different userId
      await expect(
        updateDoc(doc(userDb, 'user_doelstelling_progress', progressId), {
          userId: otherUserId, // Trying to change userId
          currentScore: 80,
          lastActivityAt: Timestamp.now()
        })
      ).rejects.toThrow();
    });

    it('should prevent deletion of progress records', async () => {
      const userDb = testEnv.authenticatedContext(userId, {
        email: 'user@test.com',
        role: 'student'
      }).firestore();
      
      // Create progress
      await setDoc(doc(userDb, 'user_doelstelling_progress', progressId), {
        userId: userId,
        doelstellingId: testDoelstellingId,
        courseId: 'course-123',
        status: 'completed',
        currentScore: 85,
        bestScore: 85,
        timeSpent: 90,
        startedAt: Timestamp.now(),
        lastActivityAt: Timestamp.now()
      });
      
      // Try to delete own progress (should fail)
      await expect(
        deleteDoc(doc(userDb, 'user_doelstelling_progress', progressId))
      ).rejects.toThrow();
      
      // Try as admin (should also fail - no deletion allowed)
      const adminDb = testEnv.authenticatedContext('admin-user', {
        email: 'admin@test.com',
        role: 'admin'
      }).firestore();
      
      await expect(
        deleteDoc(doc(adminDb, 'user_doelstelling_progress', progressId))
      ).rejects.toThrow();
    });

    it('should validate progress data on creation and update', async () => {
      const userDb = testEnv.authenticatedContext(userId, {
        email: 'user@test.com',
        role: 'student'
      }).firestore();
      
      // Invalid status
      await expect(
        setDoc(doc(userDb, 'user_doelstelling_progress', 'invalid-progress-1'), {
          userId: userId,
          doelstellingId: testDoelstellingId,
          courseId: 'course-123',
          status: 'invalid-status', // Invalid status
          currentScore: 0,
          timeSpent: 0,
          startedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        })
      ).rejects.toThrow();
      
      // Invalid score (> 100)
      await expect(
        setDoc(doc(userDb, 'user_doelstelling_progress', 'invalid-progress-2'), {
          userId: userId,
          doelstellingId: testDoelstellingId,
          courseId: 'course-123',
          status: 'in-progress',
          currentScore: 150, // Score > 100
          timeSpent: 0,
          startedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        })
      ).rejects.toThrow();
      
      // Negative time spent
      await expect(
        setDoc(doc(userDb, 'user_doelstelling_progress', 'invalid-progress-3'), {
          userId: userId,
          doelstellingId: testDoelstellingId,
          courseId: 'course-123',
          status: 'in-progress',
          currentScore: 75,
          timeSpent: -30, // Negative time
          startedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        })
      ).rejects.toThrow();
    });
  });

  // ============================================================================
  // Timestamp Security Tests
  // ============================================================================

  describe('Timestamp Security', () => {
    it('should enforce server timestamps on creation', async () => {
      const instructorDb = testEnv.authenticatedContext('instructor-user', {
        email: 'instructor@test.com',
        role: 'instructor'
      }).firestore();
      
      const fakeTimestamp = Timestamp.fromDate(new Date('2020-01-01'));
      
      await expect(
        setDoc(doc(instructorDb, 'doelstellingen', 'timestamp-test'), {
          title: 'Timestamp Test',
          description: 'Testing timestamp security validation',
          type: 'skill',
          level: 'intermediate',
          points: 100,
          weight: 0.8,
          estimatedTime: 60,
          createdAt: fakeTimestamp, // Trying to set custom timestamp
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
    });

    it('should prevent modification of createdAt on update', async () => {
      const instructorDb = testEnv.authenticatedContext('instructor-user', {
        email: 'instructor@test.com',
        role: 'instructor'
      }).firestore();
      
      // Create doelstelling
      await setDoc(doc(instructorDb, 'doelstellingen', 'timestamp-update-test'), {
        title: 'Original Title',
        description: 'This is the original description for testing',
        type: 'skill',
        level: 'intermediate',
        points: 100,
        weight: 0.8,
        estimatedTime: 60,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Try to update with modified createdAt
      await expect(
        updateDoc(doc(instructorDb, 'doelstellingen', 'timestamp-update-test'), {
          title: 'Updated Title',
          createdAt: Timestamp.fromDate(new Date('2020-01-01')), // Trying to change createdAt
          updatedAt: Timestamp.now()
        })
      ).rejects.toThrow();
    });
  });
});