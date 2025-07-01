/**
 * GroeimetAI Platform - Mollie Payment Integration Architecture
 * Comprehensive payment processing system with Mollie API
 */

import { createMollieClient, PaymentMethod, PaymentStatus, RefundStatus } from '@mollie/api-client';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  serverTimestamp,
  runTransaction,
  Timestamp,
  increment,
  query,
  where,
  limit,
  getDocs
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db } from '@/lib/firebase';

// ============================================================================
// Payment Types and Interfaces
// ============================================================================

export interface PaymentRequest {
  courseId: string;
  userId: string;
  amount: number;
  currency: 'EUR' | 'USD' | 'GBP';
  method?: PaymentMethod;
  description: string;
  billingAddress: BillingAddress;
  discountCode?: string;
  metadata?: Record<string, any>;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  street: string;
  streetAdditional?: string;
  city: string;
  postalCode: string;
  country: string;
  region?: string;
  vatNumber?: string;
  phone?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  status?: PaymentStatus;
  error?: PaymentError;
  requiresAction?: boolean;
  nextAction?: {
    type: 'redirect' | '3ds' | 'voucher';
    url?: string;
    instructions?: string;
  };
}

export interface PaymentError {
  code: string;
  message: string;
  userFriendlyMessage: string;
  retryable: boolean;
  details?: any;
}

export interface WebhookPayload {
  id: string;
  resource: string;
  _links: {
    self: {
      href: string;
      type: string;
    };
    documentation: {
      href: string;
      type: string;
    };
  };
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  status?: RefundStatus;
  error?: PaymentError;
}

// ============================================================================
// Payment Service Class
// ============================================================================

export class MolliePaymentService {
  private mollieClient: any;
  private webhookUrl: string;
  private redirectUrl: string;
  private testMode: boolean;

  constructor(apiKey: string, testMode: boolean = false) {
    this.mollieClient = createMollieClient({ apiKey });
    this.testMode = testMode;
    this.webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`;
    this.redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/complete`;
  }

  // ============================================================================
  // Payment Creation and Processing
  // ============================================================================

  public async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate request
      const validation = await this.validatePaymentRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'validation-error',
            message: validation.message!,
            userFriendlyMessage: validation.message!,
            retryable: false
          }
        };
      }

      // Apply discount if provided
      const finalAmount = await this.calculateFinalAmount(request);

      // Create payment document in Firestore
      const paymentDoc = await this.createPaymentDocument(request, finalAmount);

      // Create Mollie payment
      const molliePayment = await this.mollieClient.payments.create({
        amount: {
          currency: request.currency,
          value: this.formatAmount(finalAmount.amount)
        },
        description: request.description,
        redirectUrl: `${this.redirectUrl}?paymentId=${paymentDoc.id}`,
        webhookUrl: this.webhookUrl,
        method: request.method || undefined,
        metadata: {
          paymentDocId: paymentDoc.id,
          userId: request.userId,
          courseId: request.courseId,
          ...request.metadata
        },
        billingAddress: this.formatBillingAddress(request.billingAddress),
        locale: this.detectLocale(request.billingAddress.country),
        expiresAt: this.getPaymentExpiry()
      });

      // Update payment document with Mollie payment ID
      await updateDoc(doc(db, 'payments', paymentDoc.id), {
        molliePaymentId: molliePayment.id,
        mollieCheckoutUrl: molliePayment._links.checkout?.href,
        status: 'pending',
        updatedAt: serverTimestamp()
      });

      // Log payment creation
      await this.logPaymentEvent('payment_created', {
        paymentId: paymentDoc.id,
        molliePaymentId: molliePayment.id,
        amount: finalAmount.amount,
        currency: request.currency,
        userId: request.userId,
        courseId: request.courseId
      });

      return {
        success: true,
        paymentId: paymentDoc.id,
        checkoutUrl: molliePayment._links.checkout?.href,
        status: molliePayment.status as PaymentStatus
      };

    } catch (error) {
      const paymentError = this.handlePaymentError(error);
      
      await this.logPaymentEvent('payment_creation_failed', {
        error: paymentError.code,
        userId: request.userId,
        courseId: request.courseId,
        amount: request.amount
      });

      return {
        success: false,
        error: paymentError
      };
    }
  }

  public async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      // Get payment document from Firestore
      const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
      if (!paymentDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'payment-not-found',
            message: 'Payment not found',
            userFriendlyMessage: 'Payment not found.',
            retryable: false
          }
        };
      }

      const paymentData = paymentDoc.data();
      const molliePaymentId = paymentData.molliePaymentId;

      // Get payment status from Mollie
      const molliePayment = await this.mollieClient.payments.get(molliePaymentId);

      // Update local payment status if it has changed
      if (molliePayment.status !== paymentData.status) {
        await this.updatePaymentStatus(paymentId, molliePayment.status, molliePayment);
      }

      return {
        success: true,
        paymentId,
        status: molliePayment.status as PaymentStatus
      };

    } catch (error) {
      const paymentError = this.handlePaymentError(error);
      return {
        success: false,
        error: paymentError
      };
    }
  }

  // ============================================================================
  // Webhook Handling
  // ============================================================================

  public async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      const molliePaymentId = payload.id;
      
      // Get payment from Mollie
      const molliePayment = await this.mollieClient.payments.get(molliePaymentId);
      
      // Find corresponding payment document
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('molliePaymentId', '==', molliePaymentId), limit(1));
      const paymentQuery = await getDocs(q);

      if (paymentQuery.empty) {
        console.error('Payment document not found for Mollie payment:', molliePaymentId);
        return;
      }

      const paymentDoc = paymentQuery.docs[0];
      const paymentId = paymentDoc.id;
      const currentStatus = paymentDoc.data().status;

      // Only process if status has changed
      if (molliePayment.status !== currentStatus) {
        await this.updatePaymentStatus(paymentId, molliePayment.status, molliePayment);

        // Handle specific payment statuses
        switch (molliePayment.status) {
          case 'paid':
            await this.handlePaymentSuccess(paymentId, molliePayment);
            break;
          case 'failed':
          case 'canceled':
          case 'expired':
            await this.handlePaymentFailure(paymentId, molliePayment);
            break;
          case 'refunded':
          case 'partially-refunded':
            await this.createRefund({ paymentId, reason: 'Webhook refund' });
            break;
        }
      }

      await this.logPaymentEvent('webhook_processed', {
        paymentId,
        molliePaymentId,
        status: molliePayment.status,
        previousStatus: currentStatus
      });

    } catch (error) {
      console.error('Webhook processing error:', error);
      
      await this.logPaymentEvent('webhook_error', {
        paymentId: payload.id,
        error: (error as Error).message
      });
      
      throw error; // Re-throw to signal webhook failure
    }
  }

  private async handlePaymentSuccess(paymentId: string, molliePayment: any): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        // Get payment document
        const paymentRef = doc(db, 'payments', paymentId);
        const paymentDoc = await transaction.get(paymentRef);
        
        if (!paymentDoc.exists()) {
          throw new Error('Payment document not found');
        }

        const paymentData = paymentDoc.data();
        const { userId, courseId } = paymentData;

        // Update payment status
        transaction.update(paymentRef, {
          status: 'paid',
          completedAt: serverTimestamp(),
          molliePaymentDetails: {
            paidAt: molliePayment.paidAt,
            settlementAmount: molliePayment.settlementAmount,
            paymentMethod: molliePayment.method,
            details: molliePayment.details
          },
          updatedAt: serverTimestamp()
        });

        // Create or update enrollment
        const enrollmentId = `${userId}_${courseId}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);
        
        transaction.set(enrollmentRef, {
          id: enrollmentId,
          userId,
          courseId,
          paymentId,
          paymentStatus: 'paid',
          paymentMethod: molliePayment.method,
          amountPaid: parseFloat(molliePayment.amount.value),
          currency: molliePayment.amount.currency,
          enrolledAt: serverTimestamp(),
          status: 'active',
          progress: {
            completedLessons: [],
            completedModules: [],
            overallProgress: 0,
            totalTimeSpent: 0,
            lastAccessedAt: serverTimestamp(),
            streakDays: 0,
            bookmarks: [],
            notes: []
          },
          quizResults: [],
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Update course analytics
        // Update course analytics - if course tracking is enabled
        // const courseRef = doc(db, 'courses', courseId);
        // transaction.update(courseRef, {
        //   'analytics.enrollmentCount': increment(1),
        //   'analytics.totalRevenue': increment(parseFloat(molliePayment.amount.value)),
        //   updatedAt: serverTimestamp()
        // });

        // Update user stats
        const userRef = doc(db, 'users', userId);
        transaction.update(userRef, {
          'stats.coursesEnrolled': increment(1),
          updatedAt: serverTimestamp()
        });
      });

      // Send success notification (outside transaction)
      await this.sendPaymentSuccessNotification(paymentId);

      // Send course access email
      await this.sendCourseAccessEmail(paymentId);

      await this.logPaymentEvent('payment_success_processed', {
        paymentId,
        molliePaymentId: molliePayment.id
      });

    } catch (error) {
      console.error('Error processing payment success:', error);
      throw error;
    }
  }

  private async handlePaymentFailure(paymentId: string, molliePayment: any): Promise<void> {
    try {
      // Update payment status
      await updateDoc(doc(db, 'payments', paymentId), {
        status: 'failed',
        failedAt: serverTimestamp(),
        failureReason: molliePayment.details?.failureReason || 'Unknown',
        failureCode: molliePayment.details?.failureCode || 'unknown',
        updatedAt: serverTimestamp()
      });

      // Send failure notification
      await this.sendPaymentFailureNotification(paymentId);

      await this.logPaymentEvent('payment_failure_processed', {
        paymentId,
        molliePaymentId: molliePayment.id,
        reason: molliePayment.details?.failureReason
      });

    } catch (error) {
      console.error('Error processing payment failure:', error);
      throw error;
    }
  }

  // ============================================================================
  // Refund Processing
  // ============================================================================

  public async createRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      // Get payment document
      const paymentDoc = await getDoc(doc(db, 'payments', request.paymentId));
      if (!paymentDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'payment-not-found',
            message: 'Payment not found',
            userFriendlyMessage: 'Payment not found.',
            retryable: false
          }
        };
      }

      const paymentData = paymentDoc.data();
      const molliePaymentId = paymentData.molliePaymentId;

      // Validate refund eligibility
      const eligibility = await this.validateRefundEligibility(paymentData, request);
      if (!eligibility.eligible) {
        return {
          success: false,
          error: {
            code: 'refund-not-eligible',
            message: eligibility.reason!,
            userFriendlyMessage: eligibility.reason!,
            retryable: false
          }
        };
      }

      // Create refund with Mollie
      const refundAmount = request.amount || parseFloat(paymentData.amount);
      const mollieRefund = await this.mollieClient.payments.refunds.create({
        paymentId: molliePaymentId,
        amount: {
          currency: paymentData.currency,
          value: this.formatAmount(refundAmount)
        },
        description: request.description || `Refund for payment ${request.paymentId}`,
        metadata: {
          paymentDocId: request.paymentId,
          reason: request.reason,
          ...request.metadata
        }
      });

      // Update payment document
      await updateDoc(doc(db, 'payments', request.paymentId), {
        refund: {
          amount: refundAmount,
          reason: request.reason,
          description: request.description,
          mollieRefundId: mollieRefund.id,
          refundedAt: serverTimestamp()
        },
        status: refundAmount >= parseFloat(paymentData.amount) ? 'refunded' : 'partially-refunded',
        updatedAt: serverTimestamp()
      });

      // Handle enrollment deactivation if full refund
      if (refundAmount >= parseFloat(paymentData.amount)) {
        await this.deactivateEnrollment(paymentData.userId, paymentData.courseId);
      }

      await this.logPaymentEvent('refund_created', {
        paymentId: request.paymentId,
        mollieRefundId: mollieRefund.id,
        amount: refundAmount,
        reason: request.reason
      });

      return {
        success: true,
        refundId: mollieRefund.id,
        status: mollieRefund.status as RefundStatus
      };

    } catch (error) {
      const paymentError = this.handlePaymentError(error);
      
      await this.logPaymentEvent('refund_failed', {
        paymentId: request.paymentId,
        error: paymentError.code,
        reason: request.reason
      });

      return {
        success: false,
        error: paymentError
      };
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private async validatePaymentRequest(request: PaymentRequest): Promise<{ valid: boolean; message?: string }> {
    // Validate required fields
    if (!request.userId || !request.courseId) {
      return { valid: false, message: 'User ID and Course ID are required.' };
    }

    if (!request.amount || request.amount <= 0) {
      return { valid: false, message: 'Amount must be greater than 0.' };
    }

    if (!['EUR', 'USD', 'GBP'].includes(request.currency)) {
      return { valid: false, message: 'Invalid currency.' };
    }

    // Validate billing address
    const billingValidation = this.validateBillingAddress(request.billingAddress);
    if (!billingValidation.valid) {
      return billingValidation;
    }

    // Check if course exists and is purchasable
    const courseDoc = await getDoc(doc(db, 'courses', request.courseId));
    if (!courseDoc.exists()) {
      return { valid: false, message: 'Course not found.' };
    }

    const courseData = courseDoc.data();
    if (!courseData.metadata.published) {
      return { valid: false, message: 'Course is not available for purchase.' };
    }

    // Check if user is already enrolled
    const enrollmentDoc = await getDoc(doc(db, 'enrollments', `${request.userId}_${request.courseId}`));
    if (enrollmentDoc.exists() && enrollmentDoc.data().status === 'active') {
      return { valid: false, message: 'You are already enrolled in this course.' };
    }

    return { valid: true };
  }

  private validateBillingAddress(address: BillingAddress): { valid: boolean; message?: string } {
    const required = ['firstName', 'lastName', 'email', 'street', 'city', 'postalCode', 'country'];
    
    for (const field of required) {
      if (!address[field as keyof BillingAddress]) {
        return { valid: false, message: `${field} is required.` };
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(address.email)) {
      return { valid: false, message: 'Invalid email format.' };
    }

    return { valid: true };
  }

  private async calculateFinalAmount(request: PaymentRequest): Promise<{ amount: number; discount?: any }> {
    let finalAmount = request.amount;
    let discount;

    if (request.discountCode) {
      // Apply discount logic here
      discount = await this.validateAndApplyDiscount(request.discountCode, request.amount);
      if (discount.valid) {
        finalAmount = request.amount - discount.discountAmount;
      }
    }

    return { amount: finalAmount, discount };
  }

  private async validateAndApplyDiscount(code: string, amount: number): Promise<any> {
    // Discount validation logic would go here
    // This is a simplified version
    return { valid: false, discountAmount: 0 };
  }

  private async createPaymentDocument(request: PaymentRequest, finalAmount: any): Promise<{ id: string }> {
    const paymentRef = doc(collection(db, 'payments'));
    
    const paymentData = {
      id: paymentRef.id,
      userId: request.userId,
      courseId: request.courseId,
      amount: finalAmount.amount,
      originalAmount: request.amount,
      currency: request.currency,
      status: 'pending',
      method: request.method || 'unknown',
      description: request.description,
      billingAddress: request.billingAddress,
      metadata: {
        discountCode: request.discountCode,
        discountAmount: finalAmount.discount?.discountAmount || 0,
        ...request.metadata
      },
      webhookUrl: this.webhookUrl,
      redirectUrl: this.redirectUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(paymentRef, paymentData);
    
    return { id: paymentRef.id };
  }

  private async updatePaymentStatus(paymentId: string, status: string, molliePayment: any): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'paid') {
      updateData.completedAt = serverTimestamp();
      updateData.molliePaymentDetails = {
        paidAt: molliePayment.paidAt,
        settlementAmount: molliePayment.settlementAmount,
        paymentMethod: molliePayment.method,
        details: molliePayment.details
      };
    } else if (['failed', 'canceled', 'expired'].includes(status)) {
      updateData.failedAt = serverTimestamp();
      updateData.failureReason = molliePayment.details?.failureReason || status;
    }

    await updateDoc(doc(db, 'payments', paymentId), updateData);
  }

  private formatAmount(amount: number): string {
    return (amount / 100).toFixed(2);
  }

  private formatBillingAddress(address: BillingAddress): any {
    return {
      organizationName: address.company,
      streetAndNumber: address.street,
      streetAdditional: address.streetAdditional,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      country: address.country
    };
  }

  private detectLocale(country: string): string {
    const localeMap: Record<string, string> = {
      'NL': 'nl_NL',
      'BE': 'nl_BE',
      'DE': 'de_DE',
      'FR': 'fr_FR',
      'GB': 'en_GB',
      'US': 'en_US'
    };
    
    return localeMap[country] || 'en_US';
  }

  private getPaymentExpiry(): string {
    // Set payment to expire in 15 minutes
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    return expiry.toISOString();
  }

  private async validateRefundEligibility(paymentData: any, request: RefundRequest): Promise<{ eligible: boolean; reason?: string }> {
    if (paymentData.status !== 'paid') {
      return { eligible: false, reason: 'Payment is not in paid status.' };
    }

    // Check refund policy (e.g., 30 days)
    const paymentDate = paymentData.completedAt.toDate();
    const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSincePayment > 30) {
      return { eligible: false, reason: 'Refund period has expired (30 days).' };
    }

    const refundAmount = request.amount || parseFloat(paymentData.amount);
    if (refundAmount > parseFloat(paymentData.amount)) {
      return { eligible: false, reason: 'Refund amount cannot exceed payment amount.' };
    }

    return { eligible: true };
  }

  private async deactivateEnrollment(userId: string, courseId: string): Promise<void> {
    await updateDoc(doc(db, 'enrollments', `${userId}_${courseId}`), {
      status: 'refunded',
      refundedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  private handlePaymentError(error: any): PaymentError {
    const errorMessages: Record<string, string> = {
      'payment_failed': 'Payment failed. Please try again with a different payment method.',
      'insufficient_funds': 'Insufficient funds. Please check your account balance.',
      'card_declined': 'Your card was declined. Please try a different card.',
      'expired_card': 'Your card has expired. Please use a different card.',
      'invalid_card': 'Invalid card details. Please check your information.',
      'authentication_failed': 'Payment authentication failed. Please try again.',
      'network_error': 'Network error. Please check your connection and try again.',
      'api_error': 'Payment service temporarily unavailable. Please try again later.',
    };

    const code = error.code || error.type || 'unknown_error';
    const message = error.message || 'Unknown payment error';
    const userFriendlyMessage = errorMessages[code] || 'An unexpected error occurred. Please try again.';
    const retryable = !['invalid_card', 'expired_card', 'authentication_failed'].includes(code);

    return {
      code,
      message,
      userFriendlyMessage,
      retryable,
      details: error
    };
  }

  private async sendPaymentSuccessNotification(paymentId: string): Promise<void> {
    // Implementation would send notification
    console.log('Sending payment success notification for:', paymentId);
  }

  private async sendCourseAccessEmail(paymentId: string): Promise<void> {
    // Implementation would send course access email
    console.log('Sending course access email for:', paymentId);
  }

  private async sendPaymentFailureNotification(paymentId: string): Promise<void> {
    // Implementation would send failure notification
    console.log('Sending payment failure notification for:', paymentId);
  }

  private async logPaymentEvent(event: string, data: any): Promise<void> {
    try {
      console.log('Payment Event:', event, data);
      
      // Store in audit log
      await addDoc(collection(db, 'audit_logs'), {
        event,
        type: 'payment',
        data,
        timestamp: serverTimestamp(),
        source: 'mollie-service'
      });
    } catch (error) {
      console.error('Failed to log payment event:', error);
    }
  }
}

// ============================================================================
// Payment Flow Configurations
// ============================================================================

export const PAYMENT_CONFIGS = {
  // Supported payment methods
  supportedMethods: [
    'creditcard',
    'ideal',
    'paypal',
    'bancontact',
    'sofort',
    'giropay',
    'eps',
    'paysafecard',
    'klarna'
  ] as PaymentMethod[],

  // Currency configurations
  currencies: {
    EUR: {
      symbol: '€',
      decimals: 2,
      minAmount: 1.00,
      maxAmount: 10000.00
    },
    USD: {
      symbol: '$',
      decimals: 2,
      minAmount: 1.00,
      maxAmount: 10000.00
    },
    GBP: {
      symbol: '£',
      decimals: 2,
      minAmount: 1.00,
      maxAmount: 10000.00
    }
  },

  // Refund policy
  refundPolicy: {
    periodDays: 30,
    allowPartialRefunds: true,
    autoApprovalThreshold: 100.00, // EUR
    requiresApproval: true
  },

  // Webhook security
  webhook: {
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
    timeout: 30000, // 30 seconds
    signatureValidation: true
  }
};

// Export singleton instance
export const paymentService = new MolliePaymentService(
  process.env.NEXT_PUBLIC_MOLLIE_API_KEY || '',
  process.env.NODE_ENV !== 'production'
);