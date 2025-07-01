import { useState, useEffect } from 'react'
import { Question, Answer } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface QuestionComponentProps {
  question: Question
  questionNumber: number
  answer?: Answer
  onAnswerChange: (answer: Answer) => void
  showExplanation?: boolean
}

export function QuestionComponent({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  showExplanation = false,
}: QuestionComponentProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>(
    answer?.answer || (question.type === 'multiple_select' ? [] : '')
  )

  useEffect(() => {
    // Update answer whenever selectedAnswer changes
    const isCorrect = gradeAnswer(question, selectedAnswer)
    onAnswerChange({
      questionId: question.id,
      answer: selectedAnswer,
      isCorrect,
      points: isCorrect ? question.points : 0,
    })
  }, [selectedAnswer, question, onAnswerChange])

  const gradeAnswer = (q: Question, userAnswer: string | string[]): boolean => {
    switch (q.type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer === q.correctAnswer
      case 'text':
        const correctAnswers = Array.isArray(q.correctAnswer)
          ? q.correctAnswer
          : [q.correctAnswer]
        return correctAnswers.some(
          (correct) =>
            correct.toLowerCase().trim() === (userAnswer as string).toLowerCase().trim()
        )
      case 'multiple_select':
        if (Array.isArray(userAnswer) && Array.isArray(q.correctAnswer)) {
          const userAnswerSet = new Set(userAnswer)
          const correctAnswerSet = new Set(q.correctAnswer as string[])
          return (
            userAnswerSet.size === correctAnswerSet.size &&
            [...userAnswerSet].every((answer) => correctAnswerSet.has(answer))
          )
        }
        return false
      default:
        return false
    }
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={selectedAnswer as string}
            onValueChange={setSelectedAnswer}
            className="space-y-2"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${questionNumber}-option${index}`} />
                <Label
                  htmlFor={`q${questionNumber}-option${index}`}
                  className="cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'true_false':
        return (
          <RadioGroup
            value={selectedAnswer as string}
            onValueChange={setSelectedAnswer}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`q${questionNumber}-true`} />
              <Label htmlFor={`q${questionNumber}-true`} className="cursor-pointer">
                True
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`q${questionNumber}-false`} />
              <Label htmlFor={`q${questionNumber}-false`} className="cursor-pointer">
                False
              </Label>
            </div>
          </RadioGroup>
        )

      case 'multiple_select':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`q${questionNumber}-option${index}`}
                  checked={(selectedAnswer as string[]).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = selectedAnswer as string[]
                    if (checked) {
                      setSelectedAnswer([...currentAnswers, option])
                    } else {
                      setSelectedAnswer(currentAnswers.filter((a) => a !== option))
                    }
                  }}
                />
                <Label
                  htmlFor={`q${questionNumber}-option${index}`}
                  className="cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'text':
        return (
          <Input
            type="text"
            value={selectedAnswer as string}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Question {questionNumber}</span>
          <Badge variant="secondary">{question.points} points</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-lg">{question.question}</p>
          {question.type === 'multiple_select' && (
            <p className="text-sm text-muted-foreground">
              Select all that apply
            </p>
          )}
          {renderQuestionInput()}
          {showExplanation && question.explanation && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Explanation:</p>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}