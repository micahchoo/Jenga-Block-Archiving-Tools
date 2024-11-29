import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const TARGET = 'http://192.168.1.106:2283';

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static('.'));

// Serve the metadata editor page
app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'metadata-editor.html'));
});

// Direct handling of the PUT request
app.put('/api/assets/:id', async (req, res) => {
    const assetId = req.params.id;
    const apiKey = req.headers['x-api-key'];
    
    console.log('\nHandling PUT request:', {
        assetId,
        body: req.body,
        headers: req.headers,
        url: `${TARGET}/api/assets/${assetId}`
    });

    try {
        const response = await fetch(`${TARGET}/api/assets/${assetId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(req.body)
        });

        console.log('Upstream response status:', response.status);
        
        const responseText = await response.text();
        console.log('Upstream response body:', responseText);

        if (!response.ok) {
            console.error('Upstream error details:', responseText);
            return res.status(response.status).json({
                error: 'Failed to update metadata',
                details: responseText
            });
        }

        const data = responseText ? JSON.parse(responseText) : {};
        res.json(data);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: error.message,
            details: error.stack
        });
    }
});

// Default proxy for other routes
const apiProxy = createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    pathRewrite: (path) => path.startsWith('/api/') ? path : `/api${path}`
});

app.use('/api', (req, res, next) => {
    if (req.method === 'PUT' && req.path.startsWith('/assets/')) {
        return next(); // Let our custom handler deal with it
    }
    return apiProxy(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Target API: ${TARGET}`);
});