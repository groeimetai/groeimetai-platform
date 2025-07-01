'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Award, CheckCircle } from 'lucide-react'

interface SimpleCertificateDisplayProps {
  certificate: any
}

export default function SimpleCertificateDisplay({ certificate }: SimpleCertificateDisplayProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center mb-4">
          <Award className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-blue-600">
          Certificate of Completion
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Student Information */}
        <div className="text-center space-y-2">
          <p className="text-lg text-muted-foreground">This is to certify that</p>
          <h2 className="text-2xl font-bold">{certificate.studentName}</h2>
          <p className="text-lg text-muted-foreground">has successfully completed</p>
          <h3 className="text-xl font-semibold text-blue-600">{certificate.courseName}</h3>
        </div>

        {/* Grade and Score */}
        {(certificate.grade || certificate.score !== undefined) && (
          <div className="flex justify-center gap-4">
            {certificate.grade && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Grade: {certificate.grade}
              </Badge>
            )}
            {certificate.score !== undefined && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Score: {certificate.score}%
              </Badge>
            )}
          </div>
        )}

        {/* Completion Date */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Completed on {format(new Date(certificate.completionDate), 'MMMM d, yyyy')}</span>
        </div>

        {/* Certificate Number */}
        {certificate.certificateNumber && (
          <div className="text-center text-sm text-muted-foreground">
            Certificate No: {certificate.certificateNumber}
          </div>
        )}

        {/* Verification Status */}
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Valid Certificate</span>
        </div>

        {/* Instructor Information */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">Issued by</p>
          <p className="font-medium">{certificate.instructorName}</p>
          <p className="text-sm text-muted-foreground">Course Instructor</p>
          <p className="text-sm text-muted-foreground mt-2">GroeimetAI Academy</p>
        </div>
      </CardContent>
    </Card>
  )
}