import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register custom fonts (you can add custom fonts here)
// Font.register({
//   family: 'Montserrat',
//   src: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.ttf'
// });

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    minWidth: '100%',
    minHeight: '100%',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 15,
    maxWidth: 700,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 20,
  },
  certifyText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  studentName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  courseInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  courseText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 15,
    textAlign: 'center',
  },
  gradeSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
  },
  gradeBadge: {
    padding: '6 12',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  achievementsSection: {
    marginBottom: 15,
    alignItems: 'center',
  },
  achievementsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 6,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    maxWidth: 500,
  },
  achievementBadge: {
    padding: '3 8',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    fontSize: 10,
    color: '#4b5563',
  },
  completionDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 15,
    alignSelf: 'center',
  },
  signatureBlock: {
    alignItems: 'center',
    flex: 1,
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: '#9ca3af',
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  signatureTitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  certDetails: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
    gap: 5,
  },
  certNumber: {
    fontSize: 9,
    color: '#9ca3af',
  },
  qrSection: {
    alignItems: 'center',
  },
  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  qrText: {
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
  },
  organization: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  border: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'solid',
  },
  decorativeBorder: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
  },
});

interface CertificateData {
  id: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  certificateNumber: string;
  grade?: string;
  score?: number;
  achievements?: string[];
  qrCode?: string;
  organizationName?: string;
  organizationLogo?: string;
  organizationWebsite?: string;
}

// Certificate component
const CertificatePDF: React.FC<{ data: CertificateData }> = ({ data }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      {/* Decorative borders */}
      <View style={styles.border} />
      <View style={styles.decorativeBorder} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.subtitle}>{data.organizationName || 'GroeimetAI Academy'}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.certifyText}>This is to certify that</Text>
          <Text style={styles.studentName}>{data.studentName}</Text>
          
          <View style={styles.courseInfo}>
            <Text style={styles.courseText}>has successfully completed the course</Text>
            <Text style={styles.courseName}>{data.courseName}</Text>
          </View>

          {/* Grade and Score */}
          {(data.grade || data.score) && (
            <View style={styles.gradeSection}>
              {data.grade && (
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>Grade: {data.grade}</Text>
                </View>
              )}
              {data.score !== undefined && (
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>Score: {data.score}%</Text>
                </View>
              )}
            </View>
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Text style={styles.achievementsTitle}>Achievements</Text>
              <View style={styles.achievementsList}>
                {data.achievements.map((achievement, index) => (
                  <Text key={index} style={styles.achievementBadge}>
                    {achievement}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.completionDate}>
            Completed on {format(
              data.completionDate instanceof Date ? data.completionDate : new Date(data.completionDate || new Date()), 
              'MMMM d, yyyy'
            )}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Signatures */}
          <View style={styles.signatures}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{data.instructorName}</Text>
              <Text style={styles.signatureTitle}>Course Instructor</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Director</Text>
              <Text style={styles.signatureTitle}>{data.organizationName || 'GroeimetAI Academy'}</Text>
            </View>
          </View>

          {/* Certificate details */}
          <View style={styles.certDetails}>
            <Text style={styles.certNumber}>Certificate No: {data.certificateNumber}</Text>
            <Text style={styles.organization}>
              {data.organizationWebsite || 'groeimetai.com'}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Generate PDF blob
export const generateCertificatePDF = async (data: CertificateData): Promise<Blob> => {
  const document = <CertificatePDF data={data} />;
  const blob = await pdf(document).toBlob();
  return blob;
};

// Generate PDF base64
export const generateCertificatePDFBase64 = async (data: CertificateData): Promise<string> => {
  const blob = await generateCertificatePDF(data);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default CertificatePDF;