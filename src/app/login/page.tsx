import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | GroeimetAI Cursus Platform',
  description: 'Sign in to your GroeimetAI account',
}

export default function LoginPage() {
  return <LoginForm />
}