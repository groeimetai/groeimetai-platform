import { Lesson } from '@/lib/data/courses';

export const lesson3_3: Lesson = {
  id: 'lesson-3-3',
  title: 'AI-powered workflows bouwen',
  duration: '40 min',
  content: `
# AI-powered workflows bouwen

## Introductie

In deze les duiken we diep in het bouwen van AI-powered workflows die complexe taken automatiseren. We behandelen verschillende soorten workflows, van content generatie tot document processing, en leren hoe je multi-step AI workflows ontwerpt die echte business value leveren.

## Content generation pipelines

Content generation pipelines gebruiken AI om automatisch content te creëren, optimaliseren en publiceren. Deze workflows combineren verschillende AI-modellen en tools voor een end-to-end content productie proces.

### Basis content generation workflow

Een eenvoudige blog post generator:

\`\`\`javascript
// N8N workflow configuratie
{
  "nodes": [
    {
      "name": "Topic Input",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "topic": "Duurzame energie oplossingen",
          "keywords": ["zonnepanelen", "windenergie", "batterij opslag"],
          "tone": "informatief en toegankelijk",
          "wordCount": 800
        }
      }
    },
    {
      "name": "Generate Outline",
      "type": "n8n-nodes-openai.openAi",
      "parameters": {
        "operation": "chat",
        "model": "gpt-4",
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "Je bent een expert content strategist. Creëer gedetailleerde blog outlines."
            },
            {
              "role": "user",
              "content": "Maak een outline voor een blog post over {{\$json.topic}}. Focus op keywords: {{\$json.keywords.join(', ')}}. Tone: {{\$json.tone}}"
            }
          ]
        }
      }
    },
    {
      "name": "Generate Sections",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 1,
        "options": {}
      }
    },
    {
      "name": "Write Content",
      "type": "n8n-nodes-openai.openAi",
      "parameters": {
        "operation": "chat",
        "model": "gpt-4",
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "Je bent een professionele content writer. Schrijf engaging en informatieve content."
            },
            {
              "role": "user",
              "content": "Schrijf sectie: {{\$json.section}} voor artikel over {{\$json.topic}}"
            }
          ]
        }
      }
    }
  ]
}
\`\`\`

### Geavanceerde multi-channel content workflow

Een workflow die content aanpast voor verschillende platforms:

\`\`\`javascript
// Content adaptatie workflow
const contentWorkflow = {
  // Stap 1: Genereer master content
  generateMasterContent: async (topic, research) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Creëer uitgebreide, hoogwaardige content die als basis dient voor multi-channel distributie."
        },
        {
          role: "user",
          content: \`Topic: \${topic}\\nResearch: \${research}\\nCreëer een uitgebreid artikel van 1500 woorden.\`
        }
      ],
      temperature: 0.7
    });
    return response.choices[0].message.content;
  },

  // Stap 2: Adapteer voor verschillende kanalen
  adaptForChannels: async (masterContent) => {
    const channels = {
      linkedin: {
        maxLength: 1300,
        tone: "professioneel",
        format: "korte paragrafen met bullets"
      },
      twitter: {
        maxLength: 280,
        tone: "engaging en direct",
        format: "thread van 5-7 tweets"
      },
      instagram: {
        maxLength: 2200,
        tone: "visueel en inspirerend",
        format: "caption met hashtags"
      },
      email: {
        maxLength: 500,
        tone: "persoonlijk en actionable",
        format: "kort met duidelijke CTA"
      }
    };

    const adaptations = {};
    
    for (const [channel, specs] of Object.entries(channels)) {
      adaptations[channel] = await adaptContent(masterContent, specs);
    }
    
    return adaptations;
  },

  // Stap 3: Genereer visuele assets
  generateVisuals: async (content, channel) => {
    const imagePrompt = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: \`Creëer een DALL-E prompt voor een afbeelding bij deze \${channel} post: \${content.substring(0, 500)}\`
        }
      ]
    });

    // Genereer afbeelding met DALL-E
    const image = await openai.images.generate({
      prompt: imagePrompt.choices[0].message.content,
      size: channel === 'instagram' ? "1024x1024" : "1792x1024",
      quality: "hd"
    });

    return image.data[0].url;
  },

  // Stap 4: Schedule en publiceer
  schedulePublication: async (content, channels) => {
    const schedule = generateOptimalSchedule(channels);
    
    for (const [channel, time] of Object.entries(schedule)) {
      await schedulePost(channel, content[channel], time);
    }
  }
};
\`\`\`

## Data analysis workflows

AI-powered data analysis workflows automatiseren het proces van data verzameling, analyse en rapportage.

### Sales data analyse workflow

\`\`\`javascript
// Geautomatiseerde sales analyse pipeline
const salesAnalysisWorkflow = {
  // Stap 1: Data collectie uit meerdere bronnen
  collectData: async () => {
    const sources = {
      crm: await fetchCRMData(),
      ecommerce: await fetchShopifyData(),
      analytics: await fetchGoogleAnalytics(),
      support: await fetchSupportTickets()
    };
    
    return mergeDataSources(sources);
  },

  // Stap 2: Data preprocessing met AI
  preprocessData: async (rawData) => {
    const cleaningPrompt = \`
    Analyseer deze ruwe sales data en:
    1. Identificeer en corrigeer inconsistenties
    2. Vul ontbrekende waarden in op basis van patronen
    3. Categoriseer producten en klanten
    4. Bereken afgeleide metrics
    
    Data: \${JSON.stringify(rawData.sample)}
    \`;

    const cleanedData = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Je bent een data scientist expert in sales analyse." },
        { role: "user", content: cleaningPrompt }
      ]
    });

    return applyCleaningRules(rawData, cleanedData.choices[0].message.content);
  },

  // Stap 3: Geavanceerde analyse met AI
  analyzePatterns: async (data) => {
    const analyses = {
      // Trend analyse
      trends: await analyzeTrends(data),
      
      // Customer segmentatie
      segments: await performSegmentation(data),
      
      // Voorspellende analyse
      predictions: await generatePredictions(data),
      
      // Anomalie detectie
      anomalies: await detectAnomalies(data)
    };

    // AI-gegenereerde insights
    const insightsPrompt = \`
    Op basis van deze analyses, genereer actionable business insights:
    Trends: \${JSON.stringify(analyses.trends)}
    Segmenten: \${JSON.stringify(analyses.segments)}
    Voorspellingen: \${JSON.stringify(analyses.predictions)}
    Anomalieën: \${JSON.stringify(analyses.anomalies)}
    \`;

    const insights = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Je bent een business intelligence expert." },
        { role: "user", content: insightsPrompt }
      ]
    });

    return {
      ...analyses,
      insights: insights.choices[0].message.content
    };
  },

  // Stap 4: Automatische rapportage
  generateReport: async (analysis) => {
    // Genereer executive summary
    const executiveSummary = await generateExecutiveSummary(analysis);
    
    // Creëer visualisaties
    const charts = await generateCharts(analysis);
    
    // Compile volledig rapport
    const report = {
      summary: executiveSummary,
      detailedAnalysis: analysis,
      visualizations: charts,
      recommendations: await generateRecommendations(analysis)
    };

    // Converteer naar verschillende formaten
    return {
      pdf: await generatePDF(report),
      dashboard: await updateDashboard(report),
      email: await formatEmailReport(report)
    };
  }
};
\`\`\`

## Customer service automation

Intelligente customer service workflows die AI gebruiken voor snelle en accurate klantondersteuning.

### Omnichannel support workflow

\`\`\`javascript
// Intelligente customer support automation
const customerServiceWorkflow = {
  // Stap 1: Inkomende berichten routing
  routeIncomingMessage: async (message) => {
    // Analyseer intent en sentiment
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Analyseer customer service berichten voor intent, urgentie en sentiment."
        },
        {
          role: "user",
          content: \`
          Bericht: \${message.content}
          Klant historie: \${message.customerHistory}
          
          Bepaal:
          1. Intent (vraag, klacht, feedback, etc.)
          2. Urgentie (1-5 schaal)
          3. Sentiment (positief/neutraal/negatief)
          4. Onderwerp categorie
          5. Suggested routing (AI/Human/Specialist)
          \`
        }
      ]
    });

    const routing = JSON.parse(analysis.choices[0].message.content);
    
    // Route op basis van analyse
    if (routing.urgentie >= 4 || routing.sentiment === 'negatief') {
      return await routeToHuman(message, routing);
    } else if (routing.suggested_routing === 'AI') {
      return await handleWithAI(message, routing);
    } else {
      return await routeToSpecialist(message, routing);
    }
  },

  // Stap 2: AI response generatie
  generateAIResponse: async (message, context) => {
    // Haal relevante kennis op
    const knowledgeBase = await searchKnowledgeBase(message.intent);
    const previousInteractions = await getCustomerHistory(message.customerId);
    
    // Genereer gepersonaliseerd antwoord
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: \`
          Je bent een vriendelijke en behulpzame customer service medewerker.
          Gebruik deze kennis: \${knowledgeBase}
          Klant geschiedenis: \${previousInteractions}
          Bedrijf tone of voice: Professioneel maar toegankelijk
          \`
        },
        {
          role: "user",
          content: message.content
        }
      ],
      temperature: 0.7
    });

    // Valideer response
    const validation = await validateResponse(response.choices[0].message.content);
    
    if (validation.approved) {
      return {
        response: response.choices[0].message.content,
        confidence: validation.confidence,
        suggestedFollowUp: await generateFollowUp(message, response)
      };
    } else {
      return await escalateToHuman(message, validation.reason);
    }
  },

  // Stap 3: Proactieve support
  proactiveSupport: async (customerData) => {
    // Analyseer klant gedrag voor potentiële issues
    const behaviorAnalysis = await analyzeCustomerBehavior(customerData);
    
    if (behaviorAnalysis.potentialIssues.length > 0) {
      // Genereer proactief bericht
      const proactiveMessage = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Creëer vriendelijke, proactieve support berichten."
          },
          {
            role: "user",
            content: \`
            Klant: \${customerData.name}
            Potentiële issues: \${behaviorAnalysis.potentialIssues}
            Recent gedrag: \${behaviorAnalysis.recentActions}
            
            Schrijf een proactief support bericht.
            \`
          }
        ]
      });

      return await sendProactiveSupport(
        customerData.id,
        proactiveMessage.choices[0].message.content
      );
    }
  },

  // Stap 4: Feedback loop en verbetering
  processFeeback: async (interaction) => {
    // Verzamel feedback
    const feedback = await collectFeedback(interaction);
    
    // Analyseer voor verbeteringen
    const improvements = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: \`
          Analyseer deze customer service interactie:
          \${JSON.stringify(interaction)}
          
          Feedback: \${feedback}
          
          Suggereer verbeteringen voor:
          1. Response kwaliteit
          2. Response tijd
          3. Knowledge base updates
          4. Routing regels
          \`
        }
      ]
    });

    // Update systemen
    await updateKnowledgeBase(improvements.choices[0].message.content);
    await updateRoutingRules(improvements.choices[0].message.content);
    
    return improvements;
  }
};
\`\`\`

## Document processing workflows

Automatische verwerking van documenten met AI voor extractie, analyse en actie.

### Intelligente document verwerking pipeline

\`\`\`javascript
// Document processing automation
const documentProcessingWorkflow = {
  // Stap 1: Document intake en classificatie
  processDocument: async (document) => {
    // OCR voor gescande documenten
    let textContent = document.text;
    if (document.type === 'image' || document.type === 'pdf') {
      textContent = await performOCR(document);
    }

    // Classificeer document type
    const classification = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Classificeer documenten nauwkeurig op basis van inhoud."
        },
        {
          role: "user",
          content: \`
          Analyseer dit document en bepaal:
          1. Document type (factuur, contract, brief, etc.)
          2. Taal
          3. Urgentie niveau
          4. Relevante afdelingen
          5. Vereiste acties
          
          Document: \${textContent.substring(0, 2000)}
          \`
        }
      ]
    });

    return JSON.parse(classification.choices[0].message.content);
  },

  // Stap 2: Data extractie
  extractData: async (document, documentType) => {
    const extractionTemplates = {
      factuur: {
        fields: ['factuur_nummer', 'datum', 'bedrag', 'btw', 'leverancier', 'items'],
        validation: ['bedrag_check', 'btw_berekening', 'leverancier_verificatie']
      },
      contract: {
        fields: ['partijen', 'start_datum', 'eind_datum', 'voorwaarden', 'bedragen', 'handtekeningen'],
        validation: ['datum_logica', 'partij_verificatie', 'voorwaarden_check']
      },
      aanvraag: {
        fields: ['aanvrager', 'type_aanvraag', 'datum', 'details', 'bijlagen', 'goedkeuring_vereist'],
        validation: ['volledigheid', 'aanvrager_autorisatie']
      }
    };

    const template = extractionTemplates[documentType];
    
    // Extract specifieke velden
    const extraction = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: \`Extract specifieke data uit \${documentType} documenten. Output als JSON.\`
        },
        {
          role: "user",
          content: \`
          Extract deze velden: \${template.fields.join(', ')}
          
          Document: \${document.text}
          
          Zorg voor gestructureerde JSON output.
          \`
        }
      ],
      response_format: { type: "json_object" }
    });

    const extractedData = JSON.parse(extraction.choices[0].message.content);
    
    // Valideer geëxtraheerde data
    const validationResults = await validateExtractedData(extractedData, template.validation);
    
    return {
      data: extractedData,
      validation: validationResults,
      confidence: calculateConfidence(validationResults)
    };
  },

  // Stap 3: Intelligente verwerking
  processExtractedData: async (documentData, businessRules) => {
    // Pas business rules toe
    const decisions = [];
    
    for (const rule of businessRules) {
      if (evaluateRule(rule, documentData)) {
        decisions.push({
          rule: rule.name,
          action: rule.action,
          params: resolveParams(rule.params, documentData)
        });
      }
    }

    // AI-aanvulling voor edge cases
    if (decisions.length === 0 || documentData.confidence < 0.8) {
      const aiDecision = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Neem beslissingen over document verwerking op basis van business context."
          },
          {
            role: "user",
            content: \`
            Document data: \${JSON.stringify(documentData)}
            Business context: \${JSON.stringify(businessRules)}
            
            Bepaal de beste actie voor dit document.
            \`
          }
        ]
      });

      decisions.push({
        rule: 'ai_decision',
        action: aiDecision.choices[0].message.content,
        confidence: 'medium'
      });
    }

    return decisions;
  },

  // Stap 4: Automatische acties
  executeActions: async (decisions, documentData) => {
    const results = [];
    
    for (const decision of decisions) {
      switch (decision.action) {
        case 'create_entry':
          results.push(await createSystemEntry(documentData));
          break;
          
        case 'route_approval':
          results.push(await routeForApproval(documentData, decision.params));
          break;
          
        case 'generate_response':
          const response = await generateDocumentResponse(documentData);
          results.push(await sendResponse(response));
          break;
          
        case 'archive':
          results.push(await archiveDocument(documentData, decision.params));
          break;
          
        case 'flag_review':
          results.push(await flagForManualReview(documentData, decision.reason));
          break;
      }
    }

    // Genereer audit trail
    await createAuditTrail({
      document: documentData.id,
      decisions: decisions,
      actions: results,
      timestamp: new Date()
    });

    return results;
  }
};
\`\`\`

## Multi-step AI workflows

Complexe workflows die meerdere AI-modellen en stappen combineren voor geavanceerde automatisering.

### Research & content creation workflow

\`\`\`javascript
// Geavanceerde multi-step research en content workflow
const researchContentWorkflow = {
  // Fase 1: Research
  researchPhase: async (topic, requirements) => {
    // Stap 1: Genereer research queries
    const queries = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Genereer comprehensive research queries voor diepgaand onderzoek."
        },
        {
          role: "user",
          content: \`Topic: \${topic}\\nVereisten: \${requirements}\\nGenereer 10-15 research queries.\`
        }
      ]
    });

    // Stap 2: Voer searches uit
    const searchResults = [];
    for (const query of JSON.parse(queries.choices[0].message.content)) {
      const results = await performWebSearch(query);
      searchResults.push(...results);
    }

    // Stap 3: Analyseer en rank bronnen
    const rankedSources = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Analyseer en rank research bronnen op relevantie en betrouwbaarheid."
        },
        {
          role: "user",
          content: \`
          Topic: \${topic}
          Bronnen: \${JSON.stringify(searchResults)}
          
          Rank bronnen en extract key insights.
          \`
        }
      ]
    });

    // Stap 4: Synthetiseer research
    const synthesis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Synthetiseer research tot coherente insights en conclusies."
        },
        {
          role: "user",
          content: \`
          Research data: \${rankedSources.choices[0].message.content}
          
          Creëer een comprehensive research synthesis.
          \`
        }
      ]
    });

    return {
      sources: JSON.parse(rankedSources.choices[0].message.content),
      synthesis: synthesis.choices[0].message.content,
      keyFindings: await extractKeyFindings(synthesis.choices[0].message.content)
    };
  },

  // Fase 2: Content strategie
  strategyPhase: async (research, targetAudience, goals) => {
    // Stap 1: Audience analyse
    const audienceProfile = await analyzeAudience(targetAudience);
    
    // Stap 2: Content strategie ontwikkeling
    const strategy = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Ontwikkel data-driven content strategieën."
        },
        {
          role: "user",
          content: \`
          Research: \${research.synthesis}
          Audience: \${JSON.stringify(audienceProfile)}
          Goals: \${goals}
          
          Ontwikkel een comprehensive content strategie.
          \`
        }
      ]
    });

    // Stap 3: Content calendar
    const calendar = await generateContentCalendar(
      strategy.choices[0].message.content,
      30 // dagen
    );

    return {
      strategy: strategy.choices[0].message.content,
      audienceProfile,
      calendar,
      kpis: await defineKPIs(strategy.choices[0].message.content, goals)
    };
  },

  // Fase 3: Content creatie
  creationPhase: async (strategy, research) => {
    const contentPieces = [];
    
    for (const item of strategy.calendar) {
      // Stap 1: Genereer content outline
      const outline = await generateOutline(item, research);
      
      // Stap 2: Schrijf eerste draft
      const draft = await writeDraft(outline, strategy.audienceProfile);
      
      // Stap 3: Optimaliseer voor SEO
      const seoOptimized = await optimizeForSEO(draft, item.keywords);
      
      // Stap 4: Fact-check en verificatie
      const factChecked = await factCheckContent(seoOptimized, research.sources);
      
      // Stap 5: Tone en style aanpassing
      const styled = await adjustToneAndStyle(factChecked, strategy.brandVoice);
      
      // Stap 6: Genereer multimedia
      const multimedia = await generateMultimedia(styled);
      
      contentPieces.push({
        content: styled,
        multimedia,
        metadata: {
          outline,
          seoScore: await calculateSEOScore(styled),
          readabilityScore: await calculateReadability(styled),
          factAccuracy: factChecked.accuracy
        }
      });
    }

    return contentPieces;
  },

  // Fase 4: Review en optimalisatie
  reviewPhase: async (contentPieces, qualityCriteria) => {
    const reviewedContent = [];
    
    for (const piece of contentPieces) {
      // Stap 1: AI quality review
      const qualityReview = await performQualityReview(piece, qualityCriteria);
      
      // Stap 2: Plagiaat check
      const plagiarismCheck = await checkPlagiarism(piece.content);
      
      // Stap 3: Brand compliance
      const brandCheck = await verifyBrandCompliance(piece);
      
      // Stap 4: Finale optimalisaties
      if (qualityReview.score < 0.8) {
        piece.content = await improveContent(
          piece.content,
          qualityReview.suggestions
        );
      }

      reviewedContent.push({
        ...piece,
        reviews: {
          quality: qualityReview,
          plagiarism: plagiarismCheck,
          brand: brandCheck
        },
        status: determineStatus(qualityReview, plagiarismCheck, brandCheck)
      });
    }

    return reviewedContent;
  },

  // Fase 5: Publicatie en monitoring
  publicationPhase: async (content, channels) => {
    const publications = [];
    
    for (const piece of content) {
      if (piece.status === 'approved') {
        // Stap 1: Channel-specifieke aanpassingen
        const channelVersions = await adaptForChannels(piece, channels);
        
        // Stap 2: Schedule publicatie
        const scheduled = await schedulePublications(channelVersions);
        
        // Stap 3: Setup monitoring
        const monitoring = await setupMonitoring(scheduled);
        
        publications.push({
          content: piece,
          channels: scheduled,
          monitoring
        });
      }
    }

    // Stap 4: Setup performance tracking
    const tracking = await setupPerformanceTracking(publications);
    
    return {
      publications,
      tracking,
      dashboard: await generateDashboard(publications)
    };
  }
};

// Helper functie voor het orchestreren van de complete workflow
async function executeCompleteWorkflow(topic, requirements) {
  try {
    // Fase 1: Research
    console.log("Starting research phase...");
    const research = await researchContentWorkflow.researchPhase(topic, requirements);
    
    // Fase 2: Strategie
    console.log("Developing content strategy...");
    const strategy = await researchContentWorkflow.strategyPhase(
      research,
      requirements.targetAudience,
      requirements.goals
    );
    
    // Fase 3: Creatie
    console.log("Creating content...");
    const content = await researchContentWorkflow.creationPhase(strategy, research);
    
    // Fase 4: Review
    console.log("Reviewing and optimizing...");
    const reviewedContent = await researchContentWorkflow.reviewPhase(
      content,
      requirements.qualityCriteria
    );
    
    // Fase 5: Publicatie
    console.log("Publishing and setting up monitoring...");
    const publication = await researchContentWorkflow.publicationPhase(
      reviewedContent,
      requirements.channels
    );
    
    return {
      success: true,
      research,
      strategy,
      content: reviewedContent,
      publication,
      summary: await generateExecutiveSummary({
        research,
        strategy,
        content: reviewedContent,
        publication
      })
    };
    
  } catch (error) {
    console.error("Workflow error:", error);
    return {
      success: false,
      error: error.message,
      phase: getCurrentPhase(),
      recovery: await suggestRecovery(error)
    };
  }
}
\`\`\`

## Best practices voor AI workflows

### 1. Error handling en fallbacks

\`\`\`javascript
// Robuuste error handling
const robustAIWorkflow = {
  executeWithFallback: async (primaryAction, fallbackAction) => {
    try {
      const result = await primaryAction();
      if (validateResult(result)) {
        return result;
      }
      throw new Error("Validation failed");
    } catch (error) {
      console.log("Primary action failed, executing fallback...");
      return await fallbackAction(error);
    }
  },

  retryWithExponentialBackoff: async (action, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await sleep(Math.pow(2, i) * 1000);
      }
    }
  }
};
\`\`\`

### 2. Context management

\`\`\`javascript
// Effectief context beheer
class WorkflowContext {
  constructor() {
    this.history = [];
    this.metadata = {};
    this.tokens = 0;
  }

  addToHistory(step, result) {
    this.history.push({ step, result, timestamp: Date.now() });
    this.updateTokenCount(result);
  }

  getRelevantContext(maxTokens = 2000) {
    // Selecteer meest relevante context binnen token limiet
    return this.history
      .slice(-10)
      .map(h => summarizeIfNeeded(h, maxTokens / 10))
      .join('\\n');
  }
}
\`\`\`

### 3. Cost optimalisatie

\`\`\`javascript
// Token en cost management
const costOptimizedWorkflow = {
  selectModel: (task) => {
    if (task.complexity === 'low') return 'gpt-3.5-turbo';
    if (task.requiresLatestInfo) return 'gpt-4-turbo';
    return 'gpt-4';
  },

  batchProcess: async (items, batchSize = 10) => {
    const batches = chunk(items, batchSize);
    const results = [];
    
    for (const batch of batches) {
      const batchResult = await processBatch(batch);
      results.push(...batchResult);
    }
    
    return results;
  }
};
\`\`\`

## Monitoring en analytics

\`\`\`javascript
// Workflow monitoring
const monitoringSystem = {
  trackExecution: async (workflow, input) => {
    const tracking = {
      id: generateId(),
      startTime: Date.now(),
      workflow: workflow.name,
      input: sanitizeInput(input)
    };

    try {
      const result = await workflow.execute(input);
      tracking.endTime = Date.now();
      tracking.duration = tracking.endTime - tracking.startTime;
      tracking.success = true;
      tracking.result = summarizeResult(result);
      
      await logToAnalytics(tracking);
      return result;
      
    } catch (error) {
      tracking.error = error.message;
      tracking.success = false;
      await alertOnError(tracking);
      throw error;
    }
  }
};
\`\`\`

Deze les heeft je geleerd hoe je krachtige AI-powered workflows bouwt voor verschillende use cases. Van content generatie tot document processing, elke workflow combineert meerdere AI-stappen voor maximale automatisering en efficiëntie.
  `,
  codeExamples: [
    {
      id: 'example-3-3-1',
      title: 'Blog Content Pipeline',
      language: 'javascript',
      code: `// Complete blog content generation pipeline
const blogPipeline = {
  async generateBlogPost(topic, keywords) {
    // Research fase
    const research = await this.performResearch(topic, keywords);
    
    // Outline generatie
    const outline = await this.generateOutline(topic, research);
    
    // Content schrijven
    const content = await this.writeContent(outline, research);
    
    // SEO optimalisatie
    const optimized = await this.optimizeSEO(content, keywords);
    
    // Afbeeldingen genereren
    const images = await this.generateImages(content);
    
    return {
      title: optimized.title,
      content: optimized.content,
      images: images,
      metadata: {
        keywords: keywords,
        readingTime: calculateReadingTime(optimized.content),
        seoScore: optimized.score
      }
    };
  },

  async performResearch(topic, keywords) {
    const prompt = \`Research het onderwerp "\${topic}" 
    met focus op keywords: \${keywords.join(', ')}.
    Geef een overzicht van belangrijke punten, trends en statistieken.\`;

    const research = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Je bent een expert researcher." },
        { role: "user", content: prompt }
      ]
    });

    return research.choices[0].message.content;
  },

  async generateOutline(topic, research) {
    const prompt = \`Maak een gedetailleerde blog outline over "\${topic}".
    Gebruik deze research: \${research}
    
    Structure:
    - Pakkende intro
    - 3-5 hoofdsecties met subsecties
    - Praktische voorbeelden
    - Conclusie met call-to-action\`;

    const outline = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });

    return JSON.parse(outline.choices[0].message.content);
  }
};`
    },
    {
      id: 'example-3-3-2',
      title: 'Customer Support Automation',
      language: 'javascript',
      code: `// Intelligente customer support workflow
class CustomerSupportAI {
  constructor() {
    this.knowledgeBase = new KnowledgeBase();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.responseGenerator = new ResponseGenerator();
  }

  async handleTicket(ticket) {
    // Stap 1: Analyseer ticket
    const analysis = await this.analyzeTicket(ticket);
    
    // Stap 2: Bepaal routing
    if (analysis.urgency > 8 || analysis.sentiment < -0.5) {
      return this.escalateToHuman(ticket, analysis);
    }
    
    // Stap 3: Zoek relevante kennis
    const knowledge = await this.knowledgeBase.search(analysis.intent);
    
    // Stap 4: Genereer response
    const response = await this.generateResponse(ticket, knowledge, analysis);
    
    // Stap 5: Valideer en verstuur
    if (await this.validateResponse(response)) {
      return this.sendResponse(ticket.id, response);
    } else {
      return this.requestHumanReview(ticket, response);
    }
  }

  async analyzeTicket(ticket) {
    const prompt = \`Analyseer dit support ticket:
    Onderwerp: \${ticket.subject}
    Bericht: \${ticket.message}
    Klant historie: \${ticket.customerHistory}
    
    Bepaal:
    1. Intent (technisch probleem, billing, feature request, etc.)
    2. Urgentie (1-10)
    3. Sentiment (-1 tot 1)
    4. Complexiteit (laag/medium/hoog)
    5. Suggested resolution path\`;

    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Je bent een expert in customer support analyse." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(analysis.choices[0].message.content);
  }

  async generateResponse(ticket, knowledge, analysis) {
    const prompt = \`Genereer een behulpzaam antwoord voor deze klant:
    
    Ticket: \${ticket.message}
    Intent: \${analysis.intent}
    Relevante kennis: \${knowledge}
    
    Tone: Vriendelijk, behulpzaam, professioneel
    Structuur:
    1. Bevestig begrip van het probleem
    2. Bied concrete oplossing
    3. Geef duidelijke stappen
    4. Bied verdere hulp aan\`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Je bent een vriendelijke customer support medewerker." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    return {
      message: response.choices[0].message.content,
      confidence: this.calculateConfidence(analysis, knowledge),
      suggestedFollowUp: await this.generateFollowUp(analysis)
    };
  }
}`
    },
    {
      id: 'example-3-3-3',
      title: 'Document Processing Pipeline',
      language: 'javascript',
      code: `// Intelligente document verwerking
const documentProcessor = {
  async processInvoice(document) {
    // Stap 1: OCR indien nodig
    const text = await this.extractText(document);
    
    // Stap 2: Identificeer document type
    const docType = await this.classifyDocument(text);
    
    // Stap 3: Extract specifieke data
    const extractedData = await this.extractInvoiceData(text);
    
    // Stap 4: Valideer data
    const validation = await this.validateInvoiceData(extractedData);
    
    // Stap 5: Process acties
    if (validation.isValid) {
      await this.processValidInvoice(extractedData);
    } else {
      await this.handleInvalidInvoice(extractedData, validation.errors);
    }
    
    return {
      documentId: document.id,
      type: docType,
      data: extractedData,
      validation: validation,
      status: validation.isValid ? 'processed' : 'requires_review'
    };
  },

  async extractInvoiceData(text) {
    const prompt = \`Extract de volgende informatie uit deze factuur:
    
    \${text}
    
    Te extraheren velden:
    - factuur_nummer
    - factuur_datum
    - leverancier_naam
    - leverancier_adres
    - totaal_bedrag
    - btw_bedrag
    - subtotaal
    - betalingstermijn
    - items (array met beschrijving, aantal, prijs per stuk, totaal)
    
    Output als JSON.\`;

    const extraction = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Je bent een expert in factuur data extractie." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(extraction.choices[0].message.content);
  },

  async validateInvoiceData(data) {
    const validationRules = {
      factuur_nummer: (val) => val && val.length > 0,
      totaal_bedrag: (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      btw_bedrag: (val, data) => {
        const btw = parseFloat(val);
        const totaal = parseFloat(data.totaal_bedrag);
        const subtotaal = parseFloat(data.subtotaal);
        return Math.abs((subtotaal * 0.21) - btw) < 0.01;
      },
      items: (val) => Array.isArray(val) && val.length > 0
    };

    const errors = [];
    
    for (const [field, validator] of Object.entries(validationRules)) {
      if (!validator(data[field], data)) {
        errors.push({
          field: field,
          error: \`Validation failed for \${field}\`,
          value: data[field]
        });
      }
    }

    // AI-gestuurde validatie voor complexe regels
    if (errors.length === 0) {
      const aiValidation = await this.performAIValidation(data);
      errors.push(...aiValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      confidence: this.calculateValidationConfidence(data, errors)
    };
  }
};`
    },
    {
      id: 'example-3-3-4',
      title: 'Multi-Step Analysis Workflow',
      language: 'javascript',
      code: `// Complexe multi-step data analyse workflow
class DataAnalysisWorkflow {
  async analyzeCustomerData(dataSource) {
    const pipeline = [
      this.collectData,
      this.cleanData,
      this.enrichData,
      this.analyzePatterns,
      this.generateInsights,
      this.createReport
    ];

    let result = dataSource;
    const stepResults = [];

    for (const [index, step] of pipeline.entries()) {
      console.log(\`Executing step \${index + 1}: \${step.name}\`);
      
      try {
        result = await step.call(this, result);
        stepResults.push({
          step: step.name,
          success: true,
          output: this.summarizeOutput(result)
        });
      } catch (error) {
        console.error(\`Error in step \${step.name}:\`, error);
        stepResults.push({
          step: step.name,
          success: false,
          error: error.message
        });
        
        // Probeer te herstellen
        result = await this.recoverFromError(step, result, error);
      }
    }

    return {
      finalResult: result,
      executionLog: stepResults,
      summary: await this.generateExecutiveSummary(result)
    };
  }

  async collectData(source) {
    const dataSources = {
      crm: await this.fetchCRMData(),
      transactions: await this.fetchTransactionData(),
      support: await this.fetchSupportData(),
      marketing: await this.fetchMarketingData()
    };

    return this.mergeDataSources(dataSources);
  }

  async enrichData(data) {
    // Verrijk data met AI-gegenereerde insights
    const enrichmentPrompt = \`Analyseer deze customer data en voeg toe:
    1. Customer lifetime value predictions
    2. Churn risk scores
    3. Product affinity scores
    4. Engagement patterns
    
    Data sample: \${JSON.stringify(data.slice(0, 100))}\`;

    const enrichment = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Je bent een data scientist gespecialiseerd in customer analytics." 
        },
        { role: "user", content: enrichmentPrompt }
      ]
    });

    return this.applyEnrichment(data, enrichment.choices[0].message.content);
  }

  async analyzePatterns(enrichedData) {
    const analyses = await Promise.all([
      this.performSegmentation(enrichedData),
      this.detectAnomalies(enrichedData),
      this.identifyTrends(enrichedData),
      this.predictFutureBehavior(enrichedData)
    ]);

    return {
      segments: analyses[0],
      anomalies: analyses[1],
      trends: analyses[2],
      predictions: analyses[3]
    };
  }

  async generateInsights(analysis) {
    const insightPrompt = \`Op basis van deze analyse, genereer actionable business insights:
    
    Segmenten: \${JSON.stringify(analysis.segments)}
    Anomalieën: \${JSON.stringify(analysis.anomalies)}
    Trends: \${JSON.stringify(analysis.trends)}
    Voorspellingen: \${JSON.stringify(analysis.predictions)}
    
    Focus op:
    1. Quick wins
    2. Strategische opportunities
    3. Risk mitigation
    4. Revenue optimization\`;

    const insights = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Je bent een senior business analyst." 
        },
        { role: "user", content: insightPrompt }
      ]
    });

    return {
      insights: insights.choices[0].message.content,
      recommendations: await this.generateRecommendations(insights.choices[0].message.content),
      actionPlan: await this.createActionPlan(insights.choices[0].message.content)
    };
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-3-3-1',
      title: 'Bouw een content generation pipeline',
      description: 'Creëer een complete workflow voor het genereren van blog content.',
      difficulty: 'medium',
      type: 'code' as const,
      hints: [
        'Ontwerp een workflow die onderzoek doet naar een onderwerp',
        'Implementeer outline generatie op basis van research',
        'Bouw content schrijf functionaliteit met AI',
        'Voeg SEO optimalisatie toe',
        'Test met verschillende onderwerpen'
      ],
      initialCode: `// Content generation pipeline starter
const contentPipeline = {
  async generateContent(topic, keywords) {
    // TODO: Implementeer research fase
    const research = await this.performResearch(topic);
    
    // TODO: Genereer outline
    const outline = await this.generateOutline(topic, research);
    
    // TODO: Schrijf content
    const content = await this.writeContent(outline);
    
    // TODO: Optimaliseer voor SEO
    const optimized = await this.optimizeSEO(content, keywords);
    
    return optimized;
  },
  
  async performResearch(topic) {
    // Implementeer research logica
  }
};`,
      solution: `// Complete content generation pipeline
const contentPipeline = {
  async generateContent(topic, keywords) {
    console.log(\`Starting content generation for: \${topic}\`);
    
    // Research fase
    const research = await this.performResearch(topic, keywords);
    
    // Genereer outline
    const outline = await this.generateOutline(topic, research);
    
    // Schrijf content
    const content = await this.writeContent(outline, research);
    
    // SEO optimalisatie
    const optimized = await this.optimizeSEO(content, keywords);
    
    // Genereer metadata
    const metadata = await this.generateMetadata(optimized, keywords);
    
    return {
      title: optimized.title,
      content: optimized.content,
      metadata: metadata,
      research: research.summary
    };
  },
  
  async performResearch(topic, keywords) {
    const researchPrompt = \`
    Onderzoek het onderwerp: "\${topic}"
    Focus keywords: \${keywords.join(', ')}
    
    Geef:
    1. Belangrijkste feiten en statistieken
    2. Actuele trends
    3. Expert meningen
    4. Relevante voorbeelden
    5. Veelgestelde vragen
    \`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Je bent een expert researcher voor content creatie."
        },
        {
          role: "user",
          content: researchPrompt
        }
      ]
    });
    
    return {
      rawData: response.choices[0].message.content,
      summary: await this.summarizeResearch(response.choices[0].message.content)
    };
  },
  
  async generateOutline(topic, research) {
    const outlinePrompt = \`
    Creëer een gedetailleerde blog outline voor: "\${topic}"
    
    Gebruik deze research:
    \${research.summary}
    
    Structuur:
    - Pakkende introductie (met hook)
    - 3-5 hoofdsecties met subsecties
    - Praktische voorbeelden per sectie
    - Belangrijke takeaways
    - Call-to-action
    
    Output als JSON array.
    \`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: outlinePrompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  },
  
  async writeContent(outline, research) {
    const sections = [];
    
    // Schrijf introductie
    const intro = await this.writeSection(
      "introductie",
      outline.introduction,
      research
    );
    sections.push(intro);
    
    // Schrijf hoofdsecties
    for (const section of outline.mainSections) {
      const content = await this.writeSection(
        section.title,
        section.points,
        research
      );
      sections.push(content);
    }
    
    // Schrijf conclusie
    const conclusion = await this.writeSection(
      "conclusie",
      outline.conclusion,
      research
    );
    sections.push(conclusion);
    
    return {
      title: outline.title,
      content: sections.join('\\n\\n'),
      wordCount: sections.join(' ').split(' ').length
    };
  },
  
  async writeSection(sectionName, points, research) {
    const sectionPrompt = \`
    Schrijf de sectie "\${sectionName}" voor een blog artikel.
    
    Te behandelen punten:
    \${points.join('\\n')}
    
    Gebruik relevante informatie uit:
    \${research.summary}
    
    Schrijfstijl: Informatief maar toegankelijk
    Lengte: 200-300 woorden
    Include: Concrete voorbeelden en praktische tips
    \`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Je bent een professionele content writer."
        },
        {
          role: "user",
          content: sectionPrompt
        }
      ],
      temperature: 0.7
    });
    
    return response.choices[0].message.content;
  },
  
  async optimizeSEO(content, keywords) {
    const seoPrompt = \`
    Optimaliseer deze content voor SEO:
    
    Content: \${content.content}
    Target keywords: \${keywords.join(', ')}
    
    Taken:
    1. Optimaliseer de titel voor zoekintentie
    2. Zorg voor natuurlijke keyword integratie
    3. Voeg interne link suggesties toe
    4. Creëer meta description (155 chars)
    5. Suggereer heading structuur (H1, H2, H3)
    \`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Je bent een SEO specialist."
        },
        {
          role: "user",
          content: seoPrompt
        }
      ]
    });
    
    const seoData = JSON.parse(response.choices[0].message.content);
    
    return {
      title: seoData.optimizedTitle || content.title,
      content: seoData.optimizedContent || content.content,
      metaDescription: seoData.metaDescription,
      headingStructure: seoData.headings,
      keywordDensity: this.calculateKeywordDensity(seoData.optimizedContent, keywords),
      seoScore: this.calculateSEOScore(seoData)
    };
  },
  
  async generateMetadata(content, keywords) {
    return {
      title: content.title,
      metaDescription: content.metaDescription,
      keywords: keywords,
      readingTime: Math.ceil(content.content.split(' ').length / 200),
      seoScore: content.seoScore,
      publishDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      author: "AI Content Pipeline",
      category: await this.determineCategory(content.title, keywords)
    };
  },
  
  calculateKeywordDensity(content, keywords) {
    const words = content.toLowerCase().split(' ');
    const density = {};
    
    keywords.forEach(keyword => {
      const count = words.filter(word => 
        word.includes(keyword.toLowerCase())
      ).length;
      density[keyword] = (count / words.length) * 100;
    });
    
    return density;
  },
  
  calculateSEOScore(seoData) {
    let score = 0;
    
    // Title optimization
    if (seoData.optimizedTitle && seoData.optimizedTitle.length < 60) score += 20;
    
    // Meta description
    if (seoData.metaDescription && seoData.metaDescription.length <= 155) score += 20;
    
    // Heading structure
    if (seoData.headings && seoData.headings.h1 && seoData.headings.h2.length > 2) score += 20;
    
    // Keyword usage
    if (seoData.keywordUsage && seoData.keywordUsage.natural) score += 20;
    
    // Content length
    if (seoData.wordCount > 600) score += 20;
    
    return score;
  }
};`
    },
    {
      id: 'assignment-3-3-2',
      title: 'Implementeer een document processing systeem',
      description: 'Bouw een workflow voor het automatisch verwerken van facturen.',
      difficulty: 'hard',
      type: 'code' as const,
      hints: [
        'Creëer document classificatie functionaliteit',
        'Implementeer data extractie voor facturen',
        'Bouw validatie regels',
        'Voeg error handling toe',
        'Maak een processing pipeline'
      ],
      initialCode: `// Document processing starter
class InvoiceProcessor {
  async processInvoice(document) {
    // TODO: Implementeer document processing
  }
  
  async extractData(text) {
    // TODO: Extract factuur data
  }
  
  async validateData(data) {
    // TODO: Valideer geëxtraheerde data
  }
}`,
      solution: `// Complete invoice processing systeem
class InvoiceProcessor {
  constructor() {
    this.validationRules = this.initializeValidationRules();
    this.extractionPatterns = this.initializePatterns();
  }
  
  async processInvoice(document) {
    try {
      // Stap 1: Extract text
      const text = await this.extractText(document);
      
      // Stap 2: Classificeer document
      const classification = await this.classifyDocument(text);
      
      if (classification.type !== 'invoice') {
        throw new Error(\`Expected invoice, got \${classification.type}\`);
      }
      
      // Stap 3: Extract data
      const extractedData = await this.extractData(text);
      
      // Stap 4: Valideer data
      const validation = await this.validateData(extractedData);
      
      // Stap 5: Verwerk resultaat
      if (validation.isValid) {
        return await this.processValidInvoice(extractedData);
      } else {
        return await this.handleInvalidInvoice(extractedData, validation);
      }
      
    } catch (error) {
      console.error('Invoice processing error:', error);
      return {
        success: false,
        error: error.message,
        requiresManualReview: true
      };
    }
  }
  
  async extractText(document) {
    if (document.type === 'pdf') {
      // Gebruik OCR voor PDF
      return await this.performOCR(document);
    } else if (document.type === 'image') {
      // Gebruik OCR voor afbeelding
      return await this.performOCR(document);
    } else {
      // Plain text
      return document.content;
    }
  }
  
  async classifyDocument(text) {
    const classificationPrompt = \`
    Classificeer dit document:
    
    \${text.substring(0, 1000)}
    
    Mogelijke types:
    - invoice (factuur)
    - receipt (bon)
    - purchase_order (inkooporder)
    - quote (offerte)
    - contract
    - other
    
    Geef ook confidence score (0-1).
    \`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Je bent een document classificatie expert."
        },
        {
          role: "user",
          content: classificationPrompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
  
  async extractData(text) {
    const extractionPrompt = \`
    Extract alle factuur informatie uit deze tekst:
    
    \${text}
    
    Vereiste velden:
    - invoice_number (factuurnummer)
    - invoice_date (factuurdatum)
    - due_date (vervaldatum)
    - supplier_name (leverancier naam)
    - supplier_address (leverancier adres)
    - supplier_vat (BTW nummer leverancier)
    - customer_name (klant naam)
    - customer_address (klant adres)
    - subtotal (subtotaal)
    - vat_amount (BTW bedrag)
    - vat_rate (BTW percentage)
    - total_amount (totaalbedrag)
    - currency (valuta)
    - payment_terms (betalingsvoorwaarden)
    - line_items (array met regel items)
    
    Voor line_items extract:
    - description (omschrijving)
    - quantity (aantal)
    - unit_price (prijs per stuk)
    - total_price (totaalprijs)
    - vat_rate (BTW tarief)
    
    Output als JSON. Gebruik null voor ontbrekende waarden.
    \`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Je bent een expert in factuur data extractie. Output alleen valid JSON."
        },
        {
          role: "user",
          content: extractionPrompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const extracted = JSON.parse(response.choices[0].message.content);
    
    // Post-processing
    return this.postProcessExtraction(extracted);
  }
  
  postProcessExtraction(data) {
    // Converteer datums naar standaard formaat
    if (data.invoice_date) {
      data.invoice_date = this.parseDate(data.invoice_date);
    }
    if (data.due_date) {
      data.due_date = this.parseDate(data.due_date);
    }
    
    // Parse bedragen
    if (data.total_amount) {
      data.total_amount = this.parseAmount(data.total_amount);
    }
    if (data.subtotal) {
      data.subtotal = this.parseAmount(data.subtotal);
    }
    if (data.vat_amount) {
      data.vat_amount = this.parseAmount(data.vat_amount);
    }
    
    // Valideer line items
    if (data.line_items && Array.isArray(data.line_items)) {
      data.line_items = data.line_items.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity) || 0,
        unit_price: this.parseAmount(item.unit_price),
        total_price: this.parseAmount(item.total_price)
      }));
    }
    
    return data;
  }
  
  async validateData(data) {
    const errors = [];
    const warnings = [];
    
    // Basis veld validatie
    const requiredFields = [
      'invoice_number',
      'invoice_date',
      'supplier_name',
      'total_amount'
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push({
          field: field,
          message: \`\${field} is verplicht maar ontbreekt\`
        });
      }
    }
    
    // Numerieke validaties
    if (data.total_amount && data.subtotal && data.vat_amount) {
      const calculated = data.subtotal + data.vat_amount;
      if (Math.abs(calculated - data.total_amount) > 0.01) {
        errors.push({
          field: 'total_amount',
          message: \`Totaal (\${data.total_amount}) komt niet overeen met subtotaal + BTW (\${calculated})\`
        });
      }
    }
    
    // BTW validatie
    if (data.vat_rate && data.subtotal && data.vat_amount) {
      const expectedVat = data.subtotal * (data.vat_rate / 100);
      if (Math.abs(expectedVat - data.vat_amount) > 0.01) {
        warnings.push({
          field: 'vat_amount',
          message: \`BTW bedrag lijkt niet correct berekend\`
        });
      }
    }
    
    // Line items validatie
    if (data.line_items && data.line_items.length > 0) {
      const lineTotal = data.line_items.reduce((sum, item) => 
        sum + (item.total_price || 0), 0
      );
      
      if (data.subtotal && Math.abs(lineTotal - data.subtotal) > 0.01) {
        warnings.push({
          field: 'line_items',
          message: \`Som van regels komt niet overeen met subtotaal\`
        });
      }
    }
    
    // Datum validatie
    if (data.invoice_date && data.due_date) {
      const invoiceDate = new Date(data.invoice_date);
      const dueDate = new Date(data.due_date);
      
      if (dueDate < invoiceDate) {
        errors.push({
          field: 'due_date',
          message: \`Vervaldatum kan niet voor factuurdatum liggen\`
        });
      }
    }
    
    // AI-gestuurde business rule validatie
    const businessValidation = await this.validateBusinessRules(data);
    errors.push(...businessValidation.errors);
    warnings.push(...businessValidation.warnings);
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      confidence: this.calculateConfidence(data, errors, warnings)
    };
  }
  
  async validateBusinessRules(data) {
    const validationPrompt = \`
    Valideer deze factuur data tegen business rules:
    
    \${JSON.stringify(data, null, 2)}
    
    Check:
    1. Is de leverancier bekend/betrouwbaar?
    2. Zijn de bedragen realistisch voor dit type aankoop?
    3. Zijn er verdachte patronen?
    4. Komt het overeen met normale inkooppatronen?
    
    Geef errors en warnings.
    \`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Je bent een financial auditor met expertise in factuur validatie."
        },
        {
          role: "user",
          content: validationPrompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
  
  async processValidInvoice(data) {
    // Stap 1: Maak record in systeem
    const invoiceId = await this.createInvoiceRecord(data);
    
    // Stap 2: Upload naar accounting systeem
    await this.syncWithAccounting(invoiceId, data);
    
    // Stap 3: Trigger approval workflow indien nodig
    if (data.total_amount > 1000) {
      await this.triggerApprovalWorkflow(invoiceId, data);
    }
    
    // Stap 4: Schedule payment
    if (data.due_date) {
      await this.schedulePayment(invoiceId, data);
    }
    
    // Stap 5: Stuur notificaties
    await this.sendNotifications(invoiceId, data);
    
    return {
      success: true,
      invoiceId: invoiceId,
      status: 'processed',
      nextSteps: this.determineNextSteps(data)
    };
  }
  
  async handleInvalidInvoice(data, validation) {
    // Stap 1: Log voor audit trail
    await this.logValidationFailure(data, validation);
    
    // Stap 2: Probeer auto-fix voor kleine issues
    if (validation.errors.length <= 2) {
      const fixed = await this.attemptAutoFix(data, validation);
      if (fixed.success) {
        return await this.processValidInvoice(fixed.data);
      }
    }
    
    // Stap 3: Route naar manual review
    const reviewId = await this.createManualReview(data, validation);
    
    // Stap 4: Notificeer relevante personen
    await this.notifyForManualReview(reviewId, data, validation);
    
    return {
      success: false,
      reviewId: reviewId,
      status: 'requires_review',
      errors: validation.errors,
      warnings: validation.warnings
    };
  }
  
  initializeValidationRules() {
    return {
      invoice_number: {
        required: true,
        pattern: /^[A-Z0-9-]+$/,
        minLength: 3,
        maxLength: 50
      },
      total_amount: {
        required: true,
        min: 0.01,
        max: 1000000
      },
      vat_rate: {
        enum: [0, 9, 21], // Nederlandse BTW tarieven
        required: false
      }
    };
  }
  
  parseDate(dateString) {
    // Parse verschillende datum formaten
    const formats = [
      /^(\\d{2})-(\\d{2})-(\\d{4})$/, // DD-MM-YYYY
      /^(\\d{4})-(\\d{2})-(\\d{2})$/, // YYYY-MM-DD
      /^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/ // DD/MM/YYYY
    ];
    
    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        // Convert naar ISO format
        return new Date(dateString).toISOString().split('T')[0];
      }
    }
    
    return dateString;
  }
  
  parseAmount(amountString) {
    if (typeof amountString === 'number') return amountString;
    
    // Verwijder currency symbols en whitespace
    const cleaned = amountString
      .replace(/[€$£¥]/g, '')
      .replace(/\\s/g, '')
      .replace(/,/g, '.');
    
    return parseFloat(cleaned) || 0;
  }
  
  calculateConfidence(data, errors, warnings) {
    let confidence = 100;
    
    // Verminder voor elke error
    confidence -= errors.length * 20;
    
    // Verminder voor elke warning
    confidence -= warnings.length * 5;
    
    // Verminder voor ontbrekende optionele velden
    const optionalFields = ['customer_vat', 'payment_reference', 'po_number'];
    const missingOptional = optionalFields.filter(field => !data[field]).length;
    confidence -= missingOptional * 2;
    
    return Math.max(0, Math.min(100, confidence));
  }
};`
    }
  ],
  resources: [
    {
      title: 'OpenAI API Documentation',
      url: 'https://platform.openai.com/docs',
      type: 'documentation'
    },
    {
      title: 'N8N AI Nodes',
      url: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain/',
      type: 'documentation'
    },
    {
      title: 'Workflow Automation Best Practices',
      url: 'https://n8n.io/blog/workflow-automation-best-practices/',
      type: 'article'
    },
    {
      title: 'Building AI Agents',
      url: 'https://www.deeplearning.ai/short-courses/building-applications-with-vector-databases/',
      type: 'course'
    }
  ]
};