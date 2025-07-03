/**
 * GroeimetAI Platform - Revenue Service (Server-side)
 * Server-side version using Firebase Admin SDK
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { courses } from '@/lib/data/courses';
import { 
  RevenueTransaction, 
  AuthorType, 
  AffiliateTransaction,
  AuthorRevenueSettings
} from '@/types/revenue';

// Get course by ID from static data
function getCourseById(courseId: string) {
  return courses.find(course => course.id === courseId);
}

// Collection names
const COLLECTION_REVENUE_TRANSACTIONS = 'revenue_transactions';
const COLLECTION_AFFILIATE_TRANSACTIONS = 'affiliate_transactions';
const COLLECTION_AUTHOR_REVENUE_SETTINGS = 'author_revenue_settings';
const COLLECTION_AUTHORS = 'authors';

// Platform fee configuration
const PLATFORM_FEES = {
  new: 15, // 15% for new authors
  established: 10 // 10% for established authors
};

// Affiliate commission configuration
const DEFAULT_AFFILIATE_COMMISSION = 30; // 30% of platform commission

/**
 * Calculate platform fee based on author type
 */
function calculatePlatformFee(amount: number, authorType: AuthorType): number {
  const percentage = PLATFORM_FEES[authorType];
  return Number((amount * percentage / 100).toFixed(2));
}

/**
 * Get author type based on author ID
 */
async function getAuthorType(authorId: string): Promise<AuthorType> {
  if (authorId === 'groeimetai') {
    return 'established';
  }
  
  try {
    const authorDoc = await getAdminDb().collection(COLLECTION_AUTHORS).doc(authorId).get();
    if (authorDoc.exists) {
      const author = authorDoc.data();
      return author?.type || 'new';
    }
  } catch (error) {
    console.error('Error fetching author type:', error);
  }
  
  return 'new';
}

/**
 * Validate affiliate code and get affiliate ID
 */
async function validateAffiliateCode(affiliateCode: string): Promise<string | null> {
  try {
    const affiliateQuery = await getAdminDb()
      .collection('affiliate_links')
      .where('code', '==', affiliateCode)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    if (!affiliateQuery.empty) {
      const affiliateLink = affiliateQuery.docs[0].data();
      return affiliateLink.userId;
    }
  } catch (error) {
    console.error('Error validating affiliate code:', error);
  }
  
  return null;
}

/**
 * Process course sale and distribute revenue (Server-side version)
 */
export async function processCourseSaleServer(
  courseId: string, 
  amount: number, 
  paymentId: string,
  userId: string,
  affiliateCode?: string
): Promise<RevenueTransaction> {
  try {
    // Get course details from static data
    const course = getCourseById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Get primary author
    const authorId = course.instructorId || 'groeimetai';
    const authorType = await getAuthorType(authorId);
    
    // Calculate revenue distribution
    const platformFee = calculatePlatformFee(amount, authorType);
    let authorAmount = amount - platformFee;
    let affiliateAmount = 0;
    let affiliateId: string | undefined;

    // Handle affiliate commission if applicable
    if (affiliateCode) {
      affiliateId = await validateAffiliateCode(affiliateCode);
      if (affiliateId) {
        affiliateAmount = Number((amount * DEFAULT_AFFILIATE_COMMISSION / 100).toFixed(2));
        authorAmount -= affiliateAmount;
      }
    }

    // Create revenue transaction
    const transactionId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

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
      processedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp
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

    // Use batch writes for atomic operations
    const batch = getAdminDb().batch();

    // Save revenue transaction
    const revTransactionRef = getAdminDb()
      .collection(COLLECTION_REVENUE_TRANSACTIONS)
      .doc(transactionId);
    batch.set(revTransactionRef, revenueTransaction);

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
        createdAt: timestamp
      };
      
      const affTransactionRef = getAdminDb()
        .collection(COLLECTION_AFFILIATE_TRANSACTIONS)
        .doc(affiliateTransactionId);
      batch.set(affTransactionRef, affiliateTransaction);
    }

    // Update author's available balance
    const authorSettingsRef = getAdminDb()
      .collection(COLLECTION_AUTHOR_REVENUE_SETTINGS)
      .doc(authorId);
    
    const settingsDoc = await authorSettingsRef.get();
    
    if (settingsDoc.exists) {
      const currentBalance = settingsDoc.data()?.availableBalance || 0;
      batch.update(authorSettingsRef, {
        availableBalance: currentBalance + authorAmount,
        lastTransactionAt: timestamp,
        updatedAt: timestamp
      });
    } else {
      // Create initial settings if they don't exist
      const newSettings: AuthorRevenueSettings = {
        authorId,
        authorType,
        defaultRevenueShare: 100 - PLATFORM_FEES[authorType],
        minimumPayoutAmount: 50, // Default 50 EUR minimum
        preferredCurrency: 'EUR',
        availableBalance: authorAmount,
        lastTransactionAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      batch.set(authorSettingsRef, newSettings);
    }

    // Commit all changes
    await batch.commit();

    console.log('Revenue transaction processed:', transactionId);
    return revenueTransaction;
  } catch (error) {
    console.error('Error processing course sale (server):', error);
    throw error;
  }
}