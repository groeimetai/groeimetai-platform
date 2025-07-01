'use client'

import React, { useState, useEffect } from 'react'
import { Copy, TrendingUp, Users, Euro, Share2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AffiliateService } from '@/services/affiliateService'
import { AffiliateLink as AffiliateLinkType, AffiliateStats } from '@/types/affiliate'
import { formatPrice } from '@/lib/utils'

interface AffiliateLinkProps {
  courseId: string
  userId: string
  courseName?: string
}

export function AffiliateLink({ courseId, userId, courseName }: AffiliateLinkProps) {
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLinkType | null>(null)
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingLink, setGeneratingLink] = useState(false)
  const { toast } = useToast()

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    loadAffiliateData()
  }, [courseId, userId])

  const loadAffiliateData = async () => {
    try {
      setLoading(true)
      
      // Load affiliate stats
      const affiliateStats = await AffiliateService.getAffiliateStats(userId)
      setStats(affiliateStats)

      // Find link for this course
      const courseLink = affiliateStats.links.find(link => link.courseId === courseId)
      if (courseLink) {
        setAffiliateLink(courseLink)
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateLink = async () => {
    try {
      setGeneratingLink(true)
      const newLink = await AffiliateService.generateAffiliateLink(courseId, userId)
      setAffiliateLink(newLink)
      
      // Reload stats
      const updatedStats = await AffiliateService.getAffiliateStats(userId)
      setStats(updatedStats)
      
      toast({
        title: 'Affiliate link created!',
        description: 'Your unique affiliate link is ready to share.',
      })
    } catch (error) {
      console.error('Error generating affiliate link:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate affiliate link. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setGeneratingLink(false)
    }
  }

  const copyToClipboard = async () => {
    if (!affiliateLink) return

    const fullUrl = `${baseUrl}/ref/${affiliateLink.code}?course=${courseId}`
    
    try {
      await navigator.clipboard.writeText(fullUrl)
      toast({
        title: 'Link copied!',
        description: 'Affiliate link copied to clipboard.',
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy link. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const shareLink = async () => {
    if (!affiliateLink) return

    const fullUrl = `${baseUrl}/ref/${affiliateLink.code}?course=${courseId}`
    const shareText = `Check out this amazing course: ${courseName || 'Course'}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: courseName || 'Course',
          text: shareText,
          url: fullUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      copyToClipboard()
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!affiliateLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Become an Affiliate Partner
          </CardTitle>
          <CardDescription>
            Share this course and earn commission on every sale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateLink} 
            disabled={generatingLink}
            className="w-full"
          >
            {generatingLink ? 'Generating...' : 'Generate Affiliate Link'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const fullUrl = `${baseUrl}/ref/${affiliateLink.code}?course=${courseId}`
  const conversionRate = affiliateLink.clickCount > 0 
    ? ((affiliateLink.conversionCount / affiliateLink.clickCount) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-4">
      {/* Main Affiliate Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Your Affiliate Link
            </span>
            <Badge variant="secondary">Active</Badge>
          </CardTitle>
          <CardDescription>
            Share this link to earn commission on course sales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="affiliate-link">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                id="affiliate-link"
                value={fullUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
              {navigator.share && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={shareLink}
                  title="Share link"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Stats for this specific link */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{affiliateLink.clickCount}</div>
              <div className="text-sm text-muted-foreground">Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{affiliateLink.conversionCount}</div>
              <div className="text-sm text-muted-foreground">Conversions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPrice(affiliateLink.revenue)}</div>
              <div className="text-sm text-muted-foreground">Revenue</div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Conversion Rate</span>
              <span className="font-medium">{conversionRate}%</span>
            </div>
            <Progress value={parseFloat(conversionRate)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats Card */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Affiliate Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Total Clicks
                </div>
                <div className="text-2xl font-bold">{stats.totalClicks}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Total Conversions
                </div>
                <div className="text-2xl font-bold">{stats.totalConversions}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Euro className="h-4 w-4" />
                  Total Revenue
                </div>
                <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Euro className="h-4 w-4" />
                  Your Earnings
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(stats.totalCommission)}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Overall Conversion Rate</span>
                <span className="font-medium">{stats.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}