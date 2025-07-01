'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Zap, 
  Flame, 
  Target, 
  Award,
  TrendingUp,
  Star,
  Users,
  ChevronRight,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@/hooks/useProgress';
import { LEVEL_THRESHOLDS, Badge as BadgeType, Achievement, Skill } from '@/services/gamificationService';
import { cn } from '@/lib/utils';

export function ProgressDashboard() {
  const { progress, loading, getProgressToNextLevel, getStreakStatus } = useProgress();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-500">Please log in to view your progress</p>
      </div>
    );
  }

  const levelProgress = getProgressToNextLevel();
  const streakStatus = getStreakStatus();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Level Progress Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">Level {progress.level}</h2>
              <p className="text-purple-100">
                {levelProgress.current} / {levelProgress.needed} XP to next level
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold flex items-center gap-2">
                <Zap className="w-8 h-8" />
                {progress.xp.toLocaleString()}
              </div>
              <p className="text-purple-100">Total XP</p>
            </div>
          </div>
          <Progress value={levelProgress.percentage} className="h-3 bg-purple-300" />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          title="Current Streak"
          value={`${streakStatus.days} days`}
          subtitle={streakStatus.active ? 'Keep it up!' : 'Start learning today!'}
          color="orange"
        />
        <StatsCard
          icon={<Trophy className="w-6 h-6 text-yellow-500" />}
          title="Badges Earned"
          value={progress.badges.length.toString()}
          subtitle={`${Object.keys(BADGES).length - progress.badges.length} more to unlock`}
          color="yellow"
        />
        <StatsCard
          icon={<Target className="w-6 h-6 text-green-500" />}
          title="Lessons Completed"
          value={progress.stats.lessonsCompleted.toString()}
          subtitle="Keep learning!"
          color="green"
        />
        <StatsCard
          icon={<Star className="w-6 h-6 text-blue-500" />}
          title="Perfect Quizzes"
          value={progress.stats.perfectScores.toString()}
          subtitle="Aim for perfection!"
          color="blue"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock activity items */}
                <ActivityItem
                  icon={<Zap className="w-4 h-4" />}
                  title="Earned 150 XP"
                  subtitle="Completed 'Introduction to AI' with perfect score"
                  time="2 hours ago"
                />
                <ActivityItem
                  icon={<Trophy className="w-4 h-4" />}
                  title="New Badge Unlocked"
                  subtitle="Quiz Master - Get 10 perfect quiz scores"
                  time="Yesterday"
                />
                <ActivityItem
                  icon={<Flame className="w-4 h-4" />}
                  title="7 Day Streak!"
                  subtitle="You're on fire! Keep learning every day"
                  time="This morning"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badge Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(BADGES).map(([key, badge]) => {
                  const isUnlocked = progress.badges.some(b => b.id === badge.id);
                  return (
                    <BadgeCard
                      key={key}
                      badge={badge}
                      isUnlocked={isUnlocked}
                      unlockedAt={progress.badges.find(b => b.id === badge.id)?.unlockedAt}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progress.skills.map(skill => (
                  <SkillCategory key={skill.id} skill={skill} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress.achievements.map(achievement => (
                  <AchievementItem key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

function StatsCard({ icon, title, value, subtitle, color }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          {icon}
          <span className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
            {value}
          </span>
        </div>
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
}

function ActivityItem({ icon, title, subtitle, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
}

interface BadgeCardProps {
  badge: Omit<BadgeType, 'unlockedAt'>;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
  const rarityColors = {
    common: 'border-gray-300',
    rare: 'border-blue-300',
    epic: 'border-purple-300',
    legendary: 'border-yellow-300'
  };

  return (
    <motion.div
      whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
      className={cn(
        'relative p-4 rounded-lg border-2 transition-all cursor-pointer',
        isUnlocked ? rarityColors[badge.rarity] : 'border-gray-200 opacity-50'
      )}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">
          {isUnlocked ? badge.icon : <Lock className="w-10 h-10 mx-auto text-gray-400" />}
        </div>
        <h4 className="font-medium text-sm">{badge.name}</h4>
        <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
        {isUnlocked && (
          <Badge className="mt-2" variant="outline">
            {badge.rarity}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

interface SkillCategoryProps {
  skill: Skill;
}

function SkillCategory({ skill }: SkillCategoryProps) {
  const [expanded, setExpanded] = useState(false);
  const progress = (skill.xp / skill.nextLevelXp) * 100;

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{skill.name}</h4>
            <span className="text-sm font-bold">Level {skill.level}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {skill.xp} / {skill.nextLevelXp} XP
          </p>
        </div>
        {skill.subSkills && (
          <ChevronRight
            className={cn(
              'w-5 h-5 ml-4 transition-transform',
              expanded && 'rotate-90'
            )}
          />
        )}
      </div>

      <AnimatePresence>
        {expanded && skill.subSkills && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-8 space-y-3"
          >
            {skill.subSkills.map(subSkill => (
              <SkillCategory key={subSkill.id} skill={subSkill} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AchievementItemProps {
  achievement: Achievement;
}

function AchievementItem({ achievement }: AchievementItemProps) {
  const progress = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      achievement.completed
        ? 'bg-green-50 dark:bg-green-900/20 border-green-300'
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200'
    )}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium flex items-center gap-2">
          {achievement.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
          {achievement.name}
        </h4>
        <Badge variant={achievement.completed ? 'default' : 'outline'}>
          {achievement.xpReward} XP
        </Badge>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {achievement.description}
      </p>
      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-gray-500">
          {achievement.progress} / {achievement.maxProgress}
        </p>
      </div>
    </div>
  );
}

// Import BADGES from gamification service
import { BADGES } from '@/services/gamificationService';
import { CheckCircle } from 'lucide-react';