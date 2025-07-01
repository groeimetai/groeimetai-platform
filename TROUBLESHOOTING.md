# Troubleshooting Guide

## Problem: "Route / not found" error

### Mogelijke oplossingen:

1. **Check of er een andere service op port 3000 draait:**
   ```bash
   lsof -i :3000
   ```
   Als er iets draait, stop het met:
   ```bash
   kill -9 <PID>
   ```

2. **Clean build en herstart:**
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run dev
   ```

3. **Gebruik het start script:**
   ```bash
   ./start-dev.sh
   ```

4. **Check de logs:**
   ```bash
   npm run dev
   ```
   Kijk naar eventuele error messages in de console.

5. **Test met de debug server:**
   ```bash
   node debug-server.js
   ```
   Dit controleert wat er op port 3000 draait.

6. **Probeer een andere port:**
   ```bash
   PORT=3001 npm run dev
   ```

## Problem: "tsx: command not found"

### Oplossing:

Gebruik het JavaScript indexeer script:
```bash
npm run index-courses
```

Of installeer alle dependencies opnieuw:
```bash
npm install
```

## Als Next.js niet start:

1. **Check Node.js versie:**
   ```bash
   node --version
   ```
   Je hebt Node.js 18+ nodig.

2. **Check of alle dependencies geïnstalleerd zijn:**
   ```bash
   npm install
   ```

3. **Verwijder cache en probeer opnieuw:**
   ```bash
   rm -rf .next
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm run dev
   ```

## Als je de error "Cannot find module" krijgt:

1. **Installeer missing dependencies:**
   ```bash
   npm install
   ```

2. **Check TypeScript configuratie:**
   ```bash
   npm run typecheck
   ```

## Voor de chatbot functionaliteit:

1. **Start Redis eerst:**
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Check environment variables:**
   - Kopieer `.env.example` naar `.env.local`
   - Vul alle required API keys in

3. **Index de cursussen:**
   ```bash
   npm run index-courses
   ```