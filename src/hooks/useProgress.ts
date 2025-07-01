import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import {
  gamificationService,
  UserProgress,
  XP_REWARDS,
  LEVEL_THRESHOLDS
} from '@/services/gamificationService';
import { useToast } from '@/components/ui/use-toast';

export function useProgress() {
  const [user] = useAuthState(auth);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    loadUserProgress();
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      let userProgress = await gamificationService.getUserProgress(user.uid);
      
      if (!userProgress) {
        userProgress = await gamificationService.initializeUserProgress(user.uid);
      }
      
      setProgress(userProgress);
    } catch (error) {
      console.error('Error loading user progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to load progress data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const awardXP = async (amount: number, reason: string) => {
    if (!user) return;

    try {
      await gamificationService.awardXP(user.uid, amount, reason);
      
      // Show XP notification
      toast({
        title: `+${amount} XP!`,
        description: reason,
        duration: 3000,
      });
      
      // Reload progress
      await loadUserProgress();
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;

    try {
      await awardXP(XP_REWARDS.LESSON_COMPLETE, 'Lesson completed!');
      
      // Update achievements
      await gamificationService.updateAchievementProgress(user.uid, 'first_steps', 1);
      
      // Update stats
      if (progress) {
        await gamificationService.updateSkillProgress(
          user.uid,
          'programming', // This should be dynamic based on lesson
          25
        );
      }
      
      // Update streak
      await gamificationService.updateStreak(user.uid);
      
      await loadUserProgress();
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const completeQuiz = async (score: number, totalPoints: number) => {
    if (!user) return;

    try {
      const percentage = (score / totalPoints) * 100;
      const isPerfect = percentage === 100;
      
      const xpReward = isPerfect ? XP_REWARDS.QUIZ_PERFECT : XP_REWARDS.QUIZ_PASS;
      await awardXP(xpReward, isPerfect ? 'Perfect quiz score!' : 'Quiz completed!');
      
      // Update achievements
      await gamificationService.updateAchievementProgress(user.uid, 'quiz_champion', 1);
      
      // Update stats
      if (progress) {
        const updatedStats = { ...progress.stats };
        updatedStats.quizzesPassed += 1;
        if (isPerfect) {
          updatedStats.perfectScores += 1;
        }
      }
      
      await loadUserProgress();
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  const completeCodeChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await awardXP(XP_REWARDS.CODE_CHALLENGE, 'Code challenge completed!');
      
      // Update achievements
      await gamificationService.updateAchievementProgress(user.uid, 'code_master', 1);
      
      await loadUserProgress();
    } catch (error) {
      console.error('Error completing code challenge:', error);
    }
  };

  const markAnswerHelpful = async () => {
    if (!user) return;

    try {
      await awardXP(XP_REWARDS.HELPFUL_ANSWER, 'Your answer was marked as helpful!');
      
      // Update achievements
      await gamificationService.updateAchievementProgress(user.uid, 'helpful_hero', 1);
      
      await loadUserProgress();
    } catch (error) {
      console.error('Error marking answer helpful:', error);
    }
  };

  const getProgressToNextLevel = () => {
    if (!progress) return { current: 0, needed: 100, percentage: 0 };
    
    const currentLevelThreshold = LEVEL_THRESHOLDS[progress.level - 1] || 0;
    const nextLevelThreshold = LEVEL_THRESHOLDS[progress.level] || currentLevelThreshold + 1000;
    
    const current = progress.xp - currentLevelThreshold;
    const needed = nextLevelThreshold - currentLevelThreshold;
    const percentage = (current / needed) * 100;
    
    return { current, needed, percentage };
  };

  const getStreakStatus = () => {
    if (!progress) return { active: false, days: 0, bonus: 0 };
    
    const active = progress.streak > 0;
    const days = progress.streak;
    const bonus = Math.floor(days / 7) * XP_REWARDS.WEEKLY_STREAK;
    
    return { active, days, bonus };
  };

  return {
    progress,
    loading,
    awardXP,
    completeLesson,
    completeQuiz,
    completeCodeChallenge,
    markAnswerHelpful,
    getProgressToNextLevel,
    getStreakStatus,
    reload: loadUserProgress
  };
}