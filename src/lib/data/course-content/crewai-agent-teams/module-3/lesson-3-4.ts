import { Lesson } from '@/lib/data/courses';

export const lesson34: Lesson = {
  id: 'lesson-3-4',
  title: 'Advanced Crew Templates',
  duration: '90 min',
  content: `
# Advanced Crew Templates

Deze les presenteert 7 complete, production-ready crew templates voor verschillende use cases. Elke template is volledig uitgewerkt met agents, tasks, tools en orchestration patterns.

## Template 1: Research & Analysis Crew

### Complete Market Research Team

\`\`\`python
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, WebsiteSearchTool, FileWriteTool
from typing import Dict, List, Any
import os
from datetime import datetime

class MarketResearchCrew:
    """Complete market research team voor diepgaande marktanalyse"""
    
    def __init__(self, llm_config: Dict[str, Any]):
        self.llm_config = llm_config
        self.output_dir = "./research_output"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Initialize tools
        self.search_tool = SerperDevTool(
            api_key=os.getenv("SERPER_API_KEY")
        )
        self.website_tool = WebsiteSearchTool()
        self.file_tool = FileWriteTool(directory=self.output_dir)
        
        # Create agents
        self.agents = self._create_agents()
        
    def _create_agents(self) -> Dict[str, Agent]:
        """Create specialized research agents"""
        
        # Lead Researcher - Coordinates research
        lead_researcher = Agent(
            role="Lead Market Researcher",
            goal="Coordinate comprehensive market research and synthesize findings",
            backstory="""You are an experienced market research director with 20 years 
            of experience. You excel at identifying market trends, coordinating research 
            teams, and producing actionable insights for business strategy.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            allow_delegation=True,
            verbose=True
        )
        
        # Industry Analyst - Deep industry analysis
        industry_analyst = Agent(
            role="Industry Analyst",
            goal="Analyze industry trends, competitive landscape, and market dynamics",
            backstory="""You are a specialized industry analyst with expertise in 
            market sizing, competitive analysis, and trend identification. You have 
            worked with Fortune 500 companies on strategic market assessments.""",
            tools=[self.search_tool, self.website_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Consumer Insights Specialist - Customer behavior
        consumer_specialist = Agent(
            role="Consumer Insights Specialist",
            goal="Understand customer behavior, preferences, and buying patterns",
            backstory="""You are a consumer psychology expert who specializes in 
            understanding customer motivations, segmentation, and behavior patterns. 
            You have a PhD in Consumer Psychology.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Data Analyst - Quantitative analysis
        data_analyst = Agent(
            role="Market Data Analyst",
            goal="Analyze market data, statistics, and create data-driven insights",
            backstory="""You are a quantitative analyst with strong skills in 
            statistical analysis and data visualization. You transform raw market 
            data into clear, actionable insights.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Report Writer - Documentation
        report_writer = Agent(
            role="Research Report Writer",
            goal="Create comprehensive, well-structured research reports",
            backstory="""You are a professional business writer who excels at 
            transforming complex research into clear, executive-ready reports. 
            You have an MBA and experience in management consulting.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        return {
            'lead': lead_researcher,
            'industry': industry_analyst,
            'consumer': consumer_specialist,
            'data': data_analyst,
            'writer': report_writer
        }
    
    def create_research_workflow(self, research_topic: str, 
                               target_market: str) -> List[Task]:
        """Create complete research workflow"""
        
        # Task 1: Research Planning
        planning_task = Task(
            description=f"""
            Create a comprehensive research plan for: {research_topic}
            Target Market: {target_market}
            
            Deliverables:
            1. Research objectives and key questions
            2. Methodology outline
            3. Data sources to investigate
            4. Timeline and milestones
            5. Expected deliverables
            
            Consider:
            - Market size and growth potential
            - Competitive landscape
            - Customer segments
            - Regulatory environment
            - Technology trends
            """,
            expected_output="Detailed research plan with methodology",
            agent=self.agents['lead']
        )
        
        # Task 2: Industry Analysis
        industry_task = Task(
            description=f"""
            Conduct deep industry analysis for {target_market}:
            
            1. Market Size & Growth:
               - Current market value
               - Historical growth rates
               - Future projections (5-year)
               - Growth drivers and inhibitors
            
            2. Competitive Landscape:
               - Key players and market share
               - Competitive strategies
               - SWOT analysis of top 5 competitors
               - Market concentration (HHI)
            
            3. Industry Trends:
               - Technology disruptions
               - Regulatory changes
               - Supply chain evolution
               - Sustainability initiatives
            
            4. Entry Barriers:
               - Capital requirements
               - Regulatory hurdles
               - Technology barriers
               - Network effects
            """,
            expected_output="Comprehensive industry analysis report",
            agent=self.agents['industry'],
            context=[planning_task]
        )
        
        # Task 3: Consumer Analysis
        consumer_task = Task(
            description=f"""
            Analyze consumer behavior and preferences in {target_market}:
            
            1. Customer Segmentation:
               - Demographic profiles
               - Psychographic characteristics
               - Behavioral patterns
               - Needs and pain points
            
            2. Buying Journey:
               - Awareness stage behavior
               - Consideration factors
               - Decision criteria
               - Post-purchase behavior
            
            3. Preference Analysis:
               - Feature preferences
               - Price sensitivity
               - Brand loyalty factors
               - Channel preferences
            
            4. Trend Analysis:
               - Emerging consumer behaviors
               - Generational differences
               - Cultural influences
               - Post-COVID changes
            """,
            expected_output="Detailed consumer insights report",
            agent=self.agents['consumer'],
            context=[planning_task]
        )
        
        # Task 4: Data Analysis
        data_task = Task(
            description="""
            Analyze all quantitative data gathered:
            
            1. Market Metrics:
               - Market size calculations
               - Growth rate analysis
               - Market share distributions
               - Penetration rates
            
            2. Financial Analysis:
               - Revenue projections
               - Profit margins by segment
               - Cost structure analysis
               - ROI calculations
            
            3. Statistical Analysis:
               - Correlation analysis
               - Trend extrapolation
               - Scenario modeling
               - Sensitivity analysis
            
            4. Visualizations:
               - Market size charts
               - Growth trend graphs
               - Competitive landscape maps
               - Customer segment matrices
            """,
            expected_output="Data analysis with visualizations",
            agent=self.agents['data'],
            context=[industry_task, consumer_task]
        )
        
        # Task 5: Final Report
        report_task = Task(
            description=f"""
            Create comprehensive market research report for {research_topic}:
            
            Structure:
            1. Executive Summary (2 pages)
               - Key findings
               - Strategic recommendations
               - Investment thesis
            
            2. Market Overview (5 pages)
               - Market definition and scope
               - Size and growth analysis
               - Key trends and drivers
            
            3. Competitive Analysis (5 pages)
               - Competitive landscape
               - Key player profiles
               - Strategic positioning
            
            4. Customer Analysis (4 pages)
               - Segment profiles
               - Behavior patterns
               - Unmet needs
            
            5. Opportunities & Risks (3 pages)
               - Market opportunities
               - Risk assessment
               - Mitigation strategies
            
            6. Strategic Recommendations (3 pages)
               - Market entry strategy
               - Positioning recommendations
               - Investment priorities
            
            7. Appendices
               - Data tables
               - Methodology
               - Sources
            
            Save the report as 'market_research_{target_market}_{timestamp}.md'
            """,
            expected_output="Complete market research report",
            agent=self.agents['writer'],
            context=[planning_task, industry_task, consumer_task, data_task]
        )
        
        return [planning_task, industry_task, consumer_task, 
                data_task, report_task]
    
    def run_research(self, topic: str, market: str) -> str:
        """Execute complete research workflow"""
        tasks = self.create_research_workflow(topic, market)
        
        crew = Crew(
            agents=list(self.agents.values()),
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            memory=True
        )
        
        result = crew.kickoff()
        return result

# Usage
research_crew = MarketResearchCrew(
    llm_config={"model": "gpt-4", "temperature": 0.7}
)

result = research_crew.run_research(
    topic="AI-powered Customer Service Solutions",
    market="European E-commerce Sector"
)
\`\`\`

## Template 2: Software Development Crew

### Agile Development Team

\`\`\`python
from crewai_tools import GithubSearchTool, CodeDocsSearchTool, FileWriteTool
import subprocess

class AgileDevelopmentCrew:
    """Complete agile software development team"""
    
    def __init__(self, llm_config: Dict[str, Any], github_token: str):
        self.llm_config = llm_config
        self.github_token = github_token
        
        # Initialize tools
        self.github_tool = GithubSearchTool(github_token=github_token)
        self.docs_tool = CodeDocsSearchTool(
            docs_url="https://docs.python.org/3/"
        )
        self.file_tool = FileWriteTool(directory="./src")
        
        # Create development team
        self.agents = self._create_dev_team()
        
    def _create_dev_team(self) -> Dict[str, Agent]:
        """Create specialized development agents"""
        
        # Product Owner
        product_owner = Agent(
            role="Product Owner",
            goal="Define product requirements and prioritize features",
            backstory="""You are an experienced product owner who bridges business 
            needs with technical implementation. You excel at writing clear user 
            stories and acceptance criteria.""",
            llm_config=self.llm_config,
            allow_delegation=True,
            verbose=True
        )
        
        # Tech Lead
        tech_lead = Agent(
            role="Technical Lead",
            goal="Design system architecture and guide technical decisions",
            backstory="""You are a senior software architect with 15 years of 
            experience. You specialize in scalable system design, best practices, 
            and mentoring development teams.""",
            tools=[self.github_tool, self.docs_tool],
            llm_config=self.llm_config,
            allow_delegation=True,
            verbose=True
        )
        
        # Backend Developer
        backend_dev = Agent(
            role="Senior Backend Developer",
            goal="Develop robust backend services and APIs",
            backstory="""You are a backend specialist with expertise in Python, 
            FastAPI, and microservices. You focus on performance, security, and 
            clean code practices.""",
            tools=[self.github_tool, self.docs_tool, self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Frontend Developer
        frontend_dev = Agent(
            role="Senior Frontend Developer",
            goal="Create responsive and intuitive user interfaces",
            backstory="""You are a frontend expert specializing in React and 
            TypeScript. You have a keen eye for UX and performance optimization.""",
            tools=[self.github_tool, self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # DevOps Engineer
        devops_engineer = Agent(
            role="DevOps Engineer",
            goal="Ensure smooth deployment and infrastructure management",
            backstory="""You are a DevOps specialist with expertise in Docker, 
            Kubernetes, and CI/CD pipelines. You automate everything possible.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # QA Engineer
        qa_engineer = Agent(
            role="QA Engineer",
            goal="Ensure software quality through comprehensive testing",
            backstory="""You are a quality assurance expert who specializes in 
            both manual and automated testing. You have a talent for finding 
            edge cases and ensuring reliability.""",
            tools=[self.github_tool, self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        return {
            'product_owner': product_owner,
            'tech_lead': tech_lead,
            'backend_dev': backend_dev,
            'frontend_dev': frontend_dev,
            'devops': devops_engineer,
            'qa': qa_engineer
        }
    
    def create_sprint_workflow(self, feature_request: str, 
                             sprint_number: int) -> List[Task]:
        """Create complete sprint workflow"""
        
        # Sprint Planning
        planning_task = Task(
            description=f"""
            Sprint {sprint_number} Planning for feature: {feature_request}
            
            Create sprint plan including:
            1. User Stories:
               - Break down feature into 3-5 user stories
               - Write clear acceptance criteria
               - Estimate story points (Fibonacci: 1,2,3,5,8)
               
            2. Technical Requirements:
               - API endpoints needed
               - Database schema changes
               - Frontend components
               - Third-party integrations
               
            3. Sprint Goals:
               - Definition of Done
               - Success metrics
               - Risk assessment
               
            4. Task Breakdown:
               - Backend tasks
               - Frontend tasks
               - Testing tasks
               - DevOps tasks
            """,
            expected_output="Complete sprint plan with user stories",
            agent=self.agents['product_owner']
        )
        
        # Architecture Design
        architecture_task = Task(
            description="""
            Design technical architecture for the sprint:
            
            1. System Design:
               - Component architecture diagram
               - Data flow design
               - API contract definitions
               - Database schema design
               
            2. Technology Decisions:
               - Framework choices
               - Library selections
               - Design patterns to use
               - Performance considerations
               
            3. Security Architecture:
               - Authentication approach
               - Authorization model
               - Data encryption needs
               - Security best practices
               
            4. Scalability Planning:
               - Load expectations
               - Caching strategy
               - Database optimization
               - Horizontal scaling approach
            """,
            expected_output="Technical architecture document",
            agent=self.agents['tech_lead'],
            context=[planning_task]
        )
        
        # Backend Development
        backend_task = Task(
            description="""
            Implement backend services:
            
            1. API Development:
               - RESTful endpoints
               - Request/response schemas
               - Error handling
               - Input validation
               
            2. Business Logic:
               - Core feature implementation
               - Data processing
               - Integration logic
               - Background tasks
               
            3. Database Layer:
               - Models/schemas
               - Migrations
               - Query optimization
               - Transaction handling
               
            4. Code Quality:
               - Unit tests (80% coverage)
               - Documentation
               - Type hints
               - Logging implementation
               
            Generate Python code files with proper structure.
            """,
            expected_output="Backend implementation code",
            agent=self.agents['backend_dev'],
            context=[architecture_task]
        )
        
        # Frontend Development
        frontend_task = Task(
            description="""
            Implement frontend components:
            
            1. UI Components:
               - React components
               - TypeScript interfaces
               - Responsive design
               - Accessibility (WCAG 2.1)
               
            2. State Management:
               - Redux/Context setup
               - API integration
               - Error boundaries
               - Loading states
               
            3. User Experience:
               - Intuitive navigation
               - Form validations
               - Success/error feedback
               - Performance optimization
               
            4. Testing:
               - Component tests
               - Integration tests
               - E2E test scenarios
               
            Generate React/TypeScript code files.
            """,
            expected_output="Frontend implementation code",
            agent=self.agents['frontend_dev'],
            context=[architecture_task]
        )
        
        # DevOps Setup
        devops_task = Task(
            description="""
            Setup deployment infrastructure:
            
            1. Containerization:
               - Dockerfile for services
               - Docker-compose setup
               - Environment configs
               - Secret management
               
            2. CI/CD Pipeline:
               - GitHub Actions workflow
               - Build stages
               - Test automation
               - Deployment stages
               
            3. Infrastructure as Code:
               - Kubernetes manifests
               - Helm charts
               - Terraform configs
               - Monitoring setup
               
            4. Observability:
               - Logging configuration
               - Metrics collection
               - Alerting rules
               - Dashboard creation
               
            Generate all DevOps configuration files.
            """,
            expected_output="Complete DevOps setup",
            agent=self.agents['devops'],
            context=[backend_task, frontend_task]
        )
        
        # QA Testing
        qa_task = Task(
            description="""
            Comprehensive testing strategy:
            
            1. Test Planning:
               - Test scenarios
               - Test data preparation
               - Environment setup
               - Acceptance criteria
               
            2. Test Implementation:
               - Unit test suites
               - Integration tests
               - API tests
               - UI automation tests
               
            3. Performance Testing:
               - Load test scenarios
               - Stress testing
               - Performance benchmarks
               - Optimization recommendations
               
            4. Security Testing:
               - Vulnerability scanning
               - Penetration test cases
               - OWASP compliance
               - Security report
               
            Generate test code and reports.
            """,
            expected_output="Complete test suite and reports",
            agent=self.agents['qa'],
            context=[backend_task, frontend_task]
        )
        
        return [planning_task, architecture_task, backend_task, 
                frontend_task, devops_task, qa_task]
    
    def run_sprint(self, feature: str, sprint_num: int) -> str:
        """Execute complete sprint workflow"""
        tasks = self.create_sprint_workflow(feature, sprint_num)
        
        crew = Crew(
            agents=list(self.agents.values()),
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            memory=True,
            embedder={
                "provider": "openai",
                "config": {"model": "text-embedding-ada-002"}
            }
        )
        
        result = crew.kickoff()
        return result
\`\`\`

## Template 3: Content Creation Crew

### Multi-Channel Content Team

\`\`\`python
from crewai_tools import SerperDevTool, FileWriteTool
import requests

class ContentCreationCrew:
    """Complete content creation and marketing team"""
    
    def __init__(self, llm_config: Dict[str, Any]):
        self.llm_config = llm_config
        
        # Initialize tools
        self.search_tool = SerperDevTool(
            api_key=os.getenv("SERPER_API_KEY")
        )
        self.file_tool = FileWriteTool(directory="./content_output")
        
        # Create content team
        self.agents = self._create_content_team()
        
    def _create_content_team(self) -> Dict[str, Agent]:
        """Create specialized content agents"""
        
        # Content Strategist
        content_strategist = Agent(
            role="Content Strategist",
            goal="Develop comprehensive content strategies aligned with business goals",
            backstory="""You are a senior content strategist with expertise in 
            multi-channel marketing. You've worked with Fortune 500 companies to 
            develop content strategies that drive engagement and conversions.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            allow_delegation=True,
            verbose=True
        )
        
        # SEO Specialist
        seo_specialist = Agent(
            role="SEO Specialist",
            goal="Optimize content for search engines and organic visibility",
            backstory="""You are an SEO expert with deep knowledge of search 
            algorithms, keyword research, and on-page optimization. You stay 
            updated with the latest Google algorithm changes.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Blog Writer
        blog_writer = Agent(
            role="Senior Blog Writer",
            goal="Create engaging, informative blog posts that resonate with target audience",
            backstory="""You are a professional writer with expertise in creating 
            compelling blog content. You have a talent for explaining complex topics 
            in an accessible way while maintaining SEO best practices.""",
            tools=[self.search_tool, self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Social Media Manager
        social_media_manager = Agent(
            role="Social Media Manager",
            goal="Create viral social media content and manage multi-platform presence",
            backstory="""You are a social media expert who understands platform 
            algorithms, trending topics, and audience engagement. You've grown 
            multiple accounts to 100K+ followers.""",
            tools=[self.search_tool, self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Video Script Writer
        video_writer = Agent(
            role="Video Script Writer",
            goal="Write engaging video scripts for YouTube and social platforms",
            backstory="""You are a video content specialist who understands viewer 
            retention, storytelling, and platform-specific best practices. Your 
            scripts have generated millions of views.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Email Marketing Specialist
        email_specialist = Agent(
            role="Email Marketing Specialist",
            goal="Create high-converting email campaigns and nurture sequences",
            backstory="""You are an email marketing expert with experience in 
            segmentation, personalization, and conversion optimization. You've 
            achieved consistent 25%+ open rates.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        return {
            'strategist': content_strategist,
            'seo': seo_specialist,
            'blog_writer': blog_writer,
            'social_media': social_media_manager,
            'video_writer': video_writer,
            'email': email_specialist
        }
    
    def create_content_campaign(self, topic: str, target_audience: str, 
                              campaign_goals: List[str]) -> List[Task]:
        """Create complete content campaign workflow"""
        
        # Content Strategy
        strategy_task = Task(
            description=f"""
            Develop comprehensive content strategy for: {topic}
            Target Audience: {target_audience}
            Campaign Goals: {', '.join(campaign_goals)}
            
            Deliverables:
            1. Content Pillars (3-5 main themes)
            2. Content Calendar (30-day plan)
            3. Channel Strategy:
               - Blog: posting frequency, topics
               - Social Media: platforms, content types
               - Email: campaign structure
               - Video: YouTube strategy
               
            4. KPIs and Success Metrics:
               - Traffic goals
               - Engagement metrics
               - Conversion targets
               - ROI projections
               
            5. Competitor Analysis:
               - Top 5 competitors
               - Content gaps
               - Differentiation opportunities
            """,
            expected_output="Complete content strategy document",
            agent=self.agents['strategist']
        )
        
        # SEO Research
        seo_task = Task(
            description=f"""
            Conduct comprehensive SEO research for {topic}:
            
            1. Keyword Research:
               - Primary keywords (5-10)
               - Long-tail keywords (20-30)
               - Search volume and difficulty
               - User intent analysis
               
            2. Content Gap Analysis:
               - Topics competitors miss
               - Featured snippet opportunities
               - People Also Ask targets
               
            3. On-Page SEO Guidelines:
               - Title tag templates
               - Meta descriptions
               - Header structure
               - Internal linking strategy
               
            4. Technical SEO Checklist:
               - Page speed requirements
               - Mobile optimization
               - Schema markup needs
               - Core Web Vitals targets
            """,
            expected_output="SEO research report and guidelines",
            agent=self.agents['seo'],
            context=[strategy_task]
        )
        
        # Blog Content Creation
        blog_task = Task(
            description=f"""
            Create 5 high-quality blog posts about {topic}:
            
            For each blog post include:
            1. Compelling headline (60 chars max)
            2. Meta description (155 chars max)
            3. Introduction (hook + preview)
            4. Main content (1500-2000 words):
               - Clear sections with H2/H3
               - Data and statistics
               - Examples and case studies
               - Actionable tips
               
            5. Conclusion with CTA
            6. SEO optimization:
               - Target keyword usage
               - Related keywords
               - Internal/external links
               
            7. Content upgrades:
               - Downloadable resources
               - Infographic ideas
               - Video companions
               
            Save each post as separate markdown file.
            """,
            expected_output="5 complete blog posts",
            agent=self.agents['blog_writer'],
            context=[strategy_task, seo_task]
        )
        
        # Social Media Content
        social_task = Task(
            description=f"""
            Create social media content package:
            
            1. LinkedIn (5 posts):
               - Professional insights
               - Industry statistics
               - Thought leadership
               - Article shares
               - Polls/questions
               
            2. Twitter/X (10 tweets):
               - Thread (5-7 tweets)
               - Quick tips
               - Statistics
               - Questions
               - Quote cards
               
            3. Instagram (5 posts):
               - Carousel designs
               - Infographics
               - Quote images
               - Story templates
               - Reel ideas
               
            4. Facebook (5 posts):
               - Long-form posts
               - Video teasers
               - Community questions
               - Link shares
               - Event announcements
               
            Include hashtag strategy and posting schedule.
            """,
            expected_output="Complete social media content package",
            agent=self.agents['social_media'],
            context=[strategy_task, blog_task]
        )
        
        # Video Scripts
        video_task = Task(
            description=f"""
            Create 3 video scripts about {topic}:
            
            Video 1: Educational (10-minute YouTube)
            - Hook (0-15 seconds)
            - Introduction (15-45 seconds)
            - Main content (3 key points)
            - Examples and demonstrations
            - Summary and CTA
            - End screen strategy
            
            Video 2: Short-form (60-second)
            - Platform: TikTok/Reels/Shorts
            - Hook (3 seconds)
            - Value delivery (45 seconds)
            - CTA (12 seconds)
            
            Video 3: Webinar outline (30 minutes)
            - Opening and introductions
            - Educational content
            - Case studies
            - Q&A preparation
            - Closing and offer
            
            Include visual cues and b-roll suggestions.
            """,
            expected_output="3 complete video scripts",
            agent=self.agents['video_writer'],
            context=[strategy_task]
        )
        
        # Email Campaign
        email_task = Task(
            description=f"""
            Create email campaign sequence:
            
            1. Welcome Series (5 emails):
               - Welcome & introduction
               - Problem identification
               - Solution presentation
               - Social proof
               - Call to action
               
            2. Nurture Sequence (7 emails):
               - Educational content
               - Case studies
               - Tips and tricks
               - Industry insights
               - Product features
               - Testimonials
               - Limited offer
               
            3. Newsletter Template:
               - Subject line formulas
               - Preview text
               - Header design notes
               - Content sections
               - CTA placement
               
            4. Segmentation Strategy:
               - Audience segments
               - Personalization rules
               - A/B test ideas
               - Automation triggers
               
            Each email: subject line, preview text, body copy.
            """,
            expected_output="Complete email campaign package",
            agent=self.agents['email'],
            context=[strategy_task]
        )
        
        return [strategy_task, seo_task, blog_task, 
                social_task, video_task, email_task]
\`\`\`

## Template 4: Customer Service Crew

### Omnichannel Support Team

\`\`\`python
class CustomerServiceCrew:
    """Complete customer service and support team"""
    
    def __init__(self, llm_config: Dict[str, Any], knowledge_base_path: str):
        self.llm_config = llm_config
        self.kb_path = knowledge_base_path
        
        # Initialize tools
        self.search_tool = SerperDevTool(
            api_key=os.getenv("SERPER_API_KEY")
        )
        self.file_tool = FileWriteTool(directory="./support_logs")
        
        # Create support team
        self.agents = self._create_support_team()
        
    def _create_support_team(self) -> Dict[str, Agent]:
        """Create specialized support agents"""
        
        # Support Manager
        support_manager = Agent(
            role="Customer Support Manager",
            goal="Oversee support operations and handle escalations",
            backstory="""You are an experienced support manager who ensures 
            customer satisfaction. You excel at de-escalation, team coordination, 
            and process improvement. You have 10 years in customer success.""",
            llm_config=self.llm_config,
            allow_delegation=True,
            verbose=True
        )
        
        # Technical Support Specialist
        tech_support = Agent(
            role="Technical Support Specialist",
            goal="Resolve complex technical issues and provide solutions",
            backstory="""You are a technical expert who can troubleshoot any 
            software issue. You have deep product knowledge and can explain 
            technical concepts in simple terms.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Customer Success Representative
        customer_success = Agent(
            role="Customer Success Representative",
            goal="Ensure customers achieve their goals with our product",
            backstory="""You are a customer advocate who builds relationships 
            and ensures customers get maximum value. You're proactive in 
            identifying opportunities for customer growth.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Billing Support Specialist
        billing_support = Agent(
            role="Billing Support Specialist",
            goal="Handle all billing inquiries and payment issues",
            backstory="""You are a billing expert who understands subscription 
            models, payment processing, and refund policies. You handle sensitive 
            financial matters with care and accuracy.""",
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Social Media Support
        social_support = Agent(
            role="Social Media Support Specialist",
            goal="Monitor and respond to customer inquiries on social platforms",
            backstory="""You are a social media expert who responds quickly to 
            public inquiries. You maintain brand voice while providing helpful 
            support across all social channels.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Knowledge Base Manager
        kb_manager = Agent(
            role="Knowledge Base Manager",
            goal="Maintain and improve self-service documentation",
            backstory="""You are a documentation expert who creates clear, 
            helpful articles. You analyze support tickets to identify common 
            issues and create proactive solutions.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        return {
            'manager': support_manager,
            'tech': tech_support,
            'success': customer_success,
            'billing': billing_support,
            'social': social_support,
            'kb': kb_manager
        }
    
    def handle_support_case(self, ticket_info: Dict[str, Any]) -> List[Task]:
        """Create workflow for handling support case"""
        
        # Initial Triage
        triage_task = Task(
            description=f"""
            Triage incoming support ticket:
            
            Ticket Details:
            - Customer: {ticket_info.get('customer_name')}
            - Issue: {ticket_info.get('issue')}
            - Priority: {ticket_info.get('priority', 'normal')}
            - Channel: {ticket_info.get('channel', 'email')}
            
            Determine:
            1. Issue category (technical/billing/feature/other)
            2. Urgency level (critical/high/normal/low)
            3. Required expertise
            4. Estimated resolution time
            5. Need for escalation
            
            Check for:
            - Previous tickets from customer
            - Known issues or outages
            - Account status and tier
            - SLA requirements
            """,
            expected_output="Triage report with routing recommendation",
            agent=self.agents['manager']
        )
        
        # Technical Investigation
        tech_investigation_task = Task(
            description="""
            Investigate technical issue:
            
            1. Reproduce the issue:
               - Steps to reproduce
               - Environment details
               - Error messages
               - Screenshots/logs analysis
               
            2. Root cause analysis:
               - System components affected
               - Recent changes/updates
               - Similar reported issues
               - Potential fixes
               
            3. Solution development:
               - Immediate workaround
               - Permanent fix
               - Prevention measures
               - Documentation needs
               
            4. Testing verification:
               - Solution testing steps
               - Edge cases considered
               - Rollback plan if needed
            """,
            expected_output="Technical analysis and solution",
            agent=self.agents['tech'],
            context=[triage_task]
        )
        
        # Customer Communication
        communication_task = Task(
            description="""
            Create customer communication:
            
            1. Initial Response:
               - Acknowledge receipt
               - Set expectations
               - Request additional info if needed
               - Provide ticket number
               
            2. Solution Communication:
               - Clear explanation of issue
               - Step-by-step solution
               - Screenshots if helpful
               - Follow-up questions
               
            3. Resolution Confirmation:
               - Verify solution worked
               - Ask for feedback
               - Offer additional help
               - Satisfaction survey
               
            Tone: Professional, empathetic, helpful
            Format: Clear, concise, no jargon
            """,
            expected_output="Customer communication templates",
            agent=self.agents['success'],
            context=[tech_investigation_task]
        )
        
        # Knowledge Base Update
        kb_update_task = Task(
            description="""
            Update knowledge base if needed:
            
            1. Assess if issue should be documented:
               - Is it a common problem?
               - Would self-service help?
               - Is current documentation lacking?
               
            2. Create/Update Article:
               - Clear problem description
               - Step-by-step solution
               - Screenshots and visuals
               - Related articles
               - Search keywords
               
            3. Organize content:
               - Proper categorization
               - Tags and labels
               - Internal notes
               - Version history
            """,
            expected_output="Knowledge base article or update",
            agent=self.agents['kb'],
            context=[tech_investigation_task]
        )
        
        # Follow-up Process
        followup_task = Task(
            description="""
            Create follow-up process:
            
            1. Immediate follow-up (24 hours):
               - Confirm issue resolved
               - Any additional questions
               - Satisfaction check
               
            2. Proactive check-in (1 week):
               - Everything working well?
               - Feature adoption tips
               - Upsell opportunities
               
            3. Long-term relationship:
               - Add to nurture campaign
               - Monitor account health
               - Prevent churn signals
               
            4. Internal analysis:
               - Time to resolution
               - Customer effort score
               - Process improvements
               - Team training needs
            """,
            expected_output="Follow-up plan and metrics",
            agent=self.agents['success'],
            context=[communication_task]
        )
        
        return [triage_task, tech_investigation_task, communication_task,
                kb_update_task, followup_task]
\`\`\`

## Template 5: Financial Analysis Crew

### Investment Research Team

\`\`\`python
class FinancialAnalysisCrew:
    """Complete financial analysis and investment research team"""
    
    def __init__(self, llm_config: Dict[str, Any]):
        self.llm_config = llm_config
        
        # Initialize tools
        self.search_tool = SerperDevTool(
            api_key=os.getenv("SERPER_API_KEY")
        )
        self.file_tool = FileWriteTool(directory="./financial_reports")
        
        # Create financial team
        self.agents = self._create_financial_team()
        
    def _create_financial_team(self) -> Dict[str, Agent]:
        """Create specialized financial analysts"""
        
        # Chief Investment Officer
        cio = Agent(
            role="Chief Investment Officer",
            goal="Oversee investment strategy and make final recommendations",
            backstory="""You are a seasoned CIO with 25 years of experience in 
            capital markets. You've managed multi-billion dollar portfolios and 
            have a track record of identifying market opportunities.""",
            llm_config=self.llm_config,
            allow_delegation=True,
            verbose=True
        )
        
        # Equity Research Analyst
        equity_analyst = Agent(
            role="Senior Equity Research Analyst",
            goal="Analyze companies and provide stock recommendations",
            backstory="""You are an equity research expert with CFA certification. 
            You excel at fundamental analysis, financial modeling, and identifying 
            undervalued securities.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Macro Economic Analyst
        macro_analyst = Agent(
            role="Macro Economic Analyst",
            goal="Analyze economic trends and their market impact",
            backstory="""You are a macroeconomic expert with a PhD in Economics. 
            You understand global economic dynamics and their effects on various 
            asset classes.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Technical Analyst
        technical_analyst = Agent(
            role="Technical Analysis Expert",
            goal="Identify trading patterns and market timing opportunities",
            backstory="""You are a CMT charterholder specializing in technical 
            analysis. You use price action, volume, and indicators to predict 
            market movements.""",
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Risk Manager
        risk_manager = Agent(
            role="Chief Risk Officer",
            goal="Assess and manage portfolio risk",
            backstory="""You are a risk management expert with expertise in VaR, 
            stress testing, and portfolio optimization. You ensure investments 
            meet risk-return objectives.""",
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Report Writer
        report_writer = Agent(
            role="Investment Report Writer",
            goal="Create comprehensive investment reports and recommendations",
            backstory="""You are a financial writer who translates complex analysis 
            into clear, actionable investment reports for clients and stakeholders.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        return {
            'cio': cio,
            'equity': equity_analyst,
            'macro': macro_analyst,
            'technical': technical_analyst,
            'risk': risk_manager,
            'writer': report_writer
        }
    
    def analyze_investment(self, ticker: str, investment_amount: float) -> List[Task]:
        """Create comprehensive investment analysis workflow"""
        
        # Investment Thesis Development
        thesis_task = Task(
            description=f"""
            Develop investment thesis for {ticker}:
            
            1. Investment Overview:
               - Company description
               - Business model analysis
               - Competitive positioning
               - Market opportunity size
               
            2. Investment Highlights:
               - Key growth drivers
               - Competitive advantages
               - Management quality
               - Strategic initiatives
               
            3. Investment Risks:
               - Business risks
               - Market risks
               - Regulatory risks
               - Execution risks
               
            4. Time Horizon:
               - Short-term catalysts
               - Medium-term drivers
               - Long-term vision
               
            Investment Amount: $\{investment_amount:,.0f\}
            """,
            expected_output="Investment thesis document",
            agent=self.agents['cio']
        )
        
        # Fundamental Analysis
        fundamental_task = Task(
            description=f"""
            Conduct deep fundamental analysis of {ticker}:
            
            1. Financial Analysis:
               - Revenue growth (5-year history)
               - Profitability trends
               - Cash flow analysis
               - Balance sheet strength
               - Return metrics (ROE, ROIC)
               
            2. Valuation Analysis:
               - P/E ratio vs peers
               - PEG ratio
               - EV/EBITDA
               - DCF model
               - Price targets
               
            3. Earnings Analysis:
               - Earnings quality
               - Revenue breakdown
               - Margin analysis
               - Guidance assessment
               
            4. Peer Comparison:
               - Market share trends
               - Relative valuation
               - Operational metrics
               - Growth comparison
            """,
            expected_output="Fundamental analysis report",
            agent=self.agents['equity'],
            context=[thesis_task]
        )
        
        # Macro Economic Analysis
        macro_task = Task(
            description=f"""
            Analyze macroeconomic factors affecting {ticker}:
            
            1. Economic Environment:
               - GDP growth impact
               - Interest rate sensitivity
               - Inflation effects
               - Currency exposure
               
            2. Sector Analysis:
               - Industry growth trends
               - Regulatory environment
               - Technology disruption
               - Supply chain factors
               
            3. Geopolitical Factors:
               - Trade policy impact
               - Political risks
               - Regional exposures
               - Global trends
               
            4. Economic Scenarios:
               - Base case (60% probability)
               - Bull case (20% probability)
               - Bear case (20% probability)
               - Impact on investment
            """,
            expected_output="Macroeconomic impact analysis",
            agent=self.agents['macro'],
            context=[thesis_task]
        )
        
        # Technical Analysis
        technical_task = Task(
            description=f"""
            Perform technical analysis for {ticker}:
            
            1. Price Action Analysis:
               - Support and resistance levels
               - Trend analysis (short/medium/long)
               - Chart patterns
               - Volume analysis
               
            2. Technical Indicators:
               - Moving averages (20/50/200 DMA)
               - RSI and momentum
               - MACD signals
               - Bollinger Bands
               
            3. Market Structure:
               - Market phase identification
               - Institutional activity
               - Options flow analysis
               - Short interest
               
            4. Entry/Exit Points:
               - Optimal entry zones
               - Stop loss levels
               - Profit targets
               - Position sizing
            """,
            expected_output="Technical analysis report",
            agent=self.agents['technical'],
            context=[fundamental_task]
        )
        
        # Risk Assessment
        risk_task = Task(
            description=f"""
            Comprehensive risk assessment for {ticker} investment:
            
            1. Risk Metrics:
               - Volatility analysis
               - Beta calculation
               - Maximum drawdown
               - Sharpe ratio
               
            2. Portfolio Impact:
               - Correlation analysis
               - Diversification effect
               - Concentration risk
               - Liquidity assessment
               
            3. Scenario Analysis:
               - Stress test scenarios
               - VaR calculations
               - Monte Carlo simulation
               - Sensitivity analysis
               
            4. Risk Mitigation:
               - Hedging strategies
               - Position sizing
               - Stop loss recommendations
               - Rebalancing triggers
               
            Investment Amount: $\{investment_amount:,.0f\}
            """,
            expected_output="Risk assessment report",
            agent=self.agents['risk'],
            context=[fundamental_task, macro_task, technical_task]
        )
        
        # Final Investment Report
        report_task = Task(
            description=f"""
            Create comprehensive investment report for {ticker}:
            
            Structure:
            1. Executive Summary (1 page)
               - Investment recommendation (Buy/Hold/Sell)
               - Price target and expected return
               - Key risks and catalysts
               - Investment timeline
               
            2. Investment Thesis (2 pages)
               - Business overview
               - Investment rationale
               - Competitive advantages
               - Growth drivers
               
            3. Financial Analysis (3 pages)
               - Historical performance
               - Valuation metrics
               - Peer comparison
               - Financial projections
               
            4. Risk Analysis (2 pages)
               - Risk factors
               - Scenario analysis
               - Mitigation strategies
               - Portfolio considerations
               
            5. Technical View (1 page)
               - Chart analysis
               - Entry/exit points
               - Technical indicators
               
            6. Recommendation (1 page)
               - Position sizing
               - Implementation strategy
               - Monitoring plan
               - Exit criteria
               
            Investment Amount: $\{investment_amount:,.0f\}
            Expected Return: Calculate based on analysis
            Risk Rating: Low/Medium/High
            Time Horizon: Specify in months/years
            """,
            expected_output="Complete investment report",
            agent=self.agents['writer'],
            context=[thesis_task, fundamental_task, macro_task, 
                    technical_task, risk_task]
        )
        
        return [thesis_task, fundamental_task, macro_task,
                technical_task, risk_task, report_task]
\`\`\`

## Template 6: Healthcare Crew

### Patient Care Coordination Team

\`\`\`python
class HealthcareCrew:
    """Complete healthcare coordination and patient care team"""
    
    def __init__(self, llm_config: Dict[str, Any]):
        self.llm_config = llm_config
        
        # Initialize tools
        self.search_tool = SerperDevTool(
            api_key=os.getenv("SERPER_API_KEY")
        )
        self.file_tool = FileWriteTool(directory="./patient_records")
        
        # Create healthcare team
        self.agents = self._create_healthcare_team()
        
    def _create_healthcare_team(self) -> Dict[str, Agent]:
        """Create specialized healthcare agents"""
        
        # Care Coordinator
        care_coordinator = Agent(
            role="Patient Care Coordinator",
            goal="Coordinate comprehensive patient care across all providers",
            backstory="""You are an experienced care coordinator with 15 years in 
            healthcare. You excel at managing complex cases, coordinating between 
            specialists, and ensuring continuity of care.""",
            llm_config=self.llm_config,
            allow_delegation=True,
            verbose=True
        )
        
        # Medical Researcher
        medical_researcher = Agent(
            role="Medical Research Specialist",
            goal="Research latest treatments and medical evidence",
            backstory="""You are a medical researcher with expertise in evidence-based 
            medicine. You stay current with latest research, clinical trials, and 
            treatment guidelines across all specialties.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Patient Advocate
        patient_advocate = Agent(
            role="Patient Advocate",
            goal="Ensure patient rights and preferences are respected",
            backstory="""You are a dedicated patient advocate who ensures patients 
            understand their options and receive quality care. You navigate insurance, 
            legal, and ethical considerations.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Health Educator
        health_educator = Agent(
            role="Health Education Specialist",
            goal="Provide clear, actionable health education to patients",
            backstory="""You are a certified health educator who excels at explaining 
            complex medical concepts in understandable terms. You create personalized 
            education plans for better health outcomes.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Care Plan Developer
        care_plan_developer = Agent(
            role="Care Plan Developer",
            goal="Create comprehensive, personalized care plans",
            backstory="""You are a clinical care planner who develops detailed, 
            evidence-based care plans. You consider medical, social, and environmental 
            factors in your planning.""",
            llm_config=self.llm_config,
            verbose=True
        )
        
        return {
            'coordinator': care_coordinator,
            'researcher': medical_researcher,
            'advocate': patient_advocate,
            'educator': health_educator,
            'planner': care_plan_developer
        }
    
    def create_care_plan(self, patient_info: Dict[str, Any]) -> List[Task]:
        """Create comprehensive patient care workflow"""
        
        # Initial Assessment
        assessment_task = Task(
            description=f"""
            Conduct comprehensive patient assessment:
            
            Patient Information:
            - Age: {patient_info.get('age')}
            - Conditions: {patient_info.get('conditions')}
            - Current Medications: {patient_info.get('medications')}
            - Concerns: {patient_info.get('concerns')}
            
            Assessment Areas:
            1. Medical History Review
               - Chronic conditions
               - Previous treatments
               - Allergies and reactions
               - Family history
               
            2. Current Health Status
               - Symptom assessment
               - Functional status
               - Quality of life
               - Pain levels
               
            3. Social Determinants
               - Living situation
               - Support system
               - Financial resources
               - Transportation access
               
            4. Care Gaps
               - Missing screenings
               - Medication adherence
               - Follow-up needs
               - Preventive care
            """,
            expected_output="Comprehensive patient assessment",
            agent=self.agents['coordinator']
        )
        
        # Medical Research
        research_task = Task(
            description="""
            Research evidence-based treatment options:
            
            1. Condition-Specific Research:
               - Latest treatment guidelines
               - Clinical trial options
               - Emerging therapies
               - Alternative treatments
               
            2. Drug Interactions:
               - Current medication review
               - Potential interactions
               - Side effect profiles
               - Cost considerations
               
            3. Specialist Recommendations:
               - When to refer
               - Best specialists in area
               - Second opinion value
               - Integrated care options
               
            4. Lifestyle Interventions:
               - Diet modifications
               - Exercise programs
               - Stress management
               - Sleep optimization
            """,
            expected_output="Evidence-based treatment research",
            agent=self.agents['researcher'],
            context=[assessment_task]
        )
        
        # Care Plan Development
        plan_task = Task(
            description="""
            Develop personalized care plan:
            
            1. Treatment Goals:
               - Short-term (30 days)
               - Medium-term (90 days)
               - Long-term (1 year)
               - Quality of life targets
               
            2. Medical Interventions:
               - Medication regimen
               - Procedures needed
               - Specialist consultations
               - Monitoring schedule
               
            3. Self-Care Plan:
               - Daily activities
               - Symptom tracking
               - Red flag symptoms
               - When to seek help
               
            4. Support Services:
               - Home health needs
               - Physical therapy
               - Mental health support
               - Community resources
               
            5. Follow-Up Schedule:
               - Provider appointments
               - Lab work timing
               - Imaging studies
               - Reassessment dates
            """,
            expected_output="Detailed care plan",
            agent=self.agents['planner'],
            context=[assessment_task, research_task]
        )
        
        # Patient Education
        education_task = Task(
            description="""
            Create patient education materials:
            
            1. Condition Education:
               - What is your condition?
               - How does it affect you?
               - What to expect
               - Management strategies
               
            2. Medication Guide:
               - What each medication does
               - How to take properly
               - Side effects to watch
               - Importance of adherence
               
            3. Lifestyle Guide:
               - Dietary recommendations
               - Exercise instructions
               - Stress reduction techniques
               - Sleep hygiene
               
            4. Emergency Plan:
               - Warning signs
               - When to call doctor
               - When to go to ER
               - Emergency contacts
               
            Create in simple language (6th grade level)
            Include visuals and checklists
            """,
            expected_output="Patient education package",
            agent=self.agents['educator'],
            context=[plan_task]
        )
        
        # Advocacy and Coordination
        advocacy_task = Task(
            description="""
            Coordinate care and advocate for patient:
            
            1. Insurance Navigation:
               - Coverage verification
               - Prior authorizations
               - Appeal processes
               - Cost reduction options
               
            2. Provider Coordination:
               - Schedule appointments
               - Share care plan
               - Facilitate communication
               - Prevent duplications
               
            3. Resource Connection:
               - Financial assistance
               - Transportation services
               - Support groups
               - Community programs
               
            4. Quality Assurance:
               - Track outcomes
               - Patient satisfaction
               - Care plan adherence
               - Continuous improvement
               
            5. Documentation:
               - Maintain care record
               - Track communications
               - Document outcomes
               - Update care team
            """,
            expected_output="Care coordination report",
            agent=self.agents['advocate'],
            context=[plan_task]
        )
        
        return [assessment_task, research_task, plan_task,
                education_task, advocacy_task]
\`\`\`

## Template 7: E-commerce Operations Crew

### Complete E-commerce Management Team

\`\`\`python
class EcommerceCrew:
    """Complete e-commerce operations and growth team"""
    
    def __init__(self, llm_config: Dict[str, Any]):
        self.llm_config = llm_config
        
        # Initialize tools
        self.search_tool = SerperDevTool(
            api_key=os.getenv("SERPER_API_KEY")
        )
        self.file_tool = FileWriteTool(directory="./ecommerce_data")
        
        # Create e-commerce team
        self.agents = self._create_ecommerce_team()
        
    def _create_ecommerce_team(self) -> Dict[str, Agent]:
        """Create specialized e-commerce agents"""
        
        # E-commerce Director
        director = Agent(
            role="E-commerce Director",
            goal="Oversee all e-commerce operations and drive growth",
            backstory="""You are an experienced e-commerce director who has scaled 
            multiple online stores to 8-figure revenues. You understand all aspects 
            of e-commerce from strategy to execution.""",
            llm_config=self.llm_config,
            allow_delegation=True,
            verbose=True
        )
        
        # Product Manager
        product_manager = Agent(
            role="E-commerce Product Manager",
            goal="Optimize product catalog and launches",
            backstory="""You are a product management expert who knows how to select 
            winning products, optimize listings, and manage inventory for maximum 
            profitability.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Marketing Specialist
        marketing_specialist = Agent(
            role="Digital Marketing Specialist",
            goal="Drive traffic and conversions through multi-channel marketing",
            backstory="""You are a performance marketing expert with expertise in 
            paid ads, SEO, email marketing, and conversion optimization. You've 
            managed million-dollar ad budgets.""",
            tools=[self.search_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Conversion Optimizer
        conversion_optimizer = Agent(
            role="Conversion Rate Optimization Expert",
            goal="Maximize conversion rates and average order value",
            backstory="""You are a CRO specialist who uses data and psychology to 
            optimize every aspect of the customer journey. You've consistently 
            achieved 20%+ conversion improvements.""",
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Customer Experience Manager
        cx_manager = Agent(
            role="Customer Experience Manager",
            goal="Create exceptional customer experiences that drive loyalty",
            backstory="""You are a customer experience expert who designs seamless 
            shopping experiences. You understand customer psychology and how to 
            build lasting relationships.""",
            tools=[self.file_tool],
            llm_config=self.llm_config,
            verbose=True
        )
        
        # Analytics Specialist
        analytics_specialist = Agent(
            role="E-commerce Analytics Specialist",
            goal="Provide data-driven insights for growth",
            backstory="""You are a data analyst specializing in e-commerce metrics. 
            You can identify trends, opportunities, and issues before they impact 
            the business.""",
            llm_config=self.llm_config,
            verbose=True
        )
        
        return {
            'director': director,
            'product': product_manager,
            'marketing': marketing_specialist,
            'conversion': conversion_optimizer,
            'cx': cx_manager,
            'analytics': analytics_specialist
        }
    
    def optimize_store(self, store_info: Dict[str, Any]) -> List[Task]:
        """Create complete e-commerce optimization workflow"""
        
        # Strategic Analysis
        strategy_task = Task(
            description=f"""
            Develop e-commerce growth strategy:
            
            Store Information:
            - Store Name: \{store_info.get('name')\}
            - Category: \{store_info.get('category')\}
            - Current Revenue: $\{store_info.get('monthly_revenue', 0):,.0f\}/month
            - Conversion Rate: \{store_info.get('conversion_rate', 0)\}%
            
            Strategic Analysis:
            1. Market Position:
               - Competitive landscape
               - Market opportunities
               - Unique value proposition
               - Growth potential
               
            2. Business Model:
               - Revenue streams
               - Profit margins
               - Cost structure
               - Scalability assessment
               
            3. Growth Strategy:
               - 90-day quick wins
               - 6-month growth plan
               - 1-year vision
               - Resource requirements
               
            4. Key Metrics:
               - Revenue targets
               - Conversion goals
               - AOV targets
               - Customer LTV goals
            """,
            expected_output="E-commerce growth strategy",
            agent=self.agents['director']
        )
        
        # Product Optimization
        product_task = Task(
            description="""
            Optimize product strategy:
            
            1. Product Analysis:
               - Best sellers analysis
               - Slow movers identification
               - Margin analysis by SKU
               - Inventory turnover
               
            2. Catalog Optimization:
               - Product descriptions
               - Image optimization
               - Pricing strategy
               - Bundle opportunities
               
            3. New Product Strategy:
               - Market research
               - Trend identification
               - Supplier sourcing
               - Launch planning
               
            4. Inventory Management:
               - Stock level optimization
               - Reorder points
               - Seasonal planning
               - Dead stock reduction
            """,
            expected_output="Product optimization plan",
            agent=self.agents['product'],
            context=[strategy_task]
        )
        
        # Marketing Campaign
        marketing_task = Task(
            description="""
            Create integrated marketing campaign:
            
            1. Paid Advertising:
               - Google Ads strategy
               - Facebook/Instagram campaigns
               - Shopping campaigns
               - Retargeting setup
               
            2. SEO Strategy:
               - Keyword research
               - On-page optimization
               - Content strategy
               - Link building plan
               
            3. Email Marketing:
               - Welcome series
               - Abandoned cart sequence
               - Post-purchase flow
               - Win-back campaigns
               
            4. Social Media:
               - Content calendar
               - Influencer partnerships
               - User-generated content
               - Social commerce
               
            5. Budget Allocation:
               - Channel distribution
               - ROI projections
               - Testing budget
               - Scaling plan
            """,
            expected_output="Integrated marketing plan",
            agent=self.agents['marketing'],
            context=[strategy_task, product_task]
        )
        
        # Conversion Optimization
        conversion_task = Task(
            description="""
            Optimize conversion funnel:
            
            1. Homepage Optimization:
               - Hero section testing
               - Navigation improvements
               - Social proof placement
               - Mobile optimization
               
            2. Product Pages:
               - Image galleries
               - Description formatting
               - Reviews integration
               - Add-to-cart optimization
               
            3. Checkout Process:
               - Reduce steps
               - Guest checkout
               - Payment options
               - Trust signals
               
            4. A/B Testing Plan:
               - Testing priorities
               - Hypothesis development
               - Success metrics
               - Implementation schedule
               
            5. Personalization:
               - Product recommendations
               - Dynamic pricing
               - Behavioral triggers
               - Customer segments
            """,
            expected_output="CRO implementation plan",
            agent=self.agents['conversion'],
            context=[marketing_task]
        )
        
        # Customer Experience Enhancement
        cx_task = Task(
            description="""
            Enhance customer experience:
            
            1. Customer Journey Mapping:
               - Touchpoint analysis
               - Pain point identification
               - Opportunity areas
               - Emotion mapping
               
            2. Support Enhancement:
               - Live chat implementation
               - FAQ optimization
               - Return policy clarity
               - Response time goals
               
            3. Loyalty Program:
               - Program structure
               - Reward tiers
               - Point earning rules
               - Redemption options
               
            4. Post-Purchase Experience:
               - Order confirmation
               - Shipping updates
               - Unboxing experience
               - Review requests
               
            5. Community Building:
               - Customer forums
               - Social groups
               - User content
               - Brand ambassadors
            """,
            expected_output="Customer experience roadmap",
            agent=self.agents['cx'],
            context=[strategy_task]
        )
        
        # Analytics and Reporting
        analytics_task = Task(
            description="""
            Create analytics framework:
            
            1. KPI Dashboard:
               - Revenue metrics
               - Conversion funnel
               - Customer metrics
               - Product performance
               
            2. Attribution Model:
               - Channel attribution
               - Customer journey tracking
               - ROI calculation
               - LTV modeling
               
            3. Reporting Structure:
               - Daily metrics
               - Weekly reports
               - Monthly analysis
               - Quarterly reviews
               
            4. Predictive Analytics:
               - Sales forecasting
               - Inventory predictions
               - Churn risk scoring
               - Trend identification
               
            5. Action Items:
               - Quick wins identified
               - Testing priorities
               - Investment areas
               - Risk mitigation
            """,
            expected_output="Analytics framework and insights",
            agent=self.agents['analytics'],
            context=[strategy_task, marketing_task, conversion_task]
        )
        
        return [strategy_task, product_task, marketing_task,
                conversion_task, cx_task, analytics_task]
\`\`\`

## Best Practices for Using Templates

### Template Customization Guide

\`\`\`python
class TemplateCustomizer:
    """Helper class for customizing crew templates"""
    
    @staticmethod
    def add_specialized_agent(crew_template: Any, agent_config: Dict):
        """Add custom agent to existing template"""
        new_agent = Agent(
            role=agent_config['role'],
            goal=agent_config['goal'],
            backstory=agent_config['backstory'],
            tools=agent_config.get('tools', []),
            llm_config=agent_config.get('llm_config', {}),
            allow_delegation=agent_config.get('allow_delegation', False)
        )
        return new_agent
    
    @staticmethod
    def modify_workflow(tasks: List[Task], modifications: Dict):
        """Modify existing workflow tasks"""
        for task in tasks:
            if task.description in modifications:
                task.description = modifications[task.description]
        return tasks
    
    @staticmethod
    def combine_crews(crew1: Any, crew2: Any) -> Crew:
        """Combine multiple crew templates"""
        combined_agents = list(crew1.agents.values()) + list(crew2.agents.values())
        combined_tasks = crew1.tasks + crew2.tasks
        
        return Crew(
            agents=combined_agents,
            tasks=combined_tasks,
            process=Process.hierarchical,
            manager_llm={"model": "gpt-4"},
            verbose=True
        )
\`\`\`

Deze templates bieden een solide basis voor verschillende use cases. Pas ze aan naar jouw specifieke behoeften door agents toe te voegen, tasks te modificeren, of workflows te combineren.
  `,
  assignments: [
    {
      id: 'ex1',
      title: 'Custom Crew Template',
      description: 'Creëer je eigen crew template voor een specifieke industrie of use case',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Identificeer minimaal 5 gespecialiseerde agents',
        'Definieer een complete workflow met dependencies',
        'Implementeer error handling en quality checks'
      ]
    },
    {
      id: 'ex2',
      title: 'Hybrid Crew Implementation',
      description: 'Combineer 2 of meer templates tot een mega-crew voor complex project',
      difficulty: 'expert',
      type: 'project',
      hints: [
        'Gebruik hierarchical process voor coordination',
        'Implementeer cross-crew communication',
        'Add performance monitoring across all crews'
      ]
    }
  ],
  resources: [
    {
      title: 'CrewAI Templates Repository',
      url: 'https://github.com/joaomdmoura/crewAI-examples',
      type: 'code'
    },
    {
      title: 'Agent Design Patterns',
      url: 'https://www.oreilly.com/library/view/designing-autonomous-agents/9781098121804/',
      type: 'book'
    }
  ]
};