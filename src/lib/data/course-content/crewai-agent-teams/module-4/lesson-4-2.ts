import { Lesson } from '@/lib/data/courses';

const lesson: Lesson = {
  id: 'lesson-4-2',
  title: 'Content creation agents: Van brief tot publicatie',
  duration: '45 minuten',
  content: `
# Content Creation Agents: Complete Workflow Automation

In deze les bouwen we een volledig geautomatiseerde content creation pipeline die van brief tot publicatie werkt, inclusief quality control en multi-channel distribution.

## Content Creation Pipeline Architecture

### 1. Content Brief Processing

\`\`\`python
from crewai import Agent, Task, Crew
from crewai.tools import tool
from typing import Dict, List, Optional, Any
import json
import hashlib
from datetime import datetime, timedelta
from dataclasses import dataclass
import openai
import requests

@dataclass
class ContentBrief:
    """Structured content brief voor agents"""
    title: str
    objective: str
    target_audience: str
    key_messages: List[str]
    content_type: str  # blog, social, email, video_script, whitepaper
    word_count: Optional[int]
    keywords: List[str]
    tone: str  # professional, casual, technical, inspirational
    deadline: datetime
    references: Optional[List[str]] = None
    
    def to_dict(self) -> Dict:
        return {
            "title": self.title,
            "objective": self.objective,
            "target_audience": self.target_audience,
            "key_messages": self.key_messages,
            "content_type": self.content_type,
            "word_count": self.word_count,
            "keywords": self.keywords,
            "tone": self.tone,
            "deadline": self.deadline.isoformat(),
            "references": self.references
        }

class ContentBriefProcessor:
    """Process en validate content briefs"""
    
    @tool("Brief Analysis Tool")
    def analyze_brief(self, brief_json: str) -> str:
        """Analyseer content brief voor completeness en feasibility"""
        brief_data = json.loads(brief_json)
        
        analysis = {
            "brief_id": hashlib.md5(brief_json.encode()).hexdigest()[:8],
            "completeness_score": self._check_completeness(brief_data),
            "feasibility": self._assess_feasibility(brief_data),
            "estimated_effort": self._estimate_effort(brief_data),
            "content_strategy": self._suggest_strategy(brief_data),
            "potential_challenges": self._identify_challenges(brief_data)
        }
        
        return json.dumps(analysis, indent=2)
    
    def _check_completeness(self, brief: Dict) -> float:
        """Check of alle required fields aanwezig zijn"""
        required_fields = ["title", "objective", "target_audience", "content_type"]
        optional_fields = ["key_messages", "keywords", "tone", "references"]
        
        required_score = sum(1 for field in required_fields if field in brief and brief[field]) / len(required_fields)
        optional_score = sum(0.5 for field in optional_fields if field in brief and brief[field]) / len(optional_fields)
        
        return min(1.0, required_score * 0.7 + optional_score * 0.3)
    
    def _assess_feasibility(self, brief: Dict) -> Dict:
        """Bepaal of brief haalbaar is binnen constraints"""
        deadline = datetime.fromisoformat(brief.get("deadline", datetime.now().isoformat()))
        time_available = (deadline - datetime.now()).days
        
        content_complexity = {
            "blog": 2,
            "social": 0.5,
            "email": 1,
            "video_script": 3,
            "whitepaper": 5
        }
        
        complexity = content_complexity.get(brief.get("content_type", "blog"), 2)
        
        return {
            "time_available": time_available,
            "complexity_score": complexity,
            "feasible": time_available >= complexity,
            "recommended_timeline": f"{complexity} days"
        }
\`\`\`

### 2. Content Generation Agents

\`\`\`python
class ContentCreationAgents:
    """Specialized agents voor verschillende content types"""
    
    def create_blog_writer(self):
        """Blog content specialist"""
        return Agent(
            role='Blog Content Writer',
            goal='Create engaging, SEO-optimized blog content that drives traffic and conversions',
            backstory="""Je bent een ervaren content writer met expertise in 
            storytelling, SEO, en thought leadership. Je hebt voor top tech blogs 
            geschreven en weet hoe je complexe topics toegankelijk maakt.""",
            verbose=True,
            tools=[
                self.research_tool,
                self.outline_generator,
                self.content_writer,
                self.seo_optimizer
            ]
        )
    
    def create_social_media_writer(self):
        """Social media content specialist"""
        return Agent(
            role='Social Media Content Creator',
            goal='Create viral-worthy social content that maximizes engagement',
            backstory="""Social media native met track record van viral posts. 
            Expert in platform-specific content optimization en community engagement. 
            Je begrijpt de algoritmes en weet wat werkt.""",
            verbose=True,
            tools=[
                self.trend_analyzer,
                self.caption_writer,
                self.hashtag_generator,
                self.visual_suggestion_tool
            ]
        )
    
    @tool("Advanced Content Writer")
    def content_writer(self, outline: str, brief: str) -> str:
        """Generate high-quality content based on outline"""
        outline_data = json.loads(outline)
        brief_data = json.loads(brief)
        
        # Simulate content generation met structure
        content_sections = []
        
        # Introduction
        intro = self._generate_introduction(brief_data, outline_data)
        content_sections.append(intro)
        
        # Main sections
        for section in outline_data.get("sections", []):
            section_content = self._generate_section(
                section, 
                brief_data,
                outline_data.get("research_data", {})
            )
            content_sections.append(section_content)
        
        # Conclusion
        conclusion = self._generate_conclusion(brief_data, content_sections)
        content_sections.append(conclusion)
        
        # Meta data
        content = {
            "title": outline_data.get("title"),
            "content": "\\n\\n".join(content_sections),
            "word_count": sum(len(section.split()) for section in content_sections),
            "seo_meta": {
                "meta_description": self._generate_meta_description(brief_data),
                "focus_keywords": brief_data.get("keywords", []),
                "readability_score": self._calculate_readability(content_sections)
            },
            "content_score": self._evaluate_content_quality(content_sections, brief_data)
        }
        
        return json.dumps(content, indent=2)
    
    def _generate_introduction(self, brief: Dict, outline: Dict) -> str:
        """Generate compelling introduction"""
        intro_elements = [
            f"Hook: Start with a compelling statistic or question about {brief['title']}",
            f"Context: Why {brief['target_audience']} should care",
            f"Promise: What readers will learn",
            f"Transition: Lead into the main content"
        ]
        
        # Simulate AI-generated introduction
        intro = f"""Did you know that 73% of {brief['target_audience']} struggle with {brief['title'].lower()}? 
        
In today's fast-paced digital landscape, understanding {brief['title']} has become crucial for success. 
Whether you're just starting out or looking to optimize your current approach, this comprehensive guide 
will walk you through everything you need to know.

By the end of this article, you'll have a clear understanding of:
{chr(10).join('• ' + msg for msg in brief.get('key_messages', [])[:3])}

Let's dive in and explore how you can master {brief['title']} and achieve {brief['objective']}."""
        
        return intro
    
    @tool("SEO Optimizer")
    def seo_optimizer(self, content: str, keywords: str) -> str:
        """Optimize content voor search engines"""
        content_data = json.loads(content)
        keywords_list = json.loads(keywords)
        
        optimization_report = {
            "original_content": content_data,
            "optimizations": {
                "keyword_density": self._optimize_keyword_density(
                    content_data["content"], 
                    keywords_list
                ),
                "headers": self._optimize_headers(content_data["content"]),
                "internal_links": self._suggest_internal_links(content_data["content"]),
                "content_structure": self._optimize_structure(content_data["content"]),
                "schema_markup": self._generate_schema_markup(content_data)
            },
            "seo_score": self._calculate_seo_score(content_data, keywords_list),
            "recommendations": self._generate_seo_recommendations(content_data)
        }
        
        return json.dumps(optimization_report, indent=2)
\`\`\`

### 3. Multi-Format Content Generation

\`\`\`python
class MultiFormatContentEngine:
    """Engine voor het genereren van content in multiple formats"""
    
    def __init__(self):
        self.format_specialists = {
            "blog": self._create_blog_specialist(),
            "social": self._create_social_specialist(),
            "email": self._create_email_specialist(),
            "video_script": self._create_video_specialist(),
            "infographic": self._create_infographic_specialist(),
            "podcast": self._create_podcast_specialist()
        }
    
    @tool("Content Repurposing Tool")
    def repurpose_content(self, source_content: str, target_formats: str) -> str:
        """Repurpose content naar multiple formats"""
        source = json.loads(source_content)
        formats = json.loads(target_formats)
        
        repurposed_content = {
            "source": {
                "type": source["type"],
                "title": source["title"],
                "content_id": source.get("id", hashlib.md5(source["content"].encode()).hexdigest()[:8])
            },
            "variations": {}
        }
        
        for format in formats:
            if format in self.format_specialists:
                repurposed = self._repurpose_to_format(source, format)
                repurposed_content["variations"][format] = repurposed
        
        return json.dumps(repurposed_content, indent=2)
    
    def _repurpose_to_format(self, source: Dict, target_format: str) -> Dict:
        """Repurpose content naar specifiek format"""
        if target_format == "social":
            return self._convert_to_social(source)
        elif target_format == "email":
            return self._convert_to_email(source)
        elif target_format == "video_script":
            return self._convert_to_video_script(source)
        elif target_format == "infographic":
            return self._convert_to_infographic_data(source)
        
    def _convert_to_social(self, source: Dict) -> Dict:
        """Convert content naar social media posts"""
        # Extract key points
        key_points = self._extract_key_points(source["content"])
        
        social_posts = {
            "twitter": [],
            "linkedin": [],
            "instagram": [],
            "facebook": []
        }
        
        # Twitter thread
        for i, point in enumerate(key_points[:5]):
            social_posts["twitter"].append({
                "text": f"{i+1}/ {point[:250]}... 🧵",
                "media_suggestion": "relevant_image" if i == 0 else None,
                "hashtags": self._generate_hashtags(source["title"], "twitter")
            })
        
        # LinkedIn post
        social_posts["linkedin"].append({
            "text": f"""💡 {source['title']}

{key_points[0]}

Key insights:
{chr(10).join('✅ ' + point for point in key_points[1:4])}

Read the full article for more details. What's your experience with this?

{' '.join(self._generate_hashtags(source['title'], 'linkedin'))}""",
            "media_type": "article_link"
        })
        
        # Instagram carousel
        social_posts["instagram"].append({
            "caption": f"{source['title']} - Swipe for key insights →\\n\\n" + 
                      f"{' '.join(self._generate_hashtags(source['title'], 'instagram'))}",
            "slides": [
                {"type": "title", "text": source["title"]},
                *[{"type": "point", "text": point} for point in key_points[:5]],
                {"type": "cta", "text": "Link in bio for full article"}
            ]
        })
        
        return social_posts
\`\`\`

### 4. Editorial Workflow Automation

\`\`\`python
class EditorialWorkflow:
    """Automated editorial review en approval proces"""
    
    def __init__(self):
        self.review_stages = ["initial_review", "fact_check", "brand_compliance", "final_approval"]
        self.reviewers = self._initialize_reviewers()
    
    def _initialize_reviewers(self):
        """Initialize review agents"""
        return {
            "copy_editor": Agent(
                role='Copy Editor',
                goal='Ensure content is error-free and flows perfectly',
                backstory='Experienced editor with keen eye for detail and story flow.',
                tools=[self.grammar_check_tool, self.style_guide_tool]
            ),
            "fact_checker": Agent(
                role='Fact Checker',
                goal='Verify all claims and statistics are accurate',
                backstory='Research specialist dedicated to accuracy and truth.',
                tools=[self.fact_verification_tool, self.source_validation_tool]
            ),
            "brand_reviewer": Agent(
                role='Brand Compliance Officer',
                goal='Ensure content aligns with brand voice and guidelines',
                backstory='Brand guardian who maintains consistency across all content.',
                tools=[self.brand_compliance_tool, self.tone_analyzer_tool]
            )
        }
    
    @tool("Automated Editorial Review")
    def editorial_review(self, content: str, review_type: str) -> str:
        """Perform automated editorial review"""
        content_data = json.loads(content)
        
        review_results = {
            "content_id": content_data.get("id", hashlib.md5(content.encode()).hexdigest()[:8]),
            "review_type": review_type,
            "timestamp": datetime.now().isoformat(),
            "findings": []
        }
        
        if review_type == "grammar_style":
            findings = self._review_grammar_style(content_data["content"])
            review_results["findings"] = findings
            review_results["score"] = self._calculate_grammar_score(findings)
            
        elif review_type == "fact_check":
            findings = self._review_facts(content_data["content"])
            review_results["findings"] = findings
            review_results["verification_status"] = self._determine_verification_status(findings)
            
        elif review_type == "brand_compliance":
            findings = self._review_brand_compliance(content_data)
            review_results["findings"] = findings
            review_results["compliance_score"] = self._calculate_compliance_score(findings)
        
        review_results["recommendations"] = self._generate_edit_recommendations(findings)
        review_results["approval_status"] = self._determine_approval_status(review_results)
        
        return json.dumps(review_results, indent=2)
    
    def _review_grammar_style(self, content: str) -> List[Dict]:
        """Check grammar, spelling, and style"""
        findings = []
        
        # Simulate grammar checking
        common_issues = [
            {"type": "grammar", "issue": "passive_voice", "location": "paragraph_2", "severity": "minor"},
            {"type": "style", "issue": "sentence_too_long", "location": "paragraph_4", "severity": "minor"},
            {"type": "spelling", "issue": "misspelling", "word": "recieve", "suggestion": "receive", "severity": "major"}
        ]
        
        # Add findings based on content analysis
        sentences = content.split('.')
        for i, sentence in enumerate(sentences):
            if len(sentence.split()) > 30:
                findings.append({
                    "type": "style",
                    "issue": "sentence_too_long",
                    "location": f"sentence_{i+1}",
                    "severity": "minor",
                    "suggestion": "Consider breaking this into multiple sentences"
                })
        
        return findings
    
    @tool("Publishing Automation")
    def publish_content(self, content: str, channels: str) -> str:
        """Automate content publishing across channels"""
        content_data = json.loads(content)
        channel_list = json.loads(channels)
        
        publishing_results = {
            "content_id": content_data.get("id"),
            "publish_time": datetime.now().isoformat(),
            "channels": {}
        }
        
        for channel in channel_list:
            if channel == "wordpress":
                result = self._publish_to_wordpress(content_data)
            elif channel == "medium":
                result = self._publish_to_medium(content_data)
            elif channel == "linkedin":
                result = self._publish_to_linkedin(content_data)
            elif channel == "email":
                result = self._schedule_email_campaign(content_data)
            else:
                result = {"status": "unsupported", "message": f"Channel {channel} not configured"}
            
            publishing_results["channels"][channel] = result
        
        # Generate sharing assets
        publishing_results["sharing_assets"] = self._generate_sharing_assets(content_data)
        
        return json.dumps(publishing_results, indent=2)
    
    def _publish_to_wordpress(self, content: Dict) -> Dict:
        """Publish to WordPress via API"""
        # Simulate WordPress publishing
        return {
            "status": "published",
            "url": f"https://example.com/blog/{content['title'].lower().replace(' ', '-')}",
            "post_id": "wp_" + hashlib.md5(content['title'].encode()).hexdigest()[:8],
            "seo_preview": {
                "title": content['title'][:60],
                "description": content.get('seo_meta', {}).get('meta_description', '')[:160],
                "slug": content['title'].lower().replace(' ', '-')
            }
        }
\`\`\`

### 5. Complete Content Pipeline Implementation

\`\`\`python
class AutonomousContentPipeline:
    """Complete autonomous content creation pipeline"""
    
    def __init__(self):
        self.brief_processor = ContentBriefProcessor()
        self.content_creators = ContentCreationAgents()
        self.format_engine = MultiFormatContentEngine()
        self.editorial = EditorialWorkflow()
        self.analytics = ContentAnalytics()
        
    def process_content_request(self, brief: ContentBrief) -> Dict:
        """Process complete content request from brief to publication"""
        
        # Create content creation crew
        crew = Crew(
            agents=[
                self._create_content_strategist(),
                self.content_creators.create_blog_writer(),
                self.content_creators.create_social_media_writer(),
                self.editorial.reviewers["copy_editor"],
                self.editorial.reviewers["brand_reviewer"]
            ],
            tasks=self._create_content_tasks(brief),
            verbose=True,
            process="sequential"
        )
        
        # Execute content creation
        results = crew.kickoff()
        
        # Post-process and publish
        final_content = self._post_process_content(results)
        publishing_results = self._publish_content(final_content, brief.content_type)
        
        return {
            "brief_id": hashlib.md5(str(brief.to_dict()).encode()).hexdigest()[:8],
            "content": final_content,
            "publishing": publishing_results,
            "performance_tracking": self._setup_performance_tracking(final_content)
        }
    
    def _create_content_strategist(self):
        """Create content strategy agent"""
        return Agent(
            role='Content Strategist',
            goal='Develop winning content strategies that achieve business objectives',
            backstory="""Senior strategist with 10+ years developing content strategies 
            for Fortune 500 companies. Expert in audience psychology and content ROI.""",
            verbose=True,
            tools=[
                self.audience_analysis_tool,
                self.competitor_content_tool,
                self.content_gap_tool
            ]
        )
    
    @tool("Audience Analysis Tool")
    def audience_analysis_tool(self, target_audience: str) -> str:
        """Deep dive into audience preferences and behavior"""
        analysis = {
            "audience": target_audience,
            "demographics": {
                "age_range": "25-45",
                "job_titles": ["Manager", "Director", "Analyst"],
                "industries": ["Technology", "Finance", "Healthcare"]
            },
            "psychographics": {
                "values": ["Innovation", "Efficiency", "Growth"],
                "pain_points": ["Time constraints", "Budget limitations", "Skill gaps"],
                "goals": ["Career advancement", "Process improvement", "ROI optimization"]
            },
            "content_preferences": {
                "formats": ["How-to guides", "Case studies", "Data-driven insights"],
                "length": "1500-2500 words for blogs, 1-2 min for videos",
                "tone": "Professional but approachable",
                "consumption_patterns": {
                    "peak_times": ["Tuesday 10am", "Thursday 2pm"],
                    "devices": {"mobile": 0.45, "desktop": 0.40, "tablet": 0.15}
                }
            },
            "engagement_triggers": [
                "Statistics and data",
                "Real-world examples",
                "Actionable takeaways",
                "Industry insights"
            ]
        }
        return json.dumps(analysis, indent=2)
    
    def _create_content_tasks(self, brief: ContentBrief) -> List[Task]:
        """Create tasks for content creation"""
        return [
            Task(
                description=f"""Analyze the content brief and develop a comprehensive 
                content strategy for: {brief.title}. Include audience insights, 
                competitive analysis, and content recommendations.""",
                agent=self._create_content_strategist(),
                expected_output="Detailed content strategy document"
            ),
            Task(
                description=f"""Create {brief.content_type} content based on the strategy. 
                Target audience: {brief.target_audience}. 
                Key messages: {', '.join(brief.key_messages)}. 
                Tone: {brief.tone}.""",
                agent=self.content_creators.create_blog_writer(),
                expected_output=f"Complete {brief.content_type} content ready for review"
            ),
            Task(
                description="""Create social media variations of the content for 
                Twitter, LinkedIn, and Instagram. Optimize for each platform.""",
                agent=self.content_creators.create_social_media_writer(),
                expected_output="Platform-optimized social media posts"
            ),
            Task(
                description="""Review all content for grammar, style, and brand compliance. 
                Ensure consistency and quality across all pieces.""",
                agent=self.editorial.reviewers["copy_editor"],
                expected_output="Edited and polished content"
            ),
            Task(
                description="""Final review for brand alignment and prepare for publishing. 
                Create publishing checklist and metadata.""",
                agent=self.editorial.reviewers["brand_reviewer"],
                expected_output="Publication-ready content with metadata"
            )
        ]

# Praktijkvoorbeeld: Launch content campaign
brief = ContentBrief(
    title="The Future of AI in Marketing",
    objective="Position our company as thought leader in AI marketing",
    target_audience="Marketing directors and CMOs in tech companies",
    key_messages=[
        "AI transforms marketing efficiency",
        "Data-driven personalization at scale",
        "Future-proof your marketing stack"
    ],
    content_type="blog",
    word_count=2000,
    keywords=["AI marketing", "marketing automation", "personalization"],
    tone="professional",
    deadline=datetime.now() + timedelta(days=3)
)

pipeline = AutonomousContentPipeline()
results = pipeline.process_content_request(brief)

print(f"Content created and published: {results['publishing']['channels']}")
\`\`\`

## Content Performance Tracking

\`\`\`python
class ContentAnalytics:
    """Track en optimize content performance"""
    
    @tool("Performance Tracker")
    def track_performance(self, content_id: str, timeframe: str) -> str:
        """Track content performance metrics"""
        metrics = {
            "content_id": content_id,
            "timeframe": timeframe,
            "engagement": {
                "views": 15420,
                "unique_visitors": 12350,
                "avg_time_on_page": "4:32",
                "bounce_rate": 0.28,
                "scroll_depth": 0.78
            },
            "conversions": {
                "cta_clicks": 892,
                "conversion_rate": 0.058,
                "leads_generated": 89,
                "revenue_attributed": 45000
            },
            "social_metrics": {
                "shares": 234,
                "comments": 56,
                "likes": 892,
                "mentions": 23
            },
            "seo_performance": {
                "organic_traffic": 8920,
                "keyword_rankings": {
                    "AI marketing": 3,
                    "marketing automation": 7,
                    "personalization": 5
                },
                "backlinks_earned": 12
            }
        }
        
        # Calculate content ROI
        metrics["roi"] = {
            "cost": 500,  # Content creation cost
            "revenue": 45000,
            "roi_percentage": 8900
        }
        
        # Performance insights
        metrics["insights"] = [
            "High engagement rate indicates strong audience fit",
            "CTA placement could be optimized for better conversion",
            "Social sharing exceeds benchmark by 156%"
        ]
        
        # Optimization recommendations
        metrics["recommendations"] = [
            "Create follow-up content on top-performing subtopics",
            "Repurpose into video format for broader reach",
            "Update with fresh statistics quarterly"
        ]
        
        return json.dumps(metrics, indent=2)
\`\`\`

## Best Practices voor Content Automation

### 1. Quality Control
- Implement multi-stage review processes
- Use AI for initial drafts, human for final polish
- Maintain brand voice consistency checks

### 2. Personalization at Scale
- Segment content by audience
- Dynamic content variations
- A/B test everything

### 3. Performance Optimization
- Real-time performance tracking
- Iterative content improvements
- Data-driven content planning

## Oefeningen

### Oefening 1: Video Script Generator
Voeg een video script generator toe aan de content pipeline

### Oefening 2: Multilingual Content
Implementeer automatische content vertaling en localisatie

### Oefening 3: Content Calendar Automation
Bouw een volledig geautomatiseerde content calendar met seasonal planning
`,
  assignments: [
    {
      id: 'ex1',
      title: 'Video Script Generator Implementation',
      description: 'Voeg een specialized video script generator toe die scripts maakt voor verschillende video types (explainer, tutorial, promotional)',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Denk aan video-specifieke elementen zoals visual cues en timing',
        'Include hooks, scenes, en call-to-actions',
        'Maak scripts voor verschillende video lengtes'
      ]
    }
  ],
  resources: [
    {
      title: 'Content Creation with CrewAI',
      url: 'https://docs.crewai.com/examples/content-creation',
      type: 'documentation'
    },
    {
      title: 'AI Content Generation Best Practices',
      url: 'https://www.contentmarketinginstitute.com/ai-content-generation',
      type: 'article'
    }
  ]
};

export default lesson;