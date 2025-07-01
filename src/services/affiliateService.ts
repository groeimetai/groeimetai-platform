import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  AffiliateLink, 
  AffiliatePartner, 
  AffiliateTransaction, 
  AffiliateStats 
} from '@/types/affiliate'

export class AffiliateService {
  /**
   * Generate a unique affiliate link for a course and user
   */
  static async generateAffiliateLink(courseId: string, userId: string): Promise<AffiliateLink> {
    try {
      // Check if link already exists
      const existingLinkQuery = query(
        collection(db, 'affiliateLinks'),
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      )
      const existingSnapshot = await getDocs(existingLinkQuery)
      
      if (!existingSnapshot.empty) {
        const existingDoc = existingSnapshot.docs[0]
        return {
          id: existingDoc.id,
          ...existingDoc.data(),
          createdAt: existingDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: existingDoc.data().updatedAt?.toDate() || new Date()
        } as AffiliateLink
      }

      // Generate unique code
      const code = await this.generateUniqueCode()
      
      const newLink: Omit<AffiliateLink, 'id' | 'createdAt' | 'updatedAt'> = {
        code,
        courseId,
        userId,
        clickCount: 0,
        conversionCount: 0,
        revenue: 0
      }

      const docRef = await addDoc(collection(db, 'affiliateLinks'), {
        ...newLink,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return {
        id: docRef.id,
        ...newLink,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('Error generating affiliate link:', error)
      throw new Error('Failed to generate affiliate link')
    }
  }

  /**
   * Track a click on an affiliate link
   */
  static async trackAffiliateClick(code: string): Promise<void> {
    try {
      const linkQuery = query(
        collection(db, 'affiliateLinks'),
        where('code', '==', code)
      )
      const snapshot = await getDocs(linkQuery)
      
      if (snapshot.empty) {
        throw new Error('Affiliate link not found')
      }

      const linkDoc = snapshot.docs[0]
      await updateDoc(doc(db, 'affiliateLinks', linkDoc.id), {
        clickCount: increment(1),
        updatedAt: serverTimestamp()
      })

      // Track click analytics
      await addDoc(collection(db, 'affiliateClicks'), {
        affiliateLinkId: linkDoc.id,
        code,
        timestamp: serverTimestamp(),
        // Additional tracking data can be added here (IP, user agent, etc.)
      })
    } catch (error) {
      console.error('Error tracking affiliate click:', error)
      throw new Error('Failed to track affiliate click')
    }
  }

  /**
   * Process an affiliate conversion (when a purchase is made)
   */
  static async processAffiliateConversion(
    code: string, 
    purchaseAmount: number,
    currency: string = 'EUR'
  ): Promise<AffiliateTransaction> {
    try {
      // Get affiliate link
      const linkQuery = query(
        collection(db, 'affiliateLinks'),
        where('code', '==', code)
      )
      const linkSnapshot = await getDocs(linkQuery)
      
      if (linkSnapshot.empty) {
        throw new Error('Affiliate link not found')
      }

      const linkDoc = linkSnapshot.docs[0]
      const linkData = linkDoc.data()

      // Get affiliate partner details
      const partner = await this.getAffiliatePartner(linkData.userId)
      if (!partner) {
        throw new Error('Affiliate partner not found')
      }

      // Calculate commission
      const commissionAmount = this.calculateCommission(purchaseAmount, partner.commissionRate)

      // Create transaction
      const transaction: Omit<AffiliateTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
        affiliatePartnerId: partner.id,
        affiliateLinkId: linkDoc.id,
        courseId: linkData.courseId,
        purchaseAmount,
        commissionAmount,
        currency,
        status: 'pending'
      }

      const transactionRef = await addDoc(collection(db, 'affiliateTransactions'), {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Update affiliate link stats
      await updateDoc(doc(db, 'affiliateLinks', linkDoc.id), {
        conversionCount: increment(1),
        revenue: increment(purchaseAmount),
        updatedAt: serverTimestamp()
      })

      // Update partner stats
      await updateDoc(doc(db, 'affiliatePartners', partner.id), {
        totalEarnings: increment(commissionAmount),
        totalConversions: increment(1),
        updatedAt: serverTimestamp()
      })

      return {
        id: transactionRef.id,
        ...transaction,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('Error processing affiliate conversion:', error)
      throw new Error('Failed to process affiliate conversion')
    }
  }

  /**
   * Get affiliate statistics for a user
   */
  static async getAffiliateStats(userId: string): Promise<AffiliateStats> {
    try {
      // Get all affiliate links for user
      const linksQuery = query(
        collection(db, 'affiliateLinks'),
        where('userId', '==', userId)
      )
      const linksSnapshot = await getDocs(linksQuery)
      
      const links: AffiliateLink[] = []
      let totalClicks = 0
      let totalConversions = 0
      let totalRevenue = 0

      linksSnapshot.forEach(doc => {
        const data = doc.data()
        links.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as AffiliateLink)
        
        totalClicks += data.clickCount || 0
        totalConversions += data.conversionCount || 0
        totalRevenue += data.revenue || 0
      })

      // Get partner details for commission calculation
      const partner = await this.getAffiliatePartner(userId)
      const totalCommission = partner ? this.calculateCommission(totalRevenue, partner.commissionRate) : 0

      return {
        totalClicks,
        totalConversions,
        totalRevenue,
        totalCommission,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        links
      }
    } catch (error) {
      console.error('Error getting affiliate stats:', error)
      throw new Error('Failed to get affiliate stats')
    }
  }

  /**
   * Calculate commission based on amount and rate
   */
  static calculateCommission(amount: number, rate: number): number {
    return Math.round(amount * rate * 100) / 100
  }

  /**
   * Get affiliate partner details
   */
  private static async getAffiliatePartner(userId: string): Promise<AffiliatePartner | null> {
    try {
      const partnerQuery = query(
        collection(db, 'affiliatePartners'),
        where('id', '==', userId)
      )
      const snapshot = await getDocs(partnerQuery)
      
      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      const data = doc.data()
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as AffiliatePartner
    } catch (error) {
      console.error('Error getting affiliate partner:', error)
      return null
    }
  }

  /**
   * Generate a unique affiliate code
   */
  private static async generateUniqueCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code: string
    let attempts = 0
    const maxAttempts = 10

    do {
      code = ''
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length))
      }

      // Check if code exists
      const existingQuery = query(
        collection(db, 'affiliateLinks'),
        where('code', '==', code)
      )
      const snapshot = await getDocs(existingQuery)
      
      if (snapshot.empty) {
        return code
      }

      attempts++
    } while (attempts < maxAttempts)

    throw new Error('Failed to generate unique affiliate code')
  }

  /**
   * Create or update an affiliate partner
   */
  static async createOrUpdateAffiliatePartner(
    userId: string,
    data: Partial<Omit<AffiliatePartner, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<AffiliatePartner> {
    try {
      const existingPartner = await this.getAffiliatePartner(userId)
      
      if (existingPartner) {
        // Update existing partner
        await updateDoc(doc(db, 'affiliatePartners', existingPartner.id), {
          ...data,
          updatedAt: serverTimestamp()
        })
        
        return {
          ...existingPartner,
          ...data,
          updatedAt: new Date()
        }
      } else {
        // Create new partner
        const newPartner: Omit<AffiliatePartner, 'createdAt' | 'updatedAt'> = {
          id: userId,
          name: data.name || '',
          email: data.email || '',
          commissionRate: data.commissionRate || 0.20, // Default 20%
          totalEarnings: 0,
          totalClicks: 0,
          totalConversions: 0,
          status: 'pending'
        }

        await addDoc(collection(db, 'affiliatePartners'), {
          ...newPartner,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })

        return {
          ...newPartner,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    } catch (error) {
      console.error('Error creating/updating affiliate partner:', error)
      throw new Error('Failed to create/update affiliate partner')
    }
  }

  /**
   * Process affiliate conversion from cookies (to be called during payment processing)
   */
  static async processAffiliateConversionFromCookies(
    cookies: { affiliate_code?: string; affiliate_course?: string },
    purchaseAmount: number,
    purchasedCourseId: string,
    currency: string = 'EUR'
  ): Promise<AffiliateTransaction | null> {
    try {
      const { affiliate_code, affiliate_course } = cookies
      
      // Check if we have an affiliate code
      if (!affiliate_code) {
        return null
      }

      // Verify the affiliate code is for the purchased course (if course was specified)
      if (affiliate_course && affiliate_course !== purchasedCourseId) {
        // The affiliate link was for a different course
        return null
      }

      // Process the conversion
      return await this.processAffiliateConversion(affiliate_code, purchaseAmount, currency)
    } catch (error) {
      console.error('Error processing affiliate conversion from cookies:', error)
      return null
    }
  }

  /**
   * Get affiliate transactions for a partner
   */
  static async getAffiliateTransactions(
    affiliatePartnerId: string,
    status?: 'pending' | 'paid' | 'cancelled'
  ): Promise<AffiliateTransaction[]> {
    try {
      let transactionsQuery = query(
        collection(db, 'affiliateTransactions'),
        where('affiliatePartnerId', '==', affiliatePartnerId)
      )

      if (status) {
        transactionsQuery = query(
          transactionsQuery,
          where('status', '==', status)
        )
      }

      const snapshot = await getDocs(transactionsQuery)
      const transactions: AffiliateTransaction[] = []

      snapshot.forEach(doc => {
        const data = doc.data()
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          paidAt: data.paidAt?.toDate()
        } as AffiliateTransaction)
      })

      return transactions
    } catch (error) {
      console.error('Error getting affiliate transactions:', error)
      throw new Error('Failed to get affiliate transactions')
    }
  }
}