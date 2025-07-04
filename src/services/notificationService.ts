import { getDb } from '@/lib/firebase/db-getter'
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore'

interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'certificate' | 'course' | 'assessment' | 'general'
  data?: any
  read?: boolean
  createdAt?: Date
}

export class NotificationService {
  /**
   * Send notification to user
   */
  static async sendNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationDoc = {
        ...notification,
        read: false,
        createdAt: new Date(),
      }
      
      const docRef = await addDoc(collection(getDb(), 'notifications'), notificationDoc)
      return docRef.id
    } catch (error) {
      console.error('Send notification error:', error)
      throw error
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const q = query(
        collection(getDb(), 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Get user notifications error:', error)
      throw error
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(getDb(), 'notifications', notificationId), {
        read: true,
        readAt: new Date()
      })
    } catch (error) {
      console.error('Mark notification as read error:', error)
      throw error
    }
  }
}