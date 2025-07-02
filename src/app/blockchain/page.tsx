'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import WalletConnect from '@/components/blockchain/WalletConnect'
import BlockchainStatus from '@/components/blockchain/BlockchainStatus'
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Loader2,
  Activity,
  TrendingUp,
  Award,
  Link,
  Zap,
  Info,
  ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/lib/utils/toast-helpers'

interface BlockchainCertificate {
  id: string
  studentName: string
  courseName: string
  completionDate: Date
  certificateUrl: string
  blockchain?: {
    hash: string
    blockNumber: number
    transactionId: string
    networkId: string
    explorerUrl: string
    status: string
  }
  blockchainStatus?: {
    hasBlockchain: boolean
    status: 'verified' | 'pending' | 'failed' | 'none'
    queuePosition?: number
    error?: string
  }
}

interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  avgProcessingTime: number
  successRate: number
}

export default function BlockchainDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [certificates, setCertificates] = useState<BlockchainCertificate[]>([])
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<BlockchainCertificate | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchData()
    }
  }, [authLoading, user, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch user certificates with blockchain status
      const certResponse = await fetch('/api/blockchain/mint-queue?action=user-certificates')
      const certData = await certResponse.json()
      
      if (certData.success) {
        setCertificates(certData.certificates)
      }
      
      // Fetch queue statistics
      const statsResponse = await fetch('/api/blockchain/mint-queue?action=stats')
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setQueueStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error fetching blockchain data:', error)
      toast.error('Failed to load blockchain data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    toast.success('Data refreshed')
  }

  const handleEnableBlockchain = async (certificateId: string) => {
    try {
      const response = await fetch('/api/blockchain/mint-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable', certificateId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Blockchain verification enabled')
        await fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to enable blockchain verification')
    }
  }

  const handleRetry = async (certificateId: string) => {
    try {
      const response = await fetch('/api/blockchain/mint-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', certificateId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Retry initiated')
        await fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to retry')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">Not Minted</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  const verifiedCerts = certificates.filter(c => c.blockchainStatus?.status === 'verified')
  const pendingCerts = certificates.filter(c => c.blockchainStatus?.status === 'pending')
  const unmintedCerts = certificates.filter(c => c.blockchainStatus?.status === 'none')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Blockchain Certificates</h1>
              <p className="text-gray-600 mt-2">
                Manage and verify your blockchain-backed certificates
              </p>
            </div>
            <div className="flex items-center gap-4">
              <BlockchainStatus />
              <WalletConnect />
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Certificates</p>
                  <p className="text-3xl font-bold">{certificates.length}</p>
                </div>
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Blockchain Verified</p>
                  <p className="text-3xl font-bold">{verifiedCerts.length}</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold">{pendingCerts.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold">
                    {queueStats?.successRate.toFixed(1) || 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Status */}
        {queueStats && (queueStats.pending > 0 || queueStats.processing > 0) && (
          <Alert className="mb-8">
            <Activity className="h-4 w-4" />
            <AlertTitle>Queue Status</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Processing: {queueStats.processing}</span>
                  <span>Pending: {queueStats.pending}</span>
                  <span>Failed: {queueStats.failed}</span>
                </div>
                {queueStats.avgProcessingTime > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Average processing time: {Math.round(queueStats.avgProcessingTime / 1000)}s
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Certificates</CardTitle>
            <CardDescription>
              Manage blockchain verification for your certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({certificates.length})</TabsTrigger>
                <TabsTrigger value="verified">Verified ({verifiedCerts.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingCerts.length})</TabsTrigger>
                <TabsTrigger value="unminted">Unminted ({unmintedCerts.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <CertificatesTable 
                  certificates={certificates}
                  onEnableBlockchain={handleEnableBlockchain}
                  onRetry={handleRetry}
                  onViewDetails={setSelectedCertificate}
                />
              </TabsContent>
              
              <TabsContent value="verified">
                <CertificatesTable 
                  certificates={verifiedCerts}
                  onEnableBlockchain={handleEnableBlockchain}
                  onRetry={handleRetry}
                  onViewDetails={setSelectedCertificate}
                />
              </TabsContent>
              
              <TabsContent value="pending">
                <CertificatesTable 
                  certificates={pendingCerts}
                  onEnableBlockchain={handleEnableBlockchain}
                  onRetry={handleRetry}
                  onViewDetails={setSelectedCertificate}
                />
              </TabsContent>
              
              <TabsContent value="unminted">
                <CertificatesTable 
                  certificates={unmintedCerts}
                  onEnableBlockchain={handleEnableBlockchain}
                  onRetry={handleRetry}
                  onViewDetails={setSelectedCertificate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Certificate Details Dialog */}
        {selectedCertificate && (
          <Dialog 
            open={!!selectedCertificate} 
            onOpenChange={() => setSelectedCertificate(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Certificate Details</DialogTitle>
                <DialogDescription>
                  Blockchain verification details for your certificate
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedCertificate.courseName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed on {format(new Date(selectedCertificate.completionDate), 'PPP')}
                  </p>
                </div>
                
                {selectedCertificate.blockchain && (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Blockchain Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Network:</span>
                        <p className="font-mono">{selectedCertificate.blockchain.networkId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Block Number:</span>
                        <p className="font-mono">#{selectedCertificate.blockchain.blockNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Transaction Hash:</span>
                        <p className="font-mono text-xs break-all">
                          {selectedCertificate.blockchain.transactionId}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => window.open(selectedCertificate.blockchain!.explorerUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Explorer
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(selectedCertificate.certificateUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                  {selectedCertificate.blockchainStatus?.status === 'none' && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleEnableBlockchain(selectedCertificate.id)
                        setSelectedCertificate(null)
                      }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Enable Blockchain
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

function CertificatesTable({ 
  certificates, 
  onEnableBlockchain, 
  onRetry,
  onViewDetails 
}: {
  certificates: BlockchainCertificate[]
  onEnableBlockchain: (id: string) => void
  onRetry: (id: string) => void
  onViewDetails: (cert: BlockchainCertificate) => void
}) {
  if (certificates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No certificates found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Completion Date</TableHead>
          <TableHead>Blockchain Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {certificates.map((cert) => (
          <TableRow key={cert.id}>
            <TableCell className="font-medium">{cert.courseName}</TableCell>
            <TableCell>{format(new Date(cert.completionDate), 'PP')}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getStatusIcon(cert.blockchainStatus?.status || 'none')}
                {getStatusBadge(cert.blockchainStatus?.status || 'none')}
                {cert.blockchainStatus?.queuePosition && (
                  <span className="text-xs text-muted-foreground">
                    (Position: {cert.blockchainStatus.queuePosition})
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(cert)}
                >
                  <Info className="h-4 w-4" />
                </Button>
                {cert.blockchainStatus?.status === 'none' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEnableBlockchain(cert.id)}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Mint
                  </Button>
                )}
                {cert.blockchainStatus?.status === 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(cert.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}
                {cert.blockchain && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(cert.blockchain!.explorerUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}