'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { initializeAuth } from '@/lib/firebase/auth-init';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Fout',
        description: 'Vul je e-mailadres in',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const auth = await initializeAuth();
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast({
        title: 'E-mail verzonden',
        description: 'Controleer je inbox voor de reset link',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Fout',
        description: error.code === 'auth/user-not-found' 
          ? 'Geen account gevonden met dit e-mailadres'
          : 'Er is iets misgegaan. Probeer het later opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Link href="/">
              <Logo size="lg" showText={true} />
            </Link>
          </div>
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">E-mail verzonden</CardTitle>
              <CardDescription className="text-center">
                We hebben een e-mail gestuurd naar {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Volg de instructies in de e-mail om je wachtwoord te resetten. 
                Het kan enkele minuten duren voordat je de e-mail ontvangt.
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Terug naar inloggen
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full"
                >
                  Probeer opnieuw
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link href="/">
            <Logo size="lg" showText={true} />
          </Link>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Wachtwoord vergeten?</CardTitle>
            <CardDescription className="text-center">
              Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Voer je e-mailadres in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Bezig met verzenden...' : 'Reset link versturen'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-sm text-primary hover:underline inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Terug naar inloggen
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}