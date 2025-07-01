import { Lesson } from '@/lib/data/courses'

export const lesson24: Lesson = {
  id: 'lesson-2-4',
  title: 'Output Parsers',
  duration: '25 min',
  content: `# Output Parsers in LangChain

Output parsers zorgen voor gestructureerde, betrouwbare output van LLMs. Ze zijn essentieel voor productie-applicaties waar je data moet verwerken, valideren en integreren.

## Waarom Output Parsers?

LLMs genereren tekst, maar applicaties hebben vaak gestructureerde data nodig. Output parsers bridgen deze gap.

<iframe src="https://codesandbox.io/embed/langchain-output-parsers-intro-nl-k8m3n9?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LangChain Output Parsers Intro"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Het Probleem

\`\`\`python
# ❌ Zonder parser - onbetrouwbaar
response = llm.predict("Geef contactinfo voor Jan de Vries")
# Output kan zijn: "Jan de Vries, tel: 06-12345678" 
# Of: "Naam: Jan de Vries\nTelefoon: 06-12345678"
# Of iets heel anders...

# ✅ Met parser - gegarandeerd formaat
parser = StructuredOutputParser.from_response_schemas([
    ResponseSchema(name="naam", description="Volledige naam"),
    ResponseSchema(name="telefoon", description="Telefoonnummer")
])
result = parser.parse(response)
# Altijd: {"naam": "Jan de Vries", "telefoon": "06-12345678"}
\`\`\`

## Pydantic Integration

Pydantic biedt type safety en validatie voor je output.

<iframe src="https://codesandbox.io/embed/langchain-pydantic-parser-nl-m5k7n2?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LangChain Pydantic Parser Nederlands"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Nederlandse Business Models

\`\`\`python
from pydantic import BaseModel, Field, validator
from langchain.output_parsers import PydanticOutputParser
from typing import Optional, List
from datetime import datetime

class NederlandsAdres(BaseModel):
    straat: str = Field(description="Straatnaam")
    huisnummer: str = Field(description="Huisnummer met toevoeging")
    postcode: str = Field(description="Nederlandse postcode (1234 AB)")
    plaats: str = Field(description="Plaatsnaam")
    
    @validator('postcode')
    def validate_postcode(cls, v):
        import re
        if not re.match(r'^\d{4}\s?[A-Z]{2}$', v):
            raise ValueError('Ongeldige Nederlandse postcode')
        return v

class Bedrijf(BaseModel):
    naam: str = Field(description="Bedrijfsnaam")
    kvk_nummer: str = Field(description="KvK nummer (8 cijfers)")
    btw_nummer: Optional[str] = Field(description="BTW nummer")
    adres: NederlandsAdres
    contactpersonen: List[str] = Field(description="Namen van contactpersonen")
    
    @validator('kvk_nummer')
    def validate_kvk(cls, v):
        if not v.isdigit() or len(v) != 8:
            raise ValueError('KvK nummer moet 8 cijfers zijn')
        return v

# Parser setup
parser = PydanticOutputParser(pydantic_object=Bedrijf)

# Gebruik in chain
prompt = PromptTemplate(
    template="Extract bedrijfsinformatie:\n{format_instructions}\n{query}",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

chain = prompt | llm | parser
result = chain.invoke({
    "query": "TechNL BV, KvK 12345678, Keizersgracht 123, 1015 CJ Amsterdam"
})
# result is een gevalideerd Bedrijf object
\`\`\`

### Advanced Validation

\`\`\`python
class NederlandsContact(BaseModel):
    naam: str
    telefoon: str = Field(description="Nederlands telefoonnummer")
    email: str
    bsn: Optional[str] = Field(None, description="Burgerservicenummer")
    
    @validator('telefoon')
    def validate_phone(cls, v):
        # Nederlandse telefoon validatie
        import re
        patterns = [
            r'^06[-\s]?\d{8}$',  # Mobiel
            r'^0\d{2}[-\s]?\d{7}$',  # Vast regionaal
            r'^0\d{3}[-\s]?\d{6}$',  # Vast lokaal
            r'^\+31[-\s]?\d{9}$'  # Internationaal
        ]
        if not any(re.match(p, v.replace(' ', '')) for p in patterns):
            raise ValueError('Ongeldig Nederlands telefoonnummer')
        return v
    
    @validator('bsn')
    def validate_bsn(cls, v):
        if v is None:
            return v
        # BSN 11-proef
        if len(v) != 9 or not v.isdigit():
            return None  # Privacy: invalid BSN wordt None
        
        total = sum(int(v[i]) * (9-i) for i in range(8))
        total += int(v[8]) * -1
        
        if total % 11 != 0:
            return None
        return v
\`\`\`

## JSON en CSV Parsing

Gestructureerde data parsing voor verschillende formaten.

<iframe src="https://codesandbox.io/embed/langchain-json-csv-parser-nl-p9m5k8?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LangChain JSON CSV Parser"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### JSON Output Parser

\`\`\`python
from langchain.output_parsers import ResponseSchema, StructuredOutputParser

# Definieer schema voor Nederlandse factuur
factuur_schemas = [
    ResponseSchema(
        name="factuurnummer",
        description="Factuurnummer in formaat F-YYYY-XXXX"
    ),
    ResponseSchema(
        name="klant",
        description="Klantnaam of bedrijfsnaam"
    ),
    ResponseSchema(
        name="bedrag_excl_btw",
        description="Bedrag exclusief BTW als getal"
    ),
    ResponseSchema(
        name="btw_percentage",
        description="BTW percentage (21, 9, of 0)"
    ),
    ResponseSchema(
        name="items",
        description="Array van factuurregels"
    )
]

json_parser = StructuredOutputParser.from_response_schemas(factuur_schemas)

# Prompt met instructies
prompt = PromptTemplate(
    template="""Converteer deze factuurgegevens naar JSON:
{format_instructions}

Factuur:
{invoice_text}""",
    input_variables=["invoice_text"],
    partial_variables={"format_instructions": json_parser.get_format_instructions()}
)

# Parse factuur
chain = prompt | llm | json_parser
result = chain.invoke({
    "invoice_text": "Factuur F-2024-0042 voor Acme BV, €1000 excl 21% BTW"
})
\`\`\`

### CSV Output Parser

\`\`\`python
from langchain.output_parsers import CommaSeparatedListOutputParser

# Nederlandse product export
csv_parser = CommaSeparatedListOutputParser()

prompt = PromptTemplate(
    template="""Genereer een CSV regel voor dit product:
Kolommen: SKU,Naam,Prijs_EUR,BTW,Voorraad,Leverancier

Product: {product_description}

{format_instructions}""",
    input_variables=["product_description"],
    partial_variables={"format_instructions": csv_parser.get_format_instructions()}
)

# Custom CSV parser voor complexe data
class DutchCSVParser(BaseOutputParser):
    def parse(self, text: str) -> List[Dict]:
        lines = text.strip().split('\n')
        if len(lines) < 2:
            raise ValueError("Minimaal header en 1 data regel vereist")
        
        headers = [h.strip() for h in lines[0].split(',')]
        data = []
        
        for line in lines[1:]:
            values = [v.strip() for v in line.split(',')]
            if len(values) != len(headers):
                continue
                
            row = dict(zip(headers, values))
            
            # Nederlandse nummer formatting
            if 'prijs' in row:
                row['prijs'] = float(row['prijs'].replace(',', '.'))
            if 'datum' in row:
                row['datum'] = datetime.strptime(row['datum'], '%d-%m-%Y')
                
            data.append(row)
            
        return data
\`\`\`

## Nederlandse Data Formaten

Specifieke parsers voor Nederlandse standaarden.

<iframe src="https://codesandbox.io/embed/langchain-dutch-formats-nl-t7k9m3?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Nederlandse Data Formaten Parser"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### BSN en Postcode Parsing

\`\`\`python
class NederlandseDataParser(BaseOutputParser):
    """Parser voor Nederlandse data formaten"""
    
    def parse(self, text: str) -> Dict:
        import re
        
        result = {}
        
        # BSN extractie (met privacy)
        bsn_pattern = r'\b\d{9}\b'
        bsn_matches = re.findall(bsn_pattern, text)
        if bsn_matches:
            # Hash BSN voor privacy
            import hashlib
            result['bsn_hash'] = [
                hashlib.sha256(bsn.encode()).hexdigest()[:8] 
                for bsn in bsn_matches
            ]
        
        # Postcode extractie
        postcode_pattern = r'\b\d{4}\s?[A-Z]{2}\b'
        postcodes = re.findall(postcode_pattern, text)
        result['postcodes'] = postcodes
        
        # IBAN extractie
        iban_pattern = r'NL\d{2}[A-Z]{4}\d{10}'
        ibans = re.findall(iban_pattern, text)
        result['ibans'] = ibans
        
        # KvK nummer
        kvk_pattern = r'\b\d{8}\b'
        kvk_numbers = re.findall(kvk_pattern, text)
        result['kvk_numbers'] = kvk_numbers
        
        # Nederlandse datum formaten
        date_pattern = r'\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b'
        dates = re.findall(date_pattern, text)
        result['dates'] = [self._parse_dutch_date(d) for d in dates]
        
        return result
    
    def _parse_dutch_date(self, date_str: str) -> str:
        """Parse DD-MM-YYYY naar ISO format"""
        parts = re.split(r'[-/]', date_str)
        if len(parts) == 3:
            return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
        return date_str

# Gebruik met LangChain
parser = NederlandseDataParser()
chain = llm | parser

result = chain.invoke(
    "Jan de Vries, BSN 123456789, woont op 1015 CJ, IBAN NL91ABNA0417164300"
)
\`\`\`

### Gemeente en Provincie Parser

\`\`\`python
class GemeenteProvincieParser(PydanticOutputParser):
    class Locatie(BaseModel):
        gemeente: str
        provincie: str
        postcode: Optional[str]
        
        @validator('provincie')
        def validate_provincie(cls, v):
            provincies = [
                'Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Zeeland',
                'Noord-Brabant', 'Limburg', 'Gelderland', 'Overijssel',
                'Flevoland', 'Drenthe', 'Friesland', 'Groningen'
            ]
            if v not in provincies:
                # Fuzzy match voor typos
                from difflib import get_close_matches
                matches = get_close_matches(v, provincies, n=1, cutoff=0.8)
                if matches:
                    return matches[0]
                raise ValueError(f'Onbekende provincie: {v}')
            return v
    
    def __init__(self):
        super().__init__(pydantic_object=self.Locatie)
\`\`\`

## Error Handling

Robuuste error handling voor productie.

<iframe src="https://codesandbox.io/embed/langchain-parser-errors-nl-v5m8k7?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Parser Error Handling"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Retry en Fallback Strategies

\`\`\`python
from langchain.output_parsers import RetryWithErrorOutputParser
from langchain.schema import OutputParserException

class RobustDutchParser(BaseOutputParser):
    def __init__(self, parser, llm, max_retries=3):
        self.parser = parser
        self.retry_parser = RetryWithErrorOutputParser.from_llm(
            parser=parser,
            llm=llm,
            max_retries=max_retries
        )
    
    def parse(self, text: str) -> Any:
        try:
            # Probeer eerst normale parsing
            return self.parser.parse(text)
        except OutputParserException as e:
            # Log de error
            print(f"Parse error: {e}")
            
            # Probeer met retry parser
            try:
                return self.retry_parser.parse_with_prompt(text)
            except Exception as retry_error:
                # Fallback naar basic parsing
                return self._fallback_parse(text)
    
    def _fallback_parse(self, text: str) -> Dict:
        """Minimale parsing als alles faalt"""
        return {
            "raw_text": text,
            "parsed": False,
            "error": "Parsing failed, returning raw text"
        }

# Gebruik met error handling
def safe_parse_chain(prompt: str, parser: BaseOutputParser):
    robust_parser = RobustDutchParser(parser, llm)
    
    try:
        result = llm.predict(prompt)
        parsed = robust_parser.parse(result)
        
        # Valideer resultaat
        if isinstance(parsed, dict) and not parsed.get('parsed', True):
            # Fallback gedrag
            return handle_parse_failure(result)
            
        return parsed
        
    except Exception as e:
        # Log naar monitoring
        logger.error(f"Chain failure: {e}")
        return {"error": str(e), "status": "failed"}
\`\`\`

### Custom Error Messages

\`\`\`python
class DutchErrorParser(BaseOutputParser):
    def parse(self, text: str) -> Dict:
        try:
            # Normale parsing logic
            return json.loads(text)
        except json.JSONDecodeError as e:
            # Nederlandse error messages
            if "Expecting property name" in str(e):
                raise OutputParserException(
                    "Ongeldige JSON: property naam verwacht. "
                    "Controleer of alle velden tussen quotes staan."
                )
            elif "Expecting value" in str(e):
                raise OutputParserException(
                    "Ongeldige JSON: waarde verwacht. "
                    "Mogelijk ontbreekt er een waarde na een dubbele punt."
                )
            else:
                raise OutputParserException(
                    f"JSON parsing mislukt: {str(e)}. "
                    "Controleer de JSON syntax."
                )
\`\`\`

## Best Practices

1. **Type Safety First**: Gebruik altijd Pydantic voor complexe data
2. **Validatie is Key**: Valideer Nederlandse formaten strikt (BSN, postcode, KvK)
3. **Privacy by Design**: Hash of verwijder gevoelige data direct
4. **Error Recovery**: Implementeer altijd fallback strategieën
5. **Clear Instructions**: Geef duidelijke format instructies aan de LLM

## Oefeningen

1. Bouw een parser voor Nederlandse belastingaangiftes met BTW berekening
2. Creëer een IBAN validator die ook de bank identificeert
3. Implementeer een parser voor DigiD berichten met privacy waarborging
4. Maak een robuuste adres parser die ook oude postcodes (zonder spatie) accepteert`
}