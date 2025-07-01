export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Page - Next.js is Working!</h1>
      <p>If you can see this page, Next.js routing is working correctly.</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <hr />
      <h2>Debug Info:</h2>
      <ul>
        <li>Node Environment: {process.env.NODE_ENV || 'not set'}</li>
        <li>Next.js Version: Check package.json</li>
      </ul>
      <hr />
      <h2>Links to test:</h2>
      <ul>
        <li><a href="/">Home Page</a></li>
        <li><a href="/cursussen">Courses Page</a></li>
        <li><a href="/api/health">API Health Check</a></li>
      </ul>
    </div>
  );
}