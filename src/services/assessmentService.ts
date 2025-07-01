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
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Assessment, AssessmentAttempt, Question, Answer } from '@/types'
import { onAssessmentCompleted } from './certificateGenerationService'

export class AssessmentService {
  /**
   * Auto-save assessment progress
   */
  static async saveProgress(attemptId: string, answers: Answer[]): Promise<void> {
    try {
      const attemptRef = doc(db, 'assessment_attempts', attemptId)
      await updateDoc(attemptRef, {
        answers,
        lastSavedAt: new Date(),
      })
    } catch (error) {
      console.error('Save progress error:', error)
      throw error
    }
  }
  /**
   * Create new assessment
   */
  static async createAssessment(assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const assessmentData = {
        ...assessment,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const docRef = await addDoc(collection(db, 'assessments'), assessmentData)
      return docRef.id
    } catch (error) {
      console.error('Create assessment error:', error)
      throw error
    }
  }

  /**
   * Get assessment by ID
   */
  static async getAssessmentById(assessmentId: string): Promise<Assessment | null> {
    try {
      const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId))
      if (!assessmentDoc.exists()) return null

      return {
        id: assessmentDoc.id,
        ...assessmentDoc.data(),
      } as Assessment
    } catch (error) {
      console.error('Get assessment by ID error:', error)
      throw error
    }
  }

  /**
   * Get assessments for a course
   */
  static async getCourseAssessments(courseId: string): Promise<Assessment[]> {
    try {
      const q = query(
        collection(db, 'assessments'),
        where('courseId', '==', courseId),
        where('isActive', '==', true),
        orderBy('createdAt', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Assessment[]
    } catch (error) {
      console.error('Get course assessments error:', error)
      throw error
    }
  }

  /**
   * Update assessment
   */
  static async updateAssessment(assessmentId: string, updates: Partial<Assessment>): Promise<void> {
    try {
      const assessmentRef = doc(db, 'assessments', assessmentId)
      await updateDoc(assessmentRef, {
        ...updates,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Update assessment error:', error)
      throw error
    }
  }

  /**
   * Delete assessment
   */
  static async deleteAssessment(assessmentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'assessments', assessmentId))
    } catch (error) {
      console.error('Delete assessment error:', error)
      throw error
    }
  }

  /**
   * Check if user can start a new attempt (considering cooldown period)
   */
  static async canStartNewAttempt(userId: string, assessmentId: string): Promise<{ canStart: boolean; reason?: string; nextAttemptTime?: Date }> {
    try {
      const assessment = await this.getAssessmentById(assessmentId)
      if (!assessment) {
        return { canStart: false, reason: 'Assessment not found' }
      }

      const existingAttempts = await this.getUserAssessmentAttempts(userId, assessmentId)
      
      // Check max attempts
      if (assessment.maxAttempts && existingAttempts.length >= assessment.maxAttempts) {
        const bestAttempt = await this.getBestAttempt(userId, assessmentId)
        if (bestAttempt && bestAttempt.passed) {
          return { canStart: false, reason: 'Already passed assessment' }
        }
        return { canStart: false, reason: 'Maximum attempts reached' }
      }

      // Check cooldown period (24 hours between attempts)
      if (existingAttempts.length > 0) {
        const lastAttempt = existingAttempts[0] // Already sorted by date desc
        if (lastAttempt.completedAt) {
          const cooldownHours = 24
          const nextAttemptTime = new Date(lastAttempt.completedAt.getTime() + cooldownHours * 60 * 60 * 1000)
          if (new Date() < nextAttemptTime) {
            return { canStart: false, reason: 'Cooldown period active', nextAttemptTime }
          }
        }
      }

      return { canStart: true }
    } catch (error) {
      console.error('Check can start attempt error:', error)
      throw error
    }
  }

  /**
   * Start assessment attempt
   */
  static async startAssessmentAttempt(assessmentId: string, userId: string): Promise<string> {
    try {
      // Check if user can start new attempt
      const canStart = await this.canStartNewAttempt(userId, assessmentId)
      if (!canStart.canStart) {
        throw new Error(canStart.reason || 'Cannot start new attempt')
      }

      const attempt: Omit<AssessmentAttempt, 'id'> = {
        assessmentId,
        userId,
        answers: [],
        score: 0,
        passed: false,
        startedAt: new Date(),
        timeSpent: 0,
      }

      const docRef = await addDoc(collection(db, 'assessment_attempts'), attempt)
      return docRef.id
    } catch (error) {
      console.error('Start assessment attempt error:', error)
      throw error
    }
  }

  /**
   * Submit assessment attempt
   */
  static async submitAssessmentAttempt(
    attemptId: string,
    answers: Answer[]
  ): Promise<AssessmentAttempt> {
    try {
      const attemptRef = doc(db, 'assessment_attempts', attemptId)
      const attemptDoc = await getDoc(attemptRef)
      
      if (!attemptDoc.exists()) {
        throw new Error('Assessment attempt not found')
      }

      const attempt = attemptDoc.data() as AssessmentAttempt
      const assessment = await this.getAssessmentById(attempt.assessmentId)
      
      if (!assessment) {
        throw new Error('Assessment not found')
      }

      // Calculate score
      const { totalScore, maxScore } = this.calculateScore(answers, assessment.questions)
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
      const passed = percentage >= assessment.passingScore

      // Calculate time spent
      const startTime = attempt.startedAt.getTime()
      const endTime = new Date().getTime()
      const timeSpent = Math.floor((endTime - startTime) / 1000) // in seconds

      const updatedAttempt: Partial<AssessmentAttempt> = {
        answers,
        score: percentage,
        passed,
        completedAt: new Date(),
        timeSpent,
      }

      await updateDoc(attemptRef, updatedAttempt)
      
      // Trigger certificate generation if passed
      if (passed && percentage >= 80) {
        try {
          await onAssessmentCompleted(attempt.userId, attempt.assessmentId, attemptId)
        } catch (error) {
          console.error('Certificate generation error:', error)
          // Don't fail the assessment submission if certificate generation fails
        }
      }

      return {
        ...attempt,
        ...updatedAttempt,
        id: attemptId,
      } as AssessmentAttempt
    } catch (error) {
      console.error('Submit assessment attempt error:', error)
      throw error
    }
  }

  /**
   * Get user's assessment attempts
   */
  static async getUserAssessmentAttempts(userId: string, assessmentId: string): Promise<AssessmentAttempt[]> {
    try {
      const q = query(
        collection(db, 'assessment_attempts'),
        where('userId', '==', userId),
        where('assessmentId', '==', assessmentId),
        orderBy('startedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AssessmentAttempt[]
    } catch (error) {
      console.error('Get user assessment attempts error:', error)
      throw error
    }
  }

  /**
   * Get attempt by ID
   */
  static async getAttemptById(attemptId: string): Promise<AssessmentAttempt | null> {
    try {
      const attemptDoc = await getDoc(doc(db, 'assessment_attempts', attemptId))
      if (!attemptDoc.exists()) return null

      return {
        id: attemptDoc.id,
        ...attemptDoc.data(),
      } as AssessmentAttempt
    } catch (error) {
      console.error('Get attempt by ID error:', error)
      throw error
    }
  }

  /**
   * Calculate assessment score
   */
  private static calculateScore(answers: Answer[], questions: Question[]): { totalScore: number; maxScore: number } {
    let totalScore = 0
    let maxScore = 0

    questions.forEach(question => {
      maxScore += question.points
      const answer = answers.find(a => a.questionId === question.id)
      
      if (answer) {
        totalScore += answer.points
      }
    })

    return { totalScore, maxScore }
  }

  /**
   * Grade answer
   */
  static gradeAnswer(question: Question, userAnswer: string | string[]): Answer {
    let isCorrect = false
    let points = 0

    switch (question.type) {
      case 'multiple_choice':
        isCorrect = userAnswer === question.correctAnswer
        break
      case 'true_false':
        isCorrect = userAnswer === question.correctAnswer
        break
      case 'text':
        // Simple text comparison - in production you might want more sophisticated matching
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer]
        isCorrect = correctAnswers.some(correct => 
          correct.toLowerCase().trim() === (userAnswer as string).toLowerCase().trim()
        )
        break
      case 'multiple_select':
        // For multiple select, all selected answers must match the correct answers
        if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
          const userAnswerSet = new Set(userAnswer)
          const correctAnswerSet = new Set(question.correctAnswer as string[])
          isCorrect = userAnswerSet.size === correctAnswerSet.size &&
            [...userAnswerSet].every(answer => correctAnswerSet.has(answer))
        }
        break
    }

    if (isCorrect) {
      points = question.points
    }

    return {
      questionId: question.id,
      answer: userAnswer,
      isCorrect,
      points,
    }
  }

  /**
   * Get best attempt for user and assessment
   */
  static async getBestAttempt(userId: string, assessmentId: string): Promise<AssessmentAttempt | null> {
    try {
      const attempts = await this.getUserAssessmentAttempts(userId, assessmentId)
      
      if (attempts.length === 0) return null

      // Return the attempt with the highest score
      return attempts.reduce((best, current) => 
        current.score > best.score ? current : best
      )
    } catch (error) {
      console.error('Get best attempt error:', error)
      throw error
    }
  }
}