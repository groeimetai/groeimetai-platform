# GroeimetAI Payment Integration Documentation

## Overview

The GroeimetAI platform uses Mollie as the payment provider to handle course purchases. This document outlines the complete payment integration setup and flow.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Mollie Configuration
NEXT_PUBLIC_MOLLIE_API_KEY=your_mollie_api_key_here
MOLLIE_API_KEY=your_mollie_api_key_here

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000 # In production: https://your-domain.com

# Firebase Admin SDK (for API routes)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email Configuration (for Cloud Functions)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

## Payment Flow

### 1. User Initiates Purchase
- User clicks "Koop cursus" (Buy course) on the course detail page
- System checks if user is logged in (redirects to login if not)
- User is directed to the checkout page

### 2. Checkout Page
- User fills in billing information
- Optional: Apply discount code
- User clicks "Doorgaan naar betaling" (Continue to payment)

### 3. Payment Processing
- System creates a payment request with Mollie
- User is redirected to Mollie's secure checkout
- User completes payment (iDEAL, credit card, etc.)

### 4. Payment Confirmation
- Mollie redirects user back to `/payment/complete?paymentId=xxx`
- System checks payment status
- Mollie sends webhook to confirm payment

### 5. Course Access
- Upon successful payment:
  - User enrollment is created
  - Access to course is granted
  - Confirmation emails are sent
  - User can immediately start the course

## File Structure

### Frontend Components
- `/src/app/checkout/page.tsx` - Checkout page with billing form
- `/src/app/payment/complete/page.tsx` - Payment completion page
- `/src/components/courses/CourseHeader.tsx` - Updated with buy button
- `/src/services/paymentService.ts` - Payment service logic

### API Routes
- `/src/app/api/checkout/route.ts` - Creates payment session
- `/src/app/api/payment/status/route.ts` - Checks payment status
- `/src/app/api/webhooks/mollie/route.ts` - Handles Mollie webhooks

### Cloud Functions
- `/functions/src/index.ts` - Webhook processing and email notifications

### Core Integration
- `/payments/mollie-integration.ts` - Main Mollie integration logic

## Setting Up Mollie

### 1. Create Mollie Account
1. Go to [mollie.com](https://www.mollie.com)
2. Sign up for a business account
3. Complete verification process

### 2. Get API Keys
1. Log into Mollie Dashboard
2. Go to Settings > API keys
3. Copy your Test API key for development
4. Copy your Live API key for production

### 3. Configure Webhook URL
1. In Mollie Dashboard, go to Settings > Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/mollie`
3. For Cloud Functions: `https://region-project.cloudfunctions.net/mollieWebhook`

### 4. Enable Payment Methods
1. Go to Settings > Payment methods
2. Enable desired payment methods:
   - iDEAL (Netherlands)
   - Credit Card
   - PayPal
   - Bancontact (Belgium)
   - And more...

## Security Considerations

### 1. API Key Security
- Never expose API keys in client-side code
- Use environment variables
- Different keys for test/production

### 2. Webhook Verification
- Implement webhook signature verification (in production)
- Validate webhook source IP addresses
- Use HTTPS for all endpoints

### 3. Payment Data
- Never store sensitive payment data
- Let Mollie handle all payment processing
- Only store payment IDs and status

## Testing

### Test Payment Methods
Use these test credentials in Mollie test mode:

**iDEAL:**
- Select any test bank
- Complete flow with test credentials

**Credit Card:**
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVC: Any 3 digits

### Test Scenarios
1. Successful payment
2. Failed payment
3. Cancelled payment
4. Expired payment

## Deployment

### 1. Deploy Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### 2. Update Environment Variables
- Add production Mollie API key
- Update APP_URL to production domain
- Configure email credentials

### 3. Update Webhook URLs
- Update Mollie webhook settings
- Point to production endpoints

## Monitoring

### Payment Dashboard
Monitor payments in Mollie Dashboard:
- Transaction history
- Settlement reports
- Refund management
- Analytics

### Application Monitoring
- Check Firestore for payment records
- Monitor Cloud Functions logs
- Track enrollment creation

## Support

### Common Issues
1. **Payment not completing:** Check webhook configuration
2. **Email not sending:** Verify email credentials
3. **User not enrolled:** Check Cloud Function logs

### Debug Steps
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check Mollie Dashboard for payment status
4. Review Cloud Functions logs

## Future Enhancements

1. **Subscription Payments**
   - Implement recurring payments
   - Manage subscription lifecycle

2. **Multiple Currencies**
   - Dynamic currency conversion
   - Localized pricing

3. **Advanced Discounts**
   - Coupon management system
   - Time-limited offers
   - Bundle discounts

4. **Payment Analytics**
   - Conversion tracking
   - Revenue reporting
   - Student analytics