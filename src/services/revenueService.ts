/**
 * GroeimetAI Platform - Revenue Service
 * Handles revenue sharing, calculations, and payouts
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  updateDoc,
  runTransaction,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAdminDb } from '@/lib/firebase-admin';
import { 
  RevenueShare, 
  AuthorType, 
  RevenueTransaction, 
  PayoutRequest, 
  EarningsReport,
  RevenueCalculationParams,
  RevenueRefund,
  AffiliateTransaction,
  AuthorRevenueSettings
} from '@/types/revenue';
import { getAuthorById } from './authorService';
import { getCourseById } from './courseService';
import { Payment } from '@/types';

// Collection names
const COLLECTION_REVENUE_TRANSACTIONS = 'revenue_transactions';
const COLLECTION_PAYOUT_REQUESTS = 'payout_requests';
const COLLECTION_AFFILIATE_TRANSACTIONS = 'affiliate_transactions';
const COLLECTION_AUTHOR_REVENUE_SETTINGS = 'author_revenue_settings';
const COLLECTION_REVENUE_REFUNDS = 'revenue_refunds';

// Platform fee configuration
const PLATFORM_FEES = {
  new: 15, // 15% for new authors
  established: 10 // 10% for established authors
};

// Affiliate commission rate
const DEFAULT_AFFILIATE_COMMISSION = 5; // 5% of sale

/**
 * Calculate platform fee based on author type
 */
export function calculatePlatformFee(amount: number, authorType: AuthorType): number {
  const feePercentage = PLATFORM_FEES[authorType];
  return Number((amount * feePercentage / 100).toFixed(2));
}

/**
 * Get author type based on their performance and history
 */
async function getAuthorType(authorId: string): Promise<AuthorType> {
  try {
    // Check author revenue settings first
    const settingsDoc = await getDoc(doc(db, COLLECTION_AUTHOR_REVENUE_SETTINGS, authorId));
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data() as AuthorRevenueSettings;
      return settings.authorType;
    }

    // Default logic: Check total sales to determine if established
    const revenueQuery = query(
      collection(db, COLLECTION_REVENUE_TRANSACTIONS),
      where('distribution.author.authorId', '==', authorId),
      where('status', '==', 'processed')
    );
    
    const snapshot = await getDocs(revenueQuery);
    const totalSales = snapshot.size;
    
    // Consider author established after 50 sales or 6 months
    const author = await getAuthorById(authorId);
    if (!author) return 'new';
    
    const monthsSinceCreation = (Date.now() - author.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    return (totalSales >= 50 || monthsSinceCreation >= 6) ? 'established' : 'new';
  } catch (error) {
    console.error('Error determining author type:', error);
    return 'new'; // Default to new author
  }
}

/**
 * Process a course sale and distribute revenue
 */
export async function processCourseSale(
  courseId: string, 
  amount: number, 
  paymentId: string,
  userId: string,
  affiliateCode?: string
): Promise<RevenueTransaction> {
  try {
    // Get course details
    const course = await getCourseById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Get primary author (assuming first author is primary)
    const authorId = course.instructorId;
    const authorType = await getAuthorType(authorId);
    
    // Calculate revenue distribution
    const platformFee = calculatePlatformFee(amount, authorType);
    let authorAmount = amount - platformFee;
    let affiliateAmount = 0;
    let affiliateId: string | undefined;

    // Handle affiliate commission if applicable
    if (affiliateCode) {
      // Validate affiliate code and get affiliate ID
      affiliateId = await validateAffiliateCode(affiliateCode);
      if (affiliateId) {
        affiliateAmount = Number((amount * DEFAULT_AFFILIATE_COMMISSION / 100).toFixed(2));
        authorAmount -= affiliateAmount;
      }
    }

    // Create revenue transaction
    const transactionId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Timestamp.now();

    const revenueTransaction: RevenueTransaction = {
      id: transactionId,
      paymentId,
      courseId,
      userId,
      amount,
      currency: course.currency || 'EUR',
      distribution: {
        platform: {
          amount: platformFee,
          percentage: PLATFORM_FEES[authorType]
        },
        author: {
          authorId,
          amount: authorAmount,
          percentage: 100 - PLATFORM_FEES[authorType] - (affiliateCode && affiliateId ? DEFAULT_AFFILIATE_COMMISSION : 0)
        }
      },
      status: 'processed',
      processedAt: timestamp.toDate(),
      createdAt: timestamp.toDate(),
      updatedAt: timestamp.toDate()
    };

    // Add affiliate distribution if applicable
    if (affiliateCode && affiliateId) {
      revenueTransaction.distribution.affiliate = {
        affiliateId,
        affiliateCode,
        amount: affiliateAmount,
        percentage: DEFAULT_AFFILIATE_COMMISSION
      };
    }

    // Save transaction using Firestore transaction for consistency
    await runTransaction(db, async (transaction) => {
      // Save revenue transaction
      transaction.set(
        doc(db, COLLECTION_REVENUE_TRANSACTIONS, transactionId), 
        revenueTransaction
      );

      // Create affiliate transaction if applicable
      if (affiliateCode && affiliateId) {
        const affiliateTransactionId = `aff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const affiliateTransaction: AffiliateTransaction = {
          id: affiliateTransactionId,
          affiliateId,
          affiliateCode,
          transactionId,
          courseId,
          commission: {
            amount: affiliateAmount,
            percentage: DEFAULT_AFFILIATE_COMMISSION,
            currency: course.currency || 'EUR'
          },
          status: 'approved',
          createdAt: timestamp.toDate()
        };
        
        transaction.set(
          doc(db, COLLECTION_AFFILIATE_TRANSACTIONS, affiliateTransactionId),
          affiliateTransaction
        );
      }

      // Update author's available balance (stored in author revenue settings)
      const authorSettingsRef = doc(db, COLLECTION_AUTHOR_REVENUE_SETTINGS, authorId);
      const settingsDoc = await getDoc(authorSettingsRef);
      
      if (settingsDoc.exists()) {
        const currentBalance = settingsDoc.data().availableBalance || 0;
        transaction.update(authorSettingsRef, {
          availableBalance: currentBalance + authorAmount,
          lastTransactionAt: timestamp,
          updatedAt: timestamp
        });
      } else {
        // Create initial settings if they don't exist
        transaction.set(authorSettingsRef, {
          authorId,
          authorType,
          defaultRevenueShare: 100 - PLATFORM_FEES[authorType],
          minimumPayoutAmount: 50, // Default 50 EUR minimum
          preferredCurrency: 'EUR',
          availableBalance: authorAmount,
          lastTransactionAt: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return revenueTransaction;
  } catch (error) {
    console.error('Error processing course sale:', error);
    throw error;
  }
}

/**
 * Distribute revenue based on transaction details
 * This is called after payment is confirmed
 */
export async function distributeRevenue(transaction: Payment): Promise<RevenueTransaction | null> {
  try {
    if (transaction.status !== 'completed') {
      console.log('Payment not completed, skipping revenue distribution');
      return null;
    }

    // Process the sale with the payment details
    return await processCourseSale(
      transaction.courseId,
      transaction.amount,
      transaction.id,
      transaction.userId
    );
  } catch (error) {
    console.error('Error distributing revenue:', error);
    throw error;
  }
}

/**
 * Get author earnings for a specific period
 */
export async function getAuthorEarnings(
  authorId: string, 
  period?: { start: Date; end: Date }
): Promise<EarningsReport> {
  try {
    // Build query
    let earningsQuery = query(
      collection(db, COLLECTION_REVENUE_TRANSACTIONS),
      where('distribution.author.authorId', '==', authorId),
      where('status', '==', 'processed'),
      orderBy('createdAt', 'desc')
    );

    // Note: Firestore has limitations with compound queries, so date filtering
    // would need to be done client-side or with additional indexes
    
    const snapshot = await getDocs(earningsQuery);
    const transactions = snapshot.docs.map(doc => doc.data() as RevenueTransaction);

    // Filter by period if provided (client-side)
    const filteredTransactions = period 
      ? transactions.filter(t => {
          const createdAt = t.createdAt instanceof Date ? t.createdAt : t.createdAt;
          return createdAt >= period.start && createdAt <= period.end;
        })
      : transactions;

    // Calculate summary
    const totalEarnings = filteredTransactions.reduce(
      (sum, t) => sum + t.distribution.author.amount, 
      0
    );
    const totalSales = filteredTransactions.length;
    const averageOrderValue = totalSales > 0 ? totalEarnings / totalSales : 0;

    // Group by course
    const courseMap = new Map<string, {
      courseName: string;
      sales: number;
      earnings: number;
      revenueShare: number;
    }>();

    for (const transaction of filteredTransactions) {
      const existing = courseMap.get(transaction.courseId) || {
        courseName: '',
        sales: 0,
        earnings: 0,
        revenueShare: transaction.distribution.author.percentage
      };

      // Get course name if not already fetched
      if (!existing.courseName) {
        const course = await getCourseById(transaction.courseId);
        existing.courseName = course?.title || 'Unknown Course';
      }

      existing.sales += 1;
      existing.earnings += transaction.distribution.author.amount;
      
      courseMap.set(transaction.courseId, existing);
    }

    const courseBreakdown = Array.from(courseMap.entries()).map(([courseId, data]) => ({
      courseId,
      ...data
    }));

    // Group by month
    const monthlyMap = new Map<string, { earnings: number; sales: number }>();
    
    for (const transaction of filteredTransactions) {
      const date = transaction.createdAt instanceof Date 
        ? transaction.createdAt 
        : new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = monthlyMap.get(monthKey) || { earnings: 0, sales: 0 };
      existing.earnings += transaction.distribution.author.amount;
      existing.sales += 1;
      
      monthlyMap.set(monthKey, existing);
    }

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month));

    // Get payout information
    const payoutQuery = query(
      collection(db, COLLECTION_PAYOUT_REQUESTS),
      where('authorId', '==', authorId)
    );
    
    const payoutSnapshot = await getDocs(payoutQuery);
    const payouts = payoutSnapshot.docs.map(doc => doc.data() as PayoutRequest);

    const payoutSummary = {
      pending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      completed: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      inProcess: payouts.filter(p => p.status === 'processing').reduce((sum, p) => sum + p.amount, 0)
    };

    return {
      authorId,
      period: period || {
        start: new Date(0), // Beginning of time
        end: new Date() // Now
      },
      summary: {
        totalEarnings,
        totalSales,
        averageOrderValue,
        currency: 'EUR' // Default currency
      },
      courseBreakdown,
      monthlyBreakdown,
      payouts: payoutSummary,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error getting author earnings:', error);
    throw error;
  }
}

/**
 * Request a payout for an author
 */
export async function requestPayout(
  authorId: string, 
  amount: number,
  bankDetails?: PayoutRequest['bankDetails']
): Promise<PayoutRequest> {
  try {
    // Get author's current balance
    const settingsDoc = await getDoc(doc(db, COLLECTION_AUTHOR_REVENUE_SETTINGS, authorId));
    if (!settingsDoc.exists()) {
      throw new Error('Author revenue settings not found');
    }

    const settings = settingsDoc.data() as AuthorRevenueSettings;
    const availableBalance = settings.availableBalance || 0;
    const minimumPayout = settings.minimumPayoutAmount || 50;

    // Validate payout amount
    if (amount < minimumPayout) {
      throw new Error(`Minimum payout amount is ${minimumPayout}`);
    }

    if (amount > availableBalance) {
      throw new Error(`Insufficient balance. Available: ${availableBalance}`);
    }

    // Create payout request
    const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Timestamp.now();

    // Get recent transactions to include in payout
    const transactionsQuery = query(
      collection(db, COLLECTION_REVENUE_TRANSACTIONS),
      where('distribution.author.authorId', '==', authorId),
      where('status', '==', 'processed'),
      orderBy('createdAt', 'desc'),
      limit(100) // Limit to recent transactions
    );

    const transactionSnapshot = await getDocs(transactionsQuery);
    
    // Calculate which transactions to include based on amount
    let includedAmount = 0;
    const includedTransactions: string[] = [];
    
    for (const doc of transactionSnapshot.docs) {
      const transaction = doc.data() as RevenueTransaction;
      if (includedAmount < amount) {
        includedAmount += transaction.distribution.author.amount;
        includedTransactions.push(transaction.id);
      } else {
        break;
      }
    }

    const payoutRequest: PayoutRequest = {
      id: payoutId,
      authorId,
      amount,
      currency: settings.preferredCurrency || 'EUR',
      bankDetails,
      status: 'pending',
      requestedAt: timestamp.toDate(),
      includedTransactions
    };

    // Save payout request and update balance atomically
    await runTransaction(db, async (transaction) => {
      // Save payout request
      transaction.set(
        doc(db, COLLECTION_PAYOUT_REQUESTS, payoutId),
        payoutRequest
      );

      // Update author's available balance
      transaction.update(doc(db, COLLECTION_AUTHOR_REVENUE_SETTINGS, authorId), {
        availableBalance: availableBalance - amount,
        lastPayoutRequestAt: timestamp,
        updatedAt: timestamp
      });
    });

    return payoutRequest;
  } catch (error) {
    console.error('Error requesting payout:', error);
    throw error;
  }
}

/**
 * Handle revenue reversal for refunds
 */
export async function reverseRevenue(
  paymentId: string,
  refundAmount: number,
  reason: string
): Promise<RevenueRefund> {
  try {
    // Find the original revenue transaction
    const revenueQuery = query(
      collection(db, COLLECTION_REVENUE_TRANSACTIONS),
      where('paymentId', '==', paymentId),
      limit(1)
    );

    const snapshot = await getDocs(revenueQuery);
    if (snapshot.empty) {
      throw new Error('Original revenue transaction not found');
    }

    const originalTransaction = snapshot.docs[0].data() as RevenueTransaction;
    
    // Calculate proportional refunds
    const refundPercentage = refundAmount / originalTransaction.amount;
    const platformRefund = originalTransaction.distribution.platform.amount * refundPercentage;
    const authorDeduction = originalTransaction.distribution.author.amount * refundPercentage;
    const affiliateDeduction = originalTransaction.distribution.affiliate 
      ? originalTransaction.distribution.affiliate.amount * refundPercentage 
      : undefined;

    // Create refund record
    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Timestamp.now();

    const revenueRefund: RevenueRefund = {
      id: refundId,
      originalTransactionId: originalTransaction.id,
      paymentId,
      refundAmount,
      platformRefund,
      authorDeduction,
      affiliateDeduction,
      reason,
      status: 'processed',
      processedAt: timestamp.toDate(),
      createdAt: timestamp.toDate()
    };

    // Process refund atomically
    await runTransaction(db, async (transaction) => {
      // Save refund record
      transaction.set(
        doc(db, COLLECTION_REVENUE_REFUNDS, refundId),
        revenueRefund
      );

      // Update original transaction status
      transaction.update(
        doc(db, COLLECTION_REVENUE_TRANSACTIONS, originalTransaction.id),
        {
          status: 'reversed',
          updatedAt: timestamp
        }
      );

      // Update author's available balance
      const authorId = originalTransaction.distribution.author.authorId;
      const settingsRef = doc(db, COLLECTION_AUTHOR_REVENUE_SETTINGS, authorId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const currentBalance = settingsDoc.data().availableBalance || 0;
        transaction.update(settingsRef, {
          availableBalance: Math.max(0, currentBalance - authorDeduction),
          updatedAt: timestamp
        });
      }
    });

    return revenueRefund;
  } catch (error) {
    console.error('Error reversing revenue:', error);
    throw error;
  }
}

/**
 * Validate affiliate code and return affiliate ID
 */
async function validateAffiliateCode(affiliateCode: string): Promise<string | null> {
  try {
    // This is a simplified implementation
    // In production, you would have an affiliates collection
    const affiliatesQuery = query(
      collection(db, 'affiliates'),
      where('code', '==', affiliateCode),
      where('active', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(affiliatesQuery);
    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].id;
  } catch (error) {
    console.error('Error validating affiliate code:', error);
    return null;
  }
}

// Export all functions
export default {
  calculatePlatformFee,
  processCourseSale,
  distributeRevenue,
  getAuthorEarnings,
  requestPayout,
  reverseRevenue
};