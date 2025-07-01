/**
 * GroeimetAI Platform - Doelstelling Service
 * Service layer for managing learning objectives
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  DocumentReference,
  WriteBatch,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Doelstelling, 
  UserDoelstellingProgress, 
  DoelstellingFilter,
  DoelstellingSort,
  DoelstellingStatistics,
  DoelstellingProgressStatus,
  DOELSTELLING_VALIDATION
} from '@/types/doelstelling';

const COLLECTIONS = {
  DOELSTELLINGEN: 'doelstellingen',
  USER_PROGRESS: 'user_doelstelling_progress'
};

export class DoelstellingService {
  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Create a new doelstelling
   */
  static async createDoelstelling(doelstelling: Omit<Doelstelling, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doelstelling> {
    // Validate input
    this.validateDoelstelling(doelstelling);
    
    const docRef = doc(collection(db, COLLECTIONS.DOELSTELLINGEN));
    const now = Timestamp.now();
    
    const newDoelstelling: Doelstelling = {
      ...doelstelling,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
      tracking: {
        viewCount: 0,
        averageCompletionTime: 0,
        completionRate: 0,
        averageScore: 0
      }
    };
    
    await setDoc(docRef, newDoelstelling);
    return newDoelstelling;
  }

  /**
   * Get doelstelling by ID
   */
  static async getDoelstellingById(id: string): Promise<Doelstelling | null> {
    const docRef = doc(db, COLLECTIONS.DOELSTELLINGEN, id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return snapshot.data() as Doelstelling;
  }

  /**
   * Update doelstelling
   */
  static async updateDoelstelling(
    id: string, 
    updates: Partial<Omit<Doelstelling, 'id' | 'createdAt'>>
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DOELSTELLINGEN, id);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  /**
   * Delete doelstelling
   */
  static async deleteDoelstelling(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DOELSTELLINGEN, id);
    await deleteDoc(docRef);
    
    // Also delete all user progress records
    const progressQuery = query(
      collection(db, COLLECTIONS.USER_PROGRESS),
      where('doelstellingId', '==', id)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    const batch = writeBatch(db);
    
    progressSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  // ============================================================================
  // Query Operations
  // ============================================================================

  /**
   * Get doelstellingen for a course
   */
  static async getCourseDoelstellingen(
    courseId: string,
    filter?: DoelstellingFilter,
    sort?: DoelstellingSort
  ): Promise<Doelstelling[]> {
    let q = query(
      collection(db, COLLECTIONS.DOELSTELLINGEN),
      where('courseId', '==', courseId)
    );
    
    // Apply filters
    if (filter?.type) {
      q = query(q, where('type', '==', filter.type));
    }
    if (filter?.level) {
      q = query(q, where('level', '==', filter.level));
    }
    if (filter?.category) {
      q = query(q, where('category', '==', filter.category));
    }
    if (filter?.status) {
      q = query(q, where('status', '==', filter.status));
    }
    
    // Apply sorting
    if (sort) {
      q = query(q, orderBy(sort.field, sort.direction));
    } else {
      q = query(q, orderBy('order', 'asc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Doelstelling);
  }

  /**
   * Get module doelstellingen
   */
  static async getModuleDoelstellingen(
    courseId: string,
    moduleId: string
  ): Promise<Doelstelling[]> {
    const q = query(
      collection(db, COLLECTIONS.DOELSTELLINGEN),
      where('courseId', '==', courseId),
      where('moduleId', '==', moduleId),
      orderBy('order', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Doelstelling);
  }

  // ============================================================================
  // Progress Tracking
  // ============================================================================

  /**
   * Get user progress for a doelstelling
   */
  static async getUserProgress(
    userId: string,
    doelstellingId: string
  ): Promise<UserDoelstellingProgress | null> {
    const progressId = `${userId}_${doelstellingId}`;
    const docRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return snapshot.data() as UserDoelstellingProgress;
  }

  /**
   * Start doelstelling progress
   */
  static async startDoelstellingProgress(
    userId: string,
    doelstellingId: string,
    courseId: string
  ): Promise<UserDoelstellingProgress> {
    const progressId = `${userId}_${doelstellingId}`;
    const docRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);
    const now = Timestamp.now();
    
    const progress: UserDoelstellingProgress = {
      id: progressId,
      userId,
      doelstellingId,
      courseId,
      status: 'in-progress',
      startedAt: now,
      lastActivityAt: now,
      attempts: [],
      bestScore: 0,
      currentScore: 0,
      timeSpent: 0,
      outcomesProgress: [],
      notes: '',
      reflections: [],
      feedback: []
    };
    
    await setDoc(docRef, progress);
    
    // Update doelstelling view count
    await this.incrementViewCount(doelstellingId);
    
    return progress;
  }

  /**
   * Update progress
   */
  static async updateProgress(
    userId: string,
    doelstellingId: string,
    updates: Partial<UserDoelstellingProgress>
  ): Promise<void> {
    const progressId = `${userId}_${doelstellingId}`;
    const docRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);
    
    await updateDoc(docRef, {
      ...updates,
      lastActivityAt: Timestamp.now()
    });
  }

  /**
   * Complete doelstelling
   */
  static async completeDoelstelling(
    userId: string,
    doelstellingId: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    const progressId = `${userId}_${doelstellingId}`;
    const docRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);
    const now = Timestamp.now();
    
    // Get current progress
    const progress = await this.getUserProgress(userId, doelstellingId);
    if (!progress) {
      throw new Error('Progress not found');
    }
    
    // Determine status based on score
    const status: DoelstellingProgressStatus = score >= 90 ? 'mastered' : 'completed';
    
    // Update progress
    await updateDoc(docRef, {
      status,
      completedAt: now,
      currentScore: score,
      bestScore: Math.max(progress.bestScore, score),
      timeSpent: progress.timeSpent + timeSpent,
      lastActivityAt: now
    });
    
    // Update doelstelling statistics
    await this.updateDoelstellingStatistics(doelstellingId, score, timeSpent);
  }

  // ============================================================================
  // Statistics and Analytics
  // ============================================================================

  /**
   * Get user statistics for a course
   */
  static async getUserCourseStatistics(
    userId: string,
    courseId: string
  ): Promise<DoelstellingStatistics> {
    const q = query(
      collection(db, COLLECTIONS.USER_PROGRESS),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    
    const snapshot = await getDocs(q);
    const progressRecords = snapshot.docs.map(doc => doc.data() as UserDoelstellingProgress);
    
    // Calculate statistics
    const totalDoelstellingen = progressRecords.length;
    const completedDoelstellingen = progressRecords.filter(p => 
      p.status === 'completed' || p.status === 'mastered'
    ).length;
    const inProgressDoelstellingen = progressRecords.filter(p => 
      p.status === 'in-progress'
    ).length;
    
    const scores = progressRecords
      .filter(p => p.currentScore > 0)
      .map(p => p.currentScore);
    
    const averageScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;
    
    const totalTimeSpent = progressRecords.reduce((acc, p) => acc + p.timeSpent, 0);
    
    const masteryLevel = totalDoelstellingen > 0
      ? (completedDoelstellingen / totalDoelstellingen) * averageScore
      : 0;
    
    // TODO: Calculate strength and improvement areas based on category performance
    
    return {
      totalDoelstellingen,
      completedDoelstellingen,
      inProgressDoelstellingen,
      averageScore,
      totalTimeSpent,
      masteryLevel,
      strengthAreas: [],
      improvementAreas: []
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Validate doelstelling data
   */
  private static validateDoelstelling(doelstelling: any): void {
    const validation = DOELSTELLING_VALIDATION;
    
    // Title validation
    if (!doelstelling.title || 
        doelstelling.title.length < validation.title.minLength ||
        doelstelling.title.length > validation.title.maxLength) {
      throw new Error(`Title must be between ${validation.title.minLength} and ${validation.title.maxLength} characters`);
    }
    
    // Description validation
    if (!doelstelling.description || 
        doelstelling.description.length < validation.description.minLength ||
        doelstelling.description.length > validation.description.maxLength) {
      throw new Error(`Description must be between ${validation.description.minLength} and ${validation.description.maxLength} characters`);
    }
    
    // Outcomes validation
    if (!doelstelling.outcomes || 
        doelstelling.outcomes.length < validation.outcomes.minItems ||
        doelstelling.outcomes.length > validation.outcomes.maxItems) {
      throw new Error(`Must have between ${validation.outcomes.minItems} and ${validation.outcomes.maxItems} learning outcomes`);
    }
    
    // Assessment criteria validation
    if (!doelstelling.assessmentCriteria || 
        doelstelling.assessmentCriteria.length < validation.assessmentCriteria.minItems ||
        doelstelling.assessmentCriteria.length > validation.assessmentCriteria.maxItems) {
      throw new Error(`Must have between ${validation.assessmentCriteria.minItems} and ${validation.assessmentCriteria.maxItems} assessment criteria`);
    }
    
    // Numeric validations
    if (doelstelling.estimatedTime < validation.estimatedTime.min ||
        doelstelling.estimatedTime > validation.estimatedTime.max) {
      throw new Error(`Estimated time must be between ${validation.estimatedTime.min} and ${validation.estimatedTime.max} minutes`);
    }
    
    if (doelstelling.points < validation.points.min ||
        doelstelling.points > validation.points.max) {
      throw new Error(`Points must be between ${validation.points.min} and ${validation.points.max}`);
    }
    
    if (doelstelling.weight < validation.weight.min ||
        doelstelling.weight > validation.weight.max) {
      throw new Error(`Weight must be between ${validation.weight.min} and ${validation.weight.max}`);
    }
  }

  /**
   * Increment view count
   */
  private static async incrementViewCount(doelstellingId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DOELSTELLINGEN, doelstellingId);
    const doelstelling = await this.getDoelstellingById(doelstellingId);
    
    if (doelstelling) {
      await updateDoc(docRef, {
        'tracking.viewCount': doelstelling.tracking.viewCount + 1
      });
    }
  }

  /**
   * Update doelstelling statistics
   */
  private static async updateDoelstellingStatistics(
    doelstellingId: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DOELSTELLINGEN, doelstellingId);
    const doelstelling = await this.getDoelstellingById(doelstellingId);
    
    if (doelstelling && doelstelling.tracking) {
      const tracking = doelstelling.tracking;
      // Add null checks for all tracking properties
      const currentAverageScore = tracking.averageScore ?? 0;
      const currentAverageTime = tracking.averageCompletionTime ?? 0;
      const currentCompletionRate = tracking.completionRate ?? 0;
      const viewCount = tracking.viewCount ?? 1;
      
      // Calculate total attempts from completion rate and view count
      const totalAttempts = Math.max(currentCompletionRate * viewCount, 0);
      const newTotalAttempts = totalAttempts + 1;
      
      // Calculate new averages
      const newAverageScore = totalAttempts > 0
        ? (currentAverageScore * totalAttempts + score) / newTotalAttempts
        : score;
      const newAverageTime = totalAttempts > 0
        ? (currentAverageTime * totalAttempts + timeSpent) / newTotalAttempts
        : timeSpent;
      const newCompletionRate = newTotalAttempts / viewCount;
      
      await updateDoc(docRef, {
        'tracking.averageScore': newAverageScore,
        'tracking.averageCompletionTime': newAverageTime,
        'tracking.completionRate': Math.min(newCompletionRate, 1)
      });
    }
  }
}