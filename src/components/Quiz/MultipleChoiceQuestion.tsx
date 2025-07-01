'use client';

import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Question } from './QuizEngine';

interface MultipleChoiceQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}

export function MultipleChoiceQuestion({ question, onAnswer, disabled }: MultipleChoiceQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const handleSubmit = () => {
    if (selectedAnswer) {
      onAnswer(selectedAnswer);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{question.question}</h3>
      
      <RadioGroup
        value={selectedAnswer}
        onValueChange={setSelectedAnswer}
        disabled={disabled}
        className="space-y-3"
      >
        {question.options?.map((option, index) => (
          <motion.div
            key={option}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer text-sm"
              >
                {option}
              </Label>
            </div>
          </motion.div>
        ))}
      </RadioGroup>

      {!disabled && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}