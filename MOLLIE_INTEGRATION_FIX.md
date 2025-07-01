# Mollie Integration Fix - Client-Side Error Resolved

## Problem
The error "Unexpected process release name undefined" occurred because the Mollie API client was being instantiated on the client-side (browser), which is not supported and poses security risks.

## Root Cause
- The `MolliePaymentService` class was being imported and instantiated in `/src/services/paymentService.ts`
- This file was imported by client-side components, causing the Mollie client to initialize in the browser
- The browser environment doesn't have the Node.js `process` object, causing the error

## Solution
Completely separated client-side and server-side payment handling:

### 1. **Server-Side Only Mollie Integration**
- Moved all Mollie API client instantiation to API routes only
- Created `/src/app/api/payments/create/route.ts` - handles payment creation with Mollie
- Created `/src/app/api/payments/status/[paymentId]/route.ts` - handles payment status checks
- Updated `/src/app/api/webhooks/mollie/route.ts` - handles Mollie webhooks with direct Mollie client

### 2. **Client-Side Payment Service**
- Refactored `/src/services/paymentService.ts` to use API calls instead of direct Mollie integration
- All payment operations now go through secure API endpoints
- Added proper authentication with Firebase ID tokens
- Removed direct Mollie imports from client-side code

### 3. **Additional API Endpoints**
- Created `/src/app/api/enrollments/check/[courseId]/route.ts` - check user enrollment
- Created `/src/app/api/enrollments/list/route.ts` - list user enrollments

### 4. **Security Improvements**
- Mollie API keys are now only used server-side (never exposed to client)
- All API endpoints require Firebase authentication
- Proper error handling and validation

## Environment Variables Required

```bash
# Server-side only (never expose to client)
MOLLIE_API_KEY=test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM

# Firebase Admin SDK for server-side operations
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Application URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Usage Flow

### Before (Problematic)
```
Client Component → PaymentService → MolliePaymentService → Mollie API (❌ Client-side)
```

### After (Secure)
```
Client Component → PaymentService (API calls) → API Route → Mollie API (✅ Server-side)
```

## API Endpoints

1. **POST /api/payments/create** - Create payment with Mollie
2. **GET /api/payments/status/[paymentId]** - Get payment status
3. **POST /api/webhooks/mollie** - Handle Mollie webhooks
4. **GET /api/enrollments/check/[courseId]** - Check enrollment
5. **GET /api/enrollments/list** - List user enrollments

## Testing
1. Set up Mollie test account and get test API key
2. Configure environment variables
3. Test payment flow through the UI
4. Verify webhooks are processed correctly

The error should now be resolved as the Mollie client is only instantiated on the server-side.