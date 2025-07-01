/**
 * GroeimetAI Platform - Certificate Generation and QR Verification System
 * Comprehensive digital certificate system with blockchain-ready verification
 */

import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
// import { createCanvas, loadImage, registerFont } from 'canvas';
import crypto from 'crypto';
import { db } from '../src/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  increment,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
const storage = getStorage();

// ============================================================================
// Certificate Types and Interfaces
// ============================================================================

export interface CertificateRequest {
  userId: string;
  courseId: string;
  completionData: CourseCompletionData;
  template?: string;
  customization?: CertificateCustomization;
}

export interface CourseCompletionData {
  completedAt: Date;
  finalScore: number;
  totalTime: number; // in minutes
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' | 'Pass' | 'Fail';
  modules: ModuleCompletion[];
  achievements: string[];
  courseName: string;
  courseDescription: string;
  instructorName: string;
  instructorTitle: string;
  duration: number; // course duration in hours
}

export interface ModuleCompletion {
  moduleId: string;
  moduleName: string;
  completedAt: Date;
  score: number;
  timeSpent: number;
}

export interface CertificateCustomization {
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo?: string;
  backgroundImage?: string;
  signature?: string;
  layout?: 'landscape' | 'portrait';
  template?: 'modern' | 'classic' | 'elegant' | 'minimal';
}

export interface CertificateResult {
  success: boolean;
  certificateId?: string;
  certificateUrl?: string;
  qrCode?: string;
  verificationUrl?: string;
  error?: CertificateError;
}

export interface CertificateError {
  code: string;
  message: string;
  userFriendlyMessage: string;
  details?: any;
}

export interface VerificationRequest {
  certificateId?: string;
  qrCode?: string;
  verificationCode?: string;
}

export interface VerificationResult {
  valid: boolean;
  certificate?: CertificateData;
  verificationDetails?: VerificationDetails;
  error?: CertificateError;
}

export interface VerificationDetails {
  verifiedAt: Date;
  scanCount: number;
  lastScanned: Date;
  verificationMethod: 'qr' | 'manual' | 'api';
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country: string;
    city: string;
  };
}

export interface CertificateData {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  courseDescription: string;
  instructorName: string;
  instructorTitle: string;
  completionDate: Date;
  issueDate: Date;
  grade: string;
  score: number;
  duration: number;
  achievements: string[];
  organizationName: string;
  organizationLogo: string;
  isValid: boolean;
  expiresAt?: Date;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  layout: 'landscape' | 'portrait';
  width: number;
  height: number;
  elements: TemplateElement[];
  fonts: FontDefinition[];
  colors: ColorPalette;
  preview: string;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr' | 'signature' | 'date' | 'logo';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  rotation?: number;
  opacity?: number;
  zIndex?: number;
  dynamic?: boolean; // If content should be replaced with dynamic data
}

export interface FontDefinition {
  family: string;
  url: string;
  weight?: string;
  style?: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  border: string;
}

// ============================================================================
// Certificate Service Class
// ============================================================================

export class CertificateService {
  private templates: Map<string, CertificateTemplate> = new Map();
  private verificationBaseUrl: string;
  private organizationInfo: OrganizationInfo;

  constructor() {
    this.verificationBaseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificate/verify`;
    this.organizationInfo = {
      name: 'GroeimetAI Academy',
      logo: '/images/logo.png',
      website: 'https://groeimetai.com',
      address: 'Netherlands',
      registrationNumber: 'KVK-12345678'
    };
    
    this.initializeTemplates();
  }

  // ============================================================================
  // Certificate Generation
  // ============================================================================

  public async generateCertificate(request: CertificateRequest): Promise<CertificateResult> {
    try {
      // Validate request
      const validation = await this.validateCertificateRequest(request);
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

      // Check if certificate already exists
      const existingCertificate = await this.checkExistingCertificate(request.userId, request.courseId);
      if (existingCertificate) {
        return {
          success: false,
          error: {
            code: 'certificate-exists',
            message: 'Certificate already exists',
            userFriendlyMessage: 'A certificate has already been issued for this course.'
          }
        };
      }

      // Generate unique certificate ID and number
      const certificateId = this.generateCertificateId();
      const certificateNumber = this.generateCertificateNumber();

      // Create certificate document
      const certificateDoc = await this.createCertificateDocument(
        certificateId,
        certificateNumber,
        request
      );

      // Generate QR code
      const qrCodeData = await this.generateQRCode(certificateId);

      /*
      // Generate certificate PDF
      const template = this.getTemplate(request.template || 'modern');
      const certificatePDF = await this.generateCertificatePDF(
        template,
        certificateDoc,
        qrCodeData,
        request.customization
      );

      // Upload certificate to storage
      const certificateUrl = await this.uploadCertificate(certificateId, certificatePDF);
*/

      // Update certificate document with URLs
      await updateDoc(doc(db, 'certificates', certificateId), {
        qrCode: {
          ...qrCodeData,
          generatedAt: serverTimestamp()
        },
        sharing: {
          publicUrl: `${this.verificationBaseUrl}/${certificateId}`,
          downloadUrl: '',
          shareCount: 0,
          viewCount: 0
        },
        updatedAt: serverTimestamp()
      });

      // Update user stats
      await this.updateUserCertificateStats(request.userId);

      // Send certificate email
      await this.sendCertificateEmail(certificateId, request.userId);

      // Log certificate generation
      await this.logCertificateEvent('certificate_generated', {
        certificateId,
        userId: request.userId,
        courseId: request.courseId,
        grade: request.completionData.grade,
        score: request.completionData.finalScore
      });

      return {
        success: true,
        certificateId,
        certificateUrl: '',
        qrCode: qrCodeData.code,
        verificationUrl: `${this.verificationBaseUrl}/${certificateId}`
      };

    } catch (error) {
      const certificateError = this.handleCertificateError(error);
      
      await this.logCertificateEvent('certificate_generation_failed', {
        userId: request.userId,
        courseId: request.courseId,
        error: certificateError.code
      });

      return {
        success: false,
        error: certificateError
      };
    }
  }

  // ============================================================================
  // QR Code Generation and Verification
  // ============================================================================

  private async generateQRCode(certificateId: string): Promise<{ code: string; verificationUrl: string }> {
    const verificationUrl = `${this.verificationBaseUrl}/${certificateId}`;
    const verificationCode = this.generateVerificationCode(certificateId);
    
    // Create QR code data with verification info
    const qrData = {
      certificateId,
      verificationUrl,
      verificationCode,
      timestamp: Date.now(),
      issuer: this.organizationInfo.name
    };

    const qrDataString = JSON.stringify(qrData);
    const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return {
      code: qrCodeDataURL,
      verificationUrl
    };
  }

  public async verifyCertificate(request: VerificationRequest): Promise<VerificationResult> {
    try {
      let certificateId: string;

      // Extract certificate ID from different sources
      if (request.certificateId) {
        certificateId = request.certificateId;
      } else if (request.qrCode) {
        try {
          const qrData = JSON.parse(request.qrCode);
          certificateId = qrData.certificateId;
        } catch {
          return {
            valid: false,
            error: {
              code: 'invalid-qr-code',
              message: 'Invalid QR code format',
              userFriendlyMessage: 'The QR code is invalid or corrupted.'
            }
          };
        }
      } else if (request.verificationCode) {
        certificateId = this.extractCertificateIdFromCode(request.verificationCode);
      } else {
        return {
          valid: false,
          error: {
            code: 'missing-identifier',
            message: 'No certificate identifier provided',
            userFriendlyMessage: 'Please provide a certificate ID, QR code, or verification code.'
          }
        };
      }

      // Get certificate document
      const certificateDoc = await getDoc(doc(db, 'certificates', certificateId));
      if (!certificateDoc.exists()) {
        return {
          valid: false,
          error: {
            code: 'certificate-not-found',
            message: 'Certificate not found',
            userFriendlyMessage: 'No certificate found with the provided identifier.'
          }
        };
      }

      const certificateData = certificateDoc.data();

      // Check certificate validity
      const validityCheck = this.checkCertificateValidity(certificateData);
      if (!validityCheck.valid) {
        return {
          valid: false,
          error: validityCheck.error!
        };
      }

      // Update scan statistics
      await this.updateVerificationStats(certificateId);

      // Create verification details
      const verificationDetails: VerificationDetails = {
        verifiedAt: new Date(),
        scanCount: certificateData.qrCode.scanCount + 1,
        lastScanned: new Date(),
        verificationMethod: request.qrCode ? 'qr' : request.verificationCode ? 'manual' : 'api'
      };

      // Format certificate data for response
      const certificate: CertificateData = {
        id: certificateData.id,
        certificateNumber: certificateData.certificateNumber,
        studentName: `${certificateData.studentName}`,
        courseName: certificateData.courseName,
        courseDescription: certificateData.courseDescription,
        instructorName: certificateData.instructorName,
        instructorTitle: certificateData.instructorTitle,
        completionDate: certificateData.completion.completedAt.toDate(),
        issueDate: certificateData.createdAt.toDate(),
        grade: certificateData.completion.grade,
        score: certificateData.completion.finalScore,
        duration: Math.round(certificateData.completion.totalTime / 60), // Convert to hours
        achievements: certificateData.completion.achievements,
        organizationName: this.organizationInfo.name,
        organizationLogo: this.organizationInfo.logo,
        isValid: certificateData.validation.isValid,
        expiresAt: certificateData.validation.expiresAt?.toDate()
      };

      await this.logCertificateEvent('certificate_verified', {
        certificateId,
        verificationMethod: verificationDetails.verificationMethod,
        scanCount: verificationDetails.scanCount
      });

      return {
        valid: true,
        certificate,
        verificationDetails
      };

    } catch (error) {
      const certificateError = this.handleCertificateError(error);
      
      await this.logCertificateEvent('certificate_verification_failed', {
        request,
        error: certificateError.code
      });

      return {
        valid: false,
        error: certificateError
      };
    }
  }

  // ============================================================================
  // PDF Generation
  // ============================================================================

  /*
  private async generateCertificatePDF(
    template: CertificateTemplate,
    certificateData: any,
    qrCodeData: any,
    customization?: CertificateCustomization
  ): Promise<Buffer> {
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    // Apply customization
    const colors = { ...template.colors, ...customization?.colors };
    const fonts = { ...template.fonts, ...customization?.fonts };

    // Set background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, template.width, template.height);

    // Load and register fonts
    await this.loadTemplateFonts(template.fonts);

    // Render template elements
    for (const element of template.elements) {
      await this.renderTemplateElement(ctx, element, certificateData, qrCodeData, colors, fonts);
    }

    // Convert canvas to PDF
    const pdf = new jsPDF({
      orientation: template.layout === 'landscape' ? 'landscape' : 'portrait',
      unit: 'px',
      format: [template.width, template.height]
    });

    const canvasDataURL = canvas.toDataURL('image/jpeg', 1.0);
    pdf.addImage(canvasDataURL, 'JPEG', 0, 0, template.width, template.height);

    return Buffer.from(pdf.output('arraybuffer'));
  }
*/

  private async renderTemplateElement(
    ctx: CanvasRenderingContext2D,
    element: TemplateElement,
    certificateData: any,
    qrCodeData: any,
    colors: ColorPalette,
    fonts: any
  ): Promise<void> {
    ctx.save();

    // Apply transformations
    if (element.rotation) {
      ctx.translate(element.x + (element.width || 0) / 2, element.y + (element.height || 0) / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-(element.width || 0) / 2, -(element.height || 0) / 2);
    } else {
      ctx.translate(element.x, element.y);
    }

    if (element.opacity) {
      ctx.globalAlpha = element.opacity;
    }

    switch (element.type) {
      case 'text':
        await this.renderTextElement(ctx, element, certificateData, colors, fonts);
        break;
      /*
case 'image':
        await this.renderImageElement(ctx, element);
        break;
*/
      /*
case 'qr':
        await this.renderQRElement(ctx, element, qrCodeData);
        break;
*/
      /*
case 'signature':
        await this.renderSignatureElement(ctx, element, certificateData);
        break;
*/
      /*
case 'logo':
        await this.renderLogoElement(ctx, element);
        break;
*/
      /*
case 'shape':
        await this.renderShapeElement(ctx, element, colors);
        break;
*/
    }

    ctx.restore();
  }

  private async renderTextElement(
    ctx: CanvasRenderingContext2D,
    element: TemplateElement,
    certificateData: any,
    colors: ColorPalette,
    fonts: any
  ): Promise<void> {
    let content = element.content || '';

    // Replace dynamic placeholders
    if (element.dynamic) {
      content = this.replacePlaceholders(content, certificateData);
    }

    // Set font
    const fontSize = element.fontSize || 16;
    const fontFamily = element.fontFamily || fonts.primary || 'Arial';
    const fontWeight = element.fontWeight || 'normal';
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Set color
    ctx.fillStyle = element.color || colors.text;

    // Set alignment
    ctx.textAlign = element.alignment || 'left';

    // Draw text
    const lines = content.split('\n');
    const lineHeight = fontSize * 1.2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, 0, index * lineHeight);
    });
  }

  /*
private async renderImageElement(ctx: CanvasRenderingContext2D, element: TemplateElement): Promise<void> {
    if (!element.content) return;

    try {
      const image = await loadImage(element.content);
      ctx.drawImage(image, 0, 0, element.width || image.width, element.height || image.height);
    } catch (error) {
      console.error('Failed to load image:', element.content, error);
    }
  }
*/

  /*
private async renderQRElement(
    ctx: CanvasRenderingContext2D,
    element: TemplateElement,
    qrCodeData: any
  ): Promise<void> {
    try {
      const qrImage = await loadImage(qrCodeData.code);
      const size = Math.min(element.width || 100, element.height || 100);
      ctx.drawImage(qrImage, 0, 0, size, size);
    } catch (error) {
      console.error('Failed to render QR code:', error);
    }
  }
*/

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private generateCertificateId(): string {
    return `cert_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${year}${month}-${random}`;
  }

  private generateVerificationCode(certificateId: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(certificateId + process.env.CERTIFICATE_SECRET!);
    return hash.digest('hex').substring(0, 16).toUpperCase();
  }

  private extractCertificateIdFromCode(verificationCode: string): string {
    // This would implement reverse lookup of certificate ID from verification code
    // For now, we'll return empty string to indicate failure
    return '';
  }

  private async validateCertificateRequest(request: CertificateRequest): Promise<{ valid: boolean; message?: string }> {
    if (!request.userId || !request.courseId) {
      return { valid: false, message: 'User ID and Course ID are required.' };
    }

    if (!request.completionData) {
      return { valid: false, message: 'Completion data is required.' };
    }

    if (request.completionData.finalScore < 0 || request.completionData.finalScore > 100) {
      return { valid: false, message: 'Invalid final score.' };
    }

    // Check if user exists
    const userDoc = await getDoc(doc(db, 'users', request.userId));
    if (!userDoc.exists()) {
      return { valid: false, message: 'User not found.' };
    }

    // Check if course exists
    const courseDoc = await getDoc(doc(db, 'courses', request.courseId));
    if (!courseDoc.exists()) {
      return { valid: false, message: 'Course not found.' };
    }

    // Check if user has completed the course
    const enrollmentDoc = await getDoc(doc(db, 'enrollments', `${request.userId}_${request.courseId}`));
    if (!enrollmentDoc.exists() || enrollmentDoc.data().status !== 'completed') {
      return { valid: false, message: 'Course not completed by user.' };
    }

    return { valid: true };
  }

  private async checkExistingCertificate(userId: string, courseId: string): Promise<boolean> {
    // Query for existing certificate
    const certificatesRef = collection(db, 'certificates');
    const existingQuery = query(
      certificatesRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      where('validation.isValid', '==', true)
    );
    
    const existingDocs = await getDocs(existingQuery);
    return !existingDocs.empty;
  }

  private async createCertificateDocument(
    certificateId: string,
    certificateNumber: string,
    request: CertificateRequest
  ): Promise<any> {
    // Get user and course data
    const [userDoc, courseDoc] = await Promise.all([
      getDoc(doc(db, 'users', request.userId)),
      getDoc(doc(db, 'courses', request.courseId))
    ]);

    const userData = userDoc.data();
    const courseData = courseDoc.data();

    const certificateData = {
      id: certificateId,
      userId: request.userId,
      courseId: request.courseId,
      certificateNumber,
      studentName: `${userData?.profile.firstName} ${userData?.profile.lastName}`,
      courseName: request.completionData.courseName,
      courseDescription: request.completionData.courseDescription,
      instructorName: request.completionData.instructorName,
      instructorTitle: request.completionData.instructorTitle || 'Instructor',
      
      completion: {
        completedAt: Timestamp.fromDate(request.completionData.completedAt),
        finalScore: request.completionData.finalScore,
        totalTime: request.completionData.totalTime,
        grade: request.completionData.grade,
        modules: request.completionData.modules.map(module => ({
          moduleId: module.moduleId,
          moduleName: module.moduleName,
          completedAt: Timestamp.fromDate(module.completedAt),
          score: module.score,
          timeSpent: module.timeSpent
        })),
        achievements: request.completionData.achievements
      },
      
      validation: {
        isValid: true,
        validatedAt: serverTimestamp(),
        expiresAt: null, // Certificates don't expire by default
        revokedAt: null,
        revokedReason: null,
        revokedBy: null
      },
      
      design: {
        template: request.template || 'modern',
        colors: request.customization?.colors || {},
        logo: this.organizationInfo.logo,
        signature: request.customization?.signature || '/images/default-signature.png'
      },
      
      qrCode: {
        code: '',
        verificationUrl: '',
        generatedAt: null,
        scanCount: 0,
        lastScannedAt: null
      },
      
      sharing: {
        publicUrl: '',
        downloadUrl: '',
        shareCount: 0,
        viewCount: 0
      },
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'certificates', certificateId), certificateData);

    return certificateData;
  }

  private checkCertificateValidity(certificateData: any): { valid: boolean; error?: CertificateError } {
    if (!certificateData.validation.isValid) {
      return {
        valid: false,
        error: {
          code: 'certificate-invalid',
          message: 'Certificate is not valid',
          userFriendlyMessage: 'This certificate is not valid.'
        }
      };
    }

    if (certificateData.validation.revokedAt) {
      return {
        valid: false,
        error: {
          code: 'certificate-revoked',
          message: 'Certificate has been revoked',
          userFriendlyMessage: `This certificate has been revoked: ${certificateData.validation.revokedReason}`
        }
      };
    }

    if (certificateData.validation.expiresAt && 
        certificateData.validation.expiresAt.toDate() < new Date()) {
      return {
        valid: false,
        error: {
          code: 'certificate-expired',
          message: 'Certificate has expired',
          userFriendlyMessage: 'This certificate has expired.'
        }
      };
    }

    return { valid: true };
  }

  private async updateVerificationStats(certificateId: string): Promise<void> {
    await updateDoc(doc(db, 'certificates', certificateId), {
      'qrCode.scanCount': increment(1),
      'qrCode.lastScannedAt': serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  private async updateUserCertificateStats(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      'stats.certificatesEarned': increment(1),
      updatedAt: serverTimestamp()
    });
  }

  private replacePlaceholders(content: string, certificateData: any): string {
    const placeholders: Record<string, any> = {
      '{{studentName}}': certificateData.studentName,
      '{{courseName}}': certificateData.courseName,
      '{{courseDescription}}': certificateData.courseDescription,
      '{{instructorName}}': certificateData.instructorName,
      '{{instructorTitle}}': certificateData.instructorTitle,
      '{{completionDate}}': certificateData.completion.completedAt.toDate().toLocaleDateString(),
      '{{issueDate}}': certificateData.createdAt.toDate().toLocaleDateString(),
      '{{certificateNumber}}': certificateData.certificateNumber,
      '{{grade}}': certificateData.completion.grade,
      '{{score}}': certificateData.completion.finalScore,
      '{{organizationName}}': this.organizationInfo.name
    };

    let result = content;
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return result;
  }

  private getTemplate(templateId: string): CertificateTemplate {
    return this.templates.get(templateId) || this.templates.get('modern')!;
  }

  private initializeTemplates(): void {
    // Initialize default templates
    this.templates.set('modern', this.createModernTemplate());
    /*
this.templates.set('classic', this.createClassicTemplate());
    this.templates.set('elegant', this.createElegantTemplate());
    this.templates.set('minimal', this.createMinimalTemplate());
*/
  }

  private createModernTemplate(): CertificateTemplate {
    return {
      id: 'modern',
      name: 'Modern Certificate',
      description: 'Clean, modern design with bold typography',
      layout: 'landscape',
      width: 1056,
      height: 816,
      elements: [
        // Background elements, text elements, etc.
        // This would be a comprehensive template definition
      ],
      fonts: [],
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        text: '#1e293b',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      preview: '/images/templates/modern-preview.jpg'
    };
  }

  // Additional template creation methods would follow...

  private async uploadCertificate(certificateId: string, pdfBuffer: Buffer): Promise<string> {
    const fileName = `certificates/${certificateId}.pdf`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, pdfBuffer, {
      contentType: 'application/pdf',
      customMetadata: {
        certificateId,
        createdAt: new Date().toISOString()
      }
    });

    return await getDownloadURL(storageRef);
  }

  private async sendCertificateEmail(certificateId: string, userId: string): Promise<void> {
    // Implementation would send email with certificate
    console.log('Sending certificate email:', certificateId, userId);
  }

  private handleCertificateError(error: any): CertificateError {
    const errorMessages: Record<string, string> = {
      'validation-error': 'Invalid certificate request data.',
      'certificate-exists': 'Certificate already exists for this course.',
      'user-not-found': 'User not found.',
      'course-not-found': 'Course not found.',
      'course-not-completed': 'Course has not been completed.',
      'generation-failed': 'Failed to generate certificate.',
      'storage-error': 'Failed to save certificate.',
      'invalid-qr-code': 'Invalid QR code format.',
      'certificate-not-found': 'Certificate not found.',
      'certificate-invalid': 'Certificate is not valid.',
      'certificate-revoked': 'Certificate has been revoked.',
      'certificate-expired': 'Certificate has expired.'
    };

    const code = error.code || 'unknown-error';
    const message = error.message || 'Unknown certificate error';
    const userFriendlyMessage = errorMessages[code] || 'An unexpected error occurred.';

    return {
      code,
      message,
      userFriendlyMessage,
      details: error
    };
  }

  private async logCertificateEvent(event: string, data: any): Promise<void> {
    try {
      console.log('Certificate Event:', event, data);
      
      await addDoc(collection(db, 'audit_logs'), {
        event,
        type: 'certificate',
        data,
        timestamp: serverTimestamp(),
        source: 'certificate-service'
      });
    } catch (error) {
      console.error('Failed to log certificate event:', error);
    }
  }
}

// ============================================================================
// Certificate Configurations
// ============================================================================

interface OrganizationInfo {
  name: string;
  logo: string;
  website: string;
  address: string;
  registrationNumber: string;
}

export const CERTIFICATE_CONFIGS = {
  // Default templates
  templates: ['modern', 'classic', 'elegant', 'minimal'],
  
  // Certificate settings
  settings: {
    defaultExpiry: null, // Certificates don't expire by default
    qrCodeSize: 200,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['pdf'],
    signatureRequired: true
  },
  
  // Verification settings
  verification: {
    enableQR: true,
    enableManual: true,
    enableAPI: true,
    rateLimiting: {
      maxVerificationsPerHour: 100,
      maxVerificationsPerDay: 500
    }
  },
  
  // Security settings
  security: {
    encryptQRData: true,
    enableBlockchain: false, // Future feature
    auditAllVerifications: true,
    preventForgery: true
  }
};

// Export singleton instance
export const certificateService = new CertificateService();