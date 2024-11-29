import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const TARGET = 'http://192.168.1.106:2283';

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('.'));

// Serve the annotator page for /annotate route
app.get('/annotate', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Configure proxy for API requests
const apiProxy = createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    pathRewrite: (path) => {
        return path.startsWith('/api/') ? path : `/api${path}`;
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying to:', proxyReq.path);

        if (req.method === 'POST' && req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    }
});

// Mount proxy middleware
app.use('/api', apiProxy);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Proxying API requests to ${TARGET}`);
});