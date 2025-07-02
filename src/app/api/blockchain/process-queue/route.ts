import { NextRequest, NextResponse } from 'next/server'
import { processCertificateQueue } from '@/lib/blockchain/queue-processor'
import { getServerWalletInfo } from '@/lib/blockchain/server-wallet'

// This endpoint can be called by a cron job to process the certificate queue
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (for security)
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.BLOCKCHAIN_WEBHOOK_SECRET
    
    // In production, you should always verify the secret
    if (process.env.NODE_ENV === 'production' && (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get server wallet info
    const walletInfo = await getServerWalletInfo('polygon')
    
    // Process the queue
    const result = await processCertificateQueue()
    
    // Return detailed response
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      wallet: {
        address: walletInfo.address,
        balance: walletInfo.balance,
        canMint: walletInfo.canMint,
        network: walletInfo.network
      },
      queue: result
    })
    
  } catch (error) {
    console.error('Queue processing error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check queue status
export async function GET(request: NextRequest) {
  try {
    // Get server wallet info
    const walletInfo = await getServerWalletInfo('polygon')
    
    // Get queue stats from certificate-queue
    const { certificateQueue } = await import('@/lib/blockchain/certificate-queue')
    const queueStats = await certificateQueue.getQueueStats()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      wallet: {
        address: walletInfo.address,
        balance: walletInfo.balance,
        canMint: walletInfo.canMint,
        network: walletInfo.network,
        explorerUrl: walletInfo.explorerUrl
      },
      queue: queueStats,
      message: walletInfo.isLow ? 'Warning: Wallet balance is low' : 'System operational'
    })
    
  } catch (error) {
    console.error('Queue status error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}