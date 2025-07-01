'use client'

import React from 'react'
import { MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { AffiliatePartner } from '@/types/affiliate'

interface AffiliatePartnerListProps {
  partners: AffiliatePartner[]
  onUpdateStatus?: (partnerId: string, status: AffiliatePartner['status']) => void
  onUpdateCommission?: (partnerId: string, rate: number) => void
}

export function AffiliatePartnerList({ 
  partners, 
  onUpdateStatus, 
  onUpdateCommission 
}: AffiliatePartnerListProps) {
  const getStatusBadge = (status: AffiliatePartner['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: AffiliatePartner['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Partners</CardTitle>
        <CardDescription>
          Manage your affiliate partners and their commission rates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {partner.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {partner.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(partner.status)}
                      {getStatusBadge(partner.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(partner.commissionRate * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {partner.totalClicks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {partner.totalConversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(partner.totalEarnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {partner.status === 'pending' && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStatus?.(partner.id, 'active')}
                          >
                            Approve Partner
                          </DropdownMenuItem>
                        )}
                        {partner.status === 'active' && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStatus?.(partner.id, 'inactive')}
                          >
                            Deactivate Partner
                          </DropdownMenuItem>
                        )}
                        {partner.status === 'inactive' && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStatus?.(partner.id, 'active')}
                          >
                            Reactivate Partner
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            const newRate = prompt(
                              'Enter new commission rate (0-100):', 
                              String(partner.commissionRate * 100)
                            )
                            if (newRate) {
                              const rate = parseFloat(newRate) / 100
                              if (rate >= 0 && rate <= 1) {
                                onUpdateCommission?.(partner.id, rate)
                              }
                            }
                          }}
                        >
                          Update Commission Rate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}