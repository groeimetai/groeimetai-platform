'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { AuthService } from '@/services/authService'
import { Logo } from '@/components/ui/Logo'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: 'Fout',
        description: 'Vul alle velden in',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      await AuthService.signIn(email, password)
      toast({
        title: 'Succes',
        description: 'Welkom terug!',
      })
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: 'Inloggen mislukt',
        description: error.message || 'Ongeldig e-mailadres of wachtwoord',
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
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Inloggen</CardTitle>
            <CardDescription className="text-center">
              Log in om toegang te krijgen tot je account
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
            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                placeholder="Voer je wachtwoord in"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nog geen account?{' '}
              <Link 
                href="/register" 
                className="font-medium text-primary hover:underline"
              >
                Registreren
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Wachtwoord vergeten?
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}