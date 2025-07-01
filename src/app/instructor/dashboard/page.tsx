'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { isApprovedInstructor, getInstructorProfile, getInstructorStats } from '@/services/instructorService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, DollarSign, Users, BookOpen, Star, TrendingUp, Plus, Settings, FileText } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'
import { ClientFormattedNumber } from '@/components/ui/ClientFormattedNumber'

export default function InstructorDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.push('/login?redirect=/instructor/dashboard')
        return
      }

      try {
        const isInstructor = await isApprovedInstructor(user.uid)
        if (!isInstructor) {
          toast({
            title: 'Geen toegang',
            description: 'Je moet een goedgekeurde instructeur zijn om deze pagina te bekijken.',
            variant: 'destructive'
          })
          router.push('/instructor/become')
          return
        }

        const [profile, instructorStats] = await Promise.all([
          getInstructorProfile(user.uid),
          getInstructorStats(user.uid)
        ])

        setInstructor(profile)
        setStats(instructorStats)
      } catch (error) {
        console.error('Error loading instructor data:', error)
        toast({
          title: 'Fout bij laden',
          description: 'Er ging iets mis bij het laden van je gegevens.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!instructor) {
    return null
  }

  const monthlyRevenue = (stats?.totalRevenue || 0) * 0.7 / 12 // 70% revenue share, estimated monthly

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-width section-padding py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructeur Dashboard</h1>
              <p className="text-gray-600 mt-1">Beheer je cursussen en volg je voortgang</p>
            </div>
            <Button asChild>
              <Link href="/instructor/course/create">
                <Plus className="mr-2 w-4 h-4" />
                Nieuwe Cursus
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-width section-padding py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€<ClientFormattedNumber value={stats?.totalRevenue || 0} /></div>
              <p className="text-xs text-muted-foreground">
                ~€<ClientFormattedNumber value={monthlyRevenue} />/maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Studenten</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><ClientFormattedNumber value={stats?.totalStudents || 0} /></div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +12% deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursussen</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalCourses > 0 ? 'Actief' : 'Geen cursussen'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gemiddelde Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageRating || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                Van {stats?.totalStudents || 0} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Mijn Cursussen</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="earnings">Inkomsten</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mijn Cursussen</CardTitle>
                <CardDescription>
                  Beheer je bestaande cursussen of maak een nieuwe aan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.totalCourses === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Nog geen cursussen</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Begin met het creëren van je eerste cursus
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/instructor/course/create">
                        <Plus className="mr-2 w-4 h-4" />
                        Maak je eerste cursus
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">Je cursussen worden hier getoond...</p>
                    {/* TODO: Implement course list */}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Gedetailleerde statistieken over je cursussen en studenten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard komt binnenkort...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inkomsten Overzicht</CardTitle>
                <CardDescription>
                  Je verdiensten en uitbetalingen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Totale omzet</p>
                    <p className="text-2xl font-bold">€<ClientFormattedNumber value={stats?.totalRevenue || 0} /></p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Jouw aandeel (70%)</p>
                    <p className="text-2xl font-bold text-green-600">
                      €<ClientFormattedNumber value={(stats?.totalRevenue || 0) * 0.7} />
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Uitbetalingen vinden maandelijks plaats op de 1e van de maand voor bedragen boven €50.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Instructeur Gids
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Alles wat je moet weten over het maken van succesvolle cursussen
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/instructor/guide">Bekijk gids</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Profiel Instellingen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Update je instructeur profiel en bio
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/instructor/settings">Instellingen</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}