const http = require('http');

// Simple test server to check if port 3000 is responding
const testServer = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Test server running',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  }));
});

testServer.listen(3001, () => {
  console.log('Test server running on http://localhost:3001');
  console.log('Checking if something is running on port 3000...');
  
  // Check what's on port 3000
  http.get('http://localhost:3000', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Response from port 3000:', data);
    });
  }).on('error', (err) => {
    console.log('Error connecting to port 3000:', err.message);
  });
});