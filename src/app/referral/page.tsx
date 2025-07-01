'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { referralService } from '@/services/referralService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { 
  Copy, 
  Gift, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Award,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ReferralPage() {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const data = await referralService.getUserReferralStats(user!.uid, user!.email || '');
      setReferralData(data);
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Kon referral gegevens niet laden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralData) return;
    
    const link = `${window.location.origin}/register?ref=${referralData.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Gekopieerd!',
      description: 'Je referral link is gekopieerd naar het klembord'
    });
  };

  const shareOn = (platform: string) => {
    if (!referralData) return;
    
    const link = `${window.location.origin}/register?ref=${referralData.referralCode}`;
    const message = 'Start jouw AI-reis bij GroeimetAI! Gebruik mijn referral link voor 20% korting op je eerste cursus 🚀';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + link)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Start met AI bij GroeimetAI!')}&body=${encodeURIComponent(message + '\n\n' + link)}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
  };

  if (!user) {
    return (
      <div className="container-width section-padding min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Login Vereist</CardTitle>
            <CardDescription>
              Je moet ingelogd zijn om het referral programma te gebruiken
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !referralData) {
    return (
      <div className="container-width section-padding min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container-width section-padding">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Gift className="w-4 h-4" />
            <span>Referral Programma</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nodig vrienden uit, verdien gratis lessen
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Voor elke vriend die zich aanmeldt en een aankoop doet, krijg jij een gratis proefles naar keuze!
          </p>
        </motion.div>

        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Jouw Referral Link
              </CardTitle>
              <CardDescription>
                Deel deze link met vrienden en collega's
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white rounded-lg px-4 py-3 font-mono text-sm border">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/register?ref={referralData.referralCode}
                </div>
                <Button onClick={copyReferralLink} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Kopieer
                </Button>
              </div>
              
              {/* Share buttons */}
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3">Deel via:</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => shareOn('facebook')}>
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => shareOn('twitter')}>
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => shareOn('linkedin')}>
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => shareOn('whatsapp')}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => shareOn('email')}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Uitgenodigd</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralData.stats.totalReferrals}</div>
                <p className="text-xs text-muted-foreground">
                  mensen hebben je link gebruikt
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Succesvolle Referrals</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralData.stats.successfulReferrals}</div>
                <p className="text-xs text-muted-foreground">
                  hebben een aankoop gedaan
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gratis Lessen</CardTitle>
                <Gift className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralData.activeRewards.length}</div>
                <p className="text-xs text-muted-foreground">
                  beschikbaar om te gebruiken
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hoe werkt het?</CardTitle>
              <CardDescription>
                Volg deze simpele stappen om gratis lessen te verdienen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Share2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-1">1. Deel je link</h4>
                  <p className="text-sm text-gray-600">
                    Stuur je unieke referral link naar vrienden
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-1">2. Zij melden zich aan</h4>
                  <p className="text-sm text-gray-600">
                    Via jouw link met 20% korting
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-1">3. Eerste aankoop</h4>
                  <p className="text-sm text-gray-600">
                    Wanneer ze hun eerste cursus kopen
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold mb-1">4. Jij krijgt een les</h4>
                  <p className="text-sm text-gray-600">
                    Gratis proefles naar keuze!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Rewards */}
        {referralData.activeRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Beschikbare Beloningen
                </CardTitle>
                <CardDescription>
                  Gebruik je gratis proeflessen voor elke cursus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralData.activeRewards.map((reward: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">Gratis Proefles</p>
                          <p className="text-sm text-gray-600">
                            Geldig tot {new Date(reward.expiresAt).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/cursussen">
                          Gebruik nu
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Referrals */}
        {referralData.recentReferrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recente Referrals</CardTitle>
                <CardDescription>
                  Je laatste uitnodigingen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralData.recentReferrals.map((referral: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{referral.email}</p>
                        <p className="text-sm text-gray-600">
                          Aangemeld op {new Date(referral.signedUpAt).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                      <div className="text-right">
                        {referral.madeFirstPurchase ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Aankoop gedaan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                            <Clock className="w-4 h-4" />
                            Wacht op aankoop
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Terms */}
        <motion.div
          className="mt-12 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>
            * Gratis proeflessen zijn 90 dagen geldig. Je vriend krijgt 20% korting op hun eerste aankoop.
          </p>
          <p>
            Beloningen worden automatisch toegekend na de eerste succesvolle aankoop van je referral.
          </p>
        </motion.div>
      </div>
    </div>
  );
}