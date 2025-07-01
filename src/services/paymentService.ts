/**
 * GroeimetAI Platform - Payment Service (Client-side)
 * Handles payment operations via API calls - NO direct Mollie integration
 */

import { auth } from '@/lib/firebase';
import { CourseData } from '@/lib/data/courses';
import { processCourseSale, reverseRevenue } from './revenueService';
import { Payment } from '@/types';

export interface CheckoutSession {
  courseId: string;
  userId: string;
  userEmail: string;
  billingAddress: {
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
  };
  discountCode?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  status?: string;
  error?: {
    code: string;
    message: string;
    userFriendlyMessage: string;
    retryable: boolean;
  };
}

/**
 * Create a payment checkout session via API
 */
export async function createCheckoutSession(
  session: CheckoutSession,
  course: CourseData
): Promise<PaymentResult> {
  try {
    // Get current user auth token
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: {
          code: 'user-not-authenticated',
          message: 'User not authenticated',
          userFriendlyMessage: 'Je moet ingelogd zijn om een cursus te kopen.',
          retryable: false
        }
      };
    }

    const token = await user.getIdToken();

    // Create payment request payload
    const paymentRequest = {
      courseId: session.courseId,
      amount: course.price * 100, // Convert to cents
      currency: (course.currency as 'EUR' | 'USD' | 'GBP') || 'EUR',
      description: `Cursus: ${course.title}`,
      billingAddress: session.billingAddress,
      discountCode: session.discountCode,
    };

    // Call server-side API
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'api-error',
          message: data.error || 'Payment creation failed',
          userFriendlyMessage: 'Er is een fout opgetreden bij het starten van de betaling. Probeer het opnieuw.',
          retryable: true
        }
      };
    }

    return {
      success: true,
      paymentId: data.paymentId,
      checkoutUrl: data.checkoutUrl,
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: {
        code: 'network-error',
        message: error instanceof Error ? error.message : 'Unknown error',
        userFriendlyMessage: 'Er is een fout opgetreden bij het starten van de betaling. Probeer het opnieuw.',
        retryable: true
      }
    };
  }
}

/**
 * Get payment status via API
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentResult> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: {
          code: 'user-not-authenticated',
          message: 'User not authenticated',
          userFriendlyMessage: 'Je moet ingelogd zijn.',
          retryable: false
        }
      };
    }

    const token = await user.getIdToken();

    const response = await fetch(`/api/payments/status/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'api-error',
          message: data.error || 'Failed to get payment status',
          userFriendlyMessage: 'Kan de betalingsstatus niet ophalen.',
          retryable: true
        }
      };
    }

    return {
      success: true,
      status: data.status,
      paymentId: data.paymentId,
    };

  } catch (error) {
    console.error('Error getting payment status:', error);
    return {
      success: false,
      error: {
        code: 'network-error',
        message: error instanceof Error ? error.message : 'Unknown error',
        userFriendlyMessage: 'Kan de betalingsstatus niet ophalen.',
        retryable: true
      }
    };
  }
}

/**
 * Handle payment webhook from Mollie (server-side only)
 * This function should only be called from API routes
 */
export async function handlePaymentWebhook(payload: any): Promise<void> {
  // This function is kept for API compatibility but should only be used server-side
  throw new Error('handlePaymentWebhook should only be called from server-side API routes');
}

/**
 * Check if user is enrolled in a course via API
 */
export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const token = await user.getIdToken();

    const response = await fetch(`/api/enrollments/check/${courseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.enrolled || false;

  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
}

/**
 * Get user's purchased courses via API
 */
export async function getUserPurchasedCourses(userId: string): Promise<string[]> {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const token = await user.getIdToken();

    const response = await fetch('/api/enrollments/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.courseIds || [];

  } catch (error) {
    console.error('Error getting user courses:', error);
    return [];
  }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  const currencySymbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£'
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Calculate discount amount
 */
export async function calculateDiscount(
  coursePrice: number,
  discountCode: string
): Promise<{ valid: boolean; discountAmount: number; finalPrice: number }> {
  // This is a simplified version - in production, you would validate against a discounts collection
  const discounts: Record<string, number> = {
    'WELCOME10': 0.10,
    'STUDENT20': 0.20,
    'EARLY50': 0.50
  };

  const discountPercentage = discounts[discountCode.toUpperCase()];
  
  if (!discountPercentage) {
    return { valid: false, discountAmount: 0, finalPrice: coursePrice };
  }

  const discountAmount = coursePrice * discountPercentage;
  const finalPrice = coursePrice - discountAmount;

  return { valid: true, discountAmount, finalPrice };
}

/**
 * Process successful payment and distribute revenue
 * This should be called after payment is confirmed
 */
export async function processSuccessfulPayment(
  payment: Payment,
  affiliateCode?: string
): Promise<void> {
  try {
    // Only process completed payments
    if (payment.status !== 'completed') {
      console.log('Payment not completed, skipping revenue distribution');
      return;
    }

    // Distribute revenue through the revenue service
    await processCourseSale(
      payment.courseId,
      payment.amount,
      payment.id,
      payment.userId,
      affiliateCode
    );

    console.log(`Revenue distributed for payment ${payment.id}`);
  } catch (error) {
    console.error('Error processing successful payment:', error);
    // Don't throw - revenue distribution failure shouldn't affect payment completion
    // This could be retried later via a background job
  }
}

/**
 * Handle payment refund and reverse revenue
 */
export async function processPaymentRefund(
  paymentId: string,
  refundAmount: number,
  reason: string
): Promise<void> {
  try {
    // Reverse the revenue distribution
    await reverseRevenue(paymentId, refundAmount, reason);
    
    console.log(`Revenue reversed for payment ${paymentId}`);
  } catch (error) {
    console.error('Error processing payment refund:', error);
    throw error; // Throw for refunds as this is critical
  }
}

/**
 * Enhanced payment status check that includes revenue status
 */
export async function getPaymentStatusWithRevenue(paymentId: string): Promise<{
  payment: PaymentResult;
  revenueDistributed: boolean;
}> {
  try {
    const paymentStatus = await getPaymentStatus(paymentId);
    
    // Check if revenue has been distributed
    // This would typically check the revenue_transactions collection
    // For now, we'll assume revenue is distributed if payment is completed
    const revenueDistributed = paymentStatus.status === 'completed';
    
    return {
      payment: paymentStatus,
      revenueDistributed
    };
  } catch (error) {
    console.error('Error getting payment status with revenue:', error);
    throw error;
  }
}

export default {
  createCheckoutSession,
  getPaymentStatus,
  handlePaymentWebhook,
  isUserEnrolled,
  getUserPurchasedCourses,
  formatPrice,
  calculateDiscount,
  processSuccessfulPayment,
  processPaymentRefund,
  getPaymentStatusWithRevenue
};