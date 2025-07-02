'use client'

import { useState } from 'react'
import { useWeb3Provider, formatAddress } from '@/lib/blockchain/web3-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  ChevronDown, 
  LogOut, 
  Copy, 
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { NETWORK_CONFIGS, type NetworkType } from '@/lib/blockchain/config'
import { toast } from '@/components/ui/use-toast'

interface WalletConnectProps {
  onConnect?: () => void
  onDisconnect?: () => void
  className?: string
}

export default function WalletConnect({ 
  onConnect, 
  onDisconnect,
  className 
}: WalletConnectProps) {
  const {
    isConnected,
    address,
    chainId,
    balance,
    connect,
    disconnect,
    switchNetwork
  } = useWeb3Provider()
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Determine current network
  const currentNetwork = Object.entries(NETWORK_CONFIGS).find(
    ([_, config]) => config.chainId === chainId
  )?.[0] as NetworkType | undefined

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
      onConnect?.()
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    onDisconnect?.()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  const handleCopyAddress = async () => {
    if (!address) return
    
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleSwitchNetwork = async (network: NetworkType) => {
    try {
      await switchNetwork(network)
      toast({
        title: "Network Switched",
        description: `Switched to ${NETWORK_CONFIGS[network].chainName}`,
      })
    } catch (error: any) {
      toast({
        title: "Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive",
      })
    }
  }

  const openExplorer = () => {
    if (!address || !currentNetwork) return
    const explorerUrl = `${NETWORK_CONFIGS[currentNetwork].blockExplorerUrls[0]}/address/${address}`
    window.open(explorerUrl, '_blank')
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className={className}
        variant="default"
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`}>
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {address?.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block">
            {formatAddress(address || '')}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Account Info */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Address</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="h-6 px-2"
            >
              {copiedAddress ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <code className="text-xs break-all">{address}</code>
        </div>

        {/* Balance */}
        {balance && (
          <div className="px-2 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className="text-sm font-medium">{parseFloat(balance).toFixed(4)} {currentNetwork === 'polygon' || currentNetwork === 'mumbai' ? 'MATIC' : 'ETH'}</span>
            </div>
          </div>
        )}

        {/* Network */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Network</span>
            {currentNetwork ? (
              <Badge variant="outline" className="text-xs">
                {NETWORK_CONFIGS[currentNetwork].chainName}
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unknown
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Network Switcher */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch Network
        </DropdownMenuLabel>
        {Object.entries(NETWORK_CONFIGS).map(([network, config]) => (
          <DropdownMenuItem
            key={network}
            onClick={() => handleSwitchNetwork(network as NetworkType)}
            disabled={chainId === config.chainId}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{config.chainName}</span>
              {chainId === config.chainId && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuItem onClick={openExplorer} className="cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleDisconnect} 
          className="cursor-pointer text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}