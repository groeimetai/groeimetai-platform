'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, Shield, ExternalLink, Copy, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { CertificateService } from '@/services/certificateService'
import { CertificateVerification } from '@/types/certificate'
import QRCode from 'qrcode'

interface BlockchainVerificationProps {
  certificateId: string
  blockchainData?: {
    hash: string
    blockNumber: number
    transactionId: string
    networkId: string
    explorerUrl: string
    status: 'pending' | 'confirmed' | 'failed'
  }
}

export default function BlockchainVerification({ certificateId, blockchainData }: BlockchainVerificationProps) {
  const [verification, setVerification] = useState<CertificateVerification | null>(null)
  const [loading, setLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    if (blockchainData?.hash) {
      generateQRCode()
    }
  }, [blockchainData])

  const generateQRCode = async () => {
    if (!blockchainData?.hash) return
    
    try {
      const verificationUrl = `${window.location.origin}/certificate/verify/${certificateId}?chain=true`
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrCodeDataUrl)
    } catch (error) {
      console.error('QR code generation error:', error)
    }
  }

  const verifyOnBlockchain = async () => {
    setLoading(true)
    try {
      const result = await CertificateService.verifyCertificateOnChain(certificateId)
      setVerification(result)
      
      if (result.blockchainStatus === 'verified') {
        toast({
          title: 'Verificatie succesvol',
          description: 'Dit certificaat is geverifieerd op de blockchain',
        })
      } else {
        toast({
          title: 'Verificatie mislukt',
          description: 'De blockchain verificatie kon niet worden voltooid',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Blockchain verification error:', error)
      toast({
        title: 'Fout',
        description: 'Er is een fout opgetreden bij de verificatie',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Gekopieerd',
      description: `${label} is gekopieerd naar het klembord`,
    })
  }

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`
  }

  const getStatusBadge = () => {
    if (verification?.blockchainStatus === 'verified' || blockchainData?.status === 'confirmed') {
      return <Badge className="bg-green-500 text-white">Geverifieerd</Badge>
    } else if (blockchainData?.status === 'pending') {
      return <Badge className="bg-yellow-500 text-white">In afwachting</Badge>
    } else {
      return <Badge variant="destructive">Niet geverifieerd</Badge>
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Blockchain Verificatie</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Dit certificaat is vastgelegd op de blockchain voor permanente verificatie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {blockchainData ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Transaction Hash</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {shortenHash(blockchainData.transactionId)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(blockchainData.transactionId, 'Transaction hash')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Block Number</p>
                  <p className="text-xs text-muted-foreground">
                    #{blockchainData.blockNumber.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(blockchainData.blockNumber.toString(), 'Block number')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Network</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {blockchainData.networkId}
                  </p>
                </div>
                <a
                  href={blockchainData.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
                <p className="text-sm font-medium">Blockchain Verificatie QR Code</p>
                <img src={qrCodeUrl} alt="Blockchain verification QR code" className="w-32 h-32" />
                <p className="text-xs text-muted-foreground text-center">
                  Scan om de blockchain verificatie te bekijken
                </p>
              </div>
            )}

            <Button 
              onClick={verifyOnBlockchain} 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifiëren...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verifieer op Blockchain
                </>
              )}
            </Button>

            {verification && (
              <div className={`p-4 rounded-lg ${
                verification.blockchainStatus === 'verified' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              } border`}>
                <div className="flex items-start gap-2">
                  {verification.blockchainStatus === 'verified' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {verification.blockchainStatus === 'verified' 
                        ? 'Certificaat geverifieerd' 
                        : 'Verificatie mislukt'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {verification.blockchainStatus === 'verified'
                        ? 'Dit certificaat is authentiek en ongewijzigd'
                        : 'De certificaat data komt niet overeen met de blockchain record'}
                    </p>
                    {verification.details && (
                      <div className="mt-2 text-xs space-y-1">
                        <p>Original Hash: {shortenHash(verification.details.originalHash)}</p>
                        <p>Current Hash: {shortenHash(verification.details.currentHash)}</p>
                        <p>Match: {verification.details.matchesBlockchain ? '✓' : '✗'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Blockchain verificatie is nog niet beschikbaar voor dit certificaat
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}