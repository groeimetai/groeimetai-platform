'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, CreditCard, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const handleSaveProfile = async () => {
    toast({
      title: 'Profiel bijgewerkt',
      description: 'Je profiel is succesvol opgeslagen.',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Instellingen</h1>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profiel</TabsTrigger>
            <TabsTrigger value="notifications">Meldingen</TabsTrigger>
            <TabsTrigger value="security">Beveiliging</TabsTrigger>
            <TabsTrigger value="billing">Facturatie</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profiel Informatie
                </CardTitle>
                <CardDescription>
                  Beheer je persoonlijke informatie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    defaultValue={userProfile.displayName || ''}
                    placeholder="Je volledige naam"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={userProfile.email}
                    disabled
                  />
                </div>
                <Button onClick={handleSaveProfile}>
                  Profiel opslaan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Melding Voorkeuren
                </CardTitle>
                <CardDescription>
                  Kies welke meldingen je wilt ontvangen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">E-mail meldingen</Label>
                  <Switch id="email-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="course-updates">Cursus updates</Label>
                  <Switch id="course-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newsletter">Nieuwsbrief</Label>
                  <Switch id="newsletter" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Beveiliging
                </CardTitle>
                <CardDescription>
                  Beheer je account beveiliging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Wachtwoord wijzigen
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Uitloggen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Facturatie
                </CardTitle>
                <CardDescription>
                  Bekijk je aankopen en facturen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Je hebt nog geen aankopen gedaan.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/cursussen')}
                >
                  Bekijk cursussen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}