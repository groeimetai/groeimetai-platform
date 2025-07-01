'use client'

export default function TestCertificatePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Certificate Test Page</h1>
      <p>If you can see this, the basic routing works.</p>
      
      <div className="mt-8 space-y-4">
        <button 
          onClick={() => console.log('Test click')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Button
        </button>
        
        <div className="p-4 border rounded">
          <p>This is a simple test to check if the error is component-specific.</p>
        </div>
      </div>
    </div>
  )
}