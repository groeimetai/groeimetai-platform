/**
 * Unit tests for DoelstellingCard component
 * Testing rendering, interactions, and progress display
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DoelstellingCard } from '../DoelstellingCard';
import { Doelstelling, UserDoelstellingProgress } from '@/types/doelstelling';
import { Timestamp } from 'firebase/firestore';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Target: () => <div data-testid="target-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Award: () => <div data-testid="award-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  BarChart: () => <div data-testid="bar-chart-icon" />,
  BookOpen: () => <div data-testid="book-open-icon" />,
  Code: () => <div data-testid="code-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  User: () => <div data-testid="user-icon" />
}));

describe('DoelstellingCard', () => {
  // Mock data
  const mockDoelstelling: Doelstelling = {
    id: 'doelstelling-1',
    courseId: 'course-1',
    moduleId: 'module-1',
    title: 'Master React Hooks',
    description: 'Learn to effectively use React Hooks including useState, useEffect, and custom hooks for building modern React applications',
    type: 'skill',
    level: 'intermediate',
    category: 'technical',
    status: 'published',
    outcomes: [
      {
        id: 'outcome-1',
        description: 'Understand the purpose and benefits of React Hooks',
        measurable: true,
        bloomLevel: 'understand',
        assessmentMethod: 'quiz',
        requiredScore: 80
      },
      {
        id: 'outcome-2',
        description: 'Implement custom hooks for reusable logic',
        measurable: true,
        bloomLevel: 'create',
        assessmentMethod: 'project',
        requiredScore: 75
      },
      {
        id: 'outcome-3',
        description: 'Debug and optimize hook-based components',
        measurable: true,
        bloomLevel: 'analyze',
        assessmentMethod: 'assignment',
        requiredScore: 85
      }
    ],
    assessmentCriteria: [
      {
        id: 'criterion-1',
        description: 'Correct implementation of hooks',
        weight: 0.6,
        rubric: [],
        evidenceRequired: ['Code submission']
      }
    ],
    prerequisites: [],
    enablesNext: [],
    estimatedTime: 120,
    points: 100,
    weight: 0.8,
    order: 1,
    tracking: {
      viewCount: 150,
      averageCompletionTime: 110,
      completionRate: 0.75,
      averageScore: 82
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const mockProgressInProgress: UserDoelstellingProgress = {
    id: 'user-1_doelstelling-1',
    userId: 'user-1',
    doelstellingId: 'doelstelling-1',
    courseId: 'course-1',
    status: 'in-progress',
    startedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
    attempts: [],
    bestScore: 0,
    currentScore: 65,
    timeSpent: 45,
    outcomesProgress: [
      {
        outcomeId: 'outcome-1',
        achieved: true,
        score: 85,
        achievedAt: Timestamp.now(),
        evidence: []
      },
      {
        outcomeId: 'outcome-2',
        achieved: false,
        score: 45,
        evidence: []
      }
    ],
    notes: '',
    reflections: [],
    feedback: []
  };

  const mockProgressCompleted: UserDoelstellingProgress = {
    ...mockProgressInProgress,
    status: 'completed',
    completedAt: Timestamp.now(),
    currentScore: 85,
    bestScore: 85,
    outcomesProgress: mockDoelstelling.outcomes.map(outcome => ({
      outcomeId: outcome.id,
      achieved: true,
      score: 85,
      achievedAt: Timestamp.now(),
      evidence: []
    }))
  };

  const mockProgressMastered: UserDoelstellingProgress = {
    ...mockProgressCompleted,
    status: 'mastered',
    currentScore: 95,
    bestScore: 95
  };

  // Test cases
  describe('Rendering', () => {
    it('should render doelstelling without progress', () => {
      render(<DoelstellingCard doelstelling={mockDoelstelling} />);
      
      expect(screen.getByText('Master React Hooks')).toBeInTheDocument();
      expect(screen.getByText(/Learn to effectively use React Hooks/)).toBeInTheDocument();
      expect(screen.getByText('intermediate')).toBeInTheDocument();
      expect(screen.getByText('technical')).toBeInTheDocument();
      expect(screen.getByText('120 min')).toBeInTheDocument();
      expect(screen.getByText('100 points')).toBeInTheDocument();
    });

    it('should render learning outcomes', () => {
      render(<DoelstellingCard doelstelling={mockDoelstelling} />);
      
      expect(screen.getByText('Learning Outcomes:')).toBeInTheDocument();
      expect(screen.getByText(/Understand the purpose and benefits/)).toBeInTheDocument();
      expect(screen.getByText(/Implement custom hooks/)).toBeInTheDocument();
      expect(screen.getByText(/Debug and optimize/)).toBeInTheDocument();
    });

    it('should render with in-progress status', () => {
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={mockProgressInProgress}
        />
      );
      
      expect(screen.getByText('Continue')).toBeInTheDocument();
      expect(screen.getByText('Score: 65%')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toHaveStyle({ width: '33%' }); // 1/3 outcomes achieved
    });

    it('should render with completed status', () => {
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={mockProgressCompleted}
        />
      );
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Score: 85%')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toHaveStyle({ width: '100%' });
    });

    it('should render with mastered status', () => {
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={mockProgressMastered}
        />
      );
      
      expect(screen.getByText('Mastered')).toBeInTheDocument();
      expect(screen.getByTestId('award-icon')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toHaveStyle({ width: '100%' });
    });

    it('should render compact version', () => {
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          compact={true}
        />
      );
      
      expect(screen.getByTestId('doelstelling-card-compact')).toBeInTheDocument();
      expect(screen.getByText('Master React Hooks')).toBeInTheDocument();
      expect(screen.queryByText('Learning Outcomes:')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onStart when Start button is clicked', () => {
      const onStart = jest.fn();
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          onStart={onStart}
        />
      );
      
      fireEvent.click(screen.getByText('Start'));
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('should call onContinue when Continue button is clicked', () => {
      const onContinue = jest.fn();
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={mockProgressInProgress}
          onContinue={onContinue}
        />
      );
      
      fireEvent.click(screen.getByText('Continue'));
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('should call onViewDetails when Details button is clicked', () => {
      const onViewDetails = jest.fn();
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          onViewDetails={onViewDetails}
        />
      );
      
      fireEvent.click(screen.getByText('Details'));
      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should call onViewDetails when compact card is clicked', () => {
      const onViewDetails = jest.fn();
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          compact={true}
          onViewDetails={onViewDetails}
        />
      );
      
      fireEvent.click(screen.getByTestId('doelstelling-card-compact'));
      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });
  });

  describe('Progress Display', () => {
    it('should not show progress bar when showProgress is false', () => {
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={mockProgressInProgress}
          showProgress={false}
        />
      );
      
      expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });

    it('should correctly calculate progress percentage', () => {
      const partialProgress = {
        ...mockProgressInProgress,
        outcomesProgress: [
          {
            outcomeId: 'outcome-1',
            achieved: true,
            score: 85,
            achievedAt: Timestamp.now(),
            evidence: []
          },
          {
            outcomeId: 'outcome-2',
            achieved: true,
            score: 90,
            achievedAt: Timestamp.now(),
            evidence: []
          },
          {
            outcomeId: 'outcome-3',
            achieved: false,
            score: 0,
            evidence: []
          }
        ]
      };
      
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={partialProgress}
        />
      );
      
      expect(screen.getByTestId('progress-bar')).toHaveStyle({ width: '67%' }); // 2/3 outcomes
    });

    it('should show outcome completion status', () => {
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={mockProgressInProgress}
        />
      );
      
      const checkCircles = screen.getAllByTestId('check-circle-icon');
      const circles = screen.getAllByTestId('circle-icon');
      
      expect(checkCircles).toHaveLength(1); // 1 achieved outcome
      expect(circles).toHaveLength(2); // 2 not achieved
    });
  });

  describe('Styling and Appearance', () => {
    it('should apply correct styling for different levels', () => {
      const beginnerDoelstelling = { ...mockDoelstelling, level: 'foundation' as const };
      const { rerender } = render(<DoelstellingCard doelstelling={beginnerDoelstelling} />);
      
      expect(screen.getByText('foundation')).toHaveClass('bg-green-100', 'text-green-800');
      
      const advancedDoelstelling = { ...mockDoelstelling, level: 'advanced' as const };
      rerender(<DoelstellingCard doelstelling={advancedDoelstelling} />);
      
      expect(screen.getByText('advanced')).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('should show correct icons for different types', () => {
      const skillDoelstelling = { ...mockDoelstelling, type: 'skill' as const };
      const { rerender } = render(<DoelstellingCard doelstelling={skillDoelstelling} />);
      
      expect(screen.getByTestId('code-icon')).toBeInTheDocument();
      
      const knowledgeDoelstelling = { ...mockDoelstelling, type: 'knowledge' as const };
      rerender(<DoelstellingCard doelstelling={knowledgeDoelstelling} />);
      
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    });

    it('should apply special styling for mastered cards', () => {
      const { container } = render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={mockProgressMastered}
        />
      );
      
      const card = container.querySelector('[data-testid="doelstelling-card"]');
      expect(card).toHaveClass('border-gold-500', 'bg-gradient-to-br');
    });
  });

  describe('Edge Cases', () => {
    it('should handle doelstelling with many outcomes', () => {
      const manyOutcomes = {
        ...mockDoelstelling,
        outcomes: Array(10).fill(null).map((_, i) => ({
          id: `outcome-${i}`,
          description: `Outcome ${i}`,
          measurable: true,
          bloomLevel: 'understand' as const,
          assessmentMethod: 'quiz' as const,
          requiredScore: 80
        }))
      };
      
      render(<DoelstellingCard doelstelling={manyOutcomes} />);
      
      expect(screen.getByText('+7 more outcomes')).toBeInTheDocument();
    });

    it('should handle zero progress gracefully', () => {
      const zeroProgress = {
        ...mockProgressInProgress,
        outcomesProgress: []
      };
      
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={zeroProgress}
        />
      );
      
      expect(screen.getByTestId('progress-bar')).toHaveStyle({ width: '0%' });
    });

    it('should handle missing action handlers', () => {
      render(
        <DoelstellingCard 
          doelstelling={mockDoelstelling} 
          progress={mockProgressInProgress}
        />
      );
      
      // Should not render action buttons without handlers
      expect(screen.queryByText('Start')).not.toBeInTheDocument();
      expect(screen.queryByText('Continue')).not.toBeInTheDocument();
    });
  });
});