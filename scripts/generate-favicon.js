// This script can be used to generate PNG versions of the favicon
// Run with: node scripts/generate-favicon.js

console.log(`
To generate PNG versions of the favicon:

1. Open favicon.svg in a browser
2. Use browser DevTools to take a screenshot at 32x32, 192x192, and 512x512
3. Or use an online SVG to PNG converter like:
   - https://cloudconvert.com/svg-to-png
   - https://convertio.co/svg-png/

Save the files as:
- public/favicon.png (32x32)
- public/apple-touch-icon.png (180x180)
- public/icon-192.png (192x192)
- public/icon-512.png (512x512)

For PWA support, also create a manifest.json file.
`);