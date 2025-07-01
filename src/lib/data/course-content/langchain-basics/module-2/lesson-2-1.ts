import { Lesson } from '@/lib/data/courses'

export const lesson21: Lesson = {
  id: 'lesson-2-1',
  title: 'Prompt Templates maken en gebruiken',
  duration: '25 min',
  content: `# Prompt Templates maken en gebruiken

Prompt Templates zijn de fundamentele bouwstenen voor professionele LLM applicaties. Ze maken je prompts herbruikbaar, onderhoudbaar en veilig.

## Waarom Prompt Templates?

### Het Probleem met Hardcoded Prompts

\`\`\`python
# ❌ Slecht: String concatenatie
prompt = "Summarize this text: " + user_input
# Gevaar: Prompt injection, geen validatie, niet herbruikbaar

# ❌ Ook slecht: f-strings
prompt = f"Translate '{text}' to {language}"
# Probleem: Geen escape handling, formatting issues
\`\`\`

### De LangChain Oplossing

\`\`\`python
from langchain.prompts import PromptTemplate

# ✅ Goed: Prompt Template
template = PromptTemplate(
    input_variables=["text", "language"],
    template="Translate the following text to {language}:\\n\\n{text}"
)
\`\`\`

## Basic Prompt Templates

### Simple Template Creation

\`\`\`python
from langchain.prompts import PromptTemplate

# Method 1: Explicit variables
prompt = PromptTemplate(
    input_variables=["product", "features"],
    template="Write a product description for {product} highlighting: {features}"
)

# Method 2: Auto-detect variables
prompt = PromptTemplate.from_template(
    "Generate a {style} story about {character} in {setting}"
)

# Using the template
result = prompt.format(
    style="mystery",
    character="detective",
    setting="Victorian London"
)
\`\`\`

### Template Validation

\`\`\`python
# Automatic validation
template = PromptTemplate(
    input_variables=["name", "age"],
    template="Hello {name}, you are {age} years old"
)

# This will raise an error - 'city' not in template
try:
    template.format(name="Alice", age=25, city="Amsterdam")
except KeyError as e:
    print(f"Validation error: {e}")

# Check required variables
print(template.input_variables)  # ['name', 'age']
\`\`\`

## Advanced Template Features

### Partial Templates

\`\`\`python
# Create base template
base_prompt = PromptTemplate(
    input_variables=["topic", "language"],
    template="Write an article about {topic} in {language}"
)

# Create partial with fixed language
dutch_prompt = base_prompt.partial(language="Dutch")

# Now only need topic
article = dutch_prompt.format(topic="AI Ethics")
\`\`\`

### Template Composition

\`\`\`python
# Sub-templates
intro_template = PromptTemplate.from_template(
    "Introduction: Explain what {concept} is"
)

body_template = PromptTemplate.from_template(
    "Main points: List 3 benefits of {concept}"
)

conclusion_template = PromptTemplate.from_template(
    "Conclusion: Summarize why {concept} matters"
)

# Combine templates
full_article = f"""
{intro_template.format(concept="machine learning")}

{body_template.format(concept="machine learning")}

{conclusion_template.format(concept="machine learning")}
"""
\`\`\`

## Chat Prompt Templates

### Voor Conversational AI

\`\`\`python
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

# System message template
system_template = SystemMessagePromptTemplate.from_template(
    "You are a helpful {role} assistant specialized in {domain}"
)

# Human message template
human_template = HumanMessagePromptTemplate.from_template(
    "{user_input}"
)

# Combine into chat template
chat_prompt = ChatPromptTemplate.from_messages([
    system_template,
    human_template
])

# Format with variables
messages = chat_prompt.format_messages(
    role="technical",
    domain="Python programming",
    user_input="How do I handle exceptions?"
)
\`\`\`

### Multi-turn Conversations

\`\`\`python
from langchain.schema import AIMessage, HumanMessage

# Dynamic conversation building
chat_template = ChatPromptTemplate.from_messages([
    ("system", "You are a {personality} assistant"),
    ("human", "Tell me about {topic}"),
    ("ai", "I'll explain {topic} in a {personality} way"),
    ("human", "{follow_up_question}")
])

# Fill in the conversation
formatted = chat_template.format_messages(
    personality="friendly and casual",
    topic="quantum computing",
    follow_up_question="Can you give an example?"
)
\`\`\`

## Template Best Practices

### 1. Input Sanitization

\`\`\`python
from langchain.prompts import PromptTemplate
import re

def sanitize_input(text):
    """Remove potential injection attempts"""
    # Remove special characters
    text = re.sub(r'[{}\\\\]', '', text)
    # Limit length
    return text[:1000]

template = PromptTemplate(
    input_variables=["user_input"],
    template="Process this request: {user_input}",
    partial_variables={}
)

# Safe usage
safe_input = sanitize_input(user_raw_input)
prompt = template.format(user_input=safe_input)
\`\`\`

### 2. Template Versioning

\`\`\`python
class PromptManager:
    def __init__(self):
        self.templates = {
            "summarizer_v1": PromptTemplate.from_template(
                "Summarize: {text}"
            ),
            "summarizer_v2": PromptTemplate.from_template(
                "Create a concise summary of the following text:\\n{text}\\nSummary:"
            )
        }
    
    def get_template(self, name, version="latest"):
        """Get specific template version"""
        if version == "latest":
            # Get highest version
            versions = [k for k in self.templates if k.startswith(name)]
            return self.templates[sorted(versions)[-1]]
        return self.templates[f"{name}_{version}"]
\`\`\`

### 3. Template Testing

\`\`\`python
import pytest

def test_email_template():
    """Test email generation template"""
    template = PromptTemplate.from_template(
        "Write a {tone} email to {recipient} about {subject}"
    )
    
    # Test formatting
    result = template.format(
        tone="professional",
        recipient="client",
        subject="project update"
    )
    
    # Verify all variables replaced
    assert "{" not in result
    assert "professional" in result
    assert "client" in result
\`\`\`

## Real-world Examples

### Customer Service Bot

\`\`\`python
service_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a customer service agent for {company}.
    Your tone should be {tone}.
    You have access to order info: {order_context}"""),
    ("human", "{customer_message}")
])

# Use in application
response = service_prompt.format_messages(
    company="TechCorp",
    tone="friendly and helpful",
    order_context="Order #12345 shipped yesterday",
    customer_message="Where is my order?"
)
\`\`\`

### Code Generator

\`\`\`python
code_template = PromptTemplate(
    input_variables=["language", "function_name", "parameters", "description"],
    template="""Generate a {language} function with these specifications:
    
Function name: {function_name}
Parameters: {parameters}
Description: {description}

Include:
- Type hints (if applicable)
- Docstring
- Error handling
- Example usage

Code:"""
)
\`\`\`

## Tips voor Production

1. **Centralize Templates**: Houd alle templates in één module
2. **Version Control**: Track template changes in Git
3. **Monitor Performance**: Log welke templates het beste werken
4. **A/B Testing**: Test verschillende template variaties
5. **Security First**: Valideer altijd user input

Templates zijn de foundation van professionele LLM apps. Master ze goed!`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Basic Prompt Template',
      language: 'python',
      code: `from langchain.prompts import PromptTemplate

# Create a simple template
template = PromptTemplate(
    input_variables=["product", "target_audience"],
    template="""Create a marketing tagline for {product}.
    Target audience: {target_audience}
    Make it catchy and memorable!"""
)

# Use the template
tagline_prompt = template.format(
    product="eco-friendly water bottle",
    target_audience="environmentally conscious millennials"
)

print(tagline_prompt)`,
      explanation: 'Een basis voorbeeld van hoe je een PromptTemplate maakt en gebruikt met variabelen.'
    },
    {
      id: 'example-2',
      title: 'Chat Prompt Template',
      language: 'python',
      code: `from langchain.prompts import ChatPromptTemplate

# Create a chat template for a coding assistant
chat_template = ChatPromptTemplate.from_messages([
    ("system", "You are a {language} programming expert. Help users write clean, efficient code."),
    ("human", "I need help with {task}"),
    ("ai", "I'll help you with {task}. Let me provide a solution."),
    ("human", "{specific_question}")
])

# Format the template
messages = chat_template.format_messages(
    language="Python",
    task="error handling",
    specific_question="How do I catch multiple exceptions?"
)

# Print formatted messages
for message in messages:
    print(f"{message.type}: {message.content}")`,
      explanation: 'ChatPromptTemplate voor het maken van conversational AI flows met system, human en AI messages.'
    },
    {
      id: 'example-3',
      title: 'Partial Template Application',
      language: 'python',
      code: `from langchain.prompts import PromptTemplate

# Base template for different analysis types
analysis_template = PromptTemplate(
    input_variables=["data_type", "analysis_type", "data"],
    template="""Perform a {analysis_type} analysis on this {data_type} data:

{data}

Provide:
1. Key findings
2. Patterns identified
3. Recommendations"""
)

# Create specialized versions using partial
financial_analysis = analysis_template.partial(
    data_type="financial",
    analysis_type="trend"
)

# Now only need to provide the data
report = financial_analysis.format(
    data="Q1: $1.2M, Q2: $1.5M, Q3: $1.4M, Q4: $1.8M"
)

print(report)`,
      explanation: 'Partial templates laten je templates hergebruiken met vooraf ingevulde waarden.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-1',
      title: 'Build a Multi-Purpose Email Template System',
      description: 'Maak een template systeem voor verschillende soorten emails (welcome, reminder, support)',
      difficulty: 'medium',
      type: 'code',
      initialCode: `from langchain.prompts import PromptTemplate, ChatPromptTemplate

# TODO: Create an email template system with:
# 1. Base email template with sender, recipient, subject
# 2. Specialized templates for: welcome, reminder, support
# 3. Method to generate email based on type
# 4. Include proper formatting and tone for each type

class EmailTemplateSystem:
    def __init__(self):
        # Create your templates here
        pass
    
    def generate_email(self, email_type, **kwargs):
        # Implement email generation logic
        pass

# Test your system
email_system = EmailTemplateSystem()

# Generate different email types
welcome_email = email_system.generate_email(
    "welcome",
    recipient_name="Alice",
    product="AI Course Platform"
)

reminder_email = email_system.generate_email(
    "reminder",
    recipient_name="Bob",
    event="Webinar",
    date="March 15"
)`,
      hints: [
        'Gebruik een dictionary om verschillende template types op te slaan',
        'Overweeg ChatPromptTemplate voor meer gestructureerde emails',
        'Maak gebruik van partial() voor gemeenschappelijke elementen zoals company name',
        'Vergeet niet om input validatie toe te voegen voor veiligheid'
      ]
    }
  ]
}