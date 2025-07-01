import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { RootProvider } from '@/components/providers/RootProvider'
import { ChatContainer } from '@/components/CourseChat'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GroeimetAI - Hét AI-leerplatform van Nederland',
  description: 'Leer alles over AI, Machine Learning en automatisering. Van ChatGPT tot geavanceerde AI-toepassingen. Start vandaag met je AI-reis!',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://groeimetai.nl'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logo/GroeimetAi_logo_image_black.png', type: 'image/png' }
    ],
    apple: '/images/logo/GroeimetAi_logo_image_black.png',
  },
  openGraph: {
    title: 'GroeimetAI - Hét AI-leerplatform van Nederland',
    description: 'Leer alles over AI, Machine Learning en automatisering. Start vandaag met je AI-reis!',
    siteName: 'GroeimetAI',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GroeimetAI - Groei met Artificial Intelligence',
      }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <RootProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <ChatContainer />
        </RootProvider>
      </body>
    </html>
  )
}