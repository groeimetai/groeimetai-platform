/**
 * Centralized Firebase database getter
 * This ensures Firebase is properly initialized before use
 */
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Auth } from 'firebase/auth';

let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let authInstance: Auth | null = null;

/**
 * Get Firestore instance with lazy initialization
 */
export function getDb(): Firestore {
  if (!dbInstance) {
    try {
      const { db } = require('@/lib/firebase');
      if (!db) {
        throw new Error('Firestore instance not available');
      }
      dbInstance = db;
    } catch (error) {
      console.error('Failed to get Firestore instance:', error);
      throw new Error('Firebase Firestore not available. Please check your configuration.');
    }
  }
  return dbInstance;
}

/**
 * Get Storage instance with lazy initialization
 */
export function getStorage(): FirebaseStorage {
  if (!storageInstance) {
    try {
      const { storage } = require('@/lib/firebase');
      if (!storage) {
        throw new Error('Storage instance not available');
      }
      storageInstance = storage;
    } catch (error) {
      console.error('Failed to get Storage instance:', error);
      throw new Error('Firebase Storage not available. Please check your configuration.');
    }
  }
  return storageInstance;
}

/**
 * Get Auth instance with lazy initialization
 */
export function getAuth(): Auth {
  if (!authInstance) {
    try {
      const { auth } = require('@/lib/firebase');
      if (!auth) {
        throw new Error('Auth instance not available');
      }
      authInstance = auth;
    } catch (error) {
      console.error('Failed to get Auth instance:', error);
      throw new Error('Firebase Auth not available. Please check your configuration.');
    }
  }
  return authInstance;
}