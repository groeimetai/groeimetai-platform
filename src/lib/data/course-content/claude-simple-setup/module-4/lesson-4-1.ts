import type { Lesson } from '@/lib/data/courses';

export const lesson4_1: Lesson = {
  id: 'lesson-4-1',
  title: 'Development environment setup',
  duration: '30 min',
  content: `
# Development Environment Setup

In deze les zetten we een professionele ontwikkelomgeving op voor het bouwen van Claude integraties. We behandelen de installatie van SDKs, configuratie van API keys, en best practices voor projectstructuur.

## Overzicht van de les

- **Installatie van SDKs** (Python en TypeScript)
- **API key configuratie** en beveiliging
- **Project structuur** best practices
- **Development tools** setup
- **Testing framework** configuratie

## 1. SDK Installatie

### Python SDK Setup

#### Systeemvereisten
- Python 3.8 of hoger
- pip package manager
- Virtual environment tool (venv of conda)

#### Installatiestappen

1. **Maak een nieuwe project directory**:
\`\`\`bash
mkdir mijn-claude-project
cd mijn-claude-project
\`\`\`

2. **Creëer een virtual environment**:
\`\`\`bash
# Met venv
python -m venv venv

# Activeer de environment
# Op macOS/Linux:
source venv/bin/activate

# Op Windows:
venv\\Scripts\\activate
\`\`\`

3. **Installeer de Anthropic SDK**:
\`\`\`bash
pip install anthropic
\`\`\`

4. **Installeer development dependencies**:
\`\`\`bash
pip install python-dotenv pytest black flake8 mypy
\`\`\`

5. **Genereer requirements.txt**:
\`\`\`bash
pip freeze > requirements.txt
\`\`\`

### TypeScript SDK Setup

#### Systeemvereisten
- Node.js 16 of hoger
- npm of yarn package manager
- TypeScript 4.5 of hoger

#### Installatiestappen

1. **Initialiseer een nieuw project**:
\`\`\`bash
mkdir mijn-claude-project-ts
cd mijn-claude-project-ts
npm init -y
\`\`\`

2. **Installeer TypeScript en de Anthropic SDK**:
\`\`\`bash
npm install typescript @anthropic-ai/sdk
npm install --save-dev @types/node tsx nodemon
\`\`\`

3. **Configureer TypeScript**:
\`\`\`bash
npx tsc --init
\`\`\`

4. **Update tsconfig.json**:
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

## 2. API Key Configuratie

### Veilige API key opslag

**BELANGRIJK**: Sla NOOIT je API key op in je broncode of version control!

#### Python configuratie

1. **Maak een .env bestand**:
\`\`\`bash
touch .env
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env
\`\`\`

2. **Voeg .env toe aan .gitignore**:
\`\`\`bash
echo ".env" >> .gitignore
\`\`\`

3. **Laad environment variables**:
\`\`\`python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY niet gevonden in environment variables")
\`\`\`

#### TypeScript configuratie

1. **Installeer dotenv**:
\`\`\`bash
npm install dotenv
\`\`\`

2. **Maak een .env bestand**:
\`\`\`bash
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
echo ".env" >> .gitignore
\`\`\`

3. **Configureer environment loading**:
\`\`\`typescript
// src/config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};

if (!config.anthropicApiKey) {
  throw new Error('ANTHROPIC_API_KEY is niet ingesteld');
}
\`\`\`

## 3. Project Structuur Best Practices

### Python Project Structuur

\`\`\`
mijn-claude-project/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── claude_client.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── helpers.py
│   └── models/
│       ├── __init__.py
│       └── responses.py
├── tests/
│   ├── __init__.py
│   ├── test_claude_client.py
│   └── test_utils.py
├── config/
│   └── config.py
├── scripts/
│   └── setup.sh
├── .env
├── .gitignore
├── requirements.txt
├── README.md
└── pytest.ini
\`\`\`

### TypeScript Project Structuur

\`\`\`
mijn-claude-project-ts/
├── src/
│   ├── index.ts
│   ├── claudeClient.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── config/
│       └── index.ts
├── tests/
│   ├── claudeClient.test.ts
│   └── utils.test.ts
├── dist/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
\`\`\`

## 4. Development Tools Setup

### Python Development Tools

**Setup script (scripts/setup.sh)**:
\`\`\`bash
#!/bin/bash

# Maak virtual environment
python -m venv venv
source venv/bin/activate

# Installeer dependencies
pip install -r requirements.txt

# Setup pre-commit hooks
pip install pre-commit
pre-commit install

# Configureer code formatting
cat > .flake8 << EOF
[flake8]
max-line-length = 88
extend-ignore = E203, W503
exclude = .git,__pycache__,venv
EOF

# Configureer pytest
cat > pytest.ini << EOF
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
EOF

echo "Development environment setup voltooid!"
\`\`\`

### TypeScript Development Tools

**Package.json scripts**:
\`\`\`json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write 'src/**/*.ts'"
  }
}
\`\`\`

**ESLint configuratie (.eslintrc.json)**:
\`\`\`json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
\`\`\`

## 5. Testing Setup

### Python Testing met pytest

**Voorbeeld test bestand (tests/test_claude_client.py)**:
\`\`\`python
import pytest
from unittest.mock import Mock, patch
from src.claude_client import ClaudeClient

@pytest.fixture
def mock_client():
    with patch('anthropic.Anthropic') as mock:
        client = ClaudeClient()
        yield client, mock

def test_create_message(mock_client):
    client, mock_anthropic = mock_client
    
    # Mock de response
    mock_response = Mock()
    mock_response.content = [Mock(text="Test response")]
    mock_anthropic.return_value.messages.create.return_value = mock_response
    
    # Test de functie
    response = client.send_message("Test prompt")
    
    assert response == "Test response"
    mock_anthropic.return_value.messages.create.assert_called_once()

def test_api_key_validation():
    with pytest.raises(ValueError):
        with patch.dict('os.environ', {}, clear=True):
            ClaudeClient()
\`\`\`

### TypeScript Testing met Jest

**Jest configuratie (jest.config.js)**:
\`\`\`javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
\`\`\`

**Voorbeeld test (tests/claudeClient.test.ts)**:
\`\`\`typescript
import { ClaudeClient } from '../src/claudeClient';
import { Anthropic } from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');

describe('ClaudeClient', () => {
  let client: ClaudeClient;
  let mockAnthropic: jest.Mocked<Anthropic>;

  beforeEach(() => {
    mockAnthropic = new Anthropic({ apiKey: 'test-key' }) as jest.Mocked<Anthropic>;
    client = new ClaudeClient();
  });

  test('should send message successfully', async () => {
    const mockResponse = {
      content: [{ text: 'Test response' }],
    };

    mockAnthropic.messages.create = jest.fn().mockResolvedValue(mockResponse);

    const result = await client.sendMessage('Test prompt');

    expect(result).toBe('Test response');
    expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
      model: 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: 'Test prompt' }],
    });
  });

  test('should handle API errors', async () => {
    mockAnthropic.messages.create = jest.fn().mockRejectedValue(new Error('API Error'));

    await expect(client.sendMessage('Test')).rejects.toThrow('API Error');
  });
});
\`\`\`

## Quick Start Scripts

### Python Quick Start

Maak een bestand **quick-start.py**:
\`\`\`python
#!/usr/bin/env python3
"""
Claude API Quick Start Script
Test je setup met een simpele prompt
"""

import os
from anthropic import Anthropic
from dotenv import load_dotenv

def main():
    # Laad environment variables
    load_dotenv()
    
    # Initialiseer de client
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    try:
        # Stuur een test bericht
        response = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": "Zeg 'Hallo! Je Claude integratie werkt perfect!' in het Nederlands."
            }]
        )
        
        print("✅ Succes! Claude antwoordt:")
        print(response.content[0].text)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Controleer of je API key correct is ingesteld in .env")

if __name__ == "__main__":
    main()
\`\`\`

### TypeScript Quick Start

Maak een bestand **src/quick-start.ts**:
\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Laad environment variables
dotenv.config();

async function main() {
  try {
    // Initialiseer de client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Stuur een test bericht
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Zeg "Hallo! Je Claude integratie werkt perfect!" in het Nederlands.',
      }],
    });

    console.log('✅ Succes! Claude antwoordt:');
    console.log(response.content[0].text);

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('Controleer of je API key correct is ingesteld in .env');
  }
}

main();
\`\`\`

## Samenvatting en volgende stappen

Je hebt nu een complete development environment opgezet met:

✅ **SDK geïnstalleerd** voor Python of TypeScript  
✅ **API key veilig geconfigureerd** met environment variables  
✅ **Professionele projectstructuur** opgezet  
✅ **Development tools** geconfigureerd (linting, formatting)  
✅ **Testing framework** geïnstalleerd en geconfigureerd  

### Checklist voor je setup

- [ ] Virtual environment of node_modules aangemaakt
- [ ] Anthropic SDK geïnstalleerd
- [ ] .env bestand met API key aangemaakt
- [ ] .gitignore geconfigureerd
- [ ] Project structuur opgezet
- [ ] Testing framework werkt
- [ ] Quick start script draait succesvol

### Troubleshooting

**Probleem**: "API key niet gevonden"
- Controleer of .env bestand bestaat
- Zorg dat je de environment variables laadt
- Herstart je terminal/IDE

**Probleem**: "Import errors"
- Controleer of alle packages geïnstalleerd zijn
- Verifieer je Python/Node versie
- Activeer je virtual environment

In de volgende les gaan we onze eerste echte Claude integratie bouwen!
  `
};