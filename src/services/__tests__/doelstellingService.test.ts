/**
 * Unit tests for DoelstellingService
 * Testing all CRUD operations, validation, and business logic
 */

import { DoelstellingService } from '../doelstellingService';
import { 
  Doelstelling, 
  DoelstellingType,
  DoelstellingLevel,
  DoelstellingCategory,
  DoelstellingStatus,
  UserDoelstellingProgress
} from '@/types/doelstelling';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockGetDocs = jest.fn();
const mockWriteBatch = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  writeBatch: (...args: any[]) => mockWriteBatch(...args),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
    fromDate: jest.fn((date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }))
  }
}));

describe('DoelstellingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Test Data Helpers
  // ============================================================================
  
  const createMockDoelstelling = (): Omit<Doelstelling, 'id' | 'createdAt' | 'updatedAt'> => ({
    courseId: 'course123',
    moduleId: 'module456',
    title: 'Master React Hooks',
    description: 'Learn to effectively use React Hooks including useState, useEffect, and custom hooks',
    type: 'skill' as DoelstellingType,
    level: 'intermediate' as DoelstellingLevel,
    category: 'technical' as DoelstellingCategory,
    status: 'published' as DoelstellingStatus,
    outcomes: [
      {
        id: 'outcome1',
        description: 'Understand the purpose and benefits of React Hooks',
        measurable: true,
        bloomLevel: 'understand',
        assessmentMethod: 'quiz',
        requiredScore: 80
      },
      {
        id: 'outcome2',
        description: 'Implement custom hooks for reusable logic',
        measurable: true,
        bloomLevel: 'create',
        assessmentMethod: 'project',
        requiredScore: 75
      }
    ],
    assessmentCriteria: [
      {
        id: 'criterion1',
        description: 'Correct implementation of hooks',
        weight: 0.6,
        rubric: [
          {
            level: 'excellent',
            description: 'Flawless implementation with best practices',
            score: 100,
            examples: ['Uses dependency arrays correctly', 'No unnecessary re-renders']
          },
          {
            level: 'good',
            description: 'Good implementation with minor issues',
            score: 80,
            examples: ['Some optimization opportunities']
          }
        ],
        evidenceRequired: ['Code submission', 'Peer review']
      }
    ],
    prerequisites: [],
    enablesNext: ['doelstelling789'],
    estimatedTime: 120,
    points: 100,
    weight: 0.8,
    order: 1,
    tracking: {
      viewCount: 0,
      averageCompletionTime: 0,
      completionRate: 0,
      averageScore: 0
    }
  });

  // ============================================================================
  // CRUD Operations Tests
  // ============================================================================

  describe('createDoelstelling', () => {
    it('should create a new doelstelling with valid data', async () => {
      const mockDoelstelling = createMockDoelstelling();
      const mockId = 'generated-id-123';
      
      mockDoc.mockReturnValue({ id: mockId });
      mockCollection.mockReturnValue({});
      mockSetDoc.mockResolvedValue(undefined);
      
      const result = await DoelstellingService.createDoelstelling(mockDoelstelling);
      
      expect(result).toMatchObject({
        ...mockDoelstelling,
        id: mockId
      });
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('should throw error for invalid title length', async () => {
      const mockDoelstelling = createMockDoelstelling();
      mockDoelstelling.title = 'Bad'; // Too short
      
      await expect(DoelstellingService.createDoelstelling(mockDoelstelling))
        .rejects.toThrow('Title must be between 5 and 200 characters');
    });

    it('should throw error for invalid description length', async () => {
      const mockDoelstelling = createMockDoelstelling();
      mockDoelstelling.description = 'Too short'; // Less than 20 chars
      
      await expect(DoelstellingService.createDoelstelling(mockDoelstelling))
        .rejects.toThrow('Description must be between 20 and 1000 characters');
    });

    it('should throw error for invalid number of outcomes', async () => {
      const mockDoelstelling = createMockDoelstelling();
      mockDoelstelling.outcomes = []; // No outcomes
      
      await expect(DoelstellingService.createDoelstelling(mockDoelstelling))
        .rejects.toThrow('Must have between 1 and 10 learning outcomes');
    });

    it('should throw error for invalid estimated time', async () => {
      const mockDoelstelling = createMockDoelstelling();
      mockDoelstelling.estimatedTime = 500; // More than 480 minutes
      
      await expect(DoelstellingService.createDoelstelling(mockDoelstelling))
        .rejects.toThrow('Estimated time must be between 5 and 480 minutes');
    });

    it('should throw error for invalid weight', async () => {
      const mockDoelstelling = createMockDoelstelling();
      mockDoelstelling.weight = 1.5; // More than 1
      
      await expect(DoelstellingService.createDoelstelling(mockDoelstelling))
        .rejects.toThrow('Weight must be between 0 and 1');
    });
  });

  describe('getDoelstellingById', () => {
    it('should return doelstelling when found', async () => {
      const mockId = 'doelstelling123';
      const mockData = { ...createMockDoelstelling(), id: mockId };
      
      mockDoc.mockReturnValue({ id: mockId });
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockData
      });
      
      const result = await DoelstellingService.getDoelstellingById(mockId);
      
      expect(result).toEqual(mockData);
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
    });

    it('should return null when doelstelling not found', async () => {
      mockDoc.mockReturnValue({ id: 'not-found' });
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });
      
      const result = await DoelstellingService.getDoelstellingById('not-found');
      
      expect(result).toBeNull();
    });
  });

  describe('updateDoelstelling', () => {
    it('should update doelstelling with new data', async () => {
      const mockId = 'doelstelling123';
      const updates = {
        title: 'Updated Title',
        description: 'This is an updated description for the doelstelling'
      };
      
      mockDoc.mockReturnValue({ id: mockId });
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await DoelstellingService.updateDoelstelling(mockId, updates);
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: mockId },
        expect.objectContaining({
          ...updates,
          updatedAt: expect.anything()
        })
      );
    });
  });

  describe('deleteDoelstelling', () => {
    it('should delete doelstelling and related progress records', async () => {
      const mockId = 'doelstelling123';
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      
      mockDoc.mockReturnValue({ id: mockId });
      mockDeleteDoc.mockResolvedValue(undefined);
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});
      mockGetDocs.mockResolvedValue({
        docs: [
          { ref: { id: 'progress1' } },
          { ref: { id: 'progress2' } }
        ]
      });
      mockWriteBatch.mockReturnValue(mockBatch);
      
      await DoelstellingService.deleteDoelstelling(mockId);
      
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Query Operations Tests
  // ============================================================================

  describe('getCourseDoelstellingen', () => {
    it('should return filtered and sorted doelstellingen', async () => {
      const courseId = 'course123';
      const mockDoelstellingen = [
        { ...createMockDoelstelling(), id: '1', order: 2 },
        { ...createMockDoelstelling(), id: '2', order: 1 }
      ];
      
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockGetDocs.mockResolvedValue({
        docs: mockDoelstellingen.map(d => ({
          data: () => d
        }))
      });
      
      const result = await DoelstellingService.getCourseDoelstellingen(
        courseId,
        { type: 'skill', level: 'intermediate' },
        { field: 'order', direction: 'asc' }
      );
      
      expect(result).toHaveLength(2);
      expect(mockWhere).toHaveBeenCalledWith('courseId', '==', courseId);
      expect(mockWhere).toHaveBeenCalledWith('type', '==', 'skill');
      expect(mockOrderBy).toHaveBeenCalledWith('order', 'asc');
    });
  });

  // ============================================================================
  // Progress Tracking Tests
  // ============================================================================

  describe('startDoelstellingProgress', () => {
    it('should create new progress record', async () => {
      const userId = 'user123';
      const doelstellingId = 'doelstelling123';
      const courseId = 'course123';
      const progressId = `${userId}_${doelstellingId}`;
      
      mockDoc.mockReturnValue({ id: progressId });
      mockSetDoc.mockResolvedValue(undefined);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ tracking: { viewCount: 5 } })
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const result = await DoelstellingService.startDoelstellingProgress(
        userId,
        doelstellingId,
        courseId
      );
      
      expect(result).toMatchObject({
        id: progressId,
        userId,
        doelstellingId,
        courseId,
        status: 'in-progress',
        bestScore: 0,
        currentScore: 0,
        timeSpent: 0
      });
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1); // For view count increment
    });
  });

  describe('completeDoelstelling', () => {
    it('should mark doelstelling as completed with regular score', async () => {
      const userId = 'user123';
      const doelstellingId = 'doelstelling123';
      const score = 85;
      const timeSpent = 90;
      
      const mockProgress = {
        bestScore: 80,
        timeSpent: 60
      };
      
      mockDoc.mockReturnValue({});
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProgress
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await DoelstellingService.completeDoelstelling(
        userId,
        doelstellingId,
        score,
        timeSpent
      );
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'completed',
          currentScore: score,
          bestScore: score, // Higher than previous best
          timeSpent: 150 // 60 + 90
        })
      );
    });

    it('should mark doelstelling as mastered with high score', async () => {
      const userId = 'user123';
      const doelstellingId = 'doelstelling123';
      const score = 95; // >= 90 for mastery
      const timeSpent = 90;
      
      const mockProgress = {
        bestScore: 80,
        timeSpent: 60
      };
      
      mockDoc.mockReturnValue({});
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProgress
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await DoelstellingService.completeDoelstelling(
        userId,
        doelstellingId,
        score,
        timeSpent
      );
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'mastered'
        })
      );
    });

    it('should throw error if progress not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });
      
      await expect(
        DoelstellingService.completeDoelstelling('user123', 'doelstelling123', 85, 90)
      ).rejects.toThrow('Progress not found');
    });
  });

  // ============================================================================
  // Statistics Tests
  // ============================================================================

  describe('getUserCourseStatistics', () => {
    it('should calculate correct statistics', async () => {
      const userId = 'user123';
      const courseId = 'course123';
      
      const mockProgressRecords = [
        { status: 'completed', currentScore: 85, timeSpent: 120 },
        { status: 'mastered', currentScore: 95, timeSpent: 100 },
        { status: 'in-progress', currentScore: 0, timeSpent: 30 },
        { status: 'completed', currentScore: 80, timeSpent: 110 }
      ];
      
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});
      mockGetDocs.mockResolvedValue({
        docs: mockProgressRecords.map(record => ({
          data: () => record
        }))
      });
      
      const result = await DoelstellingService.getUserCourseStatistics(userId, courseId);
      
      expect(result.totalDoelstellingen).toBe(4);
      expect(result.completedDoelstellingen).toBe(3);
      expect(result.inProgressDoelstellingen).toBe(1);
      expect(result.averageScore).toBeCloseTo(86.67, 1); // (85 + 95 + 80) / 3
      expect(result.totalTimeSpent).toBe(360);
      expect(result.masteryLevel).toBeCloseTo(65, 0); // (3/4) * 86.67
    });

    it('should handle empty progress records', async () => {
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});
      mockGetDocs.mockResolvedValue({ docs: [] });
      
      const result = await DoelstellingService.getUserCourseStatistics('user123', 'course123');
      
      expect(result).toMatchObject({
        totalDoelstellingen: 0,
        completedDoelstellingen: 0,
        inProgressDoelstellingen: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        masteryLevel: 0
      });
    });
  });
});