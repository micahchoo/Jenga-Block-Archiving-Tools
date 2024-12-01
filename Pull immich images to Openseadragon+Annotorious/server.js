import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;
const TARGET = 'http://192.168.1.106:2283';

// Add more detailed CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  // Debug full request
  console.log('\n=== Incoming Request ===');
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Api-Key, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});
// server.js
// Add this route before the general proxy
app.get('/api/assets/:id', async (req, res) => {
  const assetId = req.params.id;
  const apiKey = req.header('x-api-key');

  console.log('\n=== Incoming Metadata Request ===');
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (!apiKey) {
    return res.status(401).json({ error: 'No API key provided' });
  }

  try {
    const response = await fetch(`${TARGET}/api/assets/${assetId}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Immich returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Metadata response:', JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error('Error processing metadata request:', error);
    res.status(500).json({ error: error.message });
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

// General API proxy
const apiProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request:', req.method, req.url);
    if (req.headers['x-api-key']) {
      proxyReq.setHeader('x-api-key', req.headers['x-api-key']);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Proxy response:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
  }
});

app.use('/api', apiProxy);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Target API: ${TARGET}`);
});