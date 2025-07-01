# 🚀 GroeimetAI Platform Starten

## Quick Start

```bash
# 1. Navigeer naar project directory
cd /Users/nielsvanderwerf/Projects/groeimetai-cursus-platform

# 2. Start de development server
npm run dev

# Of op een specifieke poort:
PORT=3002 npm run dev
```

## Platform URLs

- **Homepage**: http://localhost:3000
- **Cursussen**: http://localhost:3000/cursussen
- **Dashboard**: http://localhost:3000/dashboard
- **Author Dashboard**: http://localhost:3000/author/dashboard

## Troubleshooting

### Port al in gebruik?
```bash
# Check welke app poort 3000 gebruikt
lsof -i :3000

# Kill process op poort 3000
kill -9 $(lsof -t -i:3000)

# Of start op andere poort
PORT=3002 npm run dev
```

### TypeScript errors?
```bash
# Check errors
npm run typecheck

# Clear cache en rebuild
rm -rf .next
npm run dev
```

### Firebase errors?
- Check `.env.local` file voor juiste credentials
- Zie `ENVIRONMENT_SETUP.md` voor details

## Platform Features

### Voor Gebruikers:
- ✅ 15+ AI cursussen
- ✅ Video lessen met progress tracking
- ✅ Code voorbeelden en opdrachten
- ✅ Blockchain-verified certificaten
- ✅ Persoonlijk dashboard

### Voor Authors:
- ✅ Upload eigen cursussen
- ✅ Revenue sharing (85% voor author)
- ✅ Analytics dashboard
- ✅ Affiliate programma
- ✅ Automatische uitbetalingen

### Admin Features:
- ✅ Platform analytics
- ✅ User management
- ✅ Payment processing via Mollie
- ✅ Firebase backend

## Development Commands

```bash
# Start development server
npm run dev

# Build voor productie
npm run build

# Start productie server
npm start

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Environment Variables

Zorg dat `.env.local` alle vereiste variabelen bevat:
- Firebase credentials
- Mollie API keys
- App URLs

Zie `.env.example` voor template.