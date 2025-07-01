# 🚀 GroeimetAI Platform - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Docker (optional, for Redis)
- Git

## 🎯 Quick Setup (5 minutes)

### 1. Clone & Install

```bash
# Clone the repository
git clone [your-repo-url]
cd groeimetai-cursus-platform

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local and add your API keys:
# - OPENAI_API_KEY (required for chatbot)
# - PINECONE_API_KEY (required for search)
# - Firebase config (for auth)
# - Mollie API key (for payments)
```

### 3. Start Development Server

```bash
# Option 1: Simple start
npm run dev

# Option 2: With automatic fixes
./fix-dev.sh

# The app will be available at http://localhost:3000
```

### 4. Test the Platform

Visit http://localhost:3000/demo to see system status and test features.

## 🤖 Chatbot Setup

### 1. Start Redis (for indexing)

```bash
docker run -d -p 6379:6379 redis:alpine
```

### 2. Index Course Content

```bash
npm run index-courses
```

### 3. Test Chatbot

- Look for the floating chat button in the bottom-right corner
- Click to open the chat
- Try asking: "Welke cursus is het beste voor beginners?"

## 📁 Project Structure

```
groeimetai-cursus-platform/
├── src/
│   ├── app/              # Next.js 14 app directory
│   ├── components/       # React components
│   │   └── CourseChat/   # Chatbot UI components
│   ├── lib/
│   │   ├── rag/          # RAG system implementation
│   │   └── data/         # Course content
│   └── services/         # Backend services
├── public/               # Static assets
├── scripts/              # Utility scripts
└── docker-compose.yml    # Docker configuration
```

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run typecheck    # Check TypeScript

# Testing
npm run test         # Run tests
npm run verify       # Verify setup

# Chatbot
npm run index-courses       # Index all courses
npm run index-courses stats # View indexing stats

# Utilities
npm run clean        # Clean build artifacts
npm run setup        # Run setup script
```

## 🐛 Troubleshooting

### "Route / not found" Error
```bash
# Run the fix script
./fix-dev.sh

# Or manually:
rm -rf .next
npm run dev
```

### Dependencies Issues
```bash
npm run clean:install
```

### Port 3000 Already in Use
```bash
# Find and kill process
lsof -i :3000
kill -9 [PID]

# Or use different port
PORT=3001 npm run dev
```

### Chatbot Not Working
1. Check API keys in .env.local
2. Ensure Redis is running
3. Run `npm run index-courses`
4. Check console for errors

## 🚀 Production Deployment

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or use deployment script
./scripts/deploy.sh production
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📚 Features Overview

- **🤖 AI Chatbot**: Intelligent course assistant with RAG
- **🔍 Course Search**: Semantic search across all content
- **📊 Recommendations**: Personalized course suggestions
- **📖 Course Viewer**: Interactive lesson viewer
- **🏆 Certificates**: Blockchain-verified certificates
- **💳 Payments**: Mollie integration for course purchases
- **📱 Responsive**: Works on all devices

## 🔗 Useful Links

- **Demo Page**: http://localhost:3000/demo
- **API Test**: http://localhost:3000/api/test
- **Health Check**: http://localhost:3000/api/health
- **Courses**: http://localhost:3000/cursussen

## 💡 Next Steps

1. **Configure API Keys**: Add all required keys to .env.local
2. **Index Courses**: Run `npm run index-courses`
3. **Test Features**: Visit /demo to verify everything works
4. **Customize**: Modify components and styling as needed
5. **Deploy**: Use Docker or Vercel for production

## 🆘 Need Help?

- Check `TROUBLESHOOTING.md` for detailed solutions
- Review `CHATBOT_IMPLEMENTATION.md` for chatbot details
- Look at error messages in the browser console
- Check server logs in the terminal

---

Happy coding! 🎉 The GroeimetAI platform is ready for development.