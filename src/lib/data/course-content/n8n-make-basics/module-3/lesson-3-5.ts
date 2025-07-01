import type { Lesson } from '@/lib/data/courses';

export const lesson3_5: Lesson = {
  id: 'lesson-3-5',
  title: 'Customer Onboarding Automation',
  duration: '40 min',
  content: `
# Customer Onboarding Automation: Sign-up → Welcome Sequence

## Overzicht
Creëer een naadloze onboarding experience die nieuwe klanten automatisch door het complete welkomstproces leidt.

## Business Value
- **Activation Rate**: +45% binnen 7 dagen
- **Churn Reduction**: -30% in eerste maand
- **Support Tickets**: -60% onboarding vragen
- **Customer LTV**: +25% door betere start

## N8N Workflow JSON

\`\`\`json
{
  "name": "Complete Customer Onboarding",
  "nodes": [
    {
      "parameters": {
        "events": ["customer.created", "subscription.created"],
        "additionalFields": {}
      },
      "name": "New Customer Trigger",
      "type": "n8n-nodes-base.stripeTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "contact",
        "operation": "create",
        "email": "={{$json.email}}",
        "firstName": "={{$json.name.split(' ')[0]}}",
        "lastName": "={{$json.name.split(' ')[1]}}",
        "customProperties": {
          "onboarding_stage": "welcome_sent",
          "signup_date": "={{$now.toISO()}}",
          "plan": "={{$json.plan.nickname}}"
        }
      },
      "name": "Create in CRM",
      "type": "n8n-nodes-base.hubspot",
      "position": [450, 200]
    },
    {
      "parameters": {
        "resource": "user",
        "operation": "create",
        "email": "={{$json.email}}",
        "name": "={{$json.name}}",
        "role": "customer",
        "sendInvite": true
      },
      "name": "Create App Account",
      "type": "n8n-nodes-base.custom",
      "position": [450, 300]
    },
    {
      "parameters": {
        "fromEmail": "welcome@company.com",
        "toEmail": "={{$json.email}}",
        "subject": "Welkom bij {{company}}! 🎉",
        "html": "{{$json.welcomeEmailTemplate}}",
        "attachments": [{
          "filename": "getting-started-guide.pdf",
          "content": "{{$binary.data}}"
        }]
      },
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [650, 200]
    },
    {
      "parameters": {
        "unit": "hours",
        "value": 24
      },
      "name": "Wait 24 Hours",
      "type": "n8n-nodes-base.wait",
      "position": [850, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [{
            "value1": "={{$json.hasLoggedIn}}",
            "value2": true
          }]
        }
      },
      "name": "Check Login Status",
      "type": "n8n-nodes-base.if",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "resource": "task",
        "operation": "create",
        "title": "Personal Onboarding Call - {{$json.name}}",
        "description": "New customer hasn't logged in within 24 hours",
        "assignee": "{{$json.accountManager}}",
        "priority": "high"
      },
      "name": "Create Support Task",
      "type": "n8n-nodes-base.clickup",
      "position": [1250, 400]
    }
  ]
}
\`\`\`

## Make/Integromat Scenario

\`\`\`json
{
  "name": "Multi-Stage Onboarding Sequence",
  "flow": [
    {
      "id": 1,
      "module": "webhook:custom",
      "parameters": {
        "name": "New User Signup"
      }
    },
    {
      "id": 2,
      "module": "http:request",
      "parameters": {
        "method": "POST",
        "url": "{{apiUrl}}/users",
        "body": {
          "email": "{{1.email}}",
          "name": "{{1.name}}",
          "plan": "{{1.plan}}"
        }
      }
    },
    {
      "id": 3,
      "module": "mailchimp:addSubscriber",
      "parameters": {
        "listId": "{{onboardingListId}}",
        "email": "{{1.email}}",
        "mergeFields": {
          "FNAME": "{{1.firstName}}",
          "PLAN": "{{1.plan}}",
          "SIGNUP": "{{now}}"
        },
        "tags": ["new-customer", "onboarding"]
      }
    },
    {
      "id": 4,
      "module": "calendly:createInvite",
      "parameters": {
        "eventType": "onboarding-call",
        "inviteeEmail": "{{1.email}}",
        "inviteeName": "{{1.name}}"
      }
    },
    {
      "id": 5,
      "module": "datastore:addRecord",
      "parameters": {
        "datastore": "onboarding_progress",
        "data": {
          "userId": "{{2.userId}}",
          "stage": "account_created",
          "nextAction": "setup_profile",
          "dueDate": "{{addDays(now, 3)}}"
        }
      }
    }
  ]
}
\`\`\`

## Complete Onboarding Sequence

### Day 0: Account Creation
\`\`\`javascript
const onboardingSequence = {
  day0: {
    actions: [
      'createAccount',
      'sendWelcomeEmail',
      'addToCRM',
      'scheduleOnboardingCall',
      'createSlackChannel'
    ],
    emails: {
      welcome: {
        subject: 'Welkom bij [Company]! Hier zijn je volgende stappen 🚀',
        template: 'welcome-email',
        attachments: ['quick-start-guide.pdf'],
        cta: 'Complete Your Profile'
      }
    }
  },
  
  day1: {
    condition: 'if (!user.hasCompletedProfile)',
    actions: ['sendProfileReminder', 'notifyAccountManager'],
    emails: {
      profileReminder: {
        subject: 'Quick tip: Voltooi je profiel in 2 minuten ⏱️',
        template: 'profile-reminder',
        personalization: {
          showProgressBar: true,
          includeVideoTutorial: true
        }
      }
    }
  },
  
  day3: {
    condition: 'if (!user.hasUsedCoreFeature)',
    actions: ['sendFeatureTutorial', 'unlockBonusContent'],
    emails: {
      featureTutorial: {
        subject: 'Ontdek wat [Feature] voor jou kan doen 💡',
        template: 'feature-spotlight',
        dynamicContent: {
          feature: user.plan.primaryFeature,
          useCase: user.industry.topUseCase
        }
      }
    }
  },
  
  day7: {
    actions: ['sendWeeklyCheckIn', 'calculateHealthScore'],
    branch: {
      healthy: ['sendSuccessStory', 'inviteToWebinar'],
      atRisk: ['schedulePersonalDemo', 'assignSpecialist'],
      inactive: ['sendReactivationOffer', 'createSupportTicket']
    }
  },
  
  day14: {
    actions: ['requestFeedback', 'showUpgradeOptions'],
    emails: {
      feedback: {
        subject: 'Hoe bevalt [Company] tot nu toe? 📊',
        template: 'nps-survey',
        incentive: '10% discount on upgrade'
      }
    }
  },
  
  day30: {
    actions: ['generateSuccessReport', 'renewalReminder'],
    milestone: {
      celebration: 'firstMonthComplete',
      reward: 'loyaltyPoints',
      nextSteps: 'advancedFeatures'
    }
  }
};
\`\`\`

### Personalization Engine
\`\`\`javascript
class OnboardingPersonalizer {
  constructor(user) {
    this.user = user;
    this.segment = this.determineSegment();
    this.pace = this.determinePace();
  }
  
  determineSegment() {
    const segments = {
      enterprise: {
        criteria: () => this.user.plan === 'enterprise' || this.user.seats > 50,
        sequence: 'white-glove',
        touchpoints: ['dedicated CSM', 'custom training', 'integration support']
      },
      smb: {
        criteria: () => this.user.seats < 50 && this.user.seats > 5,
        sequence: 'guided-self-serve',
        touchpoints: ['group training', 'email support', 'knowledge base']
      },
      individual: {
        criteria: () => this.user.seats <= 5,
        sequence: 'self-serve',
        touchpoints: ['video tutorials', 'community', 'chat support']
      }
    };
    
    return Object.entries(segments).find(([_, seg]) => seg.criteria())?.[0] || 'individual';
  }
  
  determinePace() {
    const engagement = this.calculateEngagement();
    
    if (engagement > 80) return 'accelerated';
    if (engagement > 50) return 'standard';
    if (engagement > 20) return 'gentle';
    return 'reactivation';
  }
  
  generatePersonalizedPath() {
    const basePath = onboardingSequence;
    const personalizedPath = {};
    
    Object.entries(basePath).forEach(([day, actions]) => {
      personalizedPath[day] = {
        ...actions,
        timing: this.adjustTiming(day),
        content: this.personalizeContent(actions),
        channel: this.preferredChannel()
      };
    });
    
    return personalizedPath;
  }
  
  personalizeContent(actions) {
    return {
      ...actions,
      industry: industryTemplates[this.user.industry],
      useCase: useCaseExamples[this.user.primaryUseCase],
      language: this.user.preferredLanguage,
      timezone: this.user.timezone
    };
  }
}
\`\`\`

## Advanced Features

### Behavioral Triggers
\`\`\`javascript
const behavioralTriggers = {
  'first_value_moment': {
    condition: (user) => user.hasCompletedFirstProject,
    action: 'sendCelebrationEmail',
    followUp: 'suggestNextProject'
  },
  'power_user_emerging': {
    condition: (user) => user.dailyActiveUse > 5 && user.featuresUsed > 10,
    action: 'inviteToAdvancedTraining',
    reward: 'unlockPowerFeatures'
  },
  'churn_risk_detected': {
    condition: (user) => user.lastLogin > 7 && user.projectsCompleted === 0,
    action: 'triggerWinBackCampaign',
    escalation: 'assignToRetentionTeam'
  },
  'expansion_opportunity': {
    condition: (user) => user.usageRate > 80 || user.invitesSent > 3,
    action: 'presentUpgradeOffer',
    incentive: 'volumeDiscount'
  }
};
\`\`\`

### Multi-Channel Orchestration
- **Email**: Personalized sequences
- **In-App**: Tooltips en guides
- **SMS**: Belangrijke reminders
- **Slack/Teams**: Team notifications
- **Video**: Personalized walkthroughs

## Customization Options

### Industry-Specific Paths
\`\`\`javascript
const industryOnboarding = {
  saas: {
    focus: ['quick time-to-value', 'integration setup', 'team adoption'],
    kpis: ['activation rate', 'feature adoption', 'team invites'],
    content: ['ROI calculator', 'integration guides', 'best practices']
  },
  ecommerce: {
    focus: ['catalog setup', 'payment config', 'shipping zones'],
    kpis: ['first sale', 'catalog completion', 'checkout setup'],
    content: ['product upload template', 'SEO guide', 'conversion tips']
  },
  consulting: {
    focus: ['client portal', 'project templates', 'invoicing'],
    kpis: ['first client added', 'project created', 'invoice sent'],
    content: ['client communication templates', 'project frameworks', 'pricing guides']
  }
};
\`\`\`

### Gamification Elements
- Progress tracking
- Achievement badges
- Leaderboards
- Rewards program
- Referral incentives

## ROI Berekening

### Activation Improvement
- Baseline activation: 35%
- Met automation: 80%
- Extra activated users: 450 per 1000 signups
- LTV per user: €500
- **Extra revenue: €225.000 per 1000 signups**

### Support Cost Reduction
- Onboarding tickets: -60% (van 300 naar 120)
- Tijd per ticket: 15 minuten
- Support cost: €30/uur
- **Besparing: €1.350/maand**

### Churn Impact
- Eerste maand churn: 15% → 10.5%
- Behouden users: 45 extra per 1000
- Jaarwaarde per user: €600
- **Extra jaaromzet: €27.000**

### Totale Impact
- Activation revenue: €18.750/maand
- Support besparing: €1.350/maand
- Churn reductie: €2.250/maand
- **Totaal ROI: €22.350/maand**
  `,
  codeExamples: [
    {
      id: 'example-3-5-1',
      title: 'Intelligent Onboarding Orchestrator',
      language: 'javascript',
      code: `// Complete onboarding orchestration system
class OnboardingOrchestrator {
  constructor() {
    this.stages = ['welcome', 'activation', 'adoption', 'expansion'];
    this.channels = ['email', 'in-app', 'sms', 'slack'];
    this.analytics = new OnboardingAnalytics();
  }
  
  async processNewUser(user) {
    // Initialize user journey
    const journey = {
      userId: user.id,
      startDate: new Date(),
      segment: this.segmentUser(user),
      personalizedPath: this.createPath(user),
      healthScore: 100,
      milestones: []
    };
    
    // Start onboarding sequence
    await this.executeStage('welcome', journey);
    
    // Schedule future stages
    this.scheduleJourney(journey);
    
    // Monitor progress
    this.startMonitoring(journey);
    
    return journey;
  }
  
  segmentUser(user) {
    const rules = [
      { name: 'enterprise', condition: (u) => u.company.size > 500 },
      { name: 'growth', condition: (u) => u.company.size > 50 },
      { name: 'startup', condition: (u) => u.company.size > 10 },
      { name: 'individual', condition: (u) => u.company.size <= 10 }
    ];
    
    const segment = rules.find(rule => rule.condition(user))?.name || 'individual';
    
    return {
      name: segment,
      velocity: this.getSegmentVelocity(segment),
      touchpoints: this.getSegmentTouchpoints(segment)
    };
  }
  
  async executeStage(stageName, journey) {
    const stage = this.stages.find(s => s.name === stageName);
    const actions = [];
    
    // Execute all actions for this stage
    for (const action of stage.actions) {
      if (await this.shouldExecuteAction(action, journey)) {
        const result = await this.executeAction(action, journey);
        actions.push(result);
        
        // Track execution
        this.analytics.track('action_executed', {
          journeyId: journey.id,
          action: action.name,
          result: result.success
        });
      }
    }
    
    // Update journey state
    journey.currentStage = stageName;
    journey.completedActions = [...journey.completedActions, ...actions];
    journey.healthScore = this.calculateHealthScore(journey);
    
    // Check for stage completion
    if (this.isStageComplete(stageName, journey)) {
      journey.milestones.push({
        stage: stageName,
        completedAt: new Date(),
        score: journey.healthScore
      });
      
      // Trigger next stage
      const nextStage = this.getNextStage(stageName);
      if (nextStage) {
        await this.scheduleStage(nextStage, journey);
      }
    }
    
    return journey;
  }
  
  calculateHealthScore(journey) {
    const factors = {
      engagement: this.getEngagementScore(journey) * 0.4,
      progress: this.getProgressScore(journey) * 0.3,
      satisfaction: this.getSatisfactionScore(journey) * 0.2,
      potential: this.getPotentialScore(journey) * 0.1
    };
    
    return Object.values(factors).reduce((sum, score) => sum + score, 0);
  }
  
  async handleRiskDetection(journey) {
    if (journey.healthScore < 40) {
      // High risk - immediate intervention
      await this.triggerIntervention('high_risk', journey);
    } else if (journey.healthScore < 60) {
      // Medium risk - enhanced support
      await this.enhanceSupport(journey);
    }
    
    // Predictive churn scoring
    const churnRisk = await this.predictChurnRisk(journey);
    if (churnRisk > 0.7) {
      await this.escalateToRetention(journey);
    }
  }
}`
    }
  ],
  assignments: [
    {
      id: 'onboarding-automation-1',
      title: 'Design een complete onboarding flow voor jouw product',
      description: 'Creëer een multi-stage onboarding automation met personalisatie en behavioral triggers',
      difficulty: 'expert',
      type: 'project',
      initialCode: `// Customer onboarding automation framework
class OnboardingAutomation {
  constructor() {
    this.stages = [
      { day: 0, name: 'welcome', actions: ['sendWelcomeEmail', 'createAccount'] },
      { day: 1, name: 'activation', actions: ['checkFirstLogin', 'sendTips'] },
      { day: 7, name: 'engagement', actions: ['measureActivity', 'personalizeContent'] },
      { day: 30, name: 'retention', actions: ['collectFeedback', 'offerUpgrade'] }
    ];
  }
  
  // TODO: Implementeer:
  // 1. startOnboarding(user)
  // 2. executeStage(user, stage)
  // 3. trackUserProgress(userId)
  // 4. personalizeContent(user, stage)
  // 5. handleChurnRisk(user)
  
  calculateHealthScore(user) {
    // TODO: Implement health score based on:
    // - Login frequency
    // - Feature adoption
    // - Support tickets
    // - Engagement metrics
  }
}`,
      hints: [
        'Gebruik event-driven architecture voor flexibiliteit',
        'Implementeer A/B testing voor email content',
        'Track alle user interactions voor personalisatie',
        'Maak re-engagement campaigns voor inactieve users'
      ]
    }
  ],
  resources: [
    {
      title: 'Customer Onboarding Best Practices',
      url: 'https://www.intercom.com/blog/onboarding-best-practices/',
      type: 'guide'
    },
    {
      title: 'Automation Templates Library',
      url: 'https://n8n.io/workflows/',
      type: 'templates'
    }
  ]
};