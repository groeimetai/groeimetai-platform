import { RegisterForm } from '@/components/auth/RegisterForm'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Create Account | GroeimetAI Cursus Platform',
  description: 'Create your GroeimetAI account and start learning',
}

function RegisterFormWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <p>Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

export default function RegisterPage() {
  return <RegisterFormWrapper />
}