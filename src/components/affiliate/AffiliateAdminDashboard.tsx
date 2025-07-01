'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, Euro, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AffiliatePartnerList } from './AffiliatePartnerList'
import { AffiliateService } from '@/services/affiliateService'
import { AffiliatePartner } from '@/types/affiliate'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export function AffiliateAdminDashboard() {
  const [partners, setPartners] = useState<AffiliatePartner[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Calculate totals
  const totalPartners = partners.length
  const activePartners = partners.filter(p => p.status === 'active').length
  const totalClicks = partners.reduce((sum, p) => sum + p.totalClicks, 0)
  const totalConversions = partners.reduce((sum, p) => sum + p.totalConversions, 0)
  const totalEarnings = partners.reduce((sum, p) => sum + p.totalEarnings, 0)
  const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      setLoading(true)
      // In a real implementation, you would fetch this from Firebase
      // For now, using mock data
      const mockPartners: AffiliatePartner[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          commissionRate: 0.20,
          totalEarnings: 1250.50,
          totalClicks: 450,
          totalConversions: 12,
          status: 'active',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          commissionRate: 0.15,
          totalEarnings: 890.75,
          totalClicks: 320,
          totalConversions: 8,
          status: 'active',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          commissionRate: 0.20,
          totalEarnings: 0,
          totalClicks: 25,
          totalConversions: 0,
          status: 'pending',
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date()
        }
      ]
      setPartners(mockPartners)
    } catch (error) {
      console.error('Error loading partners:', error)
      toast({
        title: 'Error',
        description: 'Failed to load affiliate partners',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (partnerId: string, status: AffiliatePartner['status']) => {
    try {
      await AffiliateService.createOrUpdateAffiliatePartner(partnerId, { status })
      
      // Update local state
      setPartners(prev => prev.map(p => 
        p.id === partnerId ? { ...p, status } : p
      ))
      
      toast({
        title: 'Success',
        description: `Partner status updated to ${status}`,
      })
    } catch (error) {
      console.error('Error updating partner status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update partner status',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateCommission = async (partnerId: string, rate: number) => {
    try {
      await AffiliateService.createOrUpdateAffiliatePartner(partnerId, { commissionRate: rate })
      
      // Update local state
      setPartners(prev => prev.map(p => 
        p.id === partnerId ? { ...p, commissionRate: rate } : p
      ))
      
      toast({
        title: 'Success',
        description: `Commission rate updated to ${(rate * 100).toFixed(0)}%`,
      })
    } catch (error) {
      console.error('Error updating commission rate:', error)
      toast({
        title: 'Error',
        description: 'Failed to update commission rate',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartners}</div>
            <p className="text-xs text-muted-foreground">
              {activePartners} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              {totalConversions} conversions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all partners
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Pending + Paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="partners" className="space-y-4">
          <AffiliatePartnerList 
            partners={partners}
            onUpdateStatus={handleUpdateStatus}
            onUpdateCommission={handleUpdateCommission}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Affiliate Program Settings
              </CardTitle>
              <CardDescription>
                Configure default settings for your affiliate program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Default Commission Rate</label>
                <p className="text-sm text-muted-foreground">20% for all new partners</p>
              </div>
              <div>
                <label className="text-sm font-medium">Cookie Duration</label>
                <p className="text-sm text-muted-foreground">30 days</p>
              </div>
              <div>
                <label className="text-sm font-medium">Minimum Payout</label>
                <p className="text-sm text-muted-foreground">{formatPrice(50)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Terms</label>
                <p className="text-sm text-muted-foreground">Net 30 days</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}