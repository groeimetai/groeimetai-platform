import { Metadata } from 'next'
import FAQClient from './FAQClient'

export const metadata: Metadata = {
  title: 'Veelgestelde Vragen - GroeimetAI',
  description: 'Vind antwoorden op veelgestelde vragen over GroeimetAI, onze AI-cursussen, betalingen, certificaten en technische ondersteuning.',
}

export default function FAQPage() {
  return <FAQClient />
}