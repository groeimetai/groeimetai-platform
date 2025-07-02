// Wrapper for PDF generation to handle dynamic imports properly
export async function generateCertificatePDFSafe(data: any): Promise<Blob> {
  try {
    // Ensure completionDate is a valid Date object
    const certificateData = {
      ...data,
      completionDate: data.completionDate ? new Date(data.completionDate) : new Date()
    }
    
    // Validate the date
    if (isNaN(certificateData.completionDate.getTime())) {
      certificateData.completionDate = new Date()
    }
    
    // Dynamically import the PDF generator to avoid SSR issues
    const pdfModule = await import('./certificatePDFGenerator')
    return await pdfModule.generateCertificatePDF(certificateData)
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Return a simple HTML as fallback
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Certificate - ${data.studentName || 'Student'}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
        h1 { color: #2563eb; }
        .certificate { border: 2px solid #2563eb; padding: 40px; margin: 20px auto; max-width: 600px; }
    </style>
</head>
<body>
    <div class="certificate">
        <h1>Certificate of Completion</h1>
        <p>This is to certify that</p>
        <h2>${data.studentName || 'Student'}</h2>
        <p>has successfully completed</p>
        <h3>${data.courseName || 'Course'}</h3>
        <p>Instructor: ${data.instructorName || 'Instructor'}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`
    
    return new Blob([htmlContent], { type: 'text/html' })
  }
}