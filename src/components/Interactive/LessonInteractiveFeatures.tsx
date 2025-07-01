'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Code2, 
  Trophy, 
  HelpCircle,
  Zap,
  ChevronRight
} from 'lucide-react';
import { QuizEngine, Question } from '@/components/Quiz';
import { CodingChallenge, Challenge } from '@/components/LiveCoding/CodingChallenge';
import { DiscussionThread } from '@/components/Discussion/DiscussionThread';
import { useProgress } from '@/hooks/useProgress';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface LessonInteractiveFeaturesProps {
  lessonId: string;
  lessonTitle: string;
  quizQuestions?: Question[];
  codingChallenges?: Challenge[];
  enableDiscussion?: boolean;
  nextLessonId?: string;
  onLessonComplete?: () => void;
}

export function LessonInteractiveFeatures({
  lessonId,
  lessonTitle,
  quizQuestions = [],
  codingChallenges = [],
  enableDiscussion = true,
  nextLessonId,
  onLessonComplete
}: LessonInteractiveFeaturesProps) {
  const [user] = useAuthState(auth);
  const { completeLesson, completeQuiz, completeCodeChallenge } = useProgress();
  const { toast } = useToast();
  const [completedQuiz, setCompletedQuiz] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('quiz');

  const handleQuizComplete = async (score: number, totalPoints: number) => {
    setCompletedQuiz(true);
    await completeQuiz(score, totalPoints);
    
    const percentage = (score / totalPoints) * 100;
    toast({
      title: percentage === 100 ? 'Perfect Score!' : 'Quiz Completed!',
      description: `You scored ${score} out of ${totalPoints} points (${percentage.toFixed(0)}%)`,
    });

    // Check if all activities are completed
    checkLessonCompletion();
  };

  const handleChallengeComplete = async (
    challengeId: string,
    timeSpent: number,
    testsPass: number,
    totalTests: number
  ) => {
    setCompletedChallenges(prev => new Set(prev).add(challengeId));
    await completeCodeChallenge(challengeId);
    
    toast({
      title: 'Challenge Completed!',
      description: `${testsPass}/${totalTests} tests passed in ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`,
    });

    // Check if all activities are completed
    checkLessonCompletion();
  };

  const checkLessonCompletion = () => {
    const quizDone = completedQuiz || quizQuestions.length === 0;
    const challengesDone = completedChallenges.size === codingChallenges.length;
    
    if (quizDone && challengesDone) {
      completeLesson(lessonId);
      if (onLessonComplete) {
        onLessonComplete();
      }
      
      toast({
        title: 'Lesson Completed!',
        description: 'Great job! You\'ve completed all activities in this lesson.',
        action: nextLessonId ? (
          <Button size="sm" onClick={() => window.location.href = `/cursussen/${nextLessonId}`}>
            Next Lesson <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : undefined
      });
    }
  };

  const getTabBadge = (type: 'quiz' | 'challenges' | 'discussion') => {
    switch (type) {
      case 'quiz':
        return completedQuiz ? 'Completed' : quizQuestions.length > 0 ? 'Required' : 'No quiz';
      case 'challenges':
        return completedChallenges.size === codingChallenges.length && codingChallenges.length > 0
          ? 'Completed'
          : `${completedChallenges.size}/${codingChallenges.length}`;
      case 'discussion':
        return 'Open';
      default:
        return '';
    }
  };

  const getTabVariant = (type: 'quiz' | 'challenges' | 'discussion') => {
    switch (type) {
      case 'quiz':
        return completedQuiz ? 'default' : 'secondary';
      case 'challenges':
        return completedChallenges.size === codingChallenges.length && codingChallenges.length > 0
          ? 'default'
          : 'secondary';
      default:
        return 'outline';
    }
  };

  if (!user) {
    return (
      <Card className="mt-8">
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Log in to Access Interactive Features</h3>
          <p className="text-gray-500 mb-4">Complete quizzes, solve challenges, and join discussions</p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Interactive Learning
            </span>
            <div className="flex items-center gap-2">
              {completedQuiz && quizQuestions.length > 0 && (
                <Badge variant="default" className="bg-green-500">
                  Quiz Complete
                </Badge>
              )}
              {completedChallenges.size === codingChallenges.length && codingChallenges.length > 0 && (
                <Badge variant="default" className="bg-blue-500">
                  All Challenges Complete
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quiz" className="relative">
                <HelpCircle className="w-4 h-4 mr-2" />
                Quiz
                <Badge 
                  variant={getTabVariant('quiz')}
                  className="ml-2 text-xs"
                >
                  {getTabBadge('quiz')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="relative">
                <Code2 className="w-4 h-4 mr-2" />
                Challenges
                <Badge 
                  variant={getTabVariant('challenges')}
                  className="ml-2 text-xs"
                >
                  {getTabBadge('challenges')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="w-4 h-4 mr-2" />
                Discussion
                <Badge variant="outline" className="ml-2 text-xs">
                  {getTabBadge('discussion')}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quiz" className="mt-6">
              {quizQuestions.length > 0 ? (
                completedQuiz ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                      <h3 className="text-lg font-semibold mb-2">Quiz Completed!</h3>
                      <p className="text-gray-500">You've already completed this quiz.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <QuizEngine
                    questions={quizQuestions}
                    lessonId={lessonId}
                    onComplete={handleQuizComplete}
                  />
                )
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No quiz available for this lesson</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="challenges" className="mt-6">
              {codingChallenges.length > 0 ? (
                <div className="space-y-6">
                  {codingChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {completedChallenges.has(challenge.id) ? (
                        <Card className="border-green-300">
                          <CardContent className="py-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-green-500" />
                                <div>
                                  <h4 className="font-semibold">{challenge.title}</h4>
                                  <p className="text-sm text-gray-500">Challenge completed!</p>
                                </div>
                              </div>
                              <Badge variant="default" className="bg-green-500">
                                Completed
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <CodingChallenge
                          challenge={challenge}
                          onComplete={(time, pass, total) => 
                            handleChallengeComplete(challenge.id, time, pass, total)
                          }
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Code2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No coding challenges available for this lesson</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="discussion" className="mt-6">
              {enableDiscussion ? (
                <DiscussionThread
                  lessonId={lessonId}
                  lessonTitle={lessonTitle}
                  currentUserId={user.uid}
                  currentUserName={user.displayName || 'Anonymous'}
                  currentUserAvatar={user.photoURL || undefined}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Discussion is not available for this lesson</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}