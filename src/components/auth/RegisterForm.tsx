'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { AuthService } from '@/services/authService'
import { Logo } from '@/components/ui/Logo'
import { Gift, CheckCircle } from 'lucide-react'
import { referralService } from '@/services/referralService'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      toast({
        title: 'Fout',
        description: 'Voer je volledige naam in',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.email) {
      toast({
        title: 'Fout',
        description: 'Voer je e-mailadres in',
        variant: 'destructive',
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Fout',
        description: 'Wachtwoord moet minimaal 6 tekens lang zijn',
        variant: 'destructive',
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Fout',
        description: 'Wachtwoorden komen niet overeen',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const user = await AuthService.register(
        formData.email,
        formData.password,
        formData.displayName
      )
      
      // Process referral if present
      if (referralCode && user) {
        const referralResult = await referralService.trackReferralSignup(
          referralCode,
          user.uid,
          formData.email
        )
        
        if (referralResult.success && referralResult.discountCode) {
          setDiscountCode(referralResult.discountCode)
          toast({
            title: 'Welkomstbonus!',
            description: '20% korting op je eerste cursus is toegevoegd aan je account',
          })
        }
      }
      
      toast({
        title: 'Succes',
        description: 'Account succesvol aangemaakt! Welkom bij GroeimetAI!',
      })
      
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      let errorMessage = 'Account aanmaken mislukt'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Dit e-mailadres is al geregistreerd'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Wachtwoord is te zwak'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Ongeldig e-mailadres'
      }
      
      toast({
        title: 'Registratie mislukt',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <Logo size="lg" showText={true} />
          </Link>
        </div>
        
        {/* Referral Banner */}
        {referralCode && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm">Welkom via referral!</h3>
                  <p className="text-sm text-gray-600">
                    Meld je aan en krijg <span className="font-semibold text-blue-600">20% korting</span> op je eerste cursus
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">Korting wordt automatisch toegepast</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Account aanmaken</CardTitle>
            <CardDescription className="text-center">
              Word lid van GroeimetAI en begin je AI-leerreis
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Volledige naam</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Voer je volledige naam in"
                value={formData.displayName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Voer je e-mailadres in"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Maak een wachtwoord (min. 6 tekens)"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Bevestig je wachtwoord"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Account aanmaken...' : 'Account aanmaken'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Heb je al een account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:underline"
              >
                Inloggen
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-xs text-center text-muted-foreground">
            Door een account aan te maken, ga je akkoord met onze{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Algemene voorwaarden
            </Link>{' '}
            en{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacybeleid
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}