'use client'

import { AuthProvider } from '@/lib/auth/AuthProvider'
import { ReactNode } from 'react'

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}