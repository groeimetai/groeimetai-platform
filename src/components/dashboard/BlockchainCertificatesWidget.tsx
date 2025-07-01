'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  Zap,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { Certificate } from '@/types'
import { toast } from 'sonner'

interface BlockchainStats {
  total: number
  verified: number
  pending: number
  unminted: number
}

interface Props {
  certificates: Certificate[]
}

export function BlockchainCertificatesWidget({ certificates }: Props) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<BlockchainStats>({
    total: 0,
    verified: 0,
    pending: 0,
    unminted: 0
  })
  const [blockchainStatuses, setBlockchainStatuses] = useState<Map<string, any>>(new Map())
  const [processingCertId, setProcessingCertId] = useState<string | null>(null)

  useEffect(() => {
    fetchBlockchainStatuses()
  }, [certificates])

  const fetchBlockchainStatuses = async () => {
    if (!certificates.length) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Fetch blockchain status for each certificate
      const statuses = new Map()
      let verified = 0
      let pending = 0
      let unminted = 0
      
      for (const cert of certificates) {
        try {
          const response = await fetch(`/api/blockchain/mint-queue?action=status&certificateId=${cert.id}`)
          const data = await response.json()
          
          if (data.success && data.status) {
            statuses.set(cert.id, data.status)
            
            switch (data.status.status) {
              case 'verified':
                verified++
                break
              case 'pending':
                pending++
                break
              case 'none':
                unminted++
                break
            }
          }
        } catch (error) {
          console.error(`Error fetching status for certificate ${cert.id}:`, error)
        }
      }
      
      setBlockchainStatuses(statuses)
      setStats({
        total: certificates.length,
        verified,
        pending,
        unminted
      })
    } catch (error) {
      console.error('Error fetching blockchain statuses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnableBlockchain = async (certificateId: string) => {
    try {
      setProcessingCertId(certificateId)
      
      const response = await fetch('/api/blockchain/mint-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable', certificateId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Blockchain verification enabled')
        await fetchBlockchainStatuses()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to enable blockchain verification')
    } finally {
      setProcessingCertId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No certificates yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Complete courses to earn blockchain-verified certificates
        </p>
      </div>
    )
  }

  const verificationPercentage = stats.total > 0 ? (stats.verified / stats.total) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium">{stats.verified}</span>
            <span className="text-sm text-gray-600">Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">{stats.pending}</span>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            <span className="font-medium">{stats.unminted}</span>
            <span className="text-sm text-gray-600">Unminted</span>
          </div>
        </div>
      </div>

      {/* Verification Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Blockchain Verification Progress</span>
          <span className="font-medium">{verificationPercentage.toFixed(0)}%</span>
        </div>
        <Progress value={verificationPercentage} className="h-2" />
      </div>

      {/* Recent Certificates */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Certificates</h4>
        {certificates.slice(0, 3).map((cert) => {
          const status = blockchainStatuses.get(cert.id)
          const isProcessing = processingCertId === cert.id
          
          return (
            <div
              key={cert.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{cert.courseName}</p>
                <div className="flex items-center gap-2 mt-1">
                  {status?.status === 'verified' && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {status?.status === 'pending' && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {status?.status === 'none' && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      Not minted
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {status?.status === 'verified' && status.blockchain && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(status.blockchain.explorerUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                {status?.status === 'none' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnableBlockchain(cert.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-1" />
                        Mint
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Section */}
      {stats.unminted > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{stats.unminted} certificate{stats.unminted > 1 ? 's' : ''}</strong> can be secured on the blockchain.
            Visit the blockchain dashboard to mint them.
          </p>
        </div>
      )}
    </div>
  )
}