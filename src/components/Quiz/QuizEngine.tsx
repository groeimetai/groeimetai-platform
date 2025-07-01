'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Trophy, Zap } from 'lucide-react';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { CodeCompletionQuestion } from './CodeCompletionQuestion';
import { DragDropQuestion } from './DragDropQuestion';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export interface Question {
  id: string;
  type: 'multiple-choice' | 'code-completion' | 'drag-drop';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  codeTemplate?: string;
  testCases?: { input: string; expectedOutput: string }[];
  items?: { id: string; content: string }[];
  correctOrder?: string[];
  hint?: string;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizEngineProps {
  questions: Question[];
  lessonId: string;
  onComplete: (score: number, totalPoints: number) => void;
  adaptiveDifficulty?: boolean;
}

export function QuizEngine({ questions, lessonId, onComplete, adaptiveDifficulty = true }: QuizEngineProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  useEffect(() => {
    // Adaptive difficulty based on performance
    if (adaptiveDifficulty && currentQuestionIndex > 0) {
      const recentCorrect = Object.values(answers).slice(-3).filter(a => a.correct).length;
      if (recentCorrect === 3) {
        setDifficulty('hard');
      } else if (recentCorrect === 2) {
        setDifficulty('medium');
      } else {
        setDifficulty('easy');
      }
    }
  }, [currentQuestionIndex, answers, adaptiveDifficulty]);

  const handleAnswer = (answer: any) => {
    const isCorrect = checkAnswer(currentQuestion, answer);
    const earnedPoints = isCorrect ? currentQuestion.points * (showHint ? 0.5 : 1) : 0;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { answer, correct: isCorrect, points: earnedPoints }
    }));
    
    if (isCorrect) {
      setScore(prev => prev + earnedPoints);
      setStreak(prev => prev + 1);
      
      if (streak >= 2) {
        toast({
          title: `${streak + 1} in a row!`,
          description: `Keep up the great work!`,
          duration: 2000,
        });
      }
    } else {
      setStreak(0);
    }
    
    setShowFeedback(true);
  };

  const checkAnswer = (question: Question, answer: any): boolean => {
    switch (question.type) {
      case 'multiple-choice':
        return answer === question.correctAnswer;
      case 'code-completion':
        // This would be validated by running tests
        return answer.testsPass;
      case 'drag-drop':
        return JSON.stringify(answer) === JSON.stringify(question.correctOrder);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      onComplete(score, totalPoints);
    }
  };

  const renderQuestion = () => {
    const props = {
      question: currentQuestion,
      onAnswer: handleAnswer,
      disabled: showFeedback,
    };

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return <MultipleChoiceQuestion {...props} />;
      case 'code-completion':
        return <CodeCompletionQuestion {...props} />;
      case 'drag-drop':
        return <DragDropQuestion {...props} />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Question {currentQuestionIndex + 1} of {totalQuestions}</CardTitle>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold">{score} points</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold">{streak} streak</span>
              </div>
            )}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderQuestion()}
            
            {!showFeedback && currentQuestion.hint && (
              <div className="mt-4">
                {!showHint ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Show Hint (-50% points)
                  </Button>
                ) : (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Hint:</strong> {currentQuestion.hint}
                    </p>
                  </div>
                )}
              </div>
            )}

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                  answers[currentQuestion.id]?.correct
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  {answers[currentQuestion.id]?.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      answers[currentQuestion.id]?.correct
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {answers[currentQuestion.id]?.correct ? 'Correct!' : 'Incorrect'}
                    </p>
                    {currentQuestion.explanation && (
                      <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                        {currentQuestion.explanation}
                      </p>
                    )}
                    {answers[currentQuestion.id]?.correct && (
                      <p className="text-sm mt-2 font-medium text-green-700 dark:text-green-300">
                        +{answers[currentQuestion.id]?.points} points earned!
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full"
                  size="lg"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Quiz'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}