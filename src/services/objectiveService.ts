import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../../firebase/data-model';
import type { Objective, ObjectiveProgress, Milestone } from '../types';

class ObjectiveService {
  // Create a new objective
  async createObjective(userId: string, objectiveData: Partial<Objective>): Promise<string> {
    try {
      const newObjective = {
        userId,
        title: objectiveData.title || '',
        description: objectiveData.description || '',
        category: objectiveData.category || 'personal',
        status: 'active',
        priority: objectiveData.priority || 'medium',
        targetDate: Timestamp.fromDate(objectiveData.targetDate || new Date()),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        progress: {
          current: 0,
          milestones: objectiveData.progress?.milestones || [],
          lastUpdate: serverTimestamp(),
        },
        relatedCourses: objectiveData.relatedCourses || [],
        relatedSkills: objectiveData.relatedSkills || [],
        requiredCertificates: objectiveData.requiredCertificates || [],
        measurableTargets: objectiveData.measurableTargets || [],
        reminders: objectiveData.reminders || {
          enabled: false,
          frequency: 'weekly',
        },
        notes: objectiveData.notes || '',
        reflections: [],
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.OBJECTIVES), newObjective);
      return docRef.id;
    } catch (error) {
      console.error('Error creating objective:', error);
      throw error;
    }
  }

  // Get all objectives for a user
  async getUserObjectives(
    userId: string,
    filterStatus?: string,
    filterCategory?: string
  ): Promise<Objective[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.OBJECTIVES),
        where('userId', '==', userId)
      );

      if (filterStatus) {
        q = query(q, where('status', '==', filterStatus));
      }

      if (filterCategory) {
        q = query(q, where('category', '==', filterCategory));
      }

      q = query(q, orderBy('priority', 'desc'), orderBy('targetDate', 'asc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Objective));
    } catch (error) {
      console.error('Error fetching user objectives:', error);
      throw error;
    }
  }

  // Get objectives related to a specific course
  async getCourseRelatedObjectives(courseId: string, userId?: string): Promise<Objective[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.OBJECTIVES),
        where('relatedCourses', 'array-contains', courseId),
        where('status', '==', 'active')
      );

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Objective));
    } catch (error) {
      console.error('Error fetching course objectives:', error);
      throw error;
    }
  }

  // Get a single objective
  async getObjective(objectiveId: string): Promise<Objective | null> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.OBJECTIVES, objectiveId));
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Objective;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching objective:', error);
      throw error;
    }
  }

  // Update an objective
  async updateObjective(objectiveId: string, updates: Partial<Objective>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(doc(db, COLLECTIONS.OBJECTIVES, objectiveId), updateData);
    } catch (error) {
      console.error('Error updating objective:', error);
      throw error;
    }
  }

  // Update objective progress
  async updateProgress(
    objectiveId: string,
    progressDelta: number,
    activities: ObjectiveProgress['activities']
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Get current objective
      const objectiveRef = doc(db, COLLECTIONS.OBJECTIVES, objectiveId);
      const objectiveSnap = await getDoc(objectiveRef);
      
      if (!objectiveSnap.exists()) {
        throw new Error('Objective not found');
      }

      const objective = objectiveSnap.data();
      const newProgress = Math.min(100, Math.max(0, objective.progress.current + progressDelta));

      // Update objective progress
      batch.update(objectiveRef, {
        'progress.current': newProgress,
        'progress.lastUpdate': serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create progress record
      const progressData = {
        objectiveId,
        userId: objective.userId,
        date: serverTimestamp(),
        progressDelta,
        newTotalProgress: newProgress,
        activities,
        streak: {
          current: objective.analytics?.streakDays || 0,
          isNewRecord: false,
          nextMilestone: 7,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.set(doc(collection(db, COLLECTIONS.OBJECTIVE_PROGRESS)), progressData);

      // Check if objective is completed
      if (newProgress >= 100 && objective.status === 'active') {
        batch.update(objectiveRef, {
          status: 'completed',
          completedAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating objective progress:', error);
      throw error;
    }
  }

  // Complete a milestone
  async completeMilestone(objectiveId: string, milestoneId: string): Promise<void> {
    try {
      const objectiveRef = doc(db, COLLECTIONS.OBJECTIVES, objectiveId);
      const objectiveSnap = await getDoc(objectiveRef);
      
      if (!objectiveSnap.exists()) {
        throw new Error('Objective not found');
      }

      const objective = objectiveSnap.data();
      const milestones = objective.progress.milestones.map((m: Milestone) => {
        if (m.id === milestoneId) {
          return {
            ...m,
            completed: true,
            completedAt: new Date(),
          };
        }
        return m;
      });

      await updateDoc(objectiveRef, {
        'progress.milestones': milestones,
        updatedAt: serverTimestamp(),
      });

      // Record progress
      await this.updateProgress(objectiveId, 0, [{
        type: 'milestone_completed',
        description: `Completed milestone: ${milestones.find((m: Milestone) => m.id === milestoneId)?.title}`,
      }]);
    } catch (error) {
      console.error('Error completing milestone:', error);
      throw error;
    }
  }

  // Add a reflection
  async addReflection(objectiveId: string, content: string): Promise<void> {
    try {
      const reflection = {
        id: `reflection_${Date.now()}`,
        date: new Date(),
        content,
        progressAtTime: 0, // Will be set from current progress
      };

      await updateDoc(doc(db, COLLECTIONS.OBJECTIVES, objectiveId), {
        reflections: arrayUnion(reflection),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding reflection:', error);
      throw error;
    }
  }

  // Get progress history for an objective
  async getObjectiveProgress(objectiveId: string, limit = 30): Promise<ObjectiveProgress[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.OBJECTIVE_PROGRESS),
        where('objectiveId', '==', objectiveId),
        orderBy('date', 'desc'),
        limit
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ObjectiveProgress));
    } catch (error) {
      console.error('Error fetching objective progress:', error);
      throw error;
    }
  }

  // Get user's daily progress across all objectives
  async getUserDailyProgress(userId: string, date: Date): Promise<ObjectiveProgress[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, COLLECTIONS.OBJECTIVE_PROGRESS),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ObjectiveProgress));
    } catch (error) {
      console.error('Error fetching daily progress:', error);
      throw error;
    }
  }

  // Delete an objective
  async deleteObjective(objectiveId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.OBJECTIVES, objectiveId));
    } catch (error) {
      console.error('Error deleting objective:', error);
      throw error;
    }
  }

  // Auto-update progress based on course/lesson completion
  async updateObjectiveFromCourseProgress(
    userId: string,
    courseId: string,
    activityType: 'course_started' | 'course_completed' | 'lesson_completed',
    activityDescription: string,
    metadata?: any
  ): Promise<void> {
    try {
      // Find all active objectives related to this course
      const objectives = await this.getCourseRelatedObjectives(courseId, userId);

      for (const objective of objectives) {
        let progressDelta = 0;
        
        // Calculate progress based on activity type and measurable targets
        objective.measurableTargets.forEach(target => {
          if (target.trackingMethod === 'automatic') {
            switch (target.type) {
              case 'courses_completed':
                if (activityType === 'course_completed') {
                  target.current += 1;
                  progressDelta += (1 / target.target) * 100;
                }
                break;
              case 'lessons_completed':
                if (activityType === 'lesson_completed') {
                  target.current += 1;
                  progressDelta += (1 / target.target) * 100;
                }
                break;
            }
          }
        });

        if (progressDelta > 0) {
          await this.updateProgress(objective.id, progressDelta, [{
            type: activityType,
            description: activityDescription,
            relatedId: courseId,
            relatedType: 'course',
            metadata,
          }]);
        }
      }
    } catch (error) {
      console.error('Error updating objectives from course progress:', error);
      throw error;
    }
  }
}

export const objectiveService = new ObjectiveService();