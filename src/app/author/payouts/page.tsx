'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientFormattedNumber } from '@/components/ui/ClientFormattedNumber';
import { 
  getAuthorById, 
  calculateAuthorRevenue 
} from '@/services/authorService';
import { courseService } from '@/services/courseService';
import { Author } from '@/types';
import { 
  ArrowLeft,
  Wallet,
  Euro,
  CreditCard,
  Building2,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface PayoutHistory {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: Date;
  method: string;
  reference: string;
}

interface PayoutSettings {
  bankName: string;
  accountHolder: string;
  iban: string;
  bic: string;
  preferredSchedule: 'weekly' | 'biweekly' | 'monthly';
  minimumPayout: number;
  taxId: string;
}

export default function AuthorPayoutsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [author, setAuthor] = useState<Author | null>(null);
  const [balance, setBalance] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState('');
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>({
    bankName: '',
    accountHolder: '',
    iban: '',
    bic: '',
    preferredSchedule: 'monthly',
    minimumPayout: 50,
    taxId: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (userProfile && userProfile.role !== 'instructor' && userProfile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && userProfile) {
      loadPayoutData();
    }
  }, [user, userProfile, loading, router]);

  const loadPayoutData = async () => {
    try {
      setIsLoading(true);
      
      // Get author profile
      const authors = await courseService.getAuthorsByUserId(user!.uid);
      if (authors.length === 0) {
        router.push('/author/apply');
        return;
      }

      const authorData = authors[0];
      setAuthor(authorData);

      // Calculate revenue
      const revenue = await calculateAuthorRevenue(authorData.id);
      
      // Mock balance calculation (in production, this would come from actual payment records)
      const totalPaidOut = 8500; // Example: total already paid out
      const availableBalance = revenue.totalRevenue - totalPaidOut;
      setBalance(availableBalance);
      setPendingPayout(availableBalance * 0.1); // 10% pending

      // Mock payout history
      setPayoutHistory([
        {
          id: '1',
          amount: 1250,
          status: 'completed',
          date: new Date('2024-02-01'),
          method: 'Bank Transfer',
          reference: 'PAY-2024-0201-001'
        },
        {
          id: '2',
          amount: 1875,
          status: 'completed',
          date: new Date('2024-01-01'),
          method: 'Bank Transfer',
          reference: 'PAY-2024-0101-001'
        },
        {
          id: '3',
          amount: 2100,
          status: 'completed',
          date: new Date('2023-12-01'),
          method: 'Bank Transfer',
          reference: 'PAY-2023-1201-001'
        },
        {
          id: '4',
          amount: 1650,
          status: 'completed',
          date: new Date('2023-11-01'),
          method: 'Bank Transfer',
          reference: 'PAY-2023-1101-001'
        },
        {
          id: '5',
          amount: 1625,
          status: 'completed',
          date: new Date('2023-10-01'),
          method: 'Bank Transfer',
          reference: 'PAY-2023-1001-001'
        }
      ]);

    } catch (error) {
      console.error('Error loading payout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayoutRequest = () => {
    const amount = parseFloat(requestAmount);
    if (amount > balance) {
      alert('Request amount exceeds available balance');
      return;
    }
    if (amount < payoutSettings.minimumPayout) {
      alert(`Minimum payout amount is €${payoutSettings.minimumPayout}`);
      return;
    }
    
    // In production, this would create an actual payout request
    alert(`Payout request for €${amount} has been submitted`);
    setRequestAmount('');
  };

  const handleSettingsSave = () => {
    // In production, this would save to the backend
    alert('Payout settings saved successfully');
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!author) {
    return null;
  }

  const getStatusBadge = (status: PayoutHistory['status']) => {
    const variants: Record<PayoutHistory['status'], any> = {
      pending: { variant: 'secondary' as const, icon: Clock },
      processing: { variant: 'default' as const, icon: Clock },
      completed: { variant: 'success' as const, icon: CheckCircle },
      failed: { variant: 'destructive' as const, icon: AlertCircle }
    };
    
    const { variant, icon: Icon } = variants[status];
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/author/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Payout Management</h1>
        <p className="text-muted-foreground">
          Manage your earnings and withdrawal settings
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €<ClientFormattedNumber value={balance} />
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €<ClientFormattedNumber value={pendingPayout} />
            </div>
            <p className="text-xs text-muted-foreground">
              Processing in 3-5 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €<ClientFormattedNumber value={8500} />
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings withdrawn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Tabs */}
      <Tabs defaultValue="request" className="space-y-4">
        <TabsList>
          <TabsTrigger value="request">Request Payout</TabsTrigger>
          <TabsTrigger value="history">Payout History</TabsTrigger>
          <TabsTrigger value="settings">Payment Settings</TabsTrigger>
        </TabsList>

        {/* Request Payout Tab */}
        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle>Request New Payout</CardTitle>
              <CardDescription>
                Withdraw your available earnings to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Payouts are processed within 3-5 business days. Minimum payout amount is €{payoutSettings.minimumPayout}.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Withdraw (EUR)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min={payoutSettings.minimumPayout}
                      max={balance}
                      step="0.01"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Available: €{balance.toFixed(2)}
                  </p>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handlePayoutRequest}
                    disabled={!requestAmount || parseFloat(requestAmount) <= 0}
                    className="w-full"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Request Payout
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h4 className="font-medium mb-2">Payout Schedule</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your settings, automatic payouts are scheduled {payoutSettings.preferredSchedule}.
                  Next automatic payout: March 1, 2024
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payout History</CardTitle>
                  <CardDescription>
                    View all your past and pending payouts
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutHistory.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">€{payout.amount}</span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {payout.date.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {payout.method}
                        </span>
                        <span>{payout.reference}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure your bank details and payout preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bank Account Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bankName"
                        value={payoutSettings.bankName}
                        onChange={(e) => setPayoutSettings({ ...payoutSettings, bankName: e.target.value })}
                        placeholder="e.g., ING Bank"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={payoutSettings.accountHolder}
                      onChange={(e) => setPayoutSettings({ ...payoutSettings, accountHolder: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={payoutSettings.iban}
                      onChange={(e) => setPayoutSettings({ ...payoutSettings, iban: e.target.value })}
                      placeholder="NL00 BANK 0000 0000 00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bic">BIC/SWIFT</Label>
                    <Input
                      id="bic"
                      value={payoutSettings.bic}
                      onChange={(e) => setPayoutSettings({ ...payoutSettings, bic: e.target.value })}
                      placeholder="ABNANL2A"
                    />
                  </div>
                </div>
              </div>

              {/* Payout Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payout Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Payout Schedule</Label>
                    <Select
                      value={payoutSettings.preferredSchedule}
                      onValueChange={(value: any) => setPayoutSettings({ ...payoutSettings, preferredSchedule: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumPayout">Minimum Payout Amount (EUR)</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minimumPayout"
                        type="number"
                        min="50"
                        step="10"
                        value={payoutSettings.minimumPayout}
                        onChange={(e) => setPayoutSettings({ ...payoutSettings, minimumPayout: parseFloat(e.target.value) || 50 })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tax Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                  <Input
                    id="taxId"
                    value={payoutSettings.taxId}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, taxId: e.target.value })}
                    placeholder="NL000000000B00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Required for tax reporting purposes
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleSettingsSave}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}