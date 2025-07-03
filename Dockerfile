# Build stage
FROM node:18-alpine AS builder

# Add libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set all environment variables explicitly for the build
# These are PUBLIC values that are safe to expose
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAcVXLLoHLOlybI9FACwhC7ZV50nVOCmM0
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=groeimetai-platform.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=groeimetai-platform
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=groeimetai-platform.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1031990594888
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:1031990594888:web:c707bf22aa511a101cf77d

# Blockchain configuration
ENV NEXT_PUBLIC_BLOCKCHAIN_ENABLED=true
ENV NEXT_PUBLIC_DEFAULT_NETWORK=polygon
ENV NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON=0x9Ef945A0Bf892f239b0927758BE1a03346efe86E
ENV NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy public folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT 8080
ENV NODE_ENV production

# Start the application
CMD ["node", "server.js"]