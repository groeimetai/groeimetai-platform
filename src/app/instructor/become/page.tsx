'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { ArrowRight, BookOpen, Trophy, Users, DollarSign, Sparkles, GraduationCap, Award } from 'lucide-react'
import Link from 'next/link'
import { createInstructorApplication } from '@/services/instructorService'

export default function BecomeInstructorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    expertise: '',
    experience: '',
    courseIdeas: '',
    linkedIn: '',
    website: '',
    bio: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: 'Login vereist',
        description: 'Je moet ingelogd zijn om je aan te melden als instructeur',
        variant: 'destructive'
      })
      router.push('/login?redirect=/instructor/become')
      return
    }

    setLoading(true)
    try {
      await createInstructorApplication({
        userId: user.uid,
        email: user.email!,
        name: user.displayName || '',
        ...formData
      })

      toast({
        title: 'Aanmelding verzonden!',
        description: 'We nemen binnen 48 uur contact met je op.',
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting instructor application:', error)
      toast({
        title: 'Er ging iets mis',
        description: 'Probeer het later opnieuw',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: DollarSign,
      title: '70% Revenue Share',
      description: 'Verdien 70% van elke cursusverkoop. Transparante maandelijkse uitbetalingen.'
    },
    {
      icon: Users,
      title: 'Bereik Duizenden Studenten',
      description: 'Toegang tot ons groeiende platform met 5000+ actieve studenten.'
    },
    {
      icon: Trophy,
      title: 'Premium Support',
      description: 'Dedicated support team voor video editing, marketing en technische hulp.'
    },
    {
      icon: Award,
      title: 'Co-marketing',
      description: 'We promoten jouw cursussen actief via onze kanalen en nieuwsbrief.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container-width section-padding relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
              <GraduationCap className="w-4 h-4" />
              <span>Word GroeimetAI Instructeur</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Deel je AI-expertise met
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                duizenden professionals
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sluit je aan bij het #1 AI-leerplatform van Nederland. 
              Creëer impact, bouw je personal brand en verdien goed geld.
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Start je aanmelding
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/instructor/guide">
                  Instructeur gids
                  <BookOpen className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container-width section-padding">
          <h2 className="text-3xl font-bold text-center mb-12">Waarom lesgeven bij GroeimetAI?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gray-50">
        <div className="container-width section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join de GroeimetAI familie</h2>
            <p className="text-lg text-gray-600 mb-8">
              Onze instructeurs hebben al meer dan 10.000 studenten geholpen met het ontwikkelen van AI-vaardigheden.
            </p>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-purple-600">€250k+</div>
                <div className="text-gray-600">Uitgekeerd aan instructeurs</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600">4.8</div>
                <div className="text-gray-600">Gemiddelde cursus rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600">50+</div>
                <div className="text-gray-600">Actieve instructeurs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-16 bg-white">
        <div className="container-width section-padding">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4 mx-auto">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Instructeur Aanmelding</CardTitle>
                <CardDescription>
                  Vertel ons over jezelf en je expertise. We nemen binnen 48 uur contact op.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="expertise">Expertise gebieden *</Label>
                    <Input
                      id="expertise"
                      placeholder="bijv. Prompt Engineering, LangChain, ChatGPT voor Marketing"
                      value={formData.expertise}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Relevante ervaring *</Label>
                    <Textarea
                      id="experience"
                      placeholder="Vertel over je achtergrond, werkervaring en waarom je geschikt bent als AI-instructeur"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseIdeas">Cursus ideeën *</Label>
                    <Textarea
                      id="courseIdeas"
                      placeholder="Welke cursussen zou je willen maken? Geef 2-3 concrete ideeën"
                      value={formData.courseIdeas}
                      onChange={(e) => setFormData({ ...formData, courseIdeas: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Korte bio voor je profiel *</Label>
                    <Textarea
                      id="bio"
                      placeholder="Een korte introductie over jezelf voor potentiële studenten (max 200 woorden)"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedIn">LinkedIn profiel</Label>
                      <Input
                        id="linkedIn"
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedIn}
                        onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website/Portfolio</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://..."
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Verzenden...' : 'Verstuur aanmelding'}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    Door je aan te melden ga je akkoord met onze{' '}
                    <Link href="/terms/instructor" className="text-purple-600 hover:underline">
                      instructeur voorwaarden
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container-width section-padding text-center">
          <h2 className="text-3xl font-bold mb-4">Klaar om impact te maken?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Deel je kennis, inspireer professionals en bouw een passief inkomen op.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Start aanmelding
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/20" asChild>
              <Link href="/contact">Contact ons</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}