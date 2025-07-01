import { Lesson } from '@/lib/data/courses'

export const lesson22: Lesson = {
  id: 'lesson-2-2',
  title: 'Output Parsers voor structured data',
  duration: '30 min',
  content: `# Output Parsers voor Structured Data

LLMs genereren tekst, maar jouw applicatie heeft vaak structured data nodig. Output Parsers zijn de brug tussen AI-generated tekst en bruikbare data structures.

## Het Probleem: Van Tekst naar Data

### Zonder Output Parsers

\`\`\`python
# ❌ Fragiele string parsing
response = llm.invoke("List 3 benefits of exercise")
# Output: "1. Better health\\n2. More energy\\n3. Improved mood"

# Manual parsing = error prone
benefits = response.split("\\n")
benefits = [b.split(". ")[1] for b in benefits]  # Breekt bij andere formatting!
\`\`\`

### Met Output Parsers

\`\`\`python
from langchain.output_parsers import CommaSeparatedListOutputParser

# ✅ Robuuste parsing
parser = CommaSeparatedListOutputParser()
prompt = PromptTemplate(
    template="List 3 benefits of exercise.\\n{format_instructions}",
    input_variables=[],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)
\`\`\`

## Types Output Parsers

### 1. List Output Parser

\`\`\`python
from langchain.output_parsers import CommaSeparatedListOutputParser

# Setup parser
list_parser = CommaSeparatedListOutputParser()

# Create prompt with instructions
prompt = PromptTemplate(
    template="List 5 programming languages for {use_case}.\\n{format_instructions}",
    input_variables=["use_case"],
    partial_variables={"format_instructions": list_parser.get_format_instructions()}
)

# Use with LLM
from langchain.llms import OpenAI
llm = OpenAI(temperature=0)

# Generate and parse
_input = prompt.format(use_case="web development")
output = llm.invoke(_input)
parsed = list_parser.parse(output)
# Result: ['JavaScript', 'Python', 'Ruby', 'PHP', 'Java']
\`\`\`

### 2. JSON Output Parser

\`\`\`python
from langchain.output_parsers import ResponseSchema, StructuredOutputParser

# Define expected structure
response_schemas = [
    ResponseSchema(name="name", description="name of the person"),
    ResponseSchema(name="age", description="age of the person"),
    ResponseSchema(name="occupation", description="occupation of the person")
]

# Create parser
json_parser = StructuredOutputParser.from_response_schemas(response_schemas)

# Build prompt
prompt = PromptTemplate(
    template="Extract information about the person from this text:\\n{text}\\n{format_instructions}",
    input_variables=["text"],
    partial_variables={"format_instructions": json_parser.get_format_instructions()}
)

# Parse response
text = "John Smith is a 35-year-old software engineer living in Amsterdam."
_input = prompt.format(text=text)
output = llm.invoke(_input)
parsed = json_parser.parse(output)
# Result: {'name': 'John Smith', 'age': 35, 'occupation': 'software engineer'}
\`\`\`

### 3. Pydantic Parser (Recommended!)

\`\`\`python
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field, validator
from typing import List

# Define data model
class ProductReview(BaseModel):
    product_name: str = Field(description="name of the product")
    rating: int = Field(description="rating from 1 to 5")
    pros: List[str] = Field(description="list of positive aspects")
    cons: List[str] = Field(description="list of negative aspects")
    recommendation: bool = Field(description="whether the reviewer recommends it")
    
    @validator('rating')
    def rating_range(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

# Create parser
pydantic_parser = PydanticOutputParser(pydantic_object=ProductReview)

# Build prompt
prompt = PromptTemplate(
    template="Analyze this product review:\\n{review}\\n{format_instructions}",
    input_variables=["review"],
    partial_variables={"format_instructions": pydantic_parser.get_format_instructions()}
)

# Use it
review_text = """
The new iPhone 15 Pro is amazing! The camera quality is outstanding 
and the battery life has improved significantly. However, it's quite 
expensive and the changes from iPhone 14 Pro are minimal. 
Overall, I'd recommend it for photography enthusiasts. 4.5/5 stars.
"""

_input = prompt.format(review=review_text)
output = llm.invoke(_input)
parsed_review = pydantic_parser.parse(output)
# Result: ProductReview object with validated data
\`\`\`

## Advanced Parsing Techniques

### Retry Parsing with Corrections

\`\`\`python
from langchain.output_parsers import OutputFixingParser

# Original parser that might fail
original_parser = PydanticOutputParser(pydantic_object=ProductReview)

# Wrap with fixing parser
fixing_parser = OutputFixingParser.from_llm(
    parser=original_parser,
    llm=llm
)

# If parsing fails, it automatically asks LLM to fix the format
malformed_output = """
{
    "product_name": "iPhone 15 Pro",
    "rating": "4.5",  # Wrong type - should be int
    "pros": "Great camera, good battery",  # Wrong type - should be list
    "cons": ["Expensive"],
    "recommendation": "yes"  # Wrong type - should be boolean
}
"""

# Fixing parser will correct these issues
fixed_result = fixing_parser.parse(malformed_output)
\`\`\`

### Custom Output Parser

\`\`\`python
from langchain.schema import BaseOutputParser
from typing import Dict, Any
import re

class MarkdownTableParser(BaseOutputParser[List[Dict[str, Any]]]):
    """Parse markdown tables to list of dictionaries"""
    
    def parse(self, text: str) -> List[Dict[str, Any]]:
        lines = text.strip().split('\\n')
        
        # Find table
        table_lines = []
        in_table = False
        for line in lines:
            if '|' in line:
                in_table = True
                table_lines.append(line)
            elif in_table and '|' not in line:
                break
        
        if len(table_lines) < 2:
            raise ValueError("No valid markdown table found")
        
        # Parse headers
        headers = [h.strip() for h in table_lines[0].split('|')[1:-1]]
        
        # Parse rows
        results = []
        for line in table_lines[2:]:  # Skip header separator
            values = [v.strip() for v in line.split('|')[1:-1]]
            if len(values) == len(headers):
                results.append(dict(zip(headers, values)))
        
        return results
    
    def get_format_instructions(self) -> str:
        return """Format your response as a markdown table with headers.
Example:
| Column1 | Column2 | Column3 |
|---------|---------|---------|
| Value1  | Value2  | Value3  |"""

# Use custom parser
table_parser = MarkdownTableParser()
prompt = PromptTemplate(
    template="Create a comparison table of {item1} vs {item2}.\\n{format_instructions}",
    input_variables=["item1", "item2"],
    partial_variables={"format_instructions": table_parser.get_format_instructions()}
)
\`\`\`

### Enum Parser for Categories

\`\`\`python
from enum import Enum
from langchain.output_parsers import EnumOutputParser

class SentimentType(Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

# Create enum parser
sentiment_parser = EnumOutputParser(enum=SentimentType)

prompt = PromptTemplate(
    template="Analyze the sentiment of this text: {text}\\n{format_instructions}",
    input_variables=["text"],
    partial_variables={"format_instructions": sentiment_parser.get_format_instructions()}
)

# Parse sentiment
text = "The product works okay, nothing special but does the job."
_input = prompt.format(text=text)
output = llm.invoke(_input)
sentiment = sentiment_parser.parse(output)
# Result: SentimentType.NEUTRAL
\`\`\`

## Combining Parsers with Chains

\`\`\`python
from langchain.chains import LLMChain

# Create analysis chain with structured output
class AnalysisResult(BaseModel):
    summary: str = Field(description="brief summary")
    key_points: List[str] = Field(description="main points")
    sentiment: str = Field(description="overall sentiment")
    action_items: List[str] = Field(description="recommended actions")

parser = PydanticOutputParser(pydantic_object=AnalysisResult)

analysis_prompt = PromptTemplate(
    template="""Analyze this business report:
{report}

{format_instructions}""",
    input_variables=["report"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

# Create chain
analysis_chain = LLMChain(
    llm=llm,
    prompt=analysis_prompt,
    output_parser=parser
)

# Run analysis
report = "Q4 sales increased by 15%. Customer satisfaction is up..."
result = analysis_chain.run(report=report)
# Result is AnalysisResult object, not string!
\`\`\`

## Error Handling Best Practices

\`\`\`python
from langchain.output_parsers import RetryWithErrorOutputParser

def safe_parse(parser, llm, prompt, max_retries=3):
    """Safely parse output with retries"""
    retry_parser = RetryWithErrorOutputParser.from_llm(
        parser=parser,
        llm=llm,
        max_retries=max_retries
    )
    
    try:
        # Try original parser first
        output = llm.invoke(prompt)
        return parser.parse(output)
    except Exception as e:
        print(f"Initial parsing failed: {e}")
        # Use retry parser
        return retry_parser.parse_with_prompt(output, prompt)

# Usage
result = safe_parse(pydantic_parser, llm, formatted_prompt)
\`\`\`

## Tips voor Production

1. **Always Use Pydantic**: Type safety en validation zijn cruciaal
2. **Include Examples**: In je format instructions voor betere results
3. **Handle Failures**: Gebruik RetryWithErrorOutputParser
4. **Log Everything**: Track parsing failures voor debugging
5. **Version Your Schemas**: Data structures evolueren

Output Parsers maken het verschil tussen een demo en een production-ready applicatie!
`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Pydantic Parser voor Product Data',
      language: 'python',
      code: `from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional

# Define product data structure
class Product(BaseModel):
    name: str = Field(description="product name")
    category: str = Field(description="product category")
    price: float = Field(description="price in euros")
    in_stock: bool = Field(description="availability status")
    features: List[str] = Field(description="list of key features")
    rating: Optional[float] = Field(description="average rating 0-5", default=None)

# Create parser
parser = PydanticOutputParser(pydantic_object=Product)

# Build prompt with format instructions
from langchain.prompts import PromptTemplate

prompt = PromptTemplate(
    template="""Extract product information from this description:

{description}

{format_instructions}""",
    input_variables=["description"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

# Example usage
description = """
The EcoSmart Water Bottle is our latest sustainable drinkware solution. 
Priced at €24.99, this reusable bottle features: double-wall insulation, 
BPA-free materials, and a lifetime warranty. Currently in stock. 
Category: Outdoor Gear. Rated 4.5/5 stars by customers.
"""

# Format and parse
formatted_prompt = prompt.format(description=description)
# Assume llm output here
parsed_product = parser.parse(llm_output)`,
      explanation: 'Pydantic parser met type safety en validation voor structured product data extraction.'
    },
    {
      id: 'example-2',
      title: 'JSON Parser met Error Handling',
      language: 'python',
      code: `from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain.output_parsers import OutputFixingParser

# Define expected JSON structure
response_schemas = [
    ResponseSchema(
        name="tasks",
        description="list of tasks to complete",
        type="List[str]"
    ),
    ResponseSchema(
        name="priority",
        description="priority level (high/medium/low)"
    ),
    ResponseSchema(
        name="estimated_hours",
        description="total hours needed",
        type="float"
    ),
    ResponseSchema(
        name="assigned_to",
        description="person responsible"
    )
]

# Create base parser
base_parser = StructuredOutputParser.from_response_schemas(response_schemas)

# Wrap with fixing parser for robustness
from langchain.llms import OpenAI
llm = OpenAI(temperature=0)

fixing_parser = OutputFixingParser.from_llm(
    parser=base_parser,
    llm=llm
)

# Build prompt
prompt = PromptTemplate(
    template="""Convert this project brief into structured data:

{brief}

{format_instructions}""",
    input_variables=["brief"],
    partial_variables={"format_instructions": base_parser.get_format_instructions()}
)

# Parse with automatic fixing
brief = "We need to update the website homepage by Friday. High priority! Sarah will handle it, should take about 6 hours."
formatted = prompt.format(brief=brief)

# Even if LLM output is malformed, fixing_parser will correct it
result = fixing_parser.parse(llm_output)`,
      explanation: 'JSON parser met automatic error correction voor resilient data extraction.'
    },
    {
      id: 'example-3',
      title: 'Custom Parser voor Specifieke Formats',
      language: 'python',
      code: `from langchain.schema import BaseOutputParser
import re
from typing import Dict, List

class RecipeParser(BaseOutputParser[Dict]):
    """Parse recipe format into structured data"""
    
    def parse(self, text: str) -> Dict:
        recipe = {
            "title": "",
            "ingredients": [],
            "steps": [],
            "prep_time": "",
            "cook_time": ""
        }
        
        # Extract title
        title_match = re.search(r'Recipe: (.+?)\\n', text)
        if title_match:
            recipe["title"] = title_match.group(1)
        
        # Extract ingredients
        ingredients_section = re.search(r'Ingredients:\\n(.*?)\\n\\nSteps:', text, re.DOTALL)
        if ingredients_section:
            ingredients = ingredients_section.group(1).strip().split('\\n')
            recipe["ingredients"] = [i.strip('- ') for i in ingredients]
        
        # Extract steps
        steps_section = re.search(r'Steps:\\n(.*?)\\n\\n', text, re.DOTALL)
        if steps_section:
            steps = steps_section.group(1).strip().split('\\n')
            recipe["steps"] = [s.strip() for s in steps if s.strip()]
        
        # Extract times
        prep_match = re.search(r'Prep time: (\\d+ \\w+)', text)
        if prep_match:
            recipe["prep_time"] = prep_match.group(1)
            
        cook_match = re.search(r'Cook time: (\\d+ \\w+)', text)
        if cook_match:
            recipe["cook_time"] = cook_match.group(1)
        
        return recipe
    
    def get_format_instructions(self) -> str:
        return """Format the recipe as follows:
Recipe: [Recipe Name]

Ingredients:
- Ingredient 1
- Ingredient 2
- etc.

Steps:
1. First step
2. Second step
3. etc.

Prep time: X minutes
Cook time: Y minutes"""

# Use the custom parser
recipe_parser = RecipeParser()
prompt = PromptTemplate(
    template="Convert this dish into a recipe format: {dish}\\n\\n{format_instructions}",
    input_variables=["dish"],
    partial_variables={"format_instructions": recipe_parser.get_format_instructions()}
)`,
      explanation: 'Custom parser voor specifieke text formats zoals recipes, met regex parsing.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-2',
      title: 'Build a Multi-Format Data Extractor',
      description: 'Maak een systeem dat verschillende soorten data uit tekst kan extraheren met verschillende parsers',
      difficulty: 'medium',
      type: 'code',
      initialCode: `from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import enum

# TODO: Create a data extraction system that can:
# 1. Extract contact information (name, email, phone, company)
# 2. Extract meeting details (date, time, participants, agenda)
# 3. Extract task lists (task, assignee, deadline, priority)
# 4. Automatically detect which type of data to extract

class ContactInfo(BaseModel):
    # Define contact structure
    pass

class MeetingDetails(BaseModel):
    # Define meeting structure
    pass

class TaskItem(BaseModel):
    # Define task structure
    pass

class DataExtractor:
    def __init__(self):
        # Initialize parsers for each data type
        pass
    
    def detect_data_type(self, text: str) -> str:
        """Detect what type of data the text contains"""
        # Implement detection logic
        pass
    
    def extract(self, text: str) -> Dict:
        """Extract structured data based on content type"""
        # Implement extraction logic
        pass

# Test your extractor
extractor = DataExtractor()

# Test with different text types
contact_text = "John Smith, CEO at TechCorp. Email: john@techcorp.com, Phone: +31 6 12345678"
meeting_text = "Team standup tomorrow at 10 AM with Sarah, Mike, and Lisa. Agenda: Sprint planning"
task_text = "TODO: Fix login bug (John, deadline Friday, high priority), Update docs (Sarah, next week, low)"`,
      hints: [
        'Gebruik keywords om data type te detecteren (email, meeting, TODO, etc.)',
        'Maak een parser instance voor elk data type in __init__',
        'Overweeg een fallback parser als geen type wordt gedetecteerd',
        'Test met edge cases zoals mixed content of unclear formats'
      ]
    }
  ]
}