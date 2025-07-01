import { RegisterForm } from '@/components/auth/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account | GroeimetAI Cursus Platform',
  description: 'Create your GroeimetAI account and start learning',
}

export default function RegisterPage() {
  return <RegisterForm />
}