'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { getCourseById } from '@/lib/data/courses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice, calculateDiscount } from '@/services/paymentService';
import { Loader2, ShieldCheck, CreditCard, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface BillingForm {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  street: string;
  streetAdditional?: string;
  city: string;
  postalCode: string;
  country: string;
  region?: string;
  vatNumber?: string;
  phone?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getIdToken } = useAuth();
  const courseId = searchParams.get('courseId');
  
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState({ valid: false, discountAmount: 0, finalPrice: 0 });
  const [billingForm, setBillingForm] = useState<BillingForm>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    company: '',
    street: '',
    streetAdditional: '',
    city: '',
    postalCode: '',
    country: 'NL',
    region: '',
    vatNumber: '',
    phone: ''
  });

  const course = courseId ? getCourseById(courseId) : null;

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/checkout?courseId=${courseId}`);
    }
  }, [user, router, courseId]);

  useEffect(() => {
    if (user?.email) {
      setBillingForm(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  const handleApplyDiscount = async () => {
    if (!course || !discountCode) return;
    
    const result = await calculateDiscount(course.price, discountCode);
    setDiscount(result);
    
    if (result.valid) {
      toast({
        title: 'Kortingscode toegepast',
        description: `Je bespaart ${formatPrice(result.discountAmount, course.currency)}`,
      });
    } else {
      toast({
        title: 'Ongeldige kortingscode',
        description: 'Deze kortingscode is niet geldig',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !course) return;

    setLoading(true);
    
    try {
      const token = await getIdToken();
      
      // Use mock checkout in development if SHIFT key is held
      const useMock = process.env.NODE_ENV === 'development' && e.nativeEvent instanceof MouseEvent && e.nativeEvent.shiftKey;
      const endpoint = useMock ? '/api/checkout-mock' : '/api/checkout';
      
      if (useMock) {
        console.log('Using mock checkout for development');
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: course.id,
          billingAddress: billingForm,
          discountCode: discount.valid ? discountCode : undefined
        })
      });

      const data = await response.json();

      console.log('API Response:', data);
      
      if (data.success && data.checkoutUrl) {
        console.log('Redirecting to Mollie:', data.checkoutUrl);
        // Add a small delay to ensure console logs are visible
        toast({
          title: 'Doorsturen naar betaling...',
          description: 'Je wordt doorgestuurd naar Mollie',
        });
        
        // Direct redirect without delay
        console.log('Direct redirect to:', data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else if (data.success && data.redirectUrl) {
        // Mock checkout direct redirect
        console.log('Mock checkout: Redirecting to course');
        toast({
          title: 'Mock Payment',
          description: data.message || 'Direct toegang verleend (development)',
        });
        
        setTimeout(() => {
          router.push(data.redirectUrl);
        }, 1000);
      } else if (data.success && data.fallbackUrl) {
        // Development mode fallback
        console.warn('Development mode: Using fallback URL');
        toast({
          title: 'Development Mode',
          description: data.message || 'Simulatie betaling in development',
        });
        
        setTimeout(() => {
          router.push(data.fallbackUrl);
        }, 2000);
      } else {
        console.error('Payment failed:', data);
        toast({
          title: 'Fout bij betaling',
          description: data.error || data.details || 'Er is een fout opgetreden',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Fout',
        description: 'Er is een fout opgetreden bij het starten van de betaling',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cursus niet gevonden</p>
      </div>
    );
  }

  const finalPrice = discount.valid ? discount.finalPrice : course.price;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Overzicht bestelling</CardTitle>
                <CardDescription>Je staat op het punt de volgende cursus aan te schaffen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={120}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-[120px] h-[80px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.level} • {course.duration}</p>
                    <p className="text-sm text-gray-500 mt-1">{course.instructor}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotaal</span>
                    <span>{formatPrice(course.price, course.currency)}</span>
                  </div>
                  {discount.valid && (
                    <div className="flex justify-between text-green-600">
                      <span>Korting</span>
                      <span>-{formatPrice(discount.discountAmount, course.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Totaal</span>
                    <span>{formatPrice(finalPrice, course.currency)}</span>
                  </div>
                </div>

                {/* Discount Code */}
                <div className="space-y-2">
                  <Label htmlFor="discount">Kortingscode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      placeholder="Voer kortingscode in"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyDiscount}
                      disabled={!discountCode}
                    >
                      Toepassen
                    </Button>
                  </div>
                </div>

                {/* Security badges */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>Veilige betaling via Mollie</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>SSL-versleutelde verbinding</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span>iDEAL, creditcard en meer</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Billing Form */}
          <div className="order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle>Factuurgegevens</CardTitle>
                <CardDescription>Vul je gegevens in voor de factuur</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Voornaam *</Label>
                      <Input
                        id="firstName"
                        required
                        value={billingForm.firstName}
                        onChange={(e) => setBillingForm({ ...billingForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Achternaam *</Label>
                      <Input
                        id="lastName"
                        required
                        value={billingForm.lastName}
                        onChange={(e) => setBillingForm({ ...billingForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={billingForm.email}
                      onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Bedrijfsnaam (optioneel)</Label>
                    <Input
                      id="company"
                      value={billingForm.company}
                      onChange={(e) => setBillingForm({ ...billingForm, company: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Straat en huisnummer *</Label>
                    <Input
                      id="street"
                      required
                      value={billingForm.street}
                      onChange={(e) => setBillingForm({ ...billingForm, street: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postcode *</Label>
                      <Input
                        id="postalCode"
                        required
                        value={billingForm.postalCode}
                        onChange={(e) => setBillingForm({ ...billingForm, postalCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Plaats *</Label>
                      <Input
                        id="city"
                        required
                        value={billingForm.city}
                        onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Land *</Label>
                    <Select
                      value={billingForm.country}
                      onValueChange={(value) => setBillingForm({ ...billingForm, country: value })}
                    >
                      <SelectTrigger id="country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NL">Nederland</SelectItem>
                        <SelectItem value="BE">België</SelectItem>
                        <SelectItem value="DE">Duitsland</SelectItem>
                        <SelectItem value="FR">Frankrijk</SelectItem>
                        <SelectItem value="GB">Verenigd Koninkrijk</SelectItem>
                        <SelectItem value="US">Verenigde Staten</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">BTW-nummer (optioneel)</Label>
                    <Input
                      id="vatNumber"
                      value={billingForm.vatNumber}
                      onChange={(e) => setBillingForm({ ...billingForm, vatNumber: e.target.value })}
                      placeholder="NL123456789B01"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Bezig met verwerken...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Doorgaan naar betaling
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Door te betalen ga je akkoord met onze{' '}
                    <a href="/terms" className="underline">algemene voorwaarden</a> en{' '}
                    <a href="/privacy" className="underline">privacybeleid</a>.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Laden...</span>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}