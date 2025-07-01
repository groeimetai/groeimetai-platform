'use client'

import { useState, useEffect } from 'react'
// TODO: Uncomment when NextAuth is configured
// import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useBlockchainService } from '@/services/blockchainService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import {
  Shield,
  Upload,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Search,
  AlertCircle,
  Link as LinkIcon,
  Users,
  FileCheck
} from 'lucide-react'
import { format } from 'date-fns'
import WalletConnect from '@/components/blockchain/WalletConnect'
import MintCertificateButton from '@/components/certificate/MintCertificateButton'
import BlockchainStatus from '@/components/blockchain/BlockchainStatus'
import type { Certificate } from '@/types/certificate'

interface CertificateWithBlockchain extends Certificate {
  selected?: boolean
  certificateNumber?: string
  grade?: string
  score?: number
  achievements?: string[]
}

export default function BlockchainCertificatesPage() {
  // TODO: Uncomment when NextAuth is configured
  // const { data: session, status } = useSession()
  const router = useRouter()
  const { isConnected, address, canMintCertificates } = useBlockchainService()

  const [certificates, setCertificates] = useState<CertificateWithBlockchain[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'on-chain' | 'off-chain'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([])
  const [showBulkMintDialog, setShowBulkMintDialog] = useState(false)
  const [bulkMintProgress, setBulkMintProgress] = useState({ current: 0, total: 0 })
  const [isBulkMinting, setIsBulkMinting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // TODO: Implement proper authentication check when NextAuth is configured
  // Check authentication
  // useEffect(() => {
  //   if (status === 'loading') return
  //   if (!session) {
  //     router.push('/login')
  //   }
  // }, [session, status, router])

  // Load certificates
  useEffect(() => {
    loadCertificates()
  }, [])

  // Check admin permissions
  useEffect(() => {
    if (address) {
      checkAdminPermissions()
    }
  }, [address])

  const loadCertificates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/certificates/list')
      if (!response.ok) throw new Error('Failed to load certificates')
      
      const data = await response.json()
      setCertificates(data.certificates || [])
    } catch (error) {
      console.error('Error loading certificates:', error)
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAdminPermissions = async () => {
    if (!address) return
    
    try {
      const hasMintPermission = await canMintCertificates(address)
      setIsAdmin(hasMintPermission)
    } catch (error) {
      console.error('Error checking admin permissions:', error)
      setIsAdmin(false)
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'on-chain' && cert.blockchain?.status === 'confirmed') ||
      (filter === 'off-chain' && !cert.blockchain?.status)
    
    const matchesSearch = 
      !searchQuery ||
      cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const onChainCount = certificates.filter(cert => cert.blockchain?.status === 'confirmed').length
  const offChainCount = certificates.length - onChainCount

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = filteredCertificates
        .filter(cert => !cert.blockchain?.status)
        .map(cert => cert.id)
      setSelectedCertificates(selectableIds)
    } else {
      setSelectedCertificates([])
    }
  }

  const handleSelectCertificate = (certId: string, checked: boolean) => {
    if (checked) {
      setSelectedCertificates([...selectedCertificates, certId])
    } else {
      setSelectedCertificates(selectedCertificates.filter(id => id !== certId))
    }
  }

  const handleBulkMint = async () => {
    if (selectedCertificates.length === 0) {
      toast({
        title: "No certificates selected",
        description: "Please select certificates to mint",
        variant: "destructive",
      })
      return
    }

    setShowBulkMintDialog(true)
    setIsBulkMinting(true)
    setBulkMintProgress({ current: 0, total: selectedCertificates.length })

    const results = { success: 0, failed: 0 }

    for (let i = 0; i < selectedCertificates.length; i++) {
      const certId = selectedCertificates[i]
      const cert = certificates.find(c => c.id === certId)
      
      if (!cert) continue

      setBulkMintProgress({ current: i + 1, total: selectedCertificates.length })

      try {
        // Simulate minting process - in real app, this would call the blockchain service
        await new Promise(resolve => setTimeout(resolve, 2000))
        results.success++
      } catch (error) {
        console.error(`Failed to mint certificate ${certId}:`, error)
        results.failed++
      }
    }

    setIsBulkMinting(false)
    
    toast({
      title: "Bulk Minting Complete",
      description: `Successfully minted ${results.success} certificates. ${results.failed} failed.`,
    })

    // Refresh certificates
    await loadCertificates()
    setSelectedCertificates([])
    setShowBulkMintDialog(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blockchain Certificates</h1>
          <p className="text-muted-foreground mt-2">
            Manage and mint certificates on the blockchain
          </p>
        </div>
        <div className="flex items-center gap-4">
          <BlockchainStatus />
          <WalletConnect />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Chain</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onChainCount}</div>
            <p className="text-xs text-muted-foreground">
              {((onChainCount / certificates.length) * 100).toFixed(1)}% minted
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Off-Chain</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offChainCount}</div>
            <p className="text-xs text-muted-foreground">
              Pending blockchain mint
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Notice */}
      {isConnected && isAdmin && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              You have admin permissions to mint certificates for all users.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Certificate Management</CardTitle>
            {isAdmin && selectedCertificates.length > 0 && (
              <Button onClick={handleBulkMint} disabled={!isConnected}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Mint ({selectedCertificates.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="on-chain">On-Chain</TabsTrigger>
                <TabsTrigger value="off-chain">Off-Chain</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedCertificates.length === 
                          filteredCertificates.filter(cert => !cert.blockchain?.status).length &&
                          filteredCertificates.filter(cert => !cert.blockchain?.status).length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    {isAdmin && (
                      <TableCell>
                        <Checkbox
                          checked={selectedCertificates.includes(cert.id)}
                          onCheckedChange={(checked) => 
                            handleSelectCertificate(cert.id, checked as boolean)
                          }
                          disabled={cert.blockchain?.status === 'confirmed'}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm">
                      {cert.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{cert.studentName}</TableCell>
                    <TableCell>{cert.courseName}</TableCell>
                    <TableCell>
                      {format(new Date(cert.completionDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {cert.blockchain?.status === 'confirmed' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="gap-1">
                            <Shield className="h-3 w-3" />
                            On-Chain
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline">Off-Chain</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cert.blockchain?.status === 'confirmed' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={cert.blockchain.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://ipfs.io/ipfs/${cert.blockchain.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <LinkIcon className="h-4 w-4" />
                              </a>
                            </Button>
                          </>
                        ) : (
                          <MintCertificateButton
                            certificate={cert}
                            size="sm"
                            onMintSuccess={() => loadCertificates()}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Mint Dialog */}
      <Dialog open={showBulkMintDialog} onOpenChange={setShowBulkMintDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Minting Certificates</DialogTitle>
            <DialogDescription>
              Minting {selectedCertificates.length} certificates to the blockchain
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isBulkMinting ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Processing certificate {bulkMintProgress.current} of {bulkMintProgress.total}
                  </p>
                  <div className="mt-2 w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(bulkMintProgress.current / bulkMintProgress.total) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p>Bulk minting complete!</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowBulkMintDialog(false)}
              disabled={isBulkMinting}
            >
              {isBulkMinting ? 'Processing...' : 'Done'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}