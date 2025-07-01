# Interactive Learning System

## Installation

Na het toevoegen van de interactive learning features, voer het volgende uit:

```bash
npm install
```

Dit installeert alle benodigde dependencies inclusief:
- `@uiw/react-codemirror` - Voor de code editor
- `@codemirror/lang-javascript` & `@codemirror/lang-python` - Taal support
- `react-firebase-hooks` - Firebase integratie
- `framer-motion` - Animaties (al geïnstalleerd)

## Overview

Het GroeiMetAI platform bevat nu een volledig interactief learning systeem met quiz functies, live coding challenges, discussion forums en gamification features.

## Features

### 1. Quiz System (`/src/components/Quiz/`)
- **Multiple Choice Questions**: Traditionele meerkeuzevragen met instant feedback
- **Code Completion**: Interactieve code editor met test cases
- **Drag & Drop**: Rangschik items in de juiste volgorde
- **Adaptive Difficulty**: Past moeilijkheidsgraad aan op basis van prestaties
- **Hints System**: Optionele hints (met puntenaftrek)

### 2. Live Coding Challenges (`/src/components/LiveCoding/`)
- **Timed Challenges**: Optionele tijdslimieten voor extra uitdaging
- **Multi-Language Support**: JavaScript en Python ondersteuning
- **Test-Driven Development**: Automatische test validatie
- **Peer Review**: Deel oplossingen voor feedback
- **Leaderboards**: Competitie element

### 3. Discussion Forums (`/src/components/Discussion/`)
- **Threaded Discussions**: Per-les discussie threads
- **Code Snippet Sharing**: Ingebouwde code editor voor voorbeelden
- **Voting System**: Upvote/downvote voor nuttige antwoorden
- **Expert Badges**: Herkenning voor helpers
- **Real-time Notifications**: Blijf op de hoogte van reacties

### 4. Progress Gamification (`/src/services/gamificationService.ts`)
- **XP System**: Verdien punten voor elke activiteit
- **Level Progression**: 20 levels met toenemende XP vereisten
- **Achievement System**: Unlock achievements voor mijlpalen
- **Skill Trees**: Visualiseer je voortgang per vaardigheid
- **Streak Tracking**: Dagelijkse en wekelijkse streaks
- **Badges**: Common, Rare, Epic en Legendary badges

## Integration Guide

### Basic Integration

```tsx
import { LessonInteractiveFeatures } from '@/components/Interactive';
import { Question } from '@/components/Quiz';
import { Challenge } from '@/components/LiveCoding';

// Define quiz questions
const quizQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'Your question here',
    options: ['Option 1', 'Option 2', 'Option 3'],
    correctAnswer: 'Option 1',
    explanation: 'Why this is correct',
    points: 10,
    difficulty: 'easy'
  }
];

// Define coding challenges
const codingChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'Challenge Title',
    description: 'What to build',
    difficulty: 'medium',
    category: 'Algorithm',
    starterCode: {
      javascript: '// Your starter code',
      python: '# Your starter code'
    },
    testCases: [
      {
        id: 'tc1',
        input: 'test input',
        expectedOutput: 'expected output'
      }
    ],
    points: 50,
    tags: ['arrays', 'loops']
  }
];

// Add to your lesson component
<LessonInteractiveFeatures
  lessonId="lesson-1"
  lessonTitle="Lesson Title"
  quizQuestions={quizQuestions}
  codingChallenges={codingChallenges}
  enableDiscussion={true}
  nextLessonId="lesson-2"
  onLessonComplete={() => console.log('Completed!')}
/>
```

### Progress Tracking

```tsx
import { useProgress } from '@/hooks/useProgress';

function MyComponent() {
  const { 
    progress, 
    completeLesson, 
    completeQuiz,
    awardXP 
  } = useProgress();

  // Award XP for custom actions
  const handleCustomAction = async () => {
    await awardXP(25, 'Completed bonus task!');
  };

  // Display user level and XP
  return (
    <div>
      <p>Level {progress?.level}</p>
      <p>{progress?.xp} XP</p>
    </div>
  );
}
```

## XP Rewards Structure

| Action | XP Reward |
|--------|-----------|
| Complete Lesson | 50 XP |
| Pass Quiz | 100 XP |
| Perfect Quiz Score | 150 XP |
| Complete Code Challenge | 75 XP |
| Helpful Answer | 25 XP |
| Daily Streak | 10 XP |
| Weekly Streak | 50 XP |
| Complete Course | 500 XP |

## Badge System

### Common Badges
- **First Steps**: Complete your first lesson
- **Quick Learner**: Complete 5 lessons

### Rare Badges  
- **Quiz Master**: Get 10 perfect quiz scores
- **Community Helper**: Get 25 helpful answers

### Epic Badges
- **Code Warrior**: Complete 50 coding challenges
- **Knowledge Seeker**: Complete 10 courses

### Legendary Badges
- **Streak Master**: Maintain a 30-day streak
- **Polyglot**: Master 5 different programming languages

## Database Schema

### User Progress Collection
```typescript
{
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: Date;
  badges: Badge[];
  achievements: Achievement[];
  skills: Skill[];
  stats: {
    lessonsCompleted: number;
    quizzesPassed: number;
    codeSubmissions: number;
    helpfulAnswers: number;
    perfectScores: number;
  };
}
```

## Best Practices

1. **Quiz Design**
   - Mix question types for variety
   - Provide clear explanations
   - Use progressive difficulty
   - Include practical examples

2. **Challenge Creation**
   - Start with clear problem statements
   - Provide meaningful test cases
   - Include edge cases
   - Offer helpful hints

3. **Gamification Balance**
   - Reward effort and achievement equally
   - Make progress visible but not overwhelming
   - Ensure accessibility for all learning styles
   - Keep competition friendly

4. **Discussion Moderation**
   - Encourage helpful contributions
   - Reward quality over quantity
   - Foster inclusive environment
   - Moderate inappropriate content

## Future Enhancements

- **AI-Powered Hints**: Dynamic hint generation based on common mistakes
- **Collaborative Challenges**: Team-based coding exercises
- **Custom Learning Paths**: AI-recommended lesson sequences
- **Advanced Analytics**: Detailed progress insights
- **Mobile App Integration**: Native mobile experience
- **Offline Mode**: Download lessons for offline learning

## Performance Considerations

- Lazy load interactive components
- Cache user progress locally
- Batch XP transactions
- Optimize real-time updates
- Use WebSocket for live features

## Accessibility

All interactive components follow WCAG 2.1 guidelines:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Adjustable timing for challenges
- Alternative formats for visual content