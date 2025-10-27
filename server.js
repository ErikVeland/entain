import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Try multiple ports to avoid EADDRINUSE errors
const ports = [process.env.PORT || 4000, 3000, 3001, 5000, 8080];
let currentPortIndex = 0;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to Neds API
app.use('/api', createProxyMiddleware({
  target: 'https://api.neds.com.au',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix
  },
  onProxyRes: function (proxyRes, req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}));

// Serve index.html for all non-API routes (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Function to try starting server on different ports
function startServer() {
  const port = ports[currentPortIndex];
  
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying next port...`);
      currentPortIndex++;
      if (currentPortIndex < ports.length) {
        startServer();
      } else {
        console.error('No available ports found');
        process.exit(1);
      }
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

// Start the server
startServer();