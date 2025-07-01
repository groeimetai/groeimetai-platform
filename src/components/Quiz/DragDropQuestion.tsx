'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { Question } from './QuizEngine';
import { motion, Reorder, useDragControls } from 'framer-motion';

interface DragDropQuestionProps {
  question: Question;
  onAnswer: (answer: string[]) => void;
  disabled: boolean;
}

interface DraggableItem {
  id: string;
  content: string;
}

export function DragDropQuestion({ question, onAnswer, disabled }: DragDropQuestionProps) {
  const [items, setItems] = useState<DraggableItem[]>(question.items || []);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleReorder = (newOrder: DraggableItem[]) => {
    setItems(newOrder);
    setHasInteracted(true);
  };

  const handleSubmit = () => {
    const orderedIds = items.map(item => item.id);
    onAnswer(orderedIds);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{question.question}</h3>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drag and drop the items to arrange them in the correct order
        </p>
        
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {items.map((item) => (
            <DraggableCard
              key={item.id}
              item={item}
              disabled={disabled}
            />
          ))}
        </Reorder.Group>

        {!disabled && (
          <Button
            onClick={handleSubmit}
            disabled={!hasInteracted}
            className="w-full"
            size="lg"
          >
            Submit Order
          </Button>
        )}
      </div>
    </div>
  );
}

interface DraggableCardProps {
  item: DraggableItem;
  disabled: boolean;
}

function DraggableCard({ item, disabled }: DraggableCardProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={!disabled}
      dragControls={controls}
      className={`select-none ${disabled ? 'cursor-not-allowed' : 'cursor-move'}`}
    >
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileDrag={{ scale: 1.05 }}
        className={`
          p-4 rounded-lg border bg-white dark:bg-gray-800
          ${disabled
            ? 'border-gray-200 dark:border-gray-700 opacity-75'
            : 'border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md'
          }
          transition-shadow
        `}
      >
        <div className="flex items-center gap-3">
          <div
            onPointerDown={(e) => !disabled && controls.start(e)}
            className={`${disabled ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.content}</p>
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}