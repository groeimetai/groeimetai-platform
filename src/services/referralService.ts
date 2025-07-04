import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase/db-getter';

export interface ReferralProgram {
  id: string;
  userId: string;
  referralCode: string;
  referredUsers: Array<{
    userId: string;
    email: string;
    signedUpAt: Date;
    madeFirstPurchase: boolean;
    purchaseDate?: Date;
  }>;
  rewards: Array<{
    type: 'free_lesson' | 'discount' | 'credit';
    courseId?: string;
    value?: number;
    usedAt?: Date;
    expiresAt: Date;
  }>;
  stats: {
    totalReferrals: number;
    successfulReferrals: number;
    totalEarned: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralReward {
  referrerReward: {
    type: 'free_lesson';
    courseId: string;
    expiryDays: number;
  };
  referredReward: {
    type: 'discount';
    percentage: number;
    maxAmount: number;
    validDays: number;
  };
}

const REFERRAL_REWARDS: ReferralReward = {
  referrerReward: {
    type: 'free_lesson',
    courseId: 'any', // User can choose any course
    expiryDays: 90
  },
  referredReward: {
    type: 'discount',
    percentage: 20,
    maxAmount: 50,
    validDays: 30
  }
};

export const referralService = {
  // Generate unique referral code
  generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `REF${timestamp}${random}`.toUpperCase();
  },

  // Create or get referral program for user
  async getOrCreateReferralProgram(userId: string, userEmail: string): Promise<ReferralProgram> {
    // Only run in browser
    if (typeof window === 'undefined') {
      throw new Error('Referral service only available in browser');
    }
    
    try {
      const programRef = doc(getDb(), 'referralPrograms', userId);
      const programDoc = await getDoc(programRef);

      if (programDoc.exists()) {
        const data = programDoc.data();
        // Convert Firestore timestamps to Date objects
        return { 
          id: programDoc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          referredUsers: (data.referredUsers || []).map((user: any) => ({
            ...user,
            signedUpAt: user.signedUpAt?.toDate ? user.signedUpAt.toDate() : new Date(user.signedUpAt),
            purchaseDate: user.purchaseDate?.toDate ? user.purchaseDate.toDate() : (user.purchaseDate ? new Date(user.purchaseDate) : undefined)
          })),
          rewards: (data.rewards || []).map((reward: any) => ({
            ...reward,
            expiresAt: reward.expiresAt?.toDate ? reward.expiresAt.toDate() : new Date(reward.expiresAt),
            usedAt: reward.usedAt?.toDate ? reward.usedAt.toDate() : (reward.usedAt ? new Date(reward.usedAt) : undefined)
          }))
        } as ReferralProgram;
      }

      // Create new referral program
      const newProgram: Omit<ReferralProgram, 'id'> = {
        userId,
        referralCode: this.generateReferralCode(userId),
        referredUsers: [],
        rewards: [],
        stats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          totalEarned: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(programRef, {
        ...newProgram,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { id: userId, ...newProgram };
    } catch (error) {
      console.error('Error in getOrCreateReferralProgram:', error);
      throw new Error('Kon referral programma niet aanmaken of ophalen');
    }
  },

  // Track referral signup
  async trackReferralSignup(
    referralCode: string, 
    newUserId: string, 
    newUserEmail: string
  ): Promise<{ success: boolean; discountCode?: string }> {
    try {
      // Find referral program by code
      const q = query(
        collection(getDb(), 'referralPrograms'), 
        where('referralCode', '==', referralCode)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false };
      }

      const programDoc = querySnapshot.docs[0];
      const program = programDoc.data() as ReferralProgram;

      // Check if user already referred
      const alreadyReferred = program.referredUsers.some(u => u.userId === newUserId);
      if (alreadyReferred) {
        return { success: false };
      }

      // Add referred user
      const updatedReferredUsers = [...program.referredUsers, {
        userId: newUserId,
        email: newUserEmail,
        signedUpAt: new Date(),
        madeFirstPurchase: false
      }];

      await updateDoc(doc(getDb(), 'referralPrograms', programDoc.id), {
        referredUsers: updatedReferredUsers,
        'stats.totalReferrals': program.stats.totalReferrals + 1,
        updatedAt: serverTimestamp()
      });

      // Create discount code for new user
      const discountCode = await this.createReferralDiscount(newUserId, referralCode);

      return { success: true, discountCode };
    } catch (error) {
      console.error('Error tracking referral signup:', error);
      return { success: false };
    }
  },

  // Track first purchase and reward referrer
  async trackFirstPurchase(
    userId: string, 
    purchaseAmount: number
  ): Promise<{ rewardGranted: boolean }> {
    try {
      // Find if user was referred
      const q = query(collection(getDb(), 'referralPrograms'));
      const querySnapshot = await getDocs(q);
      
      let referrerProgram: ReferralProgram | null = null;
      let referrerDocId: string | null = null;

      for (const doc of querySnapshot.docs) {
        const program = doc.data() as ReferralProgram;
        const referredUser = program.referredUsers.find(u => 
          u.userId === userId && !u.madeFirstPurchase
        );
        
        if (referredUser) {
          referrerProgram = program;
          referrerDocId = doc.id;
          break;
        }
      }

      if (!referrerProgram || !referrerDocId) {
        return { rewardGranted: false };
      }

      // Update referred user status
      const updatedReferredUsers = referrerProgram.referredUsers.map(u => 
        u.userId === userId 
          ? { ...u, madeFirstPurchase: true, purchaseDate: new Date() }
          : u
      );

      // Create free lesson reward
      const newReward = {
        type: 'free_lesson' as const,
        courseId: 'any',
        expiresAt: new Date(Date.now() + REFERRAL_REWARDS.referrerReward.expiryDays * 24 * 60 * 60 * 1000)
      };

      const updatedRewards = [...referrerProgram.rewards, newReward];

      // Update referrer's program
      await updateDoc(doc(getDb(), 'referralPrograms', referrerDocId), {
        referredUsers: updatedReferredUsers,
        rewards: updatedRewards,
        'stats.successfulReferrals': referrerProgram.stats.successfulReferrals + 1,
        'stats.totalEarned': referrerProgram.stats.totalEarned + purchaseAmount * 0.1, // 10% commission tracking
        updatedAt: serverTimestamp()
      });

      // Notify referrer about their reward
      await this.notifyReferrerAboutReward(referrerProgram.userId);

      return { rewardGranted: true };
    } catch (error) {
      console.error('Error tracking first purchase:', error);
      return { rewardGranted: false };
    }
  },

  // Create discount code for referred user
  async createReferralDiscount(userId: string, referralCode: string): Promise<string> {
    const discountCode = `WELCOME${Date.now().toString(36).toUpperCase()}`;
    
    const discount = {
      code: discountCode,
      userId,
      type: 'percentage',
      value: REFERRAL_REWARDS.referredReward.percentage,
      maxAmount: REFERRAL_REWARDS.referredReward.maxAmount,
      validUntil: new Date(Date.now() + REFERRAL_REWARDS.referredReward.validDays * 24 * 60 * 60 * 1000),
      usedAt: null,
      referralCode,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'discounts', discountCode), discount);
    
    return discountCode;
  },

  // Get user's referral stats
  async getUserReferralStats(userId: string, userEmail: string = '') {
    // Only run in browser
    if (typeof window === 'undefined') {
      return {
        referralCode: '',
        totalReferrals: 0,
        successfulReferrals: 0,
        availableRewards: 0,
        totalEarned: 0,
        referralLink: '',
        shareLinks: {
          whatsapp: '',
          facebook: '',
          twitter: '',
          linkedin: '',
          email: ''
        }
      };
    }
    
    try {
      const program = await this.getOrCreateReferralProgram(userId, userEmail);
      
      const activeRewards = program.rewards.filter(r => 
        !r.usedAt && new Date(r.expiresAt) > new Date()
      );

      const expiredRewards = program.rewards.filter(r => 
        !r.usedAt && new Date(r.expiresAt) <= new Date()
      );

      const usedRewards = program.rewards.filter(r => r.usedAt);

      return {
        referralCode: program.referralCode,
        stats: program.stats,
        activeRewards,
        expiredRewards,
        usedRewards,
        recentReferrals: program.referredUsers
          .sort((a, b) => {
            const dateA = a.signedUpAt instanceof Date ? a.signedUpAt : new Date(a.signedUpAt);
            const dateB = b.signedUpAt instanceof Date ? b.signedUpAt : new Date(b.signedUpAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error in getUserReferralStats:', error);
      throw new Error('Kon referral gegevens niet ophalen. Probeer het later opnieuw.');
    }
  },

  // Use free lesson reward
  async useFreeLesson(userId: string, courseId: string, userEmail: string = ''): Promise<{ success: boolean; error?: string }> {
    try {
      const program = await this.getOrCreateReferralProgram(userId, userEmail);
      
      // Find unused free lesson reward
      const availableReward = program.rewards.find(r => 
        r.type === 'free_lesson' && 
        !r.usedAt && 
        new Date(r.expiresAt) > new Date() &&
        (r.courseId === 'any' || r.courseId === courseId)
      );

      if (!availableReward) {
        return { success: false, error: 'Geen gratis proefles beschikbaar' };
      }

      // Mark reward as used
      const updatedRewards = program.rewards.map(r => 
        r === availableReward 
          ? { ...r, usedAt: new Date(), courseId } 
          : r
      );

      await updateDoc(doc(getDb(), 'referralPrograms', userId), {
        rewards: updatedRewards,
        updatedAt: serverTimestamp()
      });

      // Grant access to course lesson
      await this.grantCourseLessonAccess(userId, courseId);

      return { success: true };
    } catch (error) {
      console.error('Error using free lesson:', error);
      return { success: false, error: 'Er is een fout opgetreden' };
    }
  },

  // Grant access to first lesson of a course
  async grantCourseLessonAccess(userId: string, courseId: string) {
    const access = {
      userId,
      courseId,
      lessonAccess: ['lesson-1'], // First lesson only
      type: 'trial',
      grantedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days access
    };

    await setDoc(
      doc(db, 'courseAccess', `${userId}_${courseId}_trial`), 
      access
    );
  },

  // Get referral leaderboard
  async getLeaderboard(limit = 10) {
    const q = query(
      collection(getDb(), 'referralPrograms'),
      orderBy('stats.successfulReferrals', 'desc'),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as ReferralProgram;
      return {
        userId: data.userId,
        referralCode: data.referralCode,
        successfulReferrals: data.stats.successfulReferrals,
        totalEarned: data.stats.totalEarned
      };
    });
  },

  // Notify referrer about reward (placeholder for email/notification service)
  async notifyReferrerAboutReward(userId: string) {
    // TODO: Implement email notification
    console.log(`Notifying user ${userId} about new referral reward`);
  }
};