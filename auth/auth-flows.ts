/**
 * GroeimetAI Platform - Authentication Flows Architecture
 * Comprehensive authentication system with Firebase Auth
 */

import { UserProfile } from '../types';
import {
  Auth,
  User,
  UserCredential,
  AuthError,
  AuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  EmailAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  ActionCodeSettings,
  ParsedToken,
  IdTokenResult,
  MultiFactorResolver,
  MultiFactorError
} from 'firebase/auth';

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  deleteUser,
  onAuthStateChanged,
  getIdToken,
  getIdTokenResult,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  verifyBeforeUpdateEmail,
  reload,
  getMultiFactorResolver,
  multiFactor,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  getAdditionalUserInfo
} from 'firebase/auth';

import { auth, db } from '../src/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

// ============================================================================
// Authentication Flow Types
// ============================================================================

export interface AuthFlowResult<T = any> {
  success: boolean;
  data?: T;
  error?: AuthFlowError;
  requiresVerification?: boolean;
  requiresMFA?: boolean;
  mfaResolver?: MultiFactorResolver;
}

export interface AuthFlowError {
  code: string;
  message: string;
  details?: any;
  userFriendlyMessage: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  newsletter?: boolean;
  referralCode?: string;
}

export interface SocialLoginProvider {
  providerId: 'google.com' | 'facebook.com' | 'twitter.com' | 'microsoft.com' | 'apple.com';
  scopes?: string[];
  customParameters?: Record<string, string>;
}

export interface PasswordResetData {
  email: string;
  actionCodeSettings?: ActionCodeSettings;
}

export interface ProfileUpdateData {
  displayName?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
}

export interface EmailUpdateData {
  newEmail: string;
  currentPassword: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface PhoneVerificationData {
  phoneNumber: string;
  recaptchaVerifier: RecaptchaVerifier;
}

export interface MFASetupData {
  type: 'phone' | 'totp';
  phoneNumber?: string;
  displayName?: string;
}

// ============================================================================
// Authentication Service Class
// ============================================================================

export class AuthService {
  private auth: Auth;
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private authStateListeners: Set<(user: User | null) => void> = new Set();
  private profileListeners: Set<(profile: UserProfile | null) => void> = new Set();

  constructor(auth: Auth) {
    this.auth = auth;
    this.initializeAuthStateListener();
  }

  // ============================================================================
  // Authentication State Management
  // ============================================================================

  private initializeAuthStateListener(): void {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        // Load user profile from Firestore
        await this.loadUserProfile(user.uid);
        
        // Update last login timestamp
        await this.updateLastLogin(user.uid);
        
        // Refresh token if needed
        await this.refreshTokenIfNeeded(user);
      } else {
        this.userProfile = null;
      }

      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(user));
      this.profileListeners.forEach(listener => listener(this.userProfile));
    });
  }

  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.add(callback);
    return () => this.authStateListeners.delete(callback);
  }

  public onProfileChanged(callback: (profile: UserProfile | null) => void): () => void {
    this.profileListeners.add(callback);
    return () => this.profileListeners.delete(callback);
  }

  // ============================================================================
  // Email/Password Authentication
  // ============================================================================

  public async login(credentials: LoginCredentials): Promise<AuthFlowResult<User>> {
    try {
      const { email, password, rememberMe } = credentials;

      // Validate input
      const validation = this.validateLoginCredentials(credentials);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'validation-error',
            message: validation.message!,
            userFriendlyMessage: validation.message!
          }
        };
      }

      // Attempt sign in
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        await signOut(this.auth);
        return {
          success: false,
          requiresVerification: true,
          error: {
            code: 'email-not-verified',
            message: 'Email not verified',
            userFriendlyMessage: 'Please verify your email address before signing in.'
          }
        };
      }

      // Set persistence based on rememberMe
      if (rememberMe) {
        // Firebase Auth automatically handles persistence
        // We can store this preference in localStorage if needed
        localStorage.setItem('rememberMe', 'true');
      }

      // Log successful login
      await this.logAuthEvent('login_success', { method: 'email', userId: user.uid });

      return {
        success: true,
        data: user
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      await this.logAuthEvent('login_failed', { method: 'email', error: authError.code });
      
      return {
        success: false,
        error: authError
      };
    }
  }

  public async register(data: RegisterData): Promise<AuthFlowResult<User>> {
    try {
      const { email, password, firstName, lastName, acceptTerms, newsletter, referralCode } = data;

      // Validate input
      const validation = this.validateRegistrationData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'validation-error',
            message: validation.message!,
            userFriendlyMessage: validation.message!
          }
        };
      }

      // Check if email is already in use
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);
      if (signInMethods.length > 0) {
        return {
          success: false,
          error: {
            code: 'email-already-in-use',
            message: 'Email already in use',
            userFriendlyMessage: 'An account with this email already exists. Please sign in instead.'
          }
        };
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user document in Firestore
      await this.createUserProfile(user, {
        firstName,
        lastName,
        acceptTerms,
        newsletter: newsletter || false,
        referralCode
      });

      // Send email verification
      await this.sendVerificationEmail(user);

      // Log successful registration
      await this.logAuthEvent('register_success', { 
        method: 'email', 
        userId: user.uid,
        referralCode
      });

      return {
        success: true,
        data: user,
        requiresVerification: true
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      await this.logAuthEvent('register_failed', { method: 'email', error: authError.code });
      
      return {
        success: false,
        error: authError
      };
    }
  }

  // ============================================================================
  // Social Authentication
  // ============================================================================

  public async loginWithSocial(providerConfig: SocialLoginProvider): Promise<AuthFlowResult<User>> {
    try {
      const provider = this.createSocialProvider(providerConfig);
      const userCredential = await signInWithPopup(this.auth, provider);
      const user = userCredential.user;
      const additionalUserInfo = getAdditionalUserInfo(userCredential);
      const isNewUser = additionalUserInfo?.isNewUser;
      
      if (isNewUser) {
        // Create user profile for new social users
        await this.createSocialUserProfile(user, providerConfig.providerId);
      }

      await this.logAuthEvent('login_success', { 
        method: providerConfig.providerId, 
        userId: user.uid,
        isNewUser
      });

      return {
        success: true,
        data: user
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      await this.logAuthEvent('login_failed', { 
        method: providerConfig.providerId, 
        error: authError.code 
      });
      
      return {
        success: false,
        error: authError
      };
    }
  }

  private createSocialProvider(config: SocialLoginProvider): AuthProvider {
    let provider: AuthProvider;

    switch (config.providerId) {
      case 'google.com':
        provider = new GoogleAuthProvider();
        config.scopes?.forEach(scope => (provider as GoogleAuthProvider).addScope(scope));
        break;

      case 'facebook.com':
        provider = new FacebookAuthProvider();
        config.scopes?.forEach(scope => (provider as FacebookAuthProvider).addScope(scope));
        break;

      case 'twitter.com':
        provider = new TwitterAuthProvider();
        break;

      case 'microsoft.com':
        provider = new OAuthProvider('microsoft.com');
        config.scopes?.forEach(scope => (provider as OAuthProvider).addScope(scope));
        break;

      case 'apple.com':
        provider = new OAuthProvider('apple.com');
        config.scopes?.forEach(scope => (provider as OAuthProvider).addScope(scope));
        break;

      default:
        throw new Error(`Unsupported provider: ${config.providerId}`);
    }

    // Set custom parameters
    if (config.customParameters) {
      if (provider instanceof GoogleAuthProvider || provider instanceof OAuthProvider) {
        provider.setCustomParameters(config.customParameters);
      }
    }

    return provider;
  }

  // ============================================================================
  // Password Reset Flow
  // ============================================================================

  public async resetPassword(data: PasswordResetData): Promise<AuthFlowResult<void>> {
    try {
      const { email, actionCodeSettings } = data;

      // Validate email
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: {
            code: 'invalid-email',
            message: 'Invalid email format',
            userFriendlyMessage: 'Please enter a valid email address.'
          }
        };
      }

      // Check if email exists
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);
      if (signInMethods.length === 0) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          data: undefined
        };
      }

      // Send password reset email
      const actionCodeSettingsWithDefaults: ActionCodeSettings = {
        url: `${window.location.origin}/auth/reset-password-complete`,
        handleCodeInApp: true,
        ...actionCodeSettings
      };

      await sendPasswordResetEmail(this.auth, email, actionCodeSettingsWithDefaults);

      await this.logAuthEvent('password_reset_sent', { email });

      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      await this.logAuthEvent('password_reset_failed', { email: data.email, error: authError.code });
      
      return {
        success: false,
        error: authError
      };
    }
  }

  // ============================================================================
  // Email Verification
  // ============================================================================

  public async sendVerificationEmail(user?: User): Promise<AuthFlowResult<void>> {
    try {
      const targetUser = user || this.currentUser;
      if (!targetUser) {
        return {
          success: false,
          error: {
            code: 'no-user',
            message: 'No user found',
            userFriendlyMessage: 'Please sign in first.'
          }
        };
      }

      if (targetUser.emailVerified) {
        return {
          success: false,
          error: {
            code: 'already-verified',
            message: 'Email already verified',
            userFriendlyMessage: 'Your email is already verified.'
          }
        };
      }

      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth/verify-email-complete`,
        handleCodeInApp: true
      };

      await sendEmailVerification(targetUser, actionCodeSettings);

      await this.logAuthEvent('verification_email_sent', { userId: targetUser.uid });

      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      await this.logAuthEvent('verification_email_failed', { error: authError.code });
      
      return {
        success: false,
        error: authError
      };
    }
  }

  // ============================================================================
  // Multi-Factor Authentication
  // ============================================================================

  public async setupMFA(data: MFASetupData): Promise<AuthFlowResult<void>> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          error: {
            code: 'no-user',
            message: 'No user found',
            userFriendlyMessage: 'Please sign in first.'
          }
        };
      }

      const multiFactorUser = multiFactor(this.currentUser);

      if (data.type === 'phone') {
        // Setup phone MFA
        if (!data.phoneNumber) {
          return {
            success: false,
            error: {
              code: 'missing-phone',
              message: 'Phone number required',
              userFriendlyMessage: 'Please provide a phone number.'
            }
          };
        }

        // Implementation would continue with phone verification
        // This is a simplified version
        
      } else if (data.type === 'totp') {
        // Setup TOTP MFA
        const totpSecret = TotpMultiFactorGenerator.generateSecret({});
        // Implementation would continue with TOTP setup
      }

      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      return {
        success: false,
        error: authError
      };
    }
  }

  // ============================================================================
  // Profile Management
  // ============================================================================

  public async updateProfile(data: ProfileUpdateData): Promise<AuthFlowResult<void>> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          error: {
            code: 'no-user',
            message: 'No user found',
            userFriendlyMessage: 'Please sign in first.'
          }
        };
      }

      // Update Firebase Auth profile
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (data.displayName) authUpdates.displayName = data.displayName;
      if (data.photoURL) authUpdates.photoURL = data.photoURL;

      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(this.currentUser, authUpdates);
      }

      // Update Firestore profile
      const firestoreUpdates: any = {
        updatedAt: serverTimestamp()
      };

      if (data.firstName) firestoreUpdates['profile.firstName'] = data.firstName;
      if (data.lastName) firestoreUpdates['profile.lastName'] = data.lastName;
      if (data.phone) firestoreUpdates['profile.phone'] = data.phone;
      if (data.bio) firestoreUpdates['profile.bio'] = data.bio;

      await updateDoc(doc(db, 'users', this.currentUser.uid), firestoreUpdates);

      // Reload user profile
      await this.loadUserProfile(this.currentUser.uid);

      await this.logAuthEvent('profile_updated', { userId: this.currentUser.uid });

      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      return {
        success: false,
        error: authError
      };
    }
  }

  // ============================================================================
  // Account Management
  // ============================================================================

  public async logout(): Promise<AuthFlowResult<void>> {
    try {
      const userId = this.currentUser?.uid;
      
      await signOut(this.auth);
      
      // Clear local storage
      localStorage.removeItem('rememberMe');
      
      if (userId) {
        await this.logAuthEvent('logout_success', { userId });
      }

      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      return {
        success: false,
        error: authError
      };
    }
  }

  public async deleteAccount(password?: string): Promise<AuthFlowResult<void>> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          error: {
            code: 'no-user',
            message: 'No user found',
            userFriendlyMessage: 'Please sign in first.'
          }
        };
      }

      // Re-authenticate if password provided
      if (password) {
        const credential = EmailAuthProvider.credential(this.currentUser.email!, password);
        await reauthenticateWithCredential(this.currentUser, credential);
      }

      const userId = this.currentUser.uid;

      // Delete user data from Firestore (this should be done by a Cloud Function)
      // For now, we'll just mark the account as deleted
      await updateDoc(doc(db, 'users', userId), {
        deleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Delete Firebase Auth account
      await deleteUser(this.currentUser);

      await this.logAuthEvent('account_deleted', { userId });

      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      const authError = this.handleAuthError(error as AuthError);
      return {
        success: false,
        error: authError
      };
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private validateLoginCredentials(credentials: LoginCredentials): { valid: boolean; message?: string } {
    if (!credentials.email || !this.isValidEmail(credentials.email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    
    if (!credentials.password || credentials.password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters.' };
    }
    
    return { valid: true };
  }

  private validateRegistrationData(data: RegisterData): { valid: boolean; message?: string } {
    if (!data.email || !this.isValidEmail(data.email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    
    if (!data.password || data.password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters.' };
    }
    
    if (!data.firstName || data.firstName.trim().length < 2) {
      return { valid: false, message: 'First name must be at least 2 characters.' };
    }
    
    if (!data.lastName || data.lastName.trim().length < 2) {
      return { valid: false, message: 'Last name must be at least 2 characters.' };
    }
    
    if (!data.acceptTerms) {
      return { valid: false, message: 'You must accept the terms and conditions.' };
    }
    
    return { valid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleAuthError(error: AuthError): AuthFlowError {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
      'auth/popup-closed-by-user': 'Authentication was cancelled.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
      'auth/requires-recent-login': 'Please sign in again to complete this action.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-token-expired': 'Your session has expired. Please sign in again.',
      'auth/invalid-action-code': 'Invalid or expired action code.',
      'auth/expired-action-code': 'This link has expired. Please request a new one.',
      'auth/missing-multi-factor-info': 'Multi-factor authentication is required.',
      'auth/multi-factor-auth-required': 'Please complete multi-factor authentication.',
    };

    return {
      code: error.code,
      message: error.message,
      userFriendlyMessage: errorMessages[error.code] || 'An unexpected error occurred. Please try again.',
      details: error
    };
  }

  private async createUserProfile(user: User, additionalData: any): Promise<void> {
    const userProfile: any = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || `${additionalData.firstName} ${additionalData.lastName}`,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      role: 'student',
      permissions: [],
      
      profile: {
        firstName: additionalData.firstName,
        lastName: additionalData.lastName,
        avatar: user.photoURL,
      },
      
      subscription: {
        status: 'trial',
        plan: 'free',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        autoRenew: false
      },
      
      preferences: {
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        emailNotifications: true,
        pushNotifications: true,
        theme: 'system',
        playbackSpeed: 1,
        autoplay: false,
        subtitles: false
      },
      
      stats: {
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalStudyTime: 0,
        certificatesEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveAt: serverTimestamp(),
        totalPoints: 0,
        level: 1
      },
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };

    if (additionalData.referralCode) {
      userProfile.referralCode = additionalData.referralCode;
    }

    await setDoc(doc(db, 'users', user.uid), userProfile);
  }

  private async createSocialUserProfile(user: User, providerId: string): Promise<void> {
    const names = user.displayName?.split(' ') || ['', ''];
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    await this.createUserProfile(user, {
      firstName,
      lastName,
      acceptTerms: true, // Assumed for social login
      newsletter: false,
      providerId
    });
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        this.userProfile = userDoc.data() as UserProfile;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        lastLoginAt: serverTimestamp(),
        'stats.lastActiveAt': serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }

  private async refreshTokenIfNeeded(user: User): Promise<void> {
    try {
      const tokenResult = await getIdTokenResult(user);
      const now = Date.now() / 1000;
      
      // Refresh token if it expires in the next 5 minutes
      if (tokenResult.expirationTime && 
          (new Date(tokenResult.expirationTime).getTime() / 1000 - now) < 300) {
        await getIdToken(user, true);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  private async logAuthEvent(event: string, data: any): Promise<void> {
    try {
      // This would typically send to an analytics service
      console.log('Auth Event:', event, data);
      
      // You could also store in Firestore for audit purposes
      // await addDoc(collection(db, 'audit_logs'), {
      //   event,
      //   data,
      //   timestamp: serverTimestamp(),
      //   userAgent: navigator.userAgent,
      //   ip: await this.getClientIP()
      // });
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }

  // ============================================================================
  // Public Getters
  // ============================================================================

  public get user(): User | null {
    return this.currentUser;
  }

  public get profile(): UserProfile | null {
    return this.userProfile;
  }

  public get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public get isEmailVerified(): boolean {
    return this.currentUser?.emailVerified || false;
  }

  public get hasProfile(): boolean {
    return this.userProfile !== null;
  }
}

// ============================================================================
// Auth Flow Configurations
// ============================================================================

export const AUTH_CONFIGS = {
  // Email link sign-in settings
  emailLink: {
    url: `${window.location.origin}/auth/complete-signin`,
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.groeimetai.app'
    },
    android: {
      packageName: 'com.groeimetai.app',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: 'groeimetai.page.link'
  },

  // Social provider configurations
  socialProviders: {
    google: {
      providerId: 'google.com' as const,
      scopes: ['profile', 'email'],
      customParameters: {
        prompt: 'select_account'
      }
    },
    facebook: {
      providerId: 'facebook.com' as const,
      scopes: ['email', 'public_profile'],
      customParameters: {
        display: 'popup'
      }
    },
    microsoft: {
      providerId: 'microsoft.com' as const,
      scopes: ['openid', 'email', 'profile'],
      customParameters: {
        tenant: 'common'
      }
    }
  },

  // Password policies
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxLength: 128
  },

  // Session settings
  session: {
    rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshTokenThreshold: 5 * 60 * 1000 // 5 minutes
  }
};

// Export singleton instance
export const authService = new AuthService(auth);