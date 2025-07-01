/**
 * Revenue Types for GroeimetAI Platform
 * Defines interfaces for revenue sharing, payouts, and earnings tracking
 */

import { Payment } from './index';

// Revenue Share Configuration
export interface RevenueShare {
  authorShare: number; // Percentage (85% for new authors, 90% for established)
  platformFee: number; // Percentage (15% for new authors, 10% for established)
  affiliateShare?: number; // Optional affiliate percentage
}

// Author classification for revenue sharing
export type AuthorType = 'new' | 'established';

// Revenue Transaction represents a single revenue distribution event
export interface RevenueTransaction {
  id: string;
  paymentId: string;
  courseId: string;
  userId: string; // Buyer
  amount: number; // Total payment amount
  currency: string;
  
  // Revenue distribution
  distribution: {
    platform: {
      amount: number;
      percentage: number;
    };
    author: {
      authorId: string;
      amount: number;
      percentage: number;
    };
    affiliate?: {
      affiliateId: string;
      affiliateCode: string;
      amount: number;
      percentage: number;
    };
  };
  
  // Transaction metadata
  status: 'pending' | 'processed' | 'reversed';
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Payout Request from authors
export interface PayoutRequest {
  id: string;
  authorId: string;
  amount: number;
  currency: string;
  
  // Bank details (encrypted in production)
  bankDetails?: {
    accountHolder: string;
    iban?: string;
    swift?: string;
    bankName?: string;
  };
  
  // Payout status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  
  // Processing details
  transactionReference?: string;
  failureReason?: string;
  notes?: string;
  
  // Related revenue transactions
  includedTransactions: string[]; // Revenue transaction IDs
}

// Earnings Report for authors
export interface EarningsReport {
  authorId: string;
  period: {
    start: Date;
    end: Date;
  };
  
  // Summary
  summary: {
    totalEarnings: number;
    totalSales: number;
    averageOrderValue: number;
    currency: string;
  };
  
  // Breakdown by course
  courseBreakdown: Array<{
    courseId: string;
    courseName: string;
    sales: number;
    earnings: number;
    revenueShare: number; // Percentage
  }>;
  
  // Monthly breakdown
  monthlyBreakdown: Array<{
    month: string; // Format: "YYYY-MM"
    earnings: number;
    sales: number;
  }>;
  
  // Payout information
  payouts: {
    pending: number;
    completed: number;
    inProcess: number;
  };
  
  // Generated metadata
  generatedAt: Date;
}

// Affiliate tracking
export interface AffiliateTransaction {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  transactionId: string; // Revenue transaction ID
  courseId: string;
  
  commission: {
    amount: number;
    percentage: number;
    currency: string;
  };
  
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
}

// Revenue settings per author
export interface AuthorRevenueSettings {
  authorId: string;
  authorType: AuthorType;
  defaultRevenueShare: number; // Default percentage
  minimumPayoutAmount: number; // Minimum amount for payout request
  payoutFrequency?: 'manual' | 'weekly' | 'monthly';
  preferredCurrency: string;
  taxInfo?: {
    vatNumber?: string;
    taxRate?: number;
    country: string;
  };
}

// Platform revenue analytics
export interface PlatformRevenueAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  
  totalRevenue: number;
  platformFees: number;
  authorPayouts: number;
  affiliateCommissions: number;
  
  topPerformingCourses: Array<{
    courseId: string;
    courseName: string;
    revenue: number;
    sales: number;
  }>;
  
  topEarningAuthors: Array<{
    authorId: string;
    authorName: string;
    earnings: number;
    courses: number;
  }>;
}

// Revenue calculation parameters
export interface RevenueCalculationParams {
  amount: number;
  authorType: AuthorType;
  affiliateCode?: string;
  customRevenueShare?: number; // Override default share
}

// Refund handling
export interface RevenueRefund {
  id: string;
  originalTransactionId: string;
  paymentId: string;
  
  refundAmount: number;
  platformRefund: number;
  authorDeduction: number;
  affiliateDeduction?: number;
  
  reason: string;
  status: 'pending' | 'processed';
  processedAt?: Date;
  createdAt: Date;
}