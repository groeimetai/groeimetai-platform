import type { Lesson } from '@/lib/data/courses';

export const lesson3_3: Lesson = {
  id: 'lesson-3-3',
  title: 'Multi-turn conversaties optimaliseren',
  duration: '30 min',
  content: `
# Multi-turn conversaties optimaliseren

## Introductie

Multi-turn conversaties met Claude vereisen zorgvuldige state management en context persistence. In deze les leer je hoe je vloeiende, contextbewuste dialogen implementeert met robuuste error recovery en flow control.

## Learning Objectives

Na deze les kun je:
- Conversation state effectief beheren
- Context persistent maken tussen turns
- Clarification techniques implementeren
- Error recovery patterns toepassen
- Conversation flow intelligent controleren

## Conversation State Management

### State Architecture

Implementeer een robuuste conversation state manager:

\`\`\`typescript
interface ConversationState {
  id: string;
  userId: string;
  messages: Message[];
  context: ConversationContext;
  metadata: StateMetadata;
}

interface ConversationContext {
  topic: string;
  goals: string[];
  constraints: string[];
  preferences: UserPreferences;
  history: ContextHistory;
}

class ConversationStateManager {
  private states: Map<string, ConversationState> = new Map();
  private storage: StateStorage;
  
  constructor(storage: StateStorage) {
    this.storage = storage;
    this.initializeRecovery();
  }
  
  async createConversation(userId: string, initialContext?: Partial<ConversationContext>) {
    const conversationId = this.generateId();
    const state: ConversationState = {
      id: conversationId,
      userId,
      messages: [],
      context: {
        topic: initialContext?.topic || 'general',
        goals: initialContext?.goals || [],
        constraints: initialContext?.constraints || [],
        preferences: await this.loadUserPreferences(userId),
        history: {
          topics: [],
          decisions: [],
          clarifications: []
        }
      },
      metadata: {
        created: new Date(),
        lastActive: new Date(),
        turnCount: 0,
        totalTokens: 0
      }
    };
    
    this.states.set(conversationId, state);
    await this.storage.persist(conversationId, state);
    
    return conversationId;
  }
  
  async addMessage(conversationId: string, message: Message) {
    const state = await this.getState(conversationId);
    
    // Update message history
    state.messages.push(message);
    
    // Update context based on message
    await this.updateContext(state, message);
    
    // Update metadata
    state.metadata.lastActive = new Date();
    state.metadata.turnCount++;
    state.metadata.totalTokens += this.countTokens(message);
    
    // Persist changes
    await this.storage.persist(conversationId, state);
    
    // Trigger context analysis if needed
    if (this.shouldAnalyzeContext(state)) {
      await this.analyzeAndOptimizeContext(state);
    }
  }
  
  private async updateContext(state: ConversationState, message: Message) {
    // Extract topic shifts
    const topicShift = await this.detectTopicShift(state, message);
    if (topicShift) {
      state.context.history.topics.push({
        topic: topicShift,
        timestamp: new Date(),
        triggerMessage: message.id
      });
      state.context.topic = topicShift;
    }
    
    // Track decisions made
    const decisions = await this.extractDecisions(message);
    state.context.history.decisions.push(...decisions);
    
    // Update goals if mentioned
    const newGoals = await this.extractGoals(message);
    state.context.goals = [...new Set([...state.context.goals, ...newGoals])];
  }
  
  private shouldAnalyzeContext(state: ConversationState): boolean {
    return state.metadata.turnCount % 10 === 0 || // Every 10 turns
           state.messages.length > 50 || // Long conversations
           this.hasSignificantTopicShift(state); // Major context change
  }
}
\`\`\`

### Memory Window Management

Beheer context window efficiënt:

\`\`\`javascript
class MemoryWindowManager {
  constructor(maxTokens = 100000) {
    this.maxTokens = maxTokens;
    this.compressionRatio = 0.7;
  }
  
  async prepareContext(state, newMessage) {
    const messages = [...state.messages, newMessage];
    let totalTokens = this.countTotalTokens(messages);
    
    if (totalTokens <= this.maxTokens) {
      return messages;
    }
    
    // Apply compression strategies
    return await this.compressConversation(messages, state.context);
  }
  
  async compressConversation(messages, context) {
    const compressed = [];
    const important = new Set();
    
    // 1. Identify important messages
    for (const msg of messages) {
      if (this.isImportantMessage(msg, context)) {
        important.add(msg.id);
      }
    }
    
    // 2. Summarize older conversations
    const chunks = this.chunkMessages(messages, 10);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Keep recent messages intact
      if (i >= chunks.length - 3) {
        compressed.push(...chunk);
        continue;
      }
      
      // Keep important messages, summarize others
      const toSummarize = chunk.filter(m => !important.has(m.id));
      const toKeep = chunk.filter(m => important.has(m.id));
      
      if (toSummarize.length > 0) {
        const summary = await this.summarizeChunk(toSummarize, context);
        compressed.push({
          role: 'system',
          content: \`[Summary of \${toSummarize.length} messages: \${summary}]\`
        });
      }
      
      compressed.push(...toKeep);
    }
    
    return compressed;
  }
  
  isImportantMessage(message, context) {
    return message.metadata?.important ||
           context.goals.some(goal => message.content.includes(goal)) ||
           context.history.decisions.some(d => d.messageId === message.id) ||
           this.containsKeyInformation(message);
  }
  
  async summarizeChunk(messages, context) {
    const prompt = \`
Summarize these messages while preserving:
- Key decisions and outcomes
- Important facts and data
- Context shifts
- User preferences stated

Messages:
\${messages.map(m => \`\${m.role}: \${m.content}\`).join('\\n')}

Context:
- Current topic: \${context.topic}
- Goals: \${context.goals.join(', ')}
    \`;
    
    return await this.callClaude(prompt, 'claude-3-haiku');
  }
}
\`\`\`

## Context Persistence Strategies

### Distributed Context Storage

Implementeer schaalbare context persistence:

\`\`\`python
class DistributedContextStore:
    def __init__(self, redis_client, postgres_client):
        self.redis = redis_client
        self.postgres = postgres_client
        self.cache_ttl = 3600  # 1 hour
        
    async def save_context(self, conversation_id, context):
        # Hot storage in Redis for active conversations
        await self.redis.setex(
            f"context:{conversation_id}",
            self.cache_ttl,
            json.dumps(context, cls=ContextEncoder)
        )
        
        # Cold storage in PostgreSQL for persistence
        await self.postgres.execute("""
            INSERT INTO conversation_contexts 
            (conversation_id, context_data, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (conversation_id) 
            DO UPDATE SET 
                context_data = EXCLUDED.context_data,
                updated_at = NOW()
        """, conversation_id, json.dumps(context))
        
        # Update search index for context retrieval
        await self.update_search_index(conversation_id, context)
    
    async def load_context(self, conversation_id):
        # Try hot storage first
        cached = await self.redis.get(f"context:{conversation_id}")
        if cached:
            return json.loads(cached)
        
        # Fall back to cold storage
        result = await self.postgres.fetchone("""
            SELECT context_data 
            FROM conversation_contexts 
            WHERE conversation_id = $1
        """, conversation_id)
        
        if result:
            context = json.loads(result['context_data'])
            # Warm up cache
            await self.redis.setex(
                f"context:{conversation_id}",
                self.cache_ttl,
                json.dumps(context)
            )
            return context
        
        return None
    
    async def search_similar_contexts(self, query_context, limit=5):
        # Use vector similarity search
        embedding = await self.get_context_embedding(query_context)
        
        results = await self.postgres.fetch("""
            SELECT conversation_id, context_data,
                   1 - (embedding <=> $1) as similarity
            FROM conversation_contexts
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> $1
            LIMIT $2
        """, embedding, limit)
        
        return [
            {
                'conversation_id': r['conversation_id'],
                'context': json.loads(r['context_data']),
                'similarity': r['similarity']
            }
            for r in results
        ]
\`\`\`

### Context Versioning

Track context evolution:

\`\`\`typescript
class ContextVersionControl {
  private versions: Map<string, ContextVersion[]> = new Map();
  
  async saveVersion(conversationId: string, context: ConversationContext, trigger: string) {
    const versions = this.versions.get(conversationId) || [];
    
    const newVersion: ContextVersion = {
      id: this.generateVersionId(),
      timestamp: new Date(),
      context: this.deepClone(context),
      trigger,
      changes: this.detectChanges(
        versions[versions.length - 1]?.context,
        context
      )
    };
    
    versions.push(newVersion);
    this.versions.set(conversationId, versions);
    
    // Persist to storage
    await this.storage.saveVersion(conversationId, newVersion);
    
    // Cleanup old versions
    if (versions.length > 50) {
      await this.compactVersions(conversationId);
    }
  }
  
  async rollbackContext(conversationId: string, versionId: string) {
    const versions = await this.loadVersions(conversationId);
    const targetVersion = versions.find(v => v.id === versionId);
    
    if (!targetVersion) {
      throw new Error('Version not found');
    }
    
    // Create rollback version
    await this.saveVersion(
      conversationId,
      targetVersion.context,
      \`Rollback to version \${versionId}\`
    );
    
    return targetVersion.context;
  }
  
  detectChanges(oldContext: ConversationContext | undefined, newContext: ConversationContext) {
    if (!oldContext) return { type: 'initial' };
    
    const changes: ContextChange[] = [];
    
    // Detect topic changes
    if (oldContext.topic !== newContext.topic) {
      changes.push({
        type: 'topic_shift',
        from: oldContext.topic,
        to: newContext.topic
      });
    }
    
    // Detect goal changes
    const addedGoals = newContext.goals.filter(g => !oldContext.goals.includes(g));
    const removedGoals = oldContext.goals.filter(g => !newContext.goals.includes(g));
    
    if (addedGoals.length > 0) {
      changes.push({
        type: 'goals_added',
        goals: addedGoals
      });
    }
    
    if (removedGoals.length > 0) {
      changes.push({
        type: 'goals_removed',
        goals: removedGoals
      });
    }
    
    return changes;
  }
}
\`\`\`

## Clarification Techniques

### Proactive Clarification

Detecteer en los ambiguïteiten op:

\`\`\`javascript
class ClarificationManager {
  async analyzeForClarification(message, context) {
    const ambiguities = await this.detectAmbiguities(message, context);
    
    if (ambiguities.length === 0) {
      return null;
    }
    
    // Prioritize clarifications
    const prioritized = this.prioritizeAmbiguities(ambiguities, context);
    
    // Generate clarification request
    return this.generateClarificationRequest(prioritized, context);
  }
  
  async detectAmbiguities(message, context) {
    const ambiguities = [];
    
    // 1. Pronoun resolution
    const unresolvedPronouns = this.findUnresolvedPronouns(message, context);
    ambiguities.push(...unresolvedPronouns);
    
    // 2. Vague references
    const vagueRefs = this.findVagueReferences(message);
    ambiguities.push(...vagueRefs);
    
    // 3. Conflicting instructions
    const conflicts = this.findConflicts(message, context);
    ambiguities.push(...conflicts);
    
    // 4. Missing required information
    const missing = this.findMissingInfo(message, context);
    ambiguities.push(...missing);
    
    // 5. Use Claude to detect subtle ambiguities
    const aiDetected = await this.aiDetectAmbiguities(message, context);
    ambiguities.push(...aiDetected);
    
    return ambiguities;
  }
  
  generateClarificationRequest(ambiguities, context) {
    // Group related ambiguities
    const grouped = this.groupAmbiguities(ambiguities);
    
    // Create natural clarification message
    const clarifications = grouped.map(group => {
      switch (group.type) {
        case 'pronoun':
          return \`When you say "\${group.text}", are you referring to \${group.options.join(' or ')}?\`;
          
        case 'missing_info':
          return \`To \${context.goals[0]}, I'll need to know: \${group.required.join(', ')}\`;
          
        case 'conflict':
          return \`I noticed you mentioned both "\${group.option1}" and "\${group.option2}". Which would you prefer?\`;
          
        case 'vague':
          return \`Could you be more specific about "\${group.text}"? For example: \${group.examples.join(', ')}\`;
          
        default:
          return \`I need clarification on: \${group.text}\`;
      }
    });
    
    return {
      type: 'clarification',
      questions: clarifications,
      context: {
        ambiguities: grouped,
        conversationId: context.id,
        priority: this.calculatePriority(grouped)
      }
    };
  }
  
  async aiDetectAmbiguities(message, context) {
    const prompt = \`
Analyze this message for ambiguities that need clarification:

Message: "\${message.content}"

Context:
- Topic: \${context.topic}
- Recent topics: \${context.history.topics.slice(-3).map(t => t.topic).join(', ')}
- Goals: \${context.goals.join(', ')}

Identify:
1. Ambiguous references
2. Missing information
3. Contradictions
4. Unclear instructions

Format: JSON array of {type, text, reason, suggested_clarification}
    \`;
    
    const response = await this.callClaude(prompt);
    return JSON.parse(response);
  }
}
\`\`\`

### Clarification Flow Control

Beheer clarification dialogen:

\`\`\`typescript
class ClarificationFlowController {
  private pendingClarifications: Map<string, ClarificationSession> = new Map();
  
  async handleMessage(conversationId: string, message: Message) {
    const session = this.pendingClarifications.get(conversationId);
    
    if (session && this.isAnsweringClarification(message, session)) {
      return await this.processClarificationAnswer(session, message);
    }
    
    // Check if new clarification needed
    const clarificationNeeded = await this.clarificationManager.analyzeForClarification(
      message,
      await this.getContext(conversationId)
    );
    
    if (clarificationNeeded) {
      return await this.initiateClarification(conversationId, clarificationNeeded);
    }
    
    // Process normally
    return await this.processNormalMessage(conversationId, message);
  }
  
  async initiateClarification(conversationId: string, clarification: ClarificationRequest) {
    const session: ClarificationSession = {
      id: this.generateSessionId(),
      conversationId,
      clarification,
      attempts: 0,
      startTime: new Date(),
      status: 'pending'
    };
    
    this.pendingClarifications.set(conversationId, session);
    
    // Format clarification message
    const response = this.formatClarificationMessage(clarification);
    
    // Track in context
    await this.updateContext(conversationId, {
      clarificationPending: true,
      clarificationSession: session.id
    });
    
    return response;
  }
  
  async processClarificationAnswer(session: ClarificationSession, message: Message) {
    session.attempts++;
    
    // Extract answers
    const answers = await this.extractClarificationAnswers(message, session.clarification);
    
    if (this.hasAllAnswers(answers, session.clarification)) {
      // Complete clarification
      session.status = 'completed';
      session.answers = answers;
      
      // Update context with clarified information
      await this.applyAnswersToContext(session.conversationId, answers);
      
      // Remove pending clarification
      this.pendingClarifications.delete(session.conversationId);
      
      // Continue with original intent
      return await this.continueWithClarifiedContext(session);
    }
    
    // Partial answers or need more clarification
    if (session.attempts >= 3) {
      // Too many attempts, proceed with best effort
      return await this.proceedWithPartialClarification(session, answers);
    }
    
    // Ask for remaining clarifications
    const remaining = this.identifyRemainingClarifications(
      session.clarification,
      answers
    );
    
    return this.formatFollowUpClarification(remaining, session.attempts);
  }
  
  formatClarificationMessage(clarification: ClarificationRequest) {
    const priority = clarification.context.priority;
    
    let prefix = '';
    switch (priority) {
      case 'critical':
        prefix = "I need to clarify something important before proceeding:";
        break;
      case 'high':
        prefix = "Before I continue, could you help me understand:";
        break;
      default:
        prefix = "I'd like to make sure I understand correctly:";
    }
    
    const questions = clarification.questions.map((q, i) => 
      \`\${i + 1}. \${q}\`
    ).join('\\n');
    
    return {
      role: 'assistant',
      content: \`\${prefix}\\n\\n\${questions}\`,
      metadata: {
        type: 'clarification',
        sessionId: clarification.context.conversationId
      }
    };
  }
}
\`\`\`

## Error Recovery Patterns

### Graceful Error Handling

Implementeer robuuste error recovery:

\`\`\`python
class ConversationErrorRecovery:
    def __init__(self):
        self.recovery_strategies = {
            'context_overflow': self.handle_context_overflow,
            'invalid_state': self.handle_invalid_state,
            'api_error': self.handle_api_error,
            'parsing_error': self.handle_parsing_error,
            'timeout': self.handle_timeout
        }
        self.error_history = defaultdict(list)
        
    async def recover_from_error(self, error, conversation_state):
        error_type = self.classify_error(error)
        self.log_error(conversation_state.id, error_type, error)
        
        # Select recovery strategy
        strategy = self.recovery_strategies.get(
            error_type,
            self.handle_unknown_error
        )
        
        try:
            recovery_result = await strategy(error, conversation_state)
            
            # Test recovery success
            if await self.test_recovery(recovery_result, conversation_state):
                return recovery_result
            else:
                # Fallback to safe mode
                return await self.safe_mode_recovery(conversation_state)
                
        except Exception as recovery_error:
            # Last resort: reset to safe state
            return await self.emergency_reset(conversation_state)
    
    async def handle_context_overflow(self, error, state):
        # Progressive context reduction
        strategies = [
            lambda: self.compress_messages(state, ratio=0.5),
            lambda: self.summarize_old_messages(state, keep_recent=10),
            lambda: self.extract_key_points_only(state),
            lambda: self.reset_to_checkpoint(state)
        ]
        
        for strategy in strategies:
            try:
                reduced_state = await strategy()
                if self.calculate_tokens(reduced_state) < self.max_tokens * 0.8:
                    return {
                        'status': 'recovered',
                        'action': 'context_reduced',
                        'state': reduced_state,
                        'message': 'I've condensed our conversation history to continue.'
                    }
            except:
                continue
                
        raise Exception("Unable to reduce context size")
    
    async def handle_invalid_state(self, error, state):
        # Attempt state repair
        validation_errors = self.validate_state(state)
        
        if not validation_errors:
            # State is actually valid, might be transient error
            return {
                'status': 'recovered',
                'action': 'retry',
                'state': state
            }
        
        # Fix each validation error
        repaired_state = deepcopy(state)
        for error in validation_errors:
            repaired_state = await self.repair_state_error(
                repaired_state,
                error
            )
        
        # Verify repair
        if not self.validate_state(repaired_state):
            return {
                'status': 'recovered',
                'action': 'state_repaired',
                'state': repaired_state,
                'message': 'I've corrected some issues with our conversation state.'
            }
        
        # Fallback to last known good state
        return await self.restore_last_good_state(state.id)
    
    async def safe_mode_recovery(self, state):
        # Minimal context conversation
        safe_state = {
            'id': state.id,
            'messages': state.messages[-5:],  # Keep only recent
            'context': {
                'topic': 'recovery_mode',
                'goals': ['restore_normal_operation'],
                'constraints': ['minimal_context', 'error_recovery']
            },
            'metadata': {
                'safe_mode': True,
                'original_error': True
            }
        }
        
        return {
            'status': 'safe_mode',
            'action': 'continue_limited',
            'state': safe_state,
            'message': '''I encountered an issue and switched to safe mode. 
                         I have limited context but can still help you.'''
        }
\`\`\`

### Error Pattern Learning

Leer van errors voor betere recovery:

\`\`\`javascript
class ErrorPatternLearner {
  constructor() {
    this.patterns = new Map();
    this.recoverySuccess = new Map();
  }
  
  async analyzeError(error, context, recovery) {
    const pattern = this.extractErrorPattern(error, context);
    
    // Store pattern
    if (!this.patterns.has(pattern.signature)) {
      this.patterns.set(pattern.signature, {
        count: 0,
        contexts: [],
        recoveries: []
      });
    }
    
    const patternData = this.patterns.get(pattern.signature);
    patternData.count++;
    patternData.contexts.push(this.minimizeContext(context));
    patternData.recoveries.push({
      strategy: recovery.strategy,
      success: recovery.success,
      time: recovery.duration
    });
    
    // Learn from recovery outcome
    if (recovery.success) {
      await this.updateSuccessfulRecovery(pattern, recovery);
    } else {
      await this.analyzeFailedRecovery(pattern, recovery);
    }
  }
  
  async suggestRecovery(error, context) {
    const pattern = this.extractErrorPattern(error, context);
    const similar = this.findSimilarPatterns(pattern);
    
    if (similar.length === 0) {
      return this.getDefaultRecovery(error);
    }
    
    // Rank recovery strategies by success rate
    const strategies = this.rankRecoveryStrategies(similar);
    
    // Adapt best strategy to current context
    const adapted = await this.adaptStrategy(
      strategies[0],
      context
    );
    
    return {
      strategy: adapted,
      confidence: this.calculateConfidence(strategies[0], pattern),
      alternatives: strategies.slice(1, 3)
    };
  }
  
  extractErrorPattern(error, context) {
    return {
      signature: this.generateSignature(error),
      type: error.constructor.name,
      message: this.normalizeErrorMessage(error.message),
      contextFeatures: {
        messageCount: context.messages.length,
        tokenCount: this.estimateTokens(context),
        topicComplexity: this.calculateTopicComplexity(context),
        userPatterns: this.extractUserPatterns(context)
      },
      timestamp: new Date()
    };
  }
  
  async adaptStrategy(strategy, currentContext) {
    // Analyze differences between successful context and current
    const differences = this.compareContexts(
      strategy.successfulContext,
      currentContext
    );
    
    // Adapt strategy parameters
    const adapted = { ...strategy.base };
    
    if (differences.tokenRatio > 1.5) {
      adapted.aggressiveCompression = true;
    }
    
    if (differences.topicDrift > 0.7) {
      adapted.resetToRecentTopic = true;
    }
    
    if (differences.errorRate > 0.3) {
      adapted.enhancedValidation = true;
    }
    
    return adapted;
  }
}
\`\`\`

## Conversation Flow Control

### Intelligent Flow Management

Stuur conversatie flow dynamisch:

\`\`\`typescript
class ConversationFlowController {
  private flowStates: Map<string, FlowState> = new Map();
  
  async controlFlow(conversationId: string, message: Message) {
    const flowState = await this.getOrCreateFlowState(conversationId);
    const context = await this.loadContext(conversationId);
    
    // Analyze conversation flow
    const flowAnalysis = await this.analyzeFlow(flowState, context, message);
    
    // Determine flow action
    const flowAction = this.determineFlowAction(flowAnalysis);
    
    // Execute flow control
    return await this.executeFlowAction(flowAction, flowState, context);
  }
  
  async analyzeFlow(flowState: FlowState, context: ConversationContext, message: Message) {
    return {
      // Conversation health metrics
      coherence: await this.measureCoherence(flowState, context),
      engagement: this.measureEngagement(flowState),
      progress: this.measureProgress(context),
      
      // Flow issues
      issues: {
        circular: this.detectCircularConversation(flowState),
        stuck: this.detectStuckConversation(flowState),
        offtopic: await this.detectOffTopic(context, message),
        confused: this.detectConfusion(flowState)
      },
      
      // User patterns
      userPatterns: {
        responseTime: this.calculateAvgResponseTime(flowState),
        messageLength: this.analyzeMessageLengths(flowState),
        questionFrequency: this.analyzeQuestionPattern(flowState)
      }
    };
  }
  
  determineFlowAction(analysis: FlowAnalysis): FlowAction {
    // Priority-based action selection
    if (analysis.issues.confused && analysis.coherence < 0.5) {
      return {
        type: 'reset_context',
        reason: 'Conversation has become incoherent',
        params: { keepRecent: 5, summarizePast: true }
      };
    }
    
    if (analysis.issues.circular) {
      return {
        type: 'break_loop',
        reason: 'Detected circular conversation pattern',
        params: { sugggestAlternatives: true }
      };
    }
    
    if (analysis.issues.stuck && analysis.progress < 0.1) {
      return {
        type: 'inject_momentum',
        reason: 'Conversation is not progressing',
        params: { suggestNextSteps: true, askOpenQuestion: true }
      };
    }
    
    if (analysis.issues.offtopic && analysis.progress > 0.7) {
      return {
        type: 'gentle_redirect',
        reason: 'Drifting from main goal',
        params: { remindGoal: true, bridgeTopics: true }
      };
    }
    
    if (analysis.engagement < 0.3) {
      return {
        type: 'increase_engagement',
        reason: 'Low user engagement detected',
        params: { 
          adjustTone: true,
          askEngagingQuestion: true,
          provideSummary: true
        }
      };
    }
    
    // No issues - optimize flow
    return {
      type: 'optimize',
      reason: 'Normal flow optimization',
      params: { 
        reinforceProgress: true,
        anticipateNeeds: true
      }
    };
  }
  
  async executeFlowAction(action: FlowAction, flowState: FlowState, context: ConversationContext) {
    switch (action.type) {
      case 'reset_context':
        return await this.executeContextReset(action.params, flowState, context);
        
      case 'break_loop':
        return await this.executeLoopBreaker(action.params, flowState, context);
        
      case 'inject_momentum':
        return await this.executeMomentumInjection(action.params, flowState, context);
        
      case 'gentle_redirect':
        return await this.executeRedirect(action.params, flowState, context);
        
      case 'increase_engagement':
        return await this.executeEngagementBoost(action.params, flowState, context);
        
      case 'optimize':
        return await this.executeOptimization(action.params, flowState, context);
        
      default:
        return await this.executeDefault(flowState, context);
    }
  }
  
  async executeLoopBreaker(params: any, flowState: FlowState, context: ConversationContext) {
    const loopPattern = this.identifyLoopPattern(flowState);
    
    const response = {
      type: 'flow_control',
      action: 'break_loop',
      content: ''
    };
    
    // Acknowledge the pattern
    response.content = \`I notice we're revisiting "\${loopPattern.topic}". \`;
    
    // Summarize what's been covered
    const summary = await this.summarizeLoopContent(loopPattern, context);
    response.content += \`We've established: \${summary}. \`;
    
    // Suggest moving forward
    if (params.sugggestAlternatives) {
      const alternatives = await this.generateAlternatives(loopPattern, context);
      response.content += \`\\n\\nWould you like to:\\n\`;
      alternatives.forEach((alt, i) => {
        response.content += \`\${i + 1}. \${alt}\\n\`;
      });
    }
    
    // Update flow state
    flowState.loopsBroken.push({
      pattern: loopPattern,
      timestamp: new Date(),
      action: response
    });
    
    return response;
  }
  
  async executeMomentumInjection(params: any, flowState: FlowState, context: ConversationContext) {
    const response = {
      type: 'flow_control',
      action: 'inject_momentum',
      content: ''
    };
    
    // Analyze why conversation is stuck
    const stuckReason = this.analyzeStuckReason(flowState, context);
    
    if (stuckReason === 'waiting_for_decision') {
      response.content = await this.generateDecisionHelper(context);
    } else if (stuckReason === 'unclear_goal') {
      response.content = await this.clarifyGoals(context);
    } else if (stuckReason === 'complex_topic') {
      response.content = await this.breakDownComplexity(context);
    }
    
    // Add momentum techniques
    if (params.suggestNextSteps) {
      const nextSteps = await this.generateNextSteps(context);
      response.content += \`\\n\\nHere are some concrete next steps:\\n\`;
      nextSteps.forEach((step, i) => {
        response.content += \`\${i + 1}. \${step}\\n\`;
      });
    }
    
    if (params.askOpenQuestion) {
      const question = await this.generateMomentumQuestion(context);
      response.content += \`\\n\\n\${question}\`;
    }
    
    return response;
  }
}
\`\`\`

### Adaptive Response Generation

Pas responses aan op conversation flow:

\`\`\`python
class AdaptiveResponseGenerator:
    def __init__(self):
        self.response_templates = self.load_templates()
        self.tone_analyzer = ToneAnalyzer()
        
    async def generate_response(self, content, flow_state, context):
        # Analyze current conversation state
        analysis = {
            'tone': await self.tone_analyzer.analyze(flow_state),
            'complexity': self.measure_complexity(context),
            'user_style': self.analyze_user_style(flow_state),
            'emotional_state': self.detect_emotional_state(flow_state)
        }
        
        # Select response strategy
        strategy = self.select_response_strategy(analysis)
        
        # Generate base response
        base_response = await self.generate_base_response(content, context)
        
        # Apply adaptations
        adapted = await self.apply_adaptations(
            base_response,
            strategy,
            analysis
        )
        
        # Add flow control elements
        final_response = await self.add_flow_elements(
            adapted,
            flow_state,
            context
        )
        
        return final_response
    
    def select_response_strategy(self, analysis):
        strategies = []
        
        # Tone matching
        if analysis['user_style']['formal']:
            strategies.append('formal_tone')
        elif analysis['user_style']['casual']:
            strategies.append('casual_tone')
            
        # Complexity matching
        if analysis['complexity'] > 0.7:
            strategies.append('detailed_explanation')
        elif analysis['complexity'] < 0.3:
            strategies.append('simple_summary')
            
        # Emotional response
        if analysis['emotional_state'] == 'frustrated':
            strategies.append('empathetic_acknowledgment')
        elif analysis['emotional_state'] == 'confused':
            strategies.append('step_by_step_clarity')
            
        return strategies
    
    async def apply_adaptations(self, response, strategies, analysis):
        adapted = response
        
        for strategy in strategies:
            if strategy == 'formal_tone':
                adapted = self.formalize_language(adapted)
            elif strategy == 'casual_tone':
                adapted = self.casualize_language(adapted)
            elif strategy == 'detailed_explanation':
                adapted = await self.add_detail(adapted, analysis)
            elif strategy == 'simple_summary':
                adapted = await self.simplify(adapted)
            elif strategy == 'empathetic_acknowledgment':
                adapted = self.add_empathy(adapted)
            elif strategy == 'step_by_step_clarity':
                adapted = self.structure_steps(adapted)
                
        return adapted
    
    async def add_flow_elements(self, response, flow_state, context):
        elements = []
        
        # Progress indicators
        if context.goals and flow_state.messages_since_goal_mention > 10:
            progress = self.calculate_goal_progress(context)
            elements.append(f"Progress on {context.goals[0]}: {progress}%")
        
        # Conversation guides
        if flow_state.question_answer_ratio < 0.3:
            elements.append(self.generate_engaging_question(context))
        
        # Transition helpers
        if self.detect_topic_transition_point(flow_state):
            elements.append(self.generate_smooth_transition(context))
        
        # Combine elements with response
        if elements:
            response = f"{response}\\n\\n" + "\\n\\n".join(elements)
            
        return response
\`\`\`

## Best Practices

### Multi-turn Conversation Checklist

1. **State Management**
   - Implementeer persistent state storage
   - Version control voor context changes
   - Efficient memory window management
   - Regular state validation

2. **Context Optimization**
   - Progressive summarization
   - Important message identification
   - Context compression strategies
   - Search-based context retrieval

3. **Error Handling**
   - Multiple recovery strategies
   - Pattern-based error learning
   - Graceful degradation
   - User-friendly error messages

4. **Flow Control**
   - Proactive conversation guidance
   - Loop detection and breaking
   - Engagement monitoring
   - Adaptive response generation

5. **Performance**
   - Async operations
   - Caching strategies
   - Batch processing
   - Token optimization

## Samenvatting

Effectieve multi-turn conversaties vereisen:
- **Robuuste state management** voor context persistence
- **Intelligente clarification** voor ambiguity resolution
- **Adaptive flow control** voor natuurlijke conversaties
- **Comprehensive error recovery** voor betrouwbaarheid
- **Performance optimization** voor schaalbaarheid

Door deze patterns te implementeren bouw je conversatie systemen die natuurlijk aanvoelen en betrouwbaar functioneren over langere interacties.
  `,
};