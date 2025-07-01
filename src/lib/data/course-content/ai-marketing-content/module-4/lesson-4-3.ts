import type { Lesson } from '@/lib/data/courses';

export const lesson4_3: Lesson = {
  id: 'lesson-4-3',
  title: 'Multi-channel campagnes orchestreren',
  duration: '55 min',
  content: `
# Multi-channel Campagnes Orchestreren

Moderne consumenten gebruiken gemiddeld 6-8 verschillende touchpoints voordat ze een aankoop doen. AI helpt ons deze complexe customer journeys te orchestreren en optimaliseren. Deze les focust op het bouwen van intelligente multi-channel campaigns.

## Overzicht van de les

- **Customer journey mapping** met AI
- **Cross-channel attribution** modellen
- **Real-time orchestration** engines
- **Unified campaign management**
- **Performance optimization** across channels

## 1. De Moderne Customer Journey

### Journey Complexity Analysis
\`\`\`python
# Customer journey analyzer
import pandas as pd
from datetime import datetime

class JourneyAnalyzer:
    def __init__(self, touchpoint_data):
        self.data = touchpoint_data
        self.journeys = self.construct_journeys()
    
    def construct_journeys(self):
        # Group touchpoints by customer and session
        journeys = self.data.groupby(['customer_id', 'session_id']).agg({
            'touchpoint': list,
            'channel': list,
            'timestamp': ['min', 'max'],
            'converted': 'max'
        })
        return journeys
    
    def analyze_patterns(self):
        patterns = {
            'avg_touchpoints': self.journeys['touchpoint'].apply(len).mean(),
            'common_paths': self.find_common_paths(),
            'channel_combinations': self.analyze_channel_mix(),
            'time_to_conversion': self.calculate_conversion_time(),
            'drop_off_points': self.identify_friction_points()
        }
        return patterns
    
    def find_common_paths(self, top_n=10):
        # Identificeer meest voorkomende journey paths
        path_counts = self.journeys['channel'].value_counts()
        return path_counts.head(top_n)
\`\`\`

### Multi-Touch Attribution Models

#### Data-Driven Attribution met ML
\`\`\`python
from sklearn.ensemble import RandomForestRegressor
import numpy as np

class AttributionModel:
    def __init__(self, conversion_data):
        self.data = conversion_data
        self.model = RandomForestRegressor(n_estimators=100)
        
    def prepare_features(self):
        # Feature engineering voor touchpoints
        features = []
        for journey in self.data:
            journey_features = {
                'email_touches': journey['channels'].count('email'),
                'social_touches': journey['channels'].count('social'),
                'search_touches': journey['channels'].count('search'),
                'direct_touches': journey['channels'].count('direct'),
                'total_touches': len(journey['channels']),
                'days_to_convert': journey['duration_days'],
                'weekend_touches': journey['weekend_interactions'],
                'mobile_percentage': journey['mobile_touches'] / len(journey['channels'])
            }
            features.append(journey_features)
        return pd.DataFrame(features)
    
    def calculate_channel_value(self):
        # Train model op conversion data
        X = self.prepare_features()
        y = self.data['conversion_value']
        
        self.model.fit(X, y)
        
        # Feature importance = channel attribution
        channel_importance = {
            'email': self.model.feature_importances_[0],
            'social': self.model.feature_importances_[1],
            'search': self.model.feature_importances_[2],
            'direct': self.model.feature_importances_[3]
        }
        
        return channel_importance
\`\`\`

## 2. Campaign Orchestration Platform

### Centralized Campaign Management
\`\`\`javascript
// Multi-channel campaign orchestrator
class CampaignOrchestrator {
  constructor(campaignConfig) {
    this.config = campaignConfig;
    this.channels = this.initializeChannels();
    this.segments = this.loadSegments();
    this.content = this.loadContent();
  }

  async launchCampaign() {
    const campaign = {
      id: this.generateCampaignId(),
      name: this.config.name,
      objective: this.config.objective,
      budget: this.config.budget,
      timeline: this.config.timeline,
      channels: await this.orchestrateChannels(),
      automation: this.setupAutomation()
    };
    
    return this.executeCampaign(campaign);
  }

  async orchestrateChannels() {
    const channelPlans = {};
    
    // Email channel
    if (this.config.channels.includes('email')) {
      channelPlans.email = {
        segments: this.segments.filter(s => s.email_engaged),
        content: await this.generateEmailContent(),
        schedule: this.optimizeEmailTiming(),
        automation: this.createEmailFlow()
      };
    }
    
    // Social media channels
    if (this.config.channels.includes('social')) {
      channelPlans.social = {
        platforms: ['facebook', 'instagram', 'linkedin'],
        audiences: await this.createCustomAudiences(),
        creatives: await this.generateSocialAds(),
        budget_allocation: this.optimizeSocialBudget(),
        scheduling: this.socialMediaCalendar()
      };
    }
    
    // Search channels
    if (this.config.channels.includes('search')) {
      channelPlans.search = {
        keywords: await this.generateKeywords(),
        ad_copy: await this.createSearchAds(),
        landing_pages: this.selectLandingPages(),
        bid_strategy: this.optimizeBidding()
      };
    }
    
    // Display/Retargeting
    if (this.config.channels.includes('display')) {
      channelPlans.display = {
        audiences: this.createRetargetingLists(),
        creatives: await this.generateDisplayAds(),
        placements: this.selectPlacements(),
        frequency_caps: this.setFrequencyCaps()
      };
    }
    
    return channelPlans;
  }
}
\`\`\`

### Cross-Channel Content Generation
\`\`\`
AI Prompt voor Multi-Channel Content:
"Creëer een coherente multi-channel campagne voor [product/service]:

Campaign Theme: [hoofdboodschap]
Target Audience: [doelgroep beschrijving]
Campaign Goals: [conversie doelen]

Genereer voor elk kanaal:

EMAIL:
- Subject line (max 50 chars)
- Preview text (max 100 chars)
- Body copy (150-200 woorden)
- CTA button text

SOCIAL MEDIA:
- Facebook ad copy (125 chars)
- Instagram caption (150 chars)
- LinkedIn post (200 chars)
- Hashtag suggesties (5-7)

SEARCH ADS:
- 5 headlines (max 30 chars each)
- 3 descriptions (max 90 chars each)
- Display URL paths

SMS:
- Kort bericht (max 160 chars)
- Link preview text

Zorg voor consistente messaging maar optimaliseer voor elk platform."
\`\`\`

## 3. Real-Time Campaign Triggers

### Event-Based Orchestration
\`\`\`yaml
# Campaign trigger configuration
campaign_triggers:
  abandoned_cart:
    conditions:
      - event: cart_abandoned
      - time_elapsed: 2_hours
      - cart_value: > €50
    
    actions:
      hour_2:
        channel: email
        template: gentle_reminder
        personalization: 
          - cart_items
          - discount_code_5_percent
      
      hour_24:
        channel: push_notification
        message: "Je winkelwagen mist je!"
        deep_link: cart_page
      
      day_3:
        channel: social_retargeting
        audience: cart_abandoners
        creative: dynamic_product_ads
      
      day_7:
        channel: email
        template: last_chance
        offer: free_shipping
  
  high_value_visitor:
    conditions:
      - page_views: > 10
      - time_on_site: > 5_minutes
      - viewed_categories: > 3
    
    actions:
      immediate:
        channel: on_site
        widget: exit_intent_popup
        offer: newsletter_signup_10_off
      
      next_day:
        channel: email
        template: personalized_recommendations
        products: ai_selected_based_on_behavior
\`\`\`

### Dynamic Budget Allocation
\`\`\`python
class DynamicBudgetOptimizer:
    def __init__(self, total_budget, channels, historical_performance):
        self.budget = total_budget
        self.channels = channels
        self.performance = historical_performance
        self.current_allocation = self.initialize_allocation()
    
    def optimize_allocation(self, real_time_data):
        # Multi-armed bandit approach voor budget optimalisatie
        performance_scores = {}
        
        for channel in self.channels:
            # Calculate performance index
            roi = real_time_data[channel]['revenue'] / real_time_data[channel]['spend']
            velocity = real_time_data[channel]['conversion_rate_trend']
            scalability = self.estimate_scalability(channel)
            
            performance_scores[channel] = roi * velocity * scalability
        
        # Reallocate budget based on performance
        total_score = sum(performance_scores.values())
        
        new_allocation = {}
        for channel, score in performance_scores.items():
            new_allocation[channel] = self.budget * (score / total_score)
            
            # Apply min/max constraints
            new_allocation[channel] = max(
                self.budget * 0.05,  # Min 5% per channel
                min(new_allocation[channel], self.budget * 0.40)  # Max 40%
            )
        
        return new_allocation
    
    def estimate_scalability(self, channel):
        # Estimate diminishing returns
        current_spend = self.current_allocation[channel]
        historical_curve = self.performance[channel]['efficiency_curve']
        
        return historical_curve.predict_efficiency(current_spend * 1.5)
\`\`\`

## 4. Unified Reporting & Analytics

### Cross-Channel Dashboard
\`\`\`javascript
// Real-time campaign dashboard
const CampaignDashboard = {
  metrics: {
    overview: {
      total_reach: 0,
      total_impressions: 0,
      total_clicks: 0,
      total_conversions: 0,
      total_revenue: 0,
      roi: 0
    },
    
    by_channel: {
      email: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        revenue: 0
      },
      social: {
        impressions: 0,
        clicks: 0,
        engagement_rate: 0,
        conversions: 0,
        cpc: 0,
        revenue: 0
      },
      search: {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        cost_per_conversion: 0,
        revenue: 0
      },
      display: {
        impressions: 0,
        clicks: 0,
        viewthrough_conversions: 0,
        click_conversions: 0,
        revenue: 0
      }
    },
    
    customer_journey: {
      avg_touchpoints: 0,
      time_to_conversion: 0,
      cross_channel_paths: [],
      attribution_model: 'data_driven'
    }
  },
  
  updateMetrics(newData) {
    // Real-time metric updates
    Object.keys(newData).forEach(channel => {
      this.metrics.by_channel[channel] = {
        ...this.metrics.by_channel[channel],
        ...newData[channel]
      };
    });
    
    this.calculateOverview();
    this.updateAttributions();
  },
  
  calculateOverview() {
    const channels = Object.values(this.metrics.by_channel);
    
    this.metrics.overview = {
      total_impressions: channels.reduce((sum, ch) => sum + (ch.impressions || ch.sent || 0), 0),
      total_clicks: channels.reduce((sum, ch) => sum + (ch.clicks || ch.clicked || 0), 0),
      total_conversions: channels.reduce((sum, ch) => sum + (ch.conversions || ch.converted || 0), 0),
      total_revenue: channels.reduce((sum, ch) => sum + ch.revenue, 0),
      roi: this.calculateROI()
    };
  }
};
\`\`\`

### Predictive Campaign Analytics
\`\`\`python
# Campaign performance predictor
from prophet import Prophet
import pandas as pd

class CampaignPredictor:
    def __init__(self, historical_data):
        self.data = historical_data
        self.models = {}
        
    def train_models(self):
        metrics = ['impressions', 'clicks', 'conversions', 'revenue']
        
        for metric in metrics:
            # Prepare data for Prophet
            df = pd.DataFrame({
                'ds': self.data['date'],
                'y': self.data[metric]
            })
            
            # Train model
            model = Prophet(
                seasonality_mode='multiplicative',
                weekly_seasonality=True,
                yearly_seasonality=True
            )
            
            # Add campaign events as regressors
            for event in self.data['campaign_events'].unique():
                df[event] = (self.data['campaign_events'] == event).astype(int)
                model.add_regressor(event)
            
            model.fit(df)
            self.models[metric] = model
    
    def predict_campaign_performance(self, campaign_plan):
        predictions = {}
        
        for metric, model in self.models.items():
            # Create future dataframe
            future = model.make_future_dataframe(periods=campaign_plan['duration_days'])
            
            # Add campaign effects
            for channel in campaign_plan['channels']:
                future[f'campaign_{channel}'] = 1
            
            # Generate predictions
            forecast = model.predict(future)
            
            predictions[metric] = {
                'forecast': forecast['yhat'].tail(campaign_plan['duration_days']).sum(),
                'lower_bound': forecast['yhat_lower'].tail(campaign_plan['duration_days']).sum(),
                'upper_bound': forecast['yhat_upper'].tail(campaign_plan['duration_days']).sum()
            }
        
        return predictions
\`\`\`

## 5. Advanced Integration Patterns

### API-Based Channel Integration
\`\`\`javascript
// Unified API wrapper voor alle marketing channels
class MarketingChannelAPI {
  constructor() {
    this.channels = {
      email: new EmailServiceProvider(),
      social: new SocialMediaAPI(),
      search: new GoogleAdsAPI(),
      display: new DisplayNetworkAPI(),
      sms: new SMSGateway(),
      push: new PushNotificationService()
    };
  }
  
  async executeOmnichannel(campaign) {
    const results = [];
    
    // Parallel execution met error handling
    const channelPromises = Object.entries(campaign.channels).map(
      async ([channel, config]) => {
        try {
          const result = await this.channels[channel].execute(config);
          return { channel, status: 'success', result };
        } catch (error) {
          return { channel, status: 'error', error: error.message };
        }
      }
    );
    
    return Promise.all(channelPromises);
  }
  
  async syncAudiences(segment) {
    // Sync audience segments across all channels
    const syncTasks = [];
    
    if (segment.email_list) {
      syncTasks.push(this.channels.email.uploadList(segment.email_list));
    }
    
    if (segment.phone_numbers) {
      syncTasks.push(this.channels.sms.uploadNumbers(segment.phone_numbers));
    }
    
    if (segment.social_ids) {
      syncTasks.push(this.channels.social.createCustomAudience(segment.social_ids));
    }
    
    return Promise.all(syncTasks);
  }
}
\`\`\`

### Workflow Automation Rules
\`\`\`yaml
# Marketing automation workflow
workflow_name: "Product Launch Campaign"
trigger: manual_start

stages:
  pre_launch:
    duration: 14_days_before_launch
    actions:
      - channel: email
        action: send_teaser
        segment: engaged_subscribers
        
      - channel: social
        action: start_awareness_campaign
        budget: 20%_of_total
        
      - channel: content
        action: publish_blog_series
        topics: [product_benefits, use_cases, testimonials]
  
  launch_week:
    duration: 7_days
    actions:
      - channel: email
        action: launch_announcement
        segment: all_subscribers
        send_time: launch_day_9am
        
      - channel: search
        action: activate_campaigns
        keywords: brand_plus_product
        bid_modifier: 150%
        
      - channel: social
        action: influencer_activation
        partners: pre_selected_list
        
      - channel: display
        action: retargeting_blast
        audience: website_visitors_30d
        frequency: 3x_per_day
  
  post_launch:
    duration: 21_days
    actions:
      - channel: email
        action: nurture_series
        segments:
          purchased: thank_you_onboarding
          engaged_not_purchased: benefit_education
          not_engaged: re_engagement_offer
        
      - channel: search
        action: optimize_bids
        strategy: target_roas
        target: 400%
        
      - channel: social
        action: ugc_campaign
        hashtag: "#MyProductExperience"
        incentive: feature_on_brand_page

monitoring:
  alerts:
    - metric: conversion_rate
      threshold: below_2%
      action: increase_bids_10%
      
    - metric: email_open_rate  
      threshold: below_15%
      action: test_new_subject_lines
      
    - metric: social_engagement
      threshold: below_3%
      action: refresh_creatives
\`\`\`

## 6. Campaign Optimization Strategies

### Continuous Learning System
\`\`\`python
class CampaignOptimizationEngine:
    def __init__(self):
        self.performance_history = []
        self.learning_rate = 0.1
        self.optimization_interval = 'daily'
        
    def optimize_campaign(self, current_performance):
        optimizations = {
            'content': self.optimize_content(current_performance),
            'timing': self.optimize_timing(current_performance),
            'targeting': self.optimize_targeting(current_performance),
            'budget': self.optimize_budget(current_performance),
            'channels': self.optimize_channel_mix(current_performance)
        }
        
        return self.apply_optimizations(optimizations)
    
    def optimize_content(self, performance):
        # A/B test winner selection
        best_performers = {}
        
        for channel in performance['channels']:
            variants = performance['channels'][channel]['variants']
            
            # Statistical significance check
            winner = self.determine_winner(variants)
            
            if winner:
                best_performers[channel] = winner
                
                # Generate new variants based on winner
                new_variants = self.generate_variants(winner)
                best_performers[f'{channel}_new_tests'] = new_variants
        
        return best_performers
    
    def optimize_channel_mix(self, performance):
        # Multi-objective optimization
        channel_scores = {}
        
        for channel in performance['channels']:
            metrics = performance['channels'][channel]
            
            # Composite score calculation
            score = (
                metrics['roi'] * 0.4 +
                metrics['reach'] * 0.2 +
                metrics['engagement'] * 0.2 +
                metrics['conversion_rate'] * 0.2
            )
            
            channel_scores[channel] = score
        
        # Recommend channel adjustments
        return self.recommend_mix_changes(channel_scores)
\`\`\`

## Praktische Opdracht

### Complete Multi-Channel Campaign
Ontwerp en implementeer een product launch campaign:

1. **Campaign Brief**
   - Product: Innovatieve fitness tracker
   - Budget: €50,000
   - Duration: 6 weken
   - Target: Health-conscious millennials

2. **Deliverables**
   - Customer journey map
   - Channel strategy document
   - Content calendar
   - Attribution model
   - Budget allocation plan
   - KPI dashboard mockup

3. **Implementation**
   - Email flow (5 emails)
   - Social media ads (3 platforms)
   - Search campaigns (Google & Bing)
   - Retargeting strategy
   - Influencer outreach plan

4. **Measurement**
   - Conversion tracking setup
   - Attribution methodology
   - Reporting templates
   - Optimization schedule

## Tools & Technologies

### Enterprise Orchestration Platforms
- **Salesforce Marketing Cloud Journey Builder**
- **Adobe Campaign**
- **Oracle Eloqua**
- **HubSpot Marketing Hub Enterprise**

### Integration & Automation
- **Zapier** - Quick integrations
- **Workato** - Enterprise automation
- **Tray.io** - Complex workflows
- **MuleSoft** - API integration

### Analytics & Attribution
- **Google Analytics 4**
- **Adobe Analytics**
- **Mixpanel**
- **Segment**

## Best Practices

### Campaign Orchestration Checklist
✅ Define clear campaign objectives and KPIs
✅ Map complete customer journey
✅ Ensure channel message consistency
✅ Set up proper tracking and attribution
✅ Create fallback scenarios
✅ Test all automations thoroughly
✅ Monitor performance in real-time
✅ Have optimization protocols ready
✅ Document all workflows
✅ Train team on tools and processes

## Volgende Les Preview

In de laatste les van deze module focussen we op:
- Advanced performance measurement
- AI-driven optimization techniques
- Predictive analytics for campaigns
- ROI maximization strategies
`,
  resources: [
    {
      title: 'Omnichannel Marketing Guide',
      url: 'https://www.salesforce.com/resources/guides/omnichannel-marketing/',
      type: 'guide'
    },
    {
      title: 'Multi-Touch Attribution Models',
      url: 'https://support.google.com/google-ads/answer/6394265',
      type: 'documentation'
    },
    {
      title: 'Marketing Automation Best Practices',
      url: 'https://www.marketo.com/marketing-automation/',
      type: 'resource'
    }
  ],
  assignments: [
    {
      id: 'multichannel-campaign',
      title: 'Multi-Channel Campaign Orchestration',
      description: 'Design en simuleer een complete multi-channel marketing campaign voor een product launch, inclusief alle channel strategies, content planning, en automation workflows.',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Start met een duidelijke customer journey map',
        'Zorg voor consistente messaging across channels',
        'Bouw in flexibiliteit voor real-time optimizations',
        'Vergeet mobile channels niet in je orchestration'
      ]
    }
  ]
};