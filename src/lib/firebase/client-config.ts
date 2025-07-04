/**
 * Firebase client configuration
 * This file provides Firebase config that works both at build time and runtime
 */

// Default Firebase configuration for the groeimetai-platform project
const defaultConfig = {
  apiKey: "AIzaSyAcVXLLoHLOlybI9FACwhC7ZV50nVOCmM0",
  authDomain: "groeimetai-platform.firebaseapp.com",
  projectId: "groeimetai-platform",
  storageBucket: "groeimetai-platform.firebasestorage.app",
  messagingSenderId: "1031990594888",
  appId: "1:1031990594888:web:c707bf22aa511a101cf77d"
};

// Get Firebase configuration
// Uses environment variables if available, otherwise falls back to defaults
export function getFirebaseConfig() {
  // In production, Next.js requires NEXT_PUBLIC_ vars to be available at build time
  // If they're not available, we use the default configuration
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultConfig.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultConfig.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultConfig.appId,
  };

  // Validate that we have a complete configuration
  const isComplete = Object.values(config).every(value => value && value !== '');
  
  if (!isComplete) {
    console.warn('Firebase configuration is incomplete, using defaults');
    return defaultConfig;
  }

  return config;
}

// Export the configuration
export const firebaseConfig = getFirebaseConfig();