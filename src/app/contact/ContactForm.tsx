'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { MessageSquare, Send } from 'lucide-react'

const contactReasons = [
  'Algemene vraag',
  'Technische ondersteuning',
  'Cursusinformatie',
  'Zakelijke training',
  'Partnership',
  'Anders'
]

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    reason: 'Algemene vraag',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Fout',
        description: 'Vul je naam in',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Fout',
        description: 'Vul je e-mailadres in',
        variant: 'destructive',
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Fout',
        description: 'Vul een geldig e-mailadres in',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.subject.trim()) {
      toast({
        title: 'Fout',
        description: 'Vul een onderwerp in',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.message.trim()) {
      toast({
        title: 'Fout',
        description: 'Vul je bericht in',
        variant: 'destructive',
      })
      return false
    }

    if (formData.message.trim().length < 10) {
      toast({
        title: 'Fout',
        description: 'Je bericht moet minimaal 10 karakters bevatten',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Bericht verzonden!',
        description: 'We nemen binnen 24 uur contact met je op.',
      })

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        reason: 'Algemene vraag',
        message: ''
      })
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Er ging iets mis. Probeer het later opnieuw.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Stuur ons een bericht
        </CardTitle>
        <CardDescription>
          Vul het onderstaande formulier in en we nemen zo snel mogelijk contact met je op.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Je volledige naam"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="je@email.nl"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+31 6 12345678"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reden voor contact</Label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {contactReasons.map(reason => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Onderwerp *</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Waar gaat je vraag over?"
              value={formData.subject}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Bericht *</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Vertel ons meer over je vraag..."
              value={formData.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Minimaal 10 karakters
            </p>
          </div>

          <Button 
            type="submit" 
            size="lg"
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Verzenden...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Verstuur bericht
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}