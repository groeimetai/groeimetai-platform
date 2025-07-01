/**
 * Example usage of the AffiliateLink component
 * This shows how to integrate the affiliate system into a course page
 */

import React from 'react'
import { AffiliateLink } from './AffiliateLink'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2 } from 'lucide-react'

interface AffiliateExampleProps {
  courseId: string
  courseName: string
  userId: string
}

export function AffiliateExample({ courseId, courseName, userId }: AffiliateExampleProps) {
  return (
    <div className="space-y-6">
      {/* Basic integration */}
      <AffiliateLink 
        courseId={courseId}
        userId={userId}
        courseName={courseName}
      />

      {/* Example: Integration in a course sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share & Earn
          </CardTitle>
          <CardDescription>
            Love this course? Share it with others and earn commission on every sale!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliateLink 
            courseId={courseId}
            userId={userId}
            courseName={courseName}
          />
        </CardContent>
      </Card>

      {/* Example: Integration in user dashboard */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Become an Affiliate Partner</h3>
        <p className="text-sm text-gray-700 mb-4">
          Share courses you love and earn up to 20% commission on each sale.
        </p>
        <AffiliateLink 
          courseId={courseId}
          userId={userId}
          courseName={courseName}
        />
      </div>
    </div>
  )
}

// Usage in a course page:
// 
// import { AffiliateLink } from '@/components/affiliate'
// import { useAuth } from '@/hooks/useAuth' // Your auth hook
// 
// function CoursePage({ course }) {
//   const { user } = useAuth()
//   
//   return (
//     <div>
//       {/* Course content */}
//       
//       {user && (
//         <AffiliateLink 
//           courseId={course.id}
//           userId={user.id}
//           courseName={course.title}
//         />
//       )}
//     </div>
//   )
// }