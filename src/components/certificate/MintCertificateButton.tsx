'use client'

import { useState } from 'react'
import { useBlockchainService } from '@/services/blockchainService'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Shield,
  Link,
  AlertCircle
} from 'lucide-react'
import { getExplorerUrl } from '@/lib/blockchain/web3-provider'
import { BLOCKCHAIN_SERVICE_CONFIG } from '@/lib/blockchain/config'
import type { Certificate } from '@/types/certificate'

interface MintCertificateButtonProps {
  certificate: Certificate & {
    certificateNumber?: string
    grade?: string
    score?: number
    achievements?: string[]
  }
  onMintSuccess?: (transactionHash: string, ipfsHash: string) => void
  onMintError?: (error: string) => void
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

type MintingStep = 'idle' | 'connecting' | 'uploading' | 'minting' | 'confirming' | 'success' | 'error'

const stepMessages: Record<MintingStep, string> = {
  idle: 'Ready to mint',
  connecting: 'Connecting to wallet...',
  uploading: 'Uploading certificate metadata to IPFS...',
  minting: 'Minting certificate on blockchain...',
  confirming: 'Waiting for transaction confirmation...',
  success: 'Certificate minted successfully!',
  error: 'Minting failed'
}

const stepProgress: Record<MintingStep, number> = {
  idle: 0,
  connecting: 20,
  uploading: 40,
  minting: 60,
  confirming: 80,
  success: 100,
  error: 0
}

export default function MintCertificateButton({
  certificate,
  onMintSuccess,
  onMintError,
  className,
  variant = 'default',
  size = 'default'
}: MintCertificateButtonProps) {
  const {
    isConnected,
    address,
    connectWallet,
    mintCertificate,
    canMintCertificates
  } = useBlockchainService()

  const [showDialog, setShowDialog] = useState(false)
  const [mintingStep, setMintingStep] = useState<MintingStep>('idle')
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [ipfsHash, setIpfsHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [canMint, setCanMint] = useState<boolean | null>(null)

  // Check if certificate is already minted
  const isAlreadyMinted = certificate.blockchain?.status === 'confirmed'

  const checkMintPermission = async () => {
    if (!address) return
    
    try {
      const hasMintPermission = await canMintCertificates(address)
      setCanMint(hasMintPermission)
    } catch (error) {
      console.error('Error checking mint permission:', error)
      setCanMint(false)
    }
  }

  const handleMint = async () => {
    setShowDialog(true)
    setMintingStep('idle')
    setError('')
    setTransactionHash('')
    setIpfsHash('')

    try {
      // Step 1: Connect wallet if not connected
      if (!isConnected) {
        setMintingStep('connecting')
        await connectWallet()
      }

      // Check mint permission
      if (!address) throw new Error('No wallet address found')
      
      await checkMintPermission()
      if (canMint === false) {
        throw new Error('You do not have permission to mint certificates')
      }

      // Step 2-4: Minting process (handled by service)
      setMintingStep('uploading')
      
      const result = await mintCertificate({
        studentAddress: address, // For now, using current wallet address
        studentName: certificate.studentName,
        courseId: certificate.courseId,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        completionDate: new Date(certificate.completionDate),
        certificateNumber: certificate.certificateNumber || `CERT-${certificate.id}`,
        certificateId: certificate.id,
        grade: certificate.grade,
        score: certificate.score,
        achievements: certificate.achievements,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to mint certificate')
      }

      setTransactionHash(result.transactionHash || '')
      setIpfsHash(result.ipfsHash || '')
      setMintingStep('success')

      toast({
        title: "Certificate Minted!",
        description: "Your certificate has been successfully minted on the blockchain.",
      })

      onMintSuccess?.(result.transactionHash || '', result.ipfsHash || '')
    } catch (error: any) {
      console.error('Minting error:', error)
      setMintingStep('error')
      setError(error.message || 'Failed to mint certificate')
      
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint certificate",
        variant: "destructive",
      })

      onMintError?.(error.message)
    }
  }

  const explorerUrl = transactionHash 
    ? getExplorerUrl(transactionHash, 'tx', BLOCKCHAIN_SERVICE_CONFIG.defaultNetwork)
    : ''

  const ipfsUrl = ipfsHash
    ? `https://ipfs.io/ipfs/${ipfsHash}`
    : ''

  if (isAlreadyMinted) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled
      >
        <Shield className="mr-2 h-4 w-4" />
        Already on Blockchain
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={handleMint}
        variant={variant}
        size={size}
        className={className}
      >
        <Upload className="mr-2 h-4 w-4" />
        Mint to Blockchain
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mint Certificate to Blockchain</DialogTitle>
            <DialogDescription>
              This will permanently record your certificate on the blockchain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Permission Warning */}
            {canMint === false && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  You do not have permission to mint certificates. Please contact an administrator.
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{stepMessages[mintingStep]}</span>
                {mintingStep !== 'idle' && mintingStep !== 'error' && (
                  <span className="text-muted-foreground">
                    {stepProgress[mintingStep]}%
                  </span>
                )}
              </div>
              <Progress value={stepProgress[mintingStep]} className="h-2" />
            </div>

            {/* Status Steps */}
            <div className="space-y-3">
              {/* Connect Wallet */}
              <div className="flex items-center gap-3">
                {mintingStep === 'connecting' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : mintingStep !== 'idle' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className="text-sm">Connect Wallet</span>
              </div>

              {/* Upload to IPFS */}
              <div className="flex items-center gap-3">
                {mintingStep === 'uploading' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : ['minting', 'confirming', 'success'].includes(mintingStep) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className="text-sm">Upload Metadata to IPFS</span>
              </div>

              {/* Mint on Chain */}
              <div className="flex items-center gap-3">
                {mintingStep === 'minting' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : ['confirming', 'success'].includes(mintingStep) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className="text-sm">Mint Certificate on Blockchain</span>
              </div>

              {/* Confirm Transaction */}
              <div className="flex items-center gap-3">
                {mintingStep === 'confirming' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : mintingStep === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className="text-sm">Confirm Transaction</span>
              </div>
            </div>

            {/* Error Message */}
            {mintingStep === 'error' && error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            {/* Success Details */}
            {mintingStep === 'success' && (
              <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Certificate successfully minted!
                  </p>
                </div>
                
                {transactionHash && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 px-2"
                      >
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {ipfsHash && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">IPFS Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {ipfsHash.slice(0, 10)}...{ipfsHash.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 px-2"
                      >
                        <a
                          href={ipfsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Link className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {mintingStep === 'success' ? (
              <Button onClick={() => setShowDialog(false)}>
                Done
              </Button>
            ) : mintingStep === 'error' ? (
              <>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMint}>
                  Retry
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                disabled={['minting', 'confirming'].includes(mintingStep)}
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}