import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';

export interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: Date;
  badges: Badge[];
  achievements: Achievement[];
  skills: Skill[];
  certificates: string[];
  stats: {
    lessonsCompleted: number;
    quizzesPassed: number;
    codeSubmissions: number;
    helpfulAnswers: number;
    perfectScores: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  xpReward: number;
  badgeReward?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  subSkills?: Skill[];
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  xp: number;
  level: number;
  rank: number;
  badges: number;
}

// XP rewards for different actions
export const XP_REWARDS = {
  LESSON_COMPLETE: 50,
  QUIZ_PASS: 100,
  QUIZ_PERFECT: 150,
  CODE_CHALLENGE: 75,
  HELPFUL_ANSWER: 25,
  DAILY_STREAK: 10,
  WEEKLY_STREAK: 50,
  COURSE_COMPLETE: 500,
  FIRST_BADGE: 100,
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000,
  13000, 16500, 20500, 25000, 30000, 36000, 43000, 51000, 60000
];

// Badge definitions
export const BADGES: Record<string, Omit<Badge, 'unlockedAt'>> = {
  FIRST_LESSON: {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '👣',
    rarity: 'common'
  },
  QUIZ_MASTER: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Get 10 perfect quiz scores',
    icon: '🎯',
    rarity: 'rare'
  },
  CODE_WARRIOR: {
    id: 'code_warrior',
    name: 'Code Warrior',
    description: 'Complete 50 coding challenges',
    icon: '⚔️',
    rarity: 'epic'
  },
  HELPER: {
    id: 'helper',
    name: 'Community Helper',
    description: 'Get 25 helpful answers',
    icon: '🤝',
    rarity: 'rare'
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    rarity: 'legendary'
  },
  POLYGLOT: {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Master 5 different programming languages',
    icon: '🌍',
    rarity: 'legendary'
  }
};

class GamificationService {
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const progressDoc = await getDoc(doc(db, 'userProgress', userId));
      if (!progressDoc.exists()) {
        return null;
      }
      return progressDoc.data() as UserProgress;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  }

  async initializeUserProgress(userId: string): Promise<UserProgress> {
    const initialProgress: UserProgress = {
      userId,
      xp: 0,
      level: 1,
      streak: 0,
      lastActivityDate: new Date(),
      badges: [],
      achievements: this.getInitialAchievements(),
      skills: this.getInitialSkills(),
      certificates: [],
      stats: {
        lessonsCompleted: 0,
        quizzesPassed: 0,
        codeSubmissions: 0,
        helpfulAnswers: 0,
        perfectScores: 0
      }
    };

    await setDoc(doc(db, 'userProgress', userId), {
      ...initialProgress,
      lastActivityDate: serverTimestamp()
    });

    return initialProgress;
  }

  async awardXP(userId: string, amount: number, reason: string): Promise<void> {
    const userProgressRef = doc(db, 'userProgress', userId);
    
    // Get current progress
    const progress = await this.getUserProgress(userId);
    if (!progress) {
      await this.initializeUserProgress(userId);
    }

    const currentXP = progress?.xp || 0;
    const newXP = currentXP + amount;
    const newLevel = this.calculateLevel(newXP);
    const leveledUp = newLevel > (progress?.level || 1);

    // Update progress
    await updateDoc(userProgressRef, {
      xp: increment(amount),
      level: newLevel,
      lastActivityDate: serverTimestamp()
    });

    // Record XP transaction
    await setDoc(doc(collection(db, 'xpTransactions')), {
      userId,
      amount,
      reason,
      timestamp: serverTimestamp()
    });

    // Check for level up rewards
    if (leveledUp) {
      await this.handleLevelUp(userId, newLevel);
    }
  }

  calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  async handleLevelUp(userId: string, newLevel: number): Promise<void> {
    // Award level up bonus XP
    await this.awardXP(userId, newLevel * 10, `Level ${newLevel} reached!`);
    
    // Check for level-based badges
    if (newLevel === 5) {
      await this.awardBadge(userId, 'NOVICE');
    } else if (newLevel === 10) {
      await this.awardBadge(userId, 'INTERMEDIATE');
    } else if (newLevel === 20) {
      await this.awardBadge(userId, 'EXPERT');
    }
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const badge = BADGES[badgeId];
    if (!badge) return;

    const userProgressRef = doc(db, 'userProgress', userId);
    
    await updateDoc(userProgressRef, {
      badges: arrayUnion({
        ...badge,
        unlockedAt: serverTimestamp()
      })
    });

    // Award XP for first badge
    const progress = await this.getUserProgress(userId);
    if (progress?.badges.length === 0) {
      await this.awardXP(userId, XP_REWARDS.FIRST_BADGE, 'First badge earned!');
    }
  }

  async updateStreak(userId: string): Promise<number> {
    const progress = await this.getUserProgress(userId);
    if (!progress) {
      await this.initializeUserProgress(userId);
      return 1;
    }

    const lastActivity = progress.lastActivityDate;
    const today = new Date();
    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = progress.streak;
    
    if (daysSinceLastActivity === 0) {
      // Already active today
      return newStreak;
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day
      newStreak += 1;
      await this.awardXP(userId, XP_REWARDS.DAILY_STREAK, 'Daily streak bonus!');
      
      // Weekly streak bonus
      if (newStreak % 7 === 0) {
        await this.awardXP(userId, XP_REWARDS.WEEKLY_STREAK, `${newStreak / 7} week streak!`);
      }
      
      // Check for streak badge
      if (newStreak === 30) {
        await this.awardBadge(userId, 'STREAK_MASTER');
      }
    } else {
      // Streak broken
      newStreak = 1;
    }

    await updateDoc(doc(db, 'userProgress', userId), {
      streak: newStreak,
      lastActivityDate: serverTimestamp()
    });

    return newStreak;
  }

  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<void> {
    const userProgress = await this.getUserProgress(userId);
    if (!userProgress) return;

    const achievements = userProgress.achievements.map(a => {
      if (a.id === achievementId) {
        const newProgress = Math.min(a.progress + progress, a.maxProgress);
        const wasCompleted = a.completed;
        const isCompleted = newProgress >= a.maxProgress;
        
        // Award XP for completion
        if (!wasCompleted && isCompleted) {
          this.awardXP(userId, a.xpReward, `Achievement unlocked: ${a.name}`);
          if (a.badgeReward) {
            this.awardBadge(userId, a.badgeReward);
          }
        }
        
        return {
          ...a,
          progress: newProgress,
          completed: isCompleted
        };
      }
      return a;
    });

    await updateDoc(doc(db, 'userProgress', userId), {
      achievements
    });
  }

  async updateSkillProgress(
    userId: string,
    skillId: string,
    xpGained: number
  ): Promise<void> {
    const userProgress = await this.getUserProgress(userId);
    if (!userProgress) return;

    const updateSkillRecursive = (skills: Skill[]): Skill[] => {
      return skills.map(skill => {
        if (skill.id === skillId) {
          const newXp = skill.xp + xpGained;
          let newLevel = skill.level;
          let remainingXp = newXp;
          
          // Calculate new level
          while (remainingXp >= skill.nextLevelXp) {
            remainingXp -= skill.nextLevelXp;
            newLevel++;
          }
          
          return {
            ...skill,
            xp: remainingXp,
            level: newLevel,
            nextLevelXp: newLevel * 100 // Simple progression
          };
        }
        
        if (skill.subSkills) {
          return {
            ...skill,
            subSkills: updateSkillRecursive(skill.subSkills)
          };
        }
        
        return skill;
      });
    };

    const updatedSkills = updateSkillRecursive(userProgress.skills);
    
    await updateDoc(doc(db, 'userProgress', userId), {
      skills: updatedSkills
    });
  }

  async getLeaderboard(timeframe: 'daily' | 'weekly' | 'all-time', limit = 10): Promise<LeaderboardEntry[]> {
    try {
      const q = query(
        collection(db, 'userProgress'),
        orderBy('xp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      const entries: LeaderboardEntry[] = [];
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        entries.push({
          userId: data.userId,
          userName: data.userName || 'Anonymous',
          userAvatar: data.userAvatar,
          xp: data.xp,
          level: data.level,
          rank: index + 1,
          badges: data.badges?.length || 0
        });
      });
      
      return entries;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  private getInitialAchievements(): Achievement[] {
    return [
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first lesson',
        progress: 0,
        maxProgress: 1,
        completed: false,
        xpReward: 50
      },
      {
        id: 'quiz_champion',
        name: 'Quiz Champion',
        description: 'Pass 10 quizzes',
        progress: 0,
        maxProgress: 10,
        completed: false,
        xpReward: 200,
        badgeReward: 'QUIZ_MASTER'
      },
      {
        id: 'code_master',
        name: 'Code Master',
        description: 'Complete 50 coding challenges',
        progress: 0,
        maxProgress: 50,
        completed: false,
        xpReward: 500,
        badgeReward: 'CODE_WARRIOR'
      },
      {
        id: 'helpful_hero',
        name: 'Helpful Hero',
        description: 'Get 25 helpful answers in discussions',
        progress: 0,
        maxProgress: 25,
        completed: false,
        xpReward: 300,
        badgeReward: 'HELPER'
      }
    ];
  }

  private getInitialSkills(): Skill[] {
    return [
      {
        id: 'programming',
        name: 'Programming',
        category: 'technical',
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        subSkills: [
          {
            id: 'javascript',
            name: 'JavaScript',
            category: 'language',
            level: 1,
            xp: 0,
            nextLevelXp: 100
          },
          {
            id: 'python',
            name: 'Python',
            category: 'language',
            level: 1,
            xp: 0,
            nextLevelXp: 100
          }
        ]
      },
      {
        id: 'ai_ml',
        name: 'AI & Machine Learning',
        category: 'technical',
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        subSkills: [
          {
            id: 'prompt_engineering',
            name: 'Prompt Engineering',
            category: 'ai',
            level: 1,
            xp: 0,
            nextLevelXp: 100
          },
          {
            id: 'llm_integration',
            name: 'LLM Integration',
            category: 'ai',
            level: 1,
            xp: 0,
            nextLevelXp: 100
          }
        ]
      }
    ];
  }
}

export const gamificationService = new GamificationService();