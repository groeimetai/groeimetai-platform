'use client'

import React, { useState, useEffect } from 'react'
import { useBlockchainService } from '@/services/blockchainService'
import { formatAddress, getExplorerUrl } from '@/lib/blockchain/web3-provider'
import { BLOCKCHAIN_ERRORS } from '@/lib/blockchain/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, ExternalLink, CheckCircle, XCircle, Wallet } from 'lucide-react'
import type { Certificate, CertificateVerification } from '@/types/certificate'

interface BlockchainVerificationProps {
  certificate: Certificate
  onVerificationComplete?: (verification: CertificateVerification) => void
}

export function BlockchainVerification({ certificate, onVerificationComplete }: BlockchainVerificationProps) {
  const {
    isConnected,
    address,
    chainId,
    connectWallet,
    disconnectWallet,
    verifyCertificate,
    isLoading,
    error
  } = useBlockchainService()
  
  const [verification, setVerification] = useState<CertificateVerification | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  // Auto-verify if certificate has blockchain data
  useEffect(() => {
    if (certificate.blockchain && certificate.blockchain.status === 'confirmed') {
      handleVerify()
    }
  }, [certificate])

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    setVerificationError(null)
    
    try {
      const result = await verifyCertificate(certificate.id)
      
      if (result.isValid && result.verification) {
        setVerification(result.verification)
        onVerificationComplete?.(result.verification)
      } else {
        setVerificationError(result.error || 'Verification failed')
      }
    } catch (err: any) {
      setVerificationError(err.message || 'An error occurred during verification')
    } finally {
      setVerifying(false)
    }
  }

  const getStatusBadge = () => {
    if (!certificate.blockchain) {
      return <Badge variant="secondary">Not on blockchain</Badge>
    }
    
    switch (certificate.blockchain.status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'confirmed':
        return <Badge variant="default" className="bg-green-600">Confirmed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getVerificationStatus = () => {
    if (!verification) return null
    
    switch (verification.blockchainStatus) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Verified on blockchain</span>
          </div>
        )
      case 'invalid':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Invalid certificate</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Blockchain confirmation pending</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Blockchain Verification</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Verify this certificate's authenticity on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Connect your wallet to verify certificates on the blockchain
              </AlertDescription>
            </Alert>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-4 w-4" />
              )}
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected Wallet Info */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">
                  {formatAddress(address || '')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </div>

            {/* Blockchain Details */}
            {certificate.blockchain && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Blockchain Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-mono">{certificate.blockchain.networkId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction:</span>
                    <a
                      href={certificate.blockchain.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <span className="font-mono">
                        {formatAddress(certificate.blockchain.transactionId, 6)}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IPFS Hash:</span>
                    <span className="font-mono">
                      {formatAddress(certificate.blockchain.hash, 6)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Status */}
            {verification && (
              <div className="p-3 border rounded-lg">
                {getVerificationStatus()}
                {verification.details && (
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hash Match:</span>
                      <span className={verification.details.matchesBlockchain ? 'text-green-600' : 'text-red-600'}>
                        {verification.details.matchesBlockchain ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified At:</span>
                      <span>{new Date(verification.verifiedAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {(error || verificationError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error || verificationError}
                </AlertDescription>
              </Alert>
            )}

            {/* Verify Button */}
            {certificate.blockchain && !verification && (
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full"
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </>
                )}
              </Button>
            )}

            {/* Re-verify Button */}
            {verification && (
              <Button
                onClick={handleVerify}
                disabled={verifying}
                variant="outline"
                className="w-full"
              >
                <Shield className="mr-2 h-4 w-4" />
                Re-verify Certificate
              </Button>
            )}
          </div>
        )}

        {/* No Blockchain Data */}
        {!certificate.blockchain && isConnected && (
          <Alert>
            <AlertDescription>
              This certificate has not been recorded on the blockchain yet.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default BlockchainVerification