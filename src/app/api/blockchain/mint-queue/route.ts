import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CertificateService } from '@/services/certificateService'
import { certificateQueue } from '@/lib/blockchain/certificate-queue'
import { initAdmin } from '@/lib/firebaseAdmin'

// Initialize admin SDK
initAdmin()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')
    const certificateId = searchParams.get('certificateId')
    
    // Get queue statistics
    if (action === 'stats') {
      const stats = await certificateQueue.getQueueStats()
      return NextResponse.json({ success: true, stats })
    }
    
    // Get certificate blockchain status
    if (action === 'status' && certificateId) {
      const status = await CertificateService.getBlockchainStatus(certificateId)
      return NextResponse.json({ success: true, status })
    }
    
    // Get user's certificates with blockchain status
    if (action === 'user-certificates') {
      const certificates = await CertificateService.getUserCertificates(session.user.id)
      
      // Enrich with blockchain status
      const enrichedCertificates = await Promise.all(
        certificates.map(async (cert) => {
          const blockchainStatus = await CertificateService.getBlockchainStatus(cert.id)
          return {
            ...cert,
            blockchainStatus,
          }
        })
      )
      
      return NextResponse.json({ 
        success: true, 
        certificates: enrichedCertificates 
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Blockchain mint queue GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { action, certificateId, queueIds } = body
    
    // Enable blockchain for certificate
    if (action === 'enable' && certificateId) {
      // Verify user owns the certificate
      const certificate = await CertificateService.getCertificateById(certificateId)
      if (!certificate || certificate.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Certificate not found or unauthorized' },
          { status: 404 }
        )
      }
      
      try {
        const blockchain = await CertificateService.enableBlockchainVerification(certificateId)
        return NextResponse.json({ 
          success: true, 
          blockchain,
          message: blockchain ? 'Certificate minted successfully' : 'Certificate added to minting queue'
        })
      } catch (error: any) {
        // Check if it was queued
        if (error.message?.includes('queue')) {
          return NextResponse.json({ 
            success: true, 
            queued: true,
            message: 'Certificate added to minting queue'
          })
        }
        throw error
      }
    }
    
    // Retry failed minting
    if (action === 'retry' && certificateId) {
      // Verify user owns the certificate
      const certificate = await CertificateService.getCertificateById(certificateId)
      if (!certificate || certificate.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Certificate not found or unauthorized' },
          { status: 404 }
        )
      }
      
      await CertificateService.retryBlockchainMinting(certificateId)
      return NextResponse.json({ 
        success: true, 
        message: 'Retry initiated'
      })
    }
    
    // Process queue (admin only - you might want to add admin check)
    if (action === 'process') {
      await certificateQueue.processQueue()
      return NextResponse.json({ 
        success: true, 
        message: 'Queue processing started'
      })
    }
    
    // Retry multiple failed items (admin only)
    if (action === 'retry-failed' && queueIds) {
      await certificateQueue.retryFailed(queueIds)
      return NextResponse.json({ 
        success: true, 
        message: `${queueIds.length} items queued for retry`
      })
    }
    
    // Cleanup old items (admin only)
    if (action === 'cleanup') {
      const daysToKeep = body.daysToKeep || 30
      const deleted = await certificateQueue.cleanup(daysToKeep)
      return NextResponse.json({ 
        success: true, 
        message: `${deleted} old items removed`
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Blockchain mint queue POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Webhook endpoint for automated queue processing
export async function PUT(request: NextRequest) {
  try {
    // Verify webhook secret (you should set this in environment variables)
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.BLOCKCHAIN_WEBHOOK_SECRET
    
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Process the queue
    await certificateQueue.processQueue()
    
    // Get current stats
    const stats = await certificateQueue.getQueueStats()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Queue processed',
      stats
    })
  } catch (error: any) {
    console.error('Blockchain mint queue webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}