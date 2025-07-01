
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, ExternalLink, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Certificate } from "@/types";

interface AchievementsWidgetProps {
  certificates: Certificate[];
}

export const AchievementsWidget = ({ certificates }: AchievementsWidgetProps) => {
  const router = useRouter();

  if (!certificates || certificates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            My Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No certificates earned yet. Complete courses to earn certificates!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = (certificateUrl: string) => {
    window.open(certificateUrl, '_blank');
  };

  const handleView = (certificateId: string) => {
    router.push(`/certificate/verify/${certificateId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <span>My Certificates</span>
            <Badge variant="secondary">{certificates.length}</Badge>
          </div>
          {certificates.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/certificates')}
            >
              View All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {certificates.slice(0, 3).map((cert) => (
            <div 
              key={cert.id} 
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold line-clamp-1">{cert.courseName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      Earned on {new Date(cert.completionDate).toLocaleDateString()}
                    </p>
                    {(cert as any).grade && (
                      <Badge variant="outline" className="text-xs">
                        Grade: {(cert as any).grade}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleView(cert.id)}
                  title="View Certificate"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDownload(cert.certificateUrl)}
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
