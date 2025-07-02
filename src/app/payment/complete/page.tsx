'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Loader2, ArrowRight } from 'lucide-react';

type PaymentStatus = 'paid' | 'failed' | 'canceled' | 'expired' | 'pending' | 'open';

function PaymentCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getIdToken, loading: authLoading } = useAuth();
  const paymentId = searchParams.get('paymentId');
  
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading

    if (!paymentId) {
      setError('Geen betalings-ID gevonden');
      setLoading(false);
      return;
    }

    if (!user) {
      router.push(`/login?redirect=/payment/complete?paymentId=${paymentId}`);
      return;
    }

    checkPaymentStatus();
  }, [paymentId, user, authLoading, router]);

  const checkPaymentStatus = async () => {
    if (!paymentId || !user) return;

    try {
      const token = await getIdToken();
      const response = await fetch(`/api/payments/status/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.status);
        setCourseId(data.courseId);
        
        // If payment is still pending, check again in 3 seconds
        if (data.status === 'pending' || data.status === 'open') {
          setTimeout(checkPaymentStatus, 3000);
        }
      } else {
        setError(data.error || 'Kon betalingsstatus niet ophalen');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setError('Netwerkfout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
      case 'canceled':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
      case 'open':
        return <Clock className="h-16 w-16 text-yellow-500" />;
      default:
        return <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'paid':
        return 'Betaling geslaagd!';
      case 'failed':
        return 'Betaling mislukt';
      case 'canceled':
        return 'Betaling geannuleerd';
      case 'expired':
        return 'Betaling verlopen';
      case 'pending':
      case 'open':
        return 'Betaling wordt verwerkt...';
      default:
        return 'Betalingsstatus controleren...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'paid':
        return 'Je betaling is succesvol verwerkt. Je hebt nu toegang tot de cursus.';
      case 'failed':
        return 'Er is iets misgegaan met je betaling. Probeer het opnieuw.';
      case 'canceled':
        return 'Je hebt de betaling geannuleerd. Je kunt het opnieuw proberen.';
      case 'expired':
        return 'De betaling is verlopen. Probeer het opnieuw.';
      case 'pending':
      case 'open':
        return 'We wachten op bevestiging van je bank. Dit kan een paar minuten duren.';
      default:
        return 'Even geduld, we controleren de status van je betaling...';
    }
  };

  const getActionButton = () => {
    switch (status) {
      case 'paid':
        return (
          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/cursussen/${courseId}`)}
              className="w-full"
              size="lg"
            >
              Start cursus
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Ga naar dashboard
            </Button>
          </div>
        );
      case 'failed':
      case 'canceled':
      case 'expired':
        return (
          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/checkout?courseId=${courseId}`)}
              className="w-full"
              size="lg"
            >
              Probeer opnieuw
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/cursussen')}
              className="w-full"
            >
              Terug naar cursussen
            </Button>
          </div>
        );
      case 'pending':
      case 'open':
        return (
          <div className="space-y-3">
            <Button
              onClick={checkPaymentStatus}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Controleren...
                </>
              ) : (
                'Status vernieuwen'
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/cursussen')}
              className="w-full"
            >
              Terug naar cursussen
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h1 className="text-xl font-semibold">Fout opgetreden</h1>
              <p className="text-gray-600">{error}</p>
              <Button
                onClick={() => router.push('/cursussen')}
                className="w-full"
              >
                Terug naar cursussen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">{getStatusTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getActionButton()}
          
          {status === 'paid' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                🎉 Welkom bij GroeimetAI! Je cursus is toegevoegd aan je dashboard 
                en je kunt direct beginnen met leren.
              </p>
            </div>
          )}
          
          {(status === 'pending' || status === 'open') && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                ⏳ Deze pagina wordt automatisch bijgewerkt zodra de betaling is verwerkt.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Laden...</span>
        </div>
      </div>
    }>
      <PaymentCompleteContent />
    </Suspense>
  );
}