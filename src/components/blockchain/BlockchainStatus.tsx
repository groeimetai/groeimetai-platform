'use client'

import { useState, useEffect } from 'react'
import { useWeb3Provider } from '@/lib/blockchain/web3-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Activity, 
  Zap, 
  Wifi, 
  WifiOff,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Loader2,
  Globe,
  RefreshCw
} from 'lucide-react'
import { NETWORK_CONFIGS, BLOCKCHAIN_SERVICE_CONFIG, type NetworkType } from '@/lib/blockchain/config'
import { Web3Provider } from '@/lib/blockchain/web3-provider'
import { formatUnits } from 'ethers'

interface GasPrices {
  slow: string
  standard: string
  fast: string
}

interface NetworkStatus {
  isConnected: boolean
  blockNumber: number
  gasPrice: GasPrices
  networkName: string
  chainId: number
  latency: number
}

export default function BlockchainStatus() {
  const { isConnected, chainId } = useWeb3Provider()
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    blockNumber: 0,
    gasPrice: { slow: '0', standard: '0', fast: '0' },
    networkName: 'Unknown',
    chainId: 0,
    latency: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [gasTrend, setGasTrend] = useState<'up' | 'down' | 'stable'>('stable')

  // Get current network
  const currentNetwork = Object.entries(NETWORK_CONFIGS).find(
    ([_, config]) => config.chainId === chainId
  )?.[0] as NetworkType | undefined

  // Fetch network status
  const fetchNetworkStatus = async () => {
    setIsLoading(true)
    
    try {
      const startTime = Date.now()
      const provider = currentNetwork 
        ? Web3Provider.getReadOnlyProvider(currentNetwork)
        : Web3Provider.getReadOnlyProvider(BLOCKCHAIN_SERVICE_CONFIG.defaultNetwork)
      
      // Get block number
      const blockNumber = await provider.getBlockNumber()
      
      // Get gas price
      const gasPrice = await provider.getGasPrice()
      const gasPriceGwei = formatUnits(gasPrice, 'gwei')
      
      // Calculate gas price tiers
      const baseGasPrice = parseFloat(gasPriceGwei)
      const gasPrices: GasPrices = {
        slow: (baseGasPrice * 0.8).toFixed(2),
        standard: baseGasPrice.toFixed(2),
        fast: (baseGasPrice * 1.2).toFixed(2),
      }
      
      // Check gas trend
      if (networkStatus.gasPrice.standard !== '0') {
        const previousGas = parseFloat(networkStatus.gasPrice.standard)
        const currentGas = baseGasPrice
        
        if (currentGas > previousGas * 1.05) {
          setGasTrend('up')
        } else if (currentGas < previousGas * 0.95) {
          setGasTrend('down')
        } else {
          setGasTrend('stable')
        }
      }
      
      // Calculate latency
      const latency = Date.now() - startTime
      
      // Get network info
      const network = await provider.getNetwork()
      
      setNetworkStatus({
        isConnected: true,
        blockNumber,
        gasPrice: gasPrices,
        networkName: currentNetwork 
          ? NETWORK_CONFIGS[currentNetwork].chainName 
          : 'Unknown',
        chainId: network.chainId,
        latency,
      })
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching network status:', error)
      setNetworkStatus(prev => ({
        ...prev,
        isConnected: false,
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchNetworkStatus()
    const interval = setInterval(fetchNetworkStatus, 30000)
    return () => clearInterval(interval)
  }, [chainId, currentNetwork])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  const StatusIndicator = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    }
    
    if (!networkStatus.isConnected) {
      return <WifiOff className="h-4 w-4 text-destructive" />
    }
    
    if (networkStatus.latency > 2000) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
    
    return <Wifi className="h-4 w-4 text-green-600" />
  }

  const GasTrendIcon = () => {
    if (gasTrend === 'up') {
      return <TrendingUp className="h-3 w-3 text-red-600" />
    }
    if (gasTrend === 'down') {
      return <TrendingDown className="h-3 w-3 text-green-600" />
    }
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <StatusIndicator />
          <span className="hidden sm:inline-block">
            {networkStatus.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Network Status</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNetworkStatus}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Connection Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Network</span>
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span className="font-medium">{networkStatus.networkName}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={networkStatus.isConnected ? 'default' : 'destructive'}
                className="text-xs"
              >
                {networkStatus.isConnected ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Latency</span>
              <span className="font-mono text-xs">
                {networkStatus.latency}ms
              </span>
            </div>
          </div>

          {/* Block Info */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Block Height</span>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                <span className="font-mono text-xs">
                  #{networkStatus.blockNumber.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Gas Prices */}
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gas Prices</span>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <GasTrendIcon />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-secondary rounded">
                <div className="text-muted-foreground">Slow</div>
                <div className="font-mono font-medium">{networkStatus.gasPrice.slow}</div>
              </div>
              <div className="text-center p-2 bg-secondary rounded">
                <div className="text-muted-foreground">Standard</div>
                <div className="font-mono font-medium">{networkStatus.gasPrice.standard}</div>
              </div>
              <div className="text-center p-2 bg-secondary rounded">
                <div className="text-muted-foreground">Fast</div>
                <div className="font-mono font-medium">{networkStatus.gasPrice.fast}</div>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">Gwei</p>
          </div>

          {/* Last Update */}
          <div className="pt-2 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Last updated {formatTime(lastUpdate)}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}