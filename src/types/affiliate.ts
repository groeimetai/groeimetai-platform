// Affiliate Types

export interface AffiliateLink {
  id: string
  code: string
  courseId: string
  userId: string
  clickCount: number
  conversionCount: number
  revenue: number
  createdAt: Date
  updatedAt: Date
}

export interface AffiliatePartner {
  id: string
  name: string
  email: string
  commissionRate: number // percentage (e.g., 0.20 for 20%)
  totalEarnings: number
  totalClicks: number
  totalConversions: number
  status: 'active' | 'inactive' | 'pending'
  createdAt: Date
  updatedAt: Date
}

export interface AffiliateTransaction {
  id: string
  affiliatePartnerId: string
  affiliateLinkId: string
  courseId: string
  purchaseAmount: number
  commissionAmount: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled'
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AffiliateStats {
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  totalCommission: number
  conversionRate: number
  links: AffiliateLink[]
}