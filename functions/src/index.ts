/**
 * GroeimetAI Platform - Cloud Functions
 * Handles payment webhooks and email notifications
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createMollieClient } from '@mollie/api-client';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Mollie client
const mollieClient = createMollieClient({ 
  apiKey: functions.config().mollie.api_key 
});

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass
  }
});

/**
 * Mollie Payment Webhook Handler
 * Processes payment status updates from Mollie
 */
export const mollieWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    // Get payment ID from request body
    const { id } = req.body;
    if (!id) {
      res.status(400).send('Invalid webhook payload');
      return;
    }

    // Get payment details from Mollie
    const payment = await mollieClient.payments.get(id);
    
    // Find corresponding payment document
    const paymentQuery = await db.collection('payments')
      .where('molliePaymentId', '==', id)
      .limit(1)
      .get();

    if (paymentQuery.empty) {
      console.error('Payment document not found for Mollie payment:', id);
      res.status(404).send('Payment not found');
      return;
    }

    const paymentDoc = paymentQuery.docs[0];
    const paymentId = paymentDoc.id;
    const paymentData = paymentDoc.data();
    const currentStatus = paymentData.status;

    // Only process if status has changed
    if (payment.status !== currentStatus) {
      // Update payment status
      await paymentDoc.ref.update({
        status: payment.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Handle specific payment statuses
      switch (payment.status) {
        case 'paid':
          await handlePaymentSuccess(paymentId, payment, paymentData);
          break;
        case 'failed':
        case 'canceled':
        case 'expired':
          await handlePaymentFailure(paymentId, payment, paymentData);
          break;
      }

      // Log webhook processing
      await db.collection('audit_logs').add({
        event: 'webhook_processed',
        type: 'payment',
        data: {
          paymentId,
          molliePaymentId: id,
          status: payment.status,
          previousStatus: currentStatus
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        source: 'mollie-webhook'
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentId: string, molliePayment: any, paymentData: any) {
  const { userId, courseId } = paymentData;

  try {
    await db.runTransaction(async (transaction) => {
      // Update payment status
      const paymentRef = db.doc(`payments/${paymentId}`);
      transaction.update(paymentRef, {
        status: 'paid',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        molliePaymentDetails: {
          paidAt: molliePayment.paidAt,
          settlementAmount: molliePayment.settlementAmount,
          paymentMethod: molliePayment.method,
          details: molliePayment.details
        }
      });

      // Create or update enrollment
      const enrollmentId = `${userId}_${courseId}`;
      const enrollmentRef = db.doc(`enrollments/${enrollmentId}`);
      
      transaction.set(enrollmentRef, {
        id: enrollmentId,
        userId,
        courseId,
        paymentId,
        paymentStatus: 'paid',
        paymentMethod: molliePayment.method,
        amountPaid: parseFloat(molliePayment.amount.value),
        currency: molliePayment.amount.currency,
        enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        progress: {
          completedLessons: [],
          completedModules: [],
          overallProgress: 0,
          totalTimeSpent: 0,
          lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
          streakDays: 0,
          bookmarks: [],
          notes: []
        },
        quizResults: [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Update user's enrolled courses
      const userRef = db.doc(`users/${userId}`);
      transaction.update(userRef, {
        enrolledCourses: admin.firestore.FieldValue.arrayUnion(courseId),
        'stats.coursesEnrolled': admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Send confirmation email
    await sendPaymentConfirmationEmail(paymentId, paymentData);
    
    // Send course access email
    await sendCourseAccessEmail(userId, courseId, paymentData);

  } catch (error) {
    console.error('Error processing payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentId: string, molliePayment: any, paymentData: any) {
  try {
    await db.doc(`payments/${paymentId}`).update({
      status: 'failed',
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      failureReason: molliePayment.details?.failureReason || 'Unknown',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send failure notification
    await sendPaymentFailureEmail(paymentId, paymentData);

  } catch (error) {
    console.error('Error processing payment failure:', error);
    throw error;
  }
}

/**
 * Send payment confirmation email
 */
async function sendPaymentConfirmationEmail(paymentId: string, paymentData: any) {
  const { billingAddress, courseId, amount, currency } = paymentData;
  
  // Get course details
  const courseDoc = await db.doc(`courses/${courseId}`).get();
  const courseData = courseDoc.data();

  if (!courseData) return;

  const emailContent = `
    <h2>Betalingsbevestiging - GroeimetAI</h2>
    <p>Beste ${billingAddress.firstName} ${billingAddress.lastName},</p>
    
    <p>Bedankt voor je aankoop! Je betaling is succesvol verwerkt.</p>
    
    <h3>Orderdetails:</h3>
    <ul>
      <li><strong>Cursus:</strong> ${courseData.title}</li>
      <li><strong>Bedrag:</strong> €${amount}</li>
      <li><strong>Betaalkenmerk:</strong> ${paymentId}</li>
      <li><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL')}</li>
    </ul>
    
    <h3>Factuuradres:</h3>
    <p>
      ${billingAddress.firstName} ${billingAddress.lastName}<br>
      ${billingAddress.company ? billingAddress.company + '<br>' : ''}
      ${billingAddress.street}<br>
      ${billingAddress.postalCode} ${billingAddress.city}<br>
      ${billingAddress.country}
      ${billingAddress.vatNumber ? '<br>BTW: ' + billingAddress.vatNumber : ''}
    </p>
    
    <p>Je kunt direct starten met de cursus via je dashboard.</p>
    
    <p>Met vriendelijke groet,<br>
    Het GroeimetAI Team</p>
  `;

  try {
    await transporter.sendMail({
      from: '"GroeimetAI" <noreply@groeimetai.nl>',
      to: billingAddress.email,
      subject: 'Betalingsbevestiging - ' + courseData.title,
      html: emailContent
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

/**
 * Send course access email
 */
async function sendCourseAccessEmail(userId: string, courseId: string, paymentData: any) {
  const { billingAddress } = paymentData;
  
  // Get course details
  const courseDoc = await db.doc(`courses/${courseId}`).get();
  const courseData = courseDoc.data();

  if (!courseData) return;

  const emailContent = `
    <h2>Welkom bij ${courseData.title}!</h2>
    <p>Beste ${billingAddress.firstName},</p>
    
    <p>Je hebt nu toegang tot de cursus "${courseData.title}". We zijn blij dat je hebt gekozen om je skills te verbeteren met GroeimetAI!</p>
    
    <h3>Wat nu?</h3>
    <ol>
      <li>Log in op je account</li>
      <li>Ga naar "Mijn Cursussen" in je dashboard</li>
      <li>Klik op "${courseData.title}" om te beginnen</li>
    </ol>
    
    <h3>Tips voor succes:</h3>
    <ul>
      <li>Plan regelmatig tijd in voor de cursus</li>
      <li>Maak alle praktijkopdrachten</li>
      <li>Stel vragen in de community als je vastloopt</li>
      <li>Pas het geleerde direct toe in je werk</li>
    </ul>
    
    <p><strong>Login link:</strong> https://groeimetai.nl/login</p>
    
    <p>Veel succes en plezier met de cursus!</p>
    
    <p>Met vriendelijke groet,<br>
    Het GroeimetAI Team</p>
  `;

  try {
    await transporter.sendMail({
      from: '"GroeimetAI" <noreply@groeimetai.nl>',
      to: billingAddress.email,
      subject: 'Toegang tot ' + courseData.title + ' - Start nu!',
      html: emailContent
    });
  } catch (error) {
    console.error('Error sending course access email:', error);
  }
}

/**
 * Send payment failure email
 */
async function sendPaymentFailureEmail(paymentId: string, paymentData: any) {
  const { billingAddress, courseId } = paymentData;
  
  // Get course details
  const courseDoc = await db.doc(`courses/${courseId}`).get();
  const courseData = courseDoc.data();

  if (!courseData) return;

  const emailContent = `
    <h2>Betaling mislukt - GroeimetAI</h2>
    <p>Beste ${billingAddress.firstName} ${billingAddress.lastName},</p>
    
    <p>Helaas is je betaling voor de cursus "${courseData.title}" niet gelukt.</p>
    
    <h3>Wat nu?</h3>
    <p>Je kunt het opnieuw proberen door:</p>
    <ol>
      <li>In te loggen op je account</li>
      <li>De cursus opnieuw toe te voegen aan je winkelwagen</li>
      <li>Een andere betaalmethode te kiezen</li>
    </ol>
    
    <p>Als je problemen blijft ondervinden, neem dan contact op met onze support.</p>
    
    <p><strong>Support email:</strong> support@groeimetai.nl</p>
    
    <p>Met vriendelijke groet,<br>
    Het GroeimetAI Team</p>
  `;

  try {
    await transporter.sendMail({
      from: '"GroeimetAI" <noreply@groeimetai.nl>',
      to: billingAddress.email,
      subject: 'Betaling mislukt - ' + courseData.title,
      html: emailContent
    });
  } catch (error) {
    console.error('Error sending failure email:', error);
  }
}

/**
 * Scheduled function to check for expired payments
 */
export const checkExpiredPayments = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async (context) => {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const expiredPayments = await db.collection('payments')
      .where('status', '==', 'pending')
      .where('createdAt', '<', thirtyMinutesAgo)
      .get();

    const batch = db.batch();
    
    expiredPayments.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'expired',
        expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    
    console.log(`Marked ${expiredPayments.size} payments as expired`);
  });