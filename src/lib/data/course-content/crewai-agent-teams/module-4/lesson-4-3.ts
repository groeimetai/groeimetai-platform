import { Lesson } from '@/lib/data/courses';

const lesson: Lesson = {
  id: 'lesson-4-3',
  title: 'Analytics en optimization agents: Data-driven marketing',
  duration: '45 minuten',
  content: `
# Analytics en Optimization Agents

Deze les focust op het bouwen van intelligente analytics agents die marketing performance monitoren, analyseren en automatisch optimaliseren voor maximale ROI.

## Marketing Analytics Architecture

### 1. Data Collection en Integration

\`\`\`python
from crewai import Agent, Task, Crew
from crewai.tools import tool
from typing import Dict, List, Optional, Tuple
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dataclasses import dataclass
import requests
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import warnings
warnings.filterwarnings('ignore')

@dataclass
class MarketingMetrics:
    """Core marketing metrics structure"""
    channel: str
    date: datetime
    impressions: int
    clicks: int
    conversions: int
    revenue: float
    cost: float
    
    @property
    def ctr(self) -> float:
        """Click-through rate"""
        return self.clicks / self.impressions if self.impressions > 0 else 0
    
    @property
    def conversion_rate(self) -> float:
        """Conversion rate"""
        return self.conversions / self.clicks if self.clicks > 0 else 0
    
    @property
    def cpc(self) -> float:
        """Cost per click"""
        return self.cost / self.clicks if self.clicks > 0 else 0
    
    @property
    def cpa(self) -> float:
        """Cost per acquisition"""
        return self.cost / self.conversions if self.conversions > 0 else 0
    
    @property
    def roas(self) -> float:
        """Return on ad spend"""
        return self.revenue / self.cost if self.cost > 0 else 0

class DataIntegrationHub:
    """Centralized data integration voor alle marketing channels"""
    
    def __init__(self):
        self.connectors = {
            "google_ads": self._google_ads_connector,
            "facebook": self._facebook_connector,
            "linkedin": self._linkedin_connector,
            "email": self._email_connector,
            "organic": self._organic_connector,
            "analytics": self._analytics_connector
        }
        
    @tool("Multi-Channel Data Collector")
    def collect_marketing_data(self, channels: str, date_range: str) -> str:
        """Collect data from multiple marketing channels"""
        channel_list = json.loads(channels)
        dates = json.loads(date_range)
        
        all_data = {
            "collection_timestamp": datetime.now().isoformat(),
            "date_range": dates,
            "channels": {}
        }
        
        for channel in channel_list:
            if channel in self.connectors:
                channel_data = self.connectors[channel](dates)
                all_data["channels"][channel] = channel_data
            else:
                all_data["channels"][channel] = {"error": "Connector not configured"}
        
        # Aggregate cross-channel metrics
        all_data["aggregated"] = self._aggregate_metrics(all_data["channels"])
        
        return json.dumps(all_data, indent=2)
    
    def _google_ads_connector(self, date_range: Dict) -> Dict:
        """Simulate Google Ads data collection"""
        # In production: use Google Ads API
        days = (datetime.fromisoformat(date_range["end"]) - 
                datetime.fromisoformat(date_range["start"])).days
        
        metrics = []
        for i in range(days):
            date = datetime.fromisoformat(date_range["start"]) + timedelta(days=i)
            
            # Simulate realistic metrics with some variance
            base_impressions = 50000
            impressions = base_impressions + np.random.randint(-5000, 5000)
            ctr = 0.025 + np.random.uniform(-0.005, 0.005)
            clicks = int(impressions * ctr)
            conv_rate = 0.03 + np.random.uniform(-0.01, 0.01)
            conversions = int(clicks * conv_rate)
            cpc = 1.5 + np.random.uniform(-0.3, 0.3)
            cost = clicks * cpc
            revenue_per_conversion = 150 + np.random.uniform(-30, 50)
            revenue = conversions * revenue_per_conversion
            
            metrics.append({
                "date": date.isoformat(),
                "impressions": impressions,
                "clicks": clicks,
                "conversions": conversions,
                "cost": round(cost, 2),
                "revenue": round(revenue, 2),
                "campaigns": self._get_campaign_breakdown(impressions, clicks, conversions)
            })
        
        return {
            "platform": "Google Ads",
            "metrics": metrics,
            "account_info": {
                "account_id": "123-456-7890",
                "currency": "USD",
                "timezone": "UTC"
            }
        }
    
    def _aggregate_metrics(self, channels_data: Dict) -> Dict:
        """Aggregate metrics across all channels"""
        totals = {
            "impressions": 0,
            "clicks": 0,
            "conversions": 0,
            "cost": 0,
            "revenue": 0
        }
        
        for channel, data in channels_data.items():
            if "metrics" in data:
                for day_metrics in data["metrics"]:
                    for metric in totals.keys():
                        if metric in day_metrics:
                            totals[metric] += day_metrics[metric]
        
        # Calculate aggregated rates
        totals["ctr"] = totals["clicks"] / totals["impressions"] if totals["impressions"] > 0 else 0
        totals["conversion_rate"] = totals["conversions"] / totals["clicks"] if totals["clicks"] > 0 else 0
        totals["cpa"] = totals["cost"] / totals["conversions"] if totals["conversions"] > 0 else 0
        totals["roas"] = totals["revenue"] / totals["cost"] if totals["cost"] > 0 else 0
        
        return totals
\`\`\`

### 2. Analytics Agents Implementation

\`\`\`python
class MarketingAnalyticsAgents:
    """Specialized analytics agents voor verschillende analysis types"""
    
    def create_performance_analyst(self):
        """Agent voor performance analysis"""
        return Agent(
            role='Marketing Performance Analyst',
            goal='Analyze marketing performance across all channels and identify optimization opportunities',
            backstory="""Je bent een data scientist met expertise in marketing analytics. 
            Je hebt campagnes geoptimaliseerd die miljoenen in revenue hebben gegenereerd. 
            Je bent obsessed met data accuracy en actionable insights.""",
            verbose=True,
            tools=[
                self.performance_analysis_tool,
                self.attribution_modeling_tool,
                self.anomaly_detection_tool,
                self.competitor_benchmarking_tool
            ]
        )
    
    def create_predictive_analyst(self):
        """Agent voor predictive analytics"""
        return Agent(
            role='Predictive Analytics Specialist',
            goal='Forecast future performance and identify trends before they fully emerge',
            backstory="""Machine learning expert met focus op marketing forecasting. 
            Je modellen hebben consistent 95%+ accuracy in revenue predictions. 
            Je combineert statistical rigor met business intuition.""",
            verbose=True,
            tools=[
                self.forecasting_tool,
                self.trend_detection_tool,
                self.seasonality_analyzer,
                self.scenario_modeling_tool
            ]
        )
    
    @tool("Advanced Performance Analysis")
    def performance_analysis_tool(self, metrics_data: str, analysis_type: str) -> str:
        """Perform deep performance analysis"""
        data = json.loads(metrics_data)
        
        analysis_results = {
            "analysis_type": analysis_type,
            "timestamp": datetime.now().isoformat(),
            "findings": {}
        }
        
        if analysis_type == "channel_performance":
            analysis_results["findings"] = self._analyze_channel_performance(data)
        elif analysis_type == "campaign_effectiveness":
            analysis_results["findings"] = self._analyze_campaign_effectiveness(data)
        elif analysis_type == "customer_journey":
            analysis_results["findings"] = self._analyze_customer_journey(data)
        elif analysis_type == "content_performance":
            analysis_results["findings"] = self._analyze_content_performance(data)
        
        # Generate insights and recommendations
        analysis_results["insights"] = self._generate_insights(analysis_results["findings"])
        analysis_results["recommendations"] = self._generate_recommendations(analysis_results["findings"])
        
        return json.dumps(analysis_results, indent=2)
    
    def _analyze_channel_performance(self, data: Dict) -> Dict:
        """Analyze performance by channel"""
        channel_analysis = {}
        
        for channel, channel_data in data.get("channels", {}).items():
            if "metrics" in channel_data:
                metrics_df = pd.DataFrame(channel_data["metrics"])
                
                channel_analysis[channel] = {
                    "summary": {
                        "total_impressions": metrics_df["impressions"].sum(),
                        "total_clicks": metrics_df["clicks"].sum(),
                        "total_conversions": metrics_df["conversions"].sum(),
                        "total_cost": metrics_df["cost"].sum(),
                        "total_revenue": metrics_df["revenue"].sum(),
                        "avg_ctr": metrics_df["clicks"].sum() / metrics_df["impressions"].sum(),
                        "avg_conversion_rate": metrics_df["conversions"].sum() / metrics_df["clicks"].sum(),
                        "roas": metrics_df["revenue"].sum() / metrics_df["cost"].sum()
                    },
                    "trends": {
                        "impressions_trend": self._calculate_trend(metrics_df["impressions"]),
                        "ctr_trend": self._calculate_trend(metrics_df["clicks"] / metrics_df["impressions"]),
                        "conversion_trend": self._calculate_trend(metrics_df["conversions"]),
                        "roas_trend": self._calculate_trend(metrics_df["revenue"] / metrics_df["cost"])
                    },
                    "performance_score": self._calculate_performance_score(metrics_df)
                }
        
        # Rank channels by performance
        channel_analysis["ranking"] = self._rank_channels(channel_analysis)
        
        return channel_analysis
    
    @tool("ML-Powered Forecasting")
    def forecasting_tool(self, historical_data: str, forecast_period: int) -> str:
        """Generate forecasts using machine learning"""
        data = json.loads(historical_data)
        
        forecasts = {
            "forecast_period_days": forecast_period,
            "generated_at": datetime.now().isoformat(),
            "models_used": ["linear_regression", "random_forest", "arima"],
            "forecasts": {}
        }
        
        # Prepare data for modeling
        for channel, channel_data in data.get("channels", {}).items():
            if "metrics" in channel_data:
                df = pd.DataFrame(channel_data["metrics"])
                df["date"] = pd.to_datetime(df["date"])
                df = df.sort_values("date")
                
                # Create features
                df["day_of_week"] = df["date"].dt.dayofweek
                df["day_of_month"] = df["date"].dt.day
                df["month"] = df["date"].dt.month
                df["days_since_start"] = (df["date"] - df["date"].min()).dt.days
                
                # Forecast each metric
                channel_forecasts = {}
                metrics_to_forecast = ["impressions", "clicks", "conversions", "revenue", "cost"]
                
                for metric in metrics_to_forecast:
                    if metric in df.columns:
                        forecast = self._generate_forecast(df, metric, forecast_period)
                        channel_forecasts[metric] = forecast
                
                forecasts["forecasts"][channel] = channel_forecasts
        
        # Calculate confidence intervals
        forecasts["confidence_intervals"] = self._calculate_confidence_intervals(forecasts["forecasts"])
        
        # Generate forecast insights
        forecasts["insights"] = self._generate_forecast_insights(forecasts["forecasts"])
        
        return json.dumps(forecasts, indent=2)
    
    def _generate_forecast(self, df: pd.DataFrame, metric: str, periods: int) -> Dict:
        """Generate forecast for a specific metric"""
        # Features for prediction
        feature_cols = ["day_of_week", "day_of_month", "month", "days_since_start"]
        X = df[feature_cols]
        y = df[metric]
        
        # Train multiple models
        models = {
            "linear": LinearRegression(),
            "random_forest": RandomForestRegressor(n_estimators=100, random_state=42)
        }
        
        predictions = {}
        for model_name, model in models.items():
            model.fit(X, y)
            
            # Generate future dates
            last_date = df["date"].max()
            future_dates = pd.date_range(start=last_date + timedelta(days=1), periods=periods, freq='D')
            
            # Create features for future dates
            future_features = pd.DataFrame({
                "day_of_week": future_dates.dayofweek,
                "day_of_month": future_dates.day,
                "month": future_dates.month,
                "days_since_start": [(d - df["date"].min()).days for d in future_dates]
            })
            
            # Make predictions
            future_predictions = model.predict(future_features)
            
            predictions[model_name] = {
                "values": future_predictions.tolist(),
                "dates": [d.isoformat() for d in future_dates],
                "model_score": model.score(X, y)
            }
        
        # Ensemble prediction (average of all models)
        ensemble_values = np.mean([predictions[m]["values"] for m in predictions], axis=0)
        
        return {
            "ensemble_forecast": ensemble_values.tolist(),
            "individual_models": predictions,
            "historical_avg": float(y.mean()),
            "historical_std": float(y.std()),
            "trend_direction": "increasing" if ensemble_values[-1] > ensemble_values[0] else "decreasing"
        }
\`\`\`

### 3. Optimization Agents

\`\`\`python
class MarketingOptimizationAgents:
    """Agents voor automated marketing optimization"""
    
    def create_budget_optimizer(self):
        """Agent voor budget optimization"""
        return Agent(
            role='Budget Optimization Specialist',
            goal='Maximize ROI by optimally allocating budget across channels and campaigns',
            backstory="""Finance en marketing hybrid met track record van 40%+ ROI 
            improvements door smart budget allocation. Expert in multi-touch attribution 
            en incremental value modeling.""",
            verbose=True,
            tools=[
                self.budget_optimization_tool,
                self.bid_management_tool,
                self.channel_mix_optimizer,
                self.incremental_value_calculator
            ]
        )
    
    def create_creative_optimizer(self):
        """Agent voor creative optimization"""
        return Agent(
            role='Creative Performance Optimizer',
            goal='Optimize creative elements for maximum engagement and conversion',
            backstory="""Creative strategist met data-driven approach. Heeft A/B tests 
            geleid die conversion rates met 200%+ hebben verbeterd. Master in 
            multivariate testing en creative analytics.""",
            verbose=True,
            tools=[
                self.ab_test_analyzer,
                self.creative_performance_tool,
                self.audience_resonance_tool,
                self.creative_fatigue_detector
            ]
        )
    
    @tool("AI-Powered Budget Optimizer")
    def budget_optimization_tool(self, performance_data: str, constraints: str) -> str:
        """Optimize budget allocation using AI"""
        data = json.loads(performance_data)
        budget_constraints = json.loads(constraints)
        
        optimization_result = {
            "timestamp": datetime.now().isoformat(),
            "current_allocation": {},
            "recommended_allocation": {},
            "expected_improvement": {}
        }
        
        # Extract current performance by channel
        channel_performance = {}
        for channel, channel_data in data.get("channels", {}).items():
            if "metrics" in channel_data:
                metrics = channel_data["metrics"]
                total_cost = sum(m["cost"] for m in metrics)
                total_revenue = sum(m["revenue"] for m in metrics)
                
                channel_performance[channel] = {
                    "current_budget": total_cost,
                    "revenue": total_revenue,
                    "roas": total_revenue / total_cost if total_cost > 0 else 0,
                    "marginal_roas": self._calculate_marginal_roas(metrics)
                }
                
                optimization_result["current_allocation"][channel] = total_cost
        
        # Optimize allocation based on marginal ROAS
        total_budget = budget_constraints.get("total_budget", sum(cp["current_budget"] for cp in channel_performance.values()))
        optimized_allocation = self._optimize_budget_allocation(
            channel_performance,
            total_budget,
            budget_constraints.get("min_per_channel", {}),
            budget_constraints.get("max_per_channel", {})
        )
        
        optimization_result["recommended_allocation"] = optimized_allocation["allocation"]
        optimization_result["expected_improvement"] = optimized_allocation["expected_improvement"]
        
        # Generate implementation plan
        optimization_result["implementation_plan"] = self._generate_implementation_plan(
            optimization_result["current_allocation"],
            optimization_result["recommended_allocation"]
        )
        
        return json.dumps(optimization_result, indent=2)
    
    def _calculate_marginal_roas(self, metrics: List[Dict]) -> float:
        """Calculate marginal ROAS for budget changes"""
        if len(metrics) < 2:
            return 0
        
        # Sort by cost
        sorted_metrics = sorted(metrics, key=lambda x: x["cost"])
        
        # Calculate marginal ROAS between different spend levels
        marginal_roas_values = []
        for i in range(1, len(sorted_metrics)):
            cost_diff = sorted_metrics[i]["cost"] - sorted_metrics[i-1]["cost"]
            revenue_diff = sorted_metrics[i]["revenue"] - sorted_metrics[i-1]["revenue"]
            
            if cost_diff > 0:
                marginal_roas = revenue_diff / cost_diff
                marginal_roas_values.append(marginal_roas)
        
        return np.mean(marginal_roas_values) if marginal_roas_values else 0
    
    @tool("Creative A/B Test Analyzer")
    def ab_test_analyzer(self, test_data: str, confidence_level: float = 0.95) -> str:
        """Analyze A/B test results with statistical significance"""
        data = json.loads(test_data)
        
        analysis = {
            "test_id": data.get("test_id"),
            "duration": data.get("duration"),
            "variants": {}
        }
        
        # Analyze each variant
        for variant_name, variant_data in data.get("variants", {}).items():
            impressions = variant_data.get("impressions", 0)
            conversions = variant_data.get("conversions", 0)
            revenue = variant_data.get("revenue", 0)
            
            conversion_rate = conversions / impressions if impressions > 0 else 0
            revenue_per_impression = revenue / impressions if impressions > 0 else 0
            
            analysis["variants"][variant_name] = {
                "impressions": impressions,
                "conversions": conversions,
                "conversion_rate": conversion_rate,
                "revenue": revenue,
                "revenue_per_impression": revenue_per_impression,
                "confidence_interval": self._calculate_confidence_interval(
                    conversions, impressions, confidence_level
                )
            }
        
        # Determine winner
        analysis["winner"] = self._determine_test_winner(analysis["variants"])
        analysis["statistical_significance"] = self._calculate_significance(analysis["variants"])
        
        # Generate recommendations
        analysis["recommendations"] = self._generate_test_recommendations(analysis)
        
        return json.dumps(analysis, indent=2)
\`\`\`

### 4. Real-time Optimization System

\`\`\`python
class RealTimeOptimizationSystem:
    """Complete real-time marketing optimization system"""
    
    def __init__(self):
        self.data_hub = DataIntegrationHub()
        self.performance_analyst = MarketingAnalyticsAgents().create_performance_analyst()
        self.predictive_analyst = MarketingAnalyticsAgents().create_predictive_analyst()
        self.budget_optimizer = MarketingOptimizationAgents().create_budget_optimizer()
        self.creative_optimizer = MarketingOptimizationAgents().create_creative_optimizer()
        
        # Real-time monitoring thresholds
        self.alert_thresholds = {
            "roas_drop": 0.15,  # 15% drop in ROAS
            "cpa_increase": 0.20,  # 20% increase in CPA
            "budget_pace": 0.10,  # 10% over/under pace
            "creative_fatigue": 0.25  # 25% drop in CTR
        }
    
    @tool("Real-Time Performance Monitor")
    def monitor_performance(self, channels: List[str], interval_minutes: int = 60) -> str:
        """Monitor performance in real-time and trigger optimizations"""
        monitoring_report = {
            "timestamp": datetime.now().isoformat(),
            "interval_minutes": interval_minutes,
            "channels_monitored": channels,
            "alerts": [],
            "optimizations_triggered": []
        }
        
        # Collect current data
        current_data = json.loads(
            self.data_hub.collect_marketing_data(
                json.dumps(channels),
                json.dumps({
                    "start": (datetime.now() - timedelta(minutes=interval_minutes)).isoformat(),
                    "end": datetime.now().isoformat()
                })
            )
        )
        
        # Collect comparison data (previous period)
        comparison_data = json.loads(
            self.data_hub.collect_marketing_data(
                json.dumps(channels),
                json.dumps({
                    "start": (datetime.now() - timedelta(minutes=interval_minutes*2)).isoformat(),
                    "end": (datetime.now() - timedelta(minutes=interval_minutes)).isoformat()
                })
            )
        )
        
        # Check for alerts
        alerts = self._check_performance_alerts(current_data, comparison_data)
        monitoring_report["alerts"] = alerts
        
        # Trigger optimizations if needed
        if alerts:
            optimizations = self._trigger_optimizations(alerts, current_data)
            monitoring_report["optimizations_triggered"] = optimizations
        
        # Generate performance summary
        monitoring_report["performance_summary"] = self._generate_performance_summary(current_data)
        
        return json.dumps(monitoring_report, indent=2)
    
    def _check_performance_alerts(self, current: Dict, comparison: Dict) -> List[Dict]:
        """Check for performance issues requiring attention"""
        alerts = []
        
        # Compare aggregated metrics
        current_agg = current.get("aggregated", {})
        comparison_agg = comparison.get("aggregated", {})
        
        # ROAS alert
        if comparison_agg.get("roas", 0) > 0:
            roas_change = (current_agg.get("roas", 0) - comparison_agg["roas"]) / comparison_agg["roas"]
            if roas_change < -self.alert_thresholds["roas_drop"]:
                alerts.append({
                    "type": "roas_drop",
                    "severity": "high",
                    "current_value": current_agg.get("roas", 0),
                    "previous_value": comparison_agg["roas"],
                    "change_percentage": roas_change * 100,
                    "recommendation": "Review budget allocation and creative performance"
                })
        
        # CPA alert
        if comparison_agg.get("cpa", 0) > 0:
            cpa_change = (current_agg.get("cpa", 0) - comparison_agg["cpa"]) / comparison_agg["cpa"]
            if cpa_change > self.alert_thresholds["cpa_increase"]:
                alerts.append({
                    "type": "cpa_increase",
                    "severity": "high",
                    "current_value": current_agg.get("cpa", 0),
                    "previous_value": comparison_agg["cpa"],
                    "change_percentage": cpa_change * 100,
                    "recommendation": "Optimize targeting and bid strategies"
                })
        
        return alerts
    
    def _trigger_optimizations(self, alerts: List[Dict], current_data: Dict) -> List[Dict]:
        """Automatically trigger optimizations based on alerts"""
        optimizations = []
        
        for alert in alerts:
            if alert["type"] == "roas_drop" and alert["severity"] == "high":
                # Trigger budget reallocation
                budget_optimization = self._optimize_budget_for_roas(current_data)
                optimizations.append({
                    "type": "budget_reallocation",
                    "triggered_by": alert["type"],
                    "changes": budget_optimization,
                    "expected_impact": "5-10% ROAS improvement"
                })
            
            elif alert["type"] == "cpa_increase" and alert["severity"] == "high":
                # Trigger bid optimization
                bid_optimization = self._optimize_bids_for_cpa(current_data)
                optimizations.append({
                    "type": "bid_adjustment",
                    "triggered_by": alert["type"],
                    "changes": bid_optimization,
                    "expected_impact": "10-15% CPA reduction"
                })
        
        return optimizations
    
    def create_optimization_crew(self):
        """Create crew for continuous optimization"""
        return Crew(
            agents=[
                self.performance_analyst,
                self.predictive_analyst,
                self.budget_optimizer,
                self.creative_optimizer
            ],
            tasks=[
                Task(
                    description="""Monitor real-time marketing performance across all channels. 
                    Identify any anomalies or opportunities for optimization.""",
                    agent=self.performance_analyst,
                    expected_output="Performance monitoring report with alerts"
                ),
                Task(
                    description="""Forecast next 7 days performance based on current trends. 
                    Identify potential issues before they occur.""",
                    agent=self.predictive_analyst,
                    expected_output="7-day forecast with risk assessment"
                ),
                Task(
                    description="""Optimize budget allocation based on current performance 
                    and forecasts. Maximize ROAS while meeting volume targets.""",
                    agent=self.budget_optimizer,
                    expected_output="Optimized budget allocation plan"
                ),
                Task(
                    description="""Analyze creative performance and identify optimization 
                    opportunities. Recommend new creative tests.""",
                    agent=self.creative_optimizer,
                    expected_output="Creative optimization recommendations"
                )
            ],
            verbose=True,
            process="sequential"
        )

# Praktijkvoorbeeld: Real-time optimization
optimization_system = RealTimeOptimizationSystem()

# Monitor performance
monitoring_result = optimization_system.monitor_performance(
    channels=["google_ads", "facebook", "linkedin"],
    interval_minutes=60
)

print("Monitoring Result:", json.dumps(json.loads(monitoring_result), indent=2))

# Run full optimization crew
optimization_crew = optimization_system.create_optimization_crew()
optimization_results = optimization_crew.kickoff()

print("\\nOptimization Results:", optimization_results)
\`\`\`

## Advanced Analytics Patterns

### 1. Attribution Modeling

\`\`\`python
class AttributionModeling:
    """Multi-touch attribution modeling voor marketing"""
    
    @tool("Attribution Model Calculator")
    def calculate_attribution(self, customer_journeys: str, model_type: str) -> str:
        """Calculate attribution across touchpoints"""
        journeys = json.loads(customer_journeys)
        
        attribution_results = {
            "model_type": model_type,
            "timestamp": datetime.now().isoformat(),
            "channel_attribution": {},
            "insights": []
        }
        
        if model_type == "last_click":
            attribution = self._last_click_attribution(journeys)
        elif model_type == "first_click":
            attribution = self._first_click_attribution(journeys)
        elif model_type == "linear":
            attribution = self._linear_attribution(journeys)
        elif model_type == "time_decay":
            attribution = self._time_decay_attribution(journeys)
        elif model_type == "data_driven":
            attribution = self._data_driven_attribution(journeys)
        
        attribution_results["channel_attribution"] = attribution
        
        # Compare with other models
        attribution_results["model_comparison"] = self._compare_attribution_models(journeys)
        
        # Generate insights
        attribution_results["insights"] = [
            f"{max(attribution, key=attribution.get)} drives the most conversions in {model_type} model",
            f"Consider increasing budget for undervalued channels",
            f"Cross-channel synergies identified between top performing channels"
        ]
        
        return json.dumps(attribution_results, indent=2)
    
    def _data_driven_attribution(self, journeys: List[Dict]) -> Dict:
        """Machine learning based attribution"""
        # Simplified Shapley value calculation
        channels = set()
        for journey in journeys:
            for touchpoint in journey["touchpoints"]:
                channels.add(touchpoint["channel"])
        
        channel_values = {channel: 0 for channel in channels}
        
        # Calculate marginal contribution of each channel
        for journey in journeys:
            if journey.get("converted", False):
                touchpoint_channels = [tp["channel"] for tp in journey["touchpoints"]]
                value_per_touchpoint = journey.get("value", 1) / len(touchpoint_channels)
                
                for channel in touchpoint_channels:
                    # Weight by position and time
                    position_weight = 1 / (touchpoint_channels.index(channel) + 1)
                    channel_values[channel] += value_per_touchpoint * position_weight
        
        # Normalize
        total_value = sum(channel_values.values())
        if total_value > 0:
            channel_values = {ch: val/total_value for ch, val in channel_values.items()}
        
        return channel_values
\`\`\`

### 2. Predictive Customer Value

\`\`\`python
class PredictiveCustomerValue:
    """Predict customer lifetime value en churn"""
    
    @tool("CLV Predictor")
    def predict_customer_value(self, customer_data: str, prediction_window: int) -> str:
        """Predict customer lifetime value"""
        customers = json.loads(customer_data)
        
        predictions = {
            "prediction_window_days": prediction_window,
            "timestamp": datetime.now().isoformat(),
            "customer_segments": {},
            "aggregate_metrics": {}
        }
        
        # Segment customers
        segments = self._segment_customers(customers)
        
        for segment_name, segment_customers in segments.items():
            segment_predictions = []
            
            for customer in segment_customers:
                clv = self._predict_individual_clv(customer, prediction_window)
                churn_probability = self._predict_churn(customer)
                
                segment_predictions.append({
                    "customer_id": customer["id"],
                    "predicted_clv": clv,
                    "churn_probability": churn_probability,
                    "recommended_actions": self._recommend_actions(clv, churn_probability)
                })
            
            predictions["customer_segments"][segment_name] = {
                "customers": segment_predictions,
                "avg_clv": np.mean([p["predicted_clv"] for p in segment_predictions]),
                "avg_churn_risk": np.mean([p["churn_probability"] for p in segment_predictions])
            }
        
        # Aggregate insights
        predictions["aggregate_metrics"] = {
            "total_predicted_value": sum(
                seg["avg_clv"] * len(seg["customers"]) 
                for seg in predictions["customer_segments"].values()
            ),
            "high_value_customers": sum(
                1 for seg in predictions["customer_segments"].values()
                for cust in seg["customers"] if cust["predicted_clv"] > 1000
            ),
            "at_risk_customers": sum(
                1 for seg in predictions["customer_segments"].values()
                for cust in seg["customers"] if cust["churn_probability"] > 0.7
            )
        }
        
        return json.dumps(predictions, indent=2)
\`\`\`

## Best Practices voor Analytics Agents

### 1. Data Quality
- Implement data validation at every stage
- Handle missing data gracefully
- Maintain data lineage

### 2. Real-time Processing
- Use streaming analytics where possible
- Implement efficient caching strategies
- Balance accuracy vs. speed

### 3. Actionable Insights
- Focus on insights that drive action
- Provide clear next steps
- Quantify expected impact

### 4. Continuous Learning
- Implement feedback loops
- Update models regularly
- Track prediction accuracy

## Oefeningen

### Oefening 1: Anomaly Detection
Implementeer een anomaly detection system voor marketing metrics

### Oefening 2: Campaign Simulator
Bouw een simulator die campaign outcomes voorspelt

### Oefening 3: ROI Calculator
Creëer een geavanceerde ROI calculator met incrementality testing
`,
  assignments: [
    {
      id: 'ex1',
      title: 'Anomaly Detection System',
      description: 'Implementeer een ML-based anomaly detection system dat automatisch unusual patterns in marketing data detecteert',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Gebruik statistical methods zoals Z-score en IQR',
        'Implementeer verschillende detection algorithms (isolation forest, LSTM)',
        'Include contextual factors (seasonality, campaigns)'
      ]
    }
  ],
  resources: [
    {
      title: 'Marketing Analytics with Python',
      url: 'https://towardsdatascience.com/marketing-analytics-with-python',
      type: 'article'
    },
    {
      title: 'CrewAI for Data Analysis',
      url: 'https://docs.crewai.com/examples/data-analysis',
      type: 'documentation'
    }
  ]
};

export default lesson;