// Wrapper for PDF generation to handle dynamic imports properly
export async function generateCertificatePDFSafe(data: any): Promise<Blob> {
  try {
    // Dynamically import the PDF generator to avoid SSR issues
    const pdfModule = await import('./certificatePDFGenerator')
    return await pdfModule.generateCertificatePDF(data)
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Return a simple fallback blob if PDF generation fails
    return new Blob(['Certificate generation failed'], { type: 'text/plain' })
  }
}