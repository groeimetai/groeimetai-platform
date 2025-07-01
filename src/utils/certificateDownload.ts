export function downloadCertificateAsHTML(certificate: any) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - ${certificate.studentName}</title>
    <style>
        @media print {
            body { margin: 0; }
            .certificate { page-break-after: avoid; }
        }
        body {
            font-family: Georgia, serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .certificate {
            background: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 60px;
            border: 2px solid #2563eb;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            text-align: center;
            position: relative;
        }
        .certificate::before, .certificate::after {
            content: '';
            position: absolute;
            border: 1px solid #e5e7eb;
        }
        .certificate::before {
            top: 10px; left: 10px; right: 10px; bottom: 10px;
        }
        .certificate::after {
            top: 15px; left: 15px; right: 15px; bottom: 15px;
        }
        h1 {
            color: #2563eb;
            font-size: 36px;
            margin-bottom: 30px;
            font-weight: bold;
        }
        .award-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .student-name {
            font-size: 32px;
            font-weight: bold;
            margin: 20px 0;
            color: #1f2937;
        }
        .course-name {
            font-size: 24px;
            color: #2563eb;
            font-weight: bold;
            margin: 20px 0;
        }
        .text-muted {
            color: #6b7280;
            font-size: 18px;
        }
        .grade-score {
            margin: 30px 0;
        }
        .badge {
            display: inline-block;
            padding: 8px 16px;
            background: #e5e7eb;
            border-radius: 8px;
            margin: 0 10px;
            font-weight: bold;
            color: #374151;
        }
        .completion-date {
            margin: 30px 0;
            color: #6b7280;
        }
        .certificate-number {
            margin: 20px 0;
            font-size: 14px;
            color: #9ca3af;
        }
        .footer {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
        }
        .instructor {
            font-weight: bold;
            color: #1f2937;
        }
        .organization {
            color: #6b7280;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="award-icon">🏆</div>
        <h1>Certificate of Completion</h1>
        
        <p class="text-muted">This is to certify that</p>
        <p class="student-name">${certificate.studentName}</p>
        <p class="text-muted">has successfully completed</p>
        <p class="course-name">${certificate.courseName}</p>
        
        ${certificate.grade || certificate.score ? `
        <div class="grade-score">
            ${certificate.grade ? `<span class="badge">Grade: ${certificate.grade}</span>` : ''}
            ${certificate.score !== undefined ? `<span class="badge">Score: ${certificate.score}%</span>` : ''}
        </div>
        ` : ''}
        
        <p class="completion-date">
            Completed on ${certificate.completionDate ? 
                new Date(certificate.completionDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) : 
                new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
            }
        </p>
        
        ${certificate.certificateNumber ? `
        <p class="certificate-number">Certificate No: ${certificate.certificateNumber || certificate.id}</p>
        ` : ''}
        
        <div class="footer">
            <p class="text-muted">Issued by</p>
            <p class="instructor">${certificate.instructorName}</p>
            <p class="text-muted">Course Instructor</p>
            <p class="organization">GroeiMetAI Academy</p>
        </div>
    </div>
</body>
</html>
  `.trim()

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `certificate-${certificate.id}.html`
  document.body.appendChild(link)
  link.click()
  
  setTimeout(() => {
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }, 100)
}

export async function downloadCertificateFromAPI(certificateId: string) {
  try {
    const response = await fetch(`/api/certificate/download-safe/${certificateId}`)
    if (!response.ok) throw new Error('Download failed')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `certificate-${certificateId}.txt`
    document.body.appendChild(link)
    link.click()
    
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}