'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingDown,
  Activity,
  Zap,
  ExternalLink,
  Play,
  DollarSign
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface WalletInfo {
  address: string
  balance: string
  canMint: boolean
  network: string
  explorerUrl?: string
}

interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  avgProcessingTime: number
  successRate: number
}

interface SystemStatus {
  wallet: WalletInfo
  queue: QueueStats
  message?: string
}

export default function BlockchainAdminPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Check if user is admin
    if (!authLoading && (!user || userProfile?.role !== 'admin')) {
      router.push('/dashboard')
    } else if (user && userProfile?.role === 'admin') {
      fetchStatus()
    }
  }, [user, userProfile, authLoading, router])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/blockchain/process-queue', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching blockchain status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessQueue = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/blockchain/process-queue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error processing queue:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load blockchain status</AlertDescription>
        </Alert>
      </div>
    )
  }

  const estimatedCostPerCertificate = 0.02 // EUR
  const polPrice = 0.40 // EUR per POL (approximate)
  const balanceInEUR = parseFloat(status.wallet.balance) * polPrice
  const certificatesRemaining = Math.floor(parseFloat(status.wallet.balance) / 0.05) // 0.05 POL per certificate

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Blockchain Administration</h1>
          <p className="text-gray-600 mt-1">
            Manage automatic certificate minting
          </p>
        </div>

        {/* Wallet Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Server Wallet Status
            </CardTitle>
            <CardDescription>
              GroeimetAI wallet for automatic certificate minting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs">{status.wallet.address.slice(0, 10)}...{status.wallet.address.slice(-8)}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(status.wallet.explorerUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <div className="space-y-1">
                  <p className="font-semibold">{status.wallet.balance} POL</p>
                  <p className="text-xs text-muted-foreground">≈ €{balanceInEUR.toFixed(2)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  {status.wallet.canMint ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Ready to mint</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Cannot mint</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {parseFloat(status.wallet.balance) < 1 && (
              <Alert className="mt-4" variant="destructive">
                <TrendingDown className="h-4 w-4" />
                <AlertTitle>Low Balance Warning</AlertTitle>
                <AlertDescription>
                  The server wallet balance is low. Please add more POL to continue automatic minting.
                  Approximately {certificatesRemaining} certificates can still be minted.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Cost Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Per Certificate</p>
                  <p className="font-medium">~€{estimatedCostPerCertificate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Certificates Remaining</p>
                  <p className="font-medium">~{certificatesRemaining}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Estimate (100 certs)</p>
                  <p className="font-medium">~€{(estimatedCostPerCertificate * 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Network</p>
                  <p className="font-medium capitalize">{status.wallet.network}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Queue Status
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchStatus}
                  disabled={processing}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={handleProcessQueue}
                  disabled={processing || !status.wallet.canMint}
                >
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Process Queue
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{status.queue.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{status.queue.processing}</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{status.queue.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{status.queue.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Success Rate: </span>
                <span className="font-medium">{(status.queue.successRate * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Processing Time: </span>
                <span className="font-medium">{(status.queue.avgProcessingTime / 1000).toFixed(1)}s</span>
              </div>
              <div className="text-muted-foreground">
                Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Automatic Minting Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">How it works:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Every certificate is automatically minted to the blockchain when generated</li>
                <li>GroeimetAI pays all gas fees (approximately €0.02 per certificate)</li>
                <li>Failed mints are queued and retried automatically</li>
                <li>Users receive blockchain-verified certificates without any action required</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Queue Processing:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>The queue is processed automatically every 5 minutes</li>
                <li>You can manually trigger processing using the "Process Queue" button</li>
                <li>Failed items are retried up to 3 times before being marked as failed</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Monitoring:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Monitor the wallet balance to ensure continuous operation</li>
                <li>Check the queue regularly for any persistent failures</li>
                <li>Set up alerts for low balance warnings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}