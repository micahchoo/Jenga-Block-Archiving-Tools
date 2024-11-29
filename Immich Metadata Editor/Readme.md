# Immich Metadata Editor

A web application that enables easy metadata editing for Immich images through a browser interface, with integrated XMP sidecar file support.

## Overview

This project provides a system for adding metadata editing capabilities to Immich images through a custom workflow:

1. Adds a metadata link to Immich images that appears in the official Immich apps
2. When clicked, opens a web-based metadata editor
3. Changes are saved back to Immich and automatically sync to XMP sidecar files

## Architecture

The project consists of three main components:

### 1. Proxy Server (`server.js`)
- Acts as a middleware between the web client and Immich server
- Handles CORS and authentication
- Routes API requests to Immich
- Serves the metadata editor web interface

```
server.js
├── Express server setup
├── CORS handling
├── API proxying to Immich
└── Static file serving
```

### 2. Metadata Link Injector (`metadatatest.js`)
- Adds metadata edit links to Immich images
- Injects links in a format recognizable by Immich
- Preserves existing metadata
- Handles API authentication

```
metadatatest.js
├── Asset info retrieval
├── Metadata link generation
└── Update handling
```

### 3. Web-based Editor (`metadata-editor.html`)
- Browser-based metadata editing interface
- React-based single-page application
- Handles API key management
- Provides image preview and metadata form

```
metadata-editor.html
├── React components
├── API key management
├── Metadata form
└── Image preview
```

## Technical Decisions

### Why a Proxy Server?
1. **CORS Handling**: Immich's API doesn't support CORS by default. The proxy server enables cross-origin requests from our web editor.
2. **Security**: The proxy adds an additional layer of security and control over API access.
3. **Request Transformation**: Allows us to modify requests and responses as needed.

### Why React without Build Tools?
1. **Simplicity**: Using React via CDN with Babel standalone eliminates the need for a build system.
2. **Easy Deployment**: Single HTML file can be served directly.
3. **Quick Updates**: Changes can be made without rebuilding.

### Why Embed Links in Description?
1. **Compatibility**: Works with existing Immich apps without modifications.
2. **Persistence**: Links stay with the image metadata.
3. **Visibility**: Easily accessible in all Immich interfaces.

## Production Deployment

To deploy this project in production:

1. **Server Hardening**
```javascript
// Add rate limiting
import rateLimit from 'express-rate-limit';
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Add security headers
import helmet from 'helmet';
app.use(helmet());
```

2. **Environment Configuration**
```bash
# .env
PORT=3000
IMMICH_SERVER=https://your-immich-server
NODE_ENV=production
```

3. **HTTPS Setup**
- Configure SSL/TLS certificates
- Force HTTPS redirects
- Update CORS settings accordingly

4. **Error Handling**
- Add proper logging (e.g., Winston)
- Set up monitoring
- Implement error reporting

5. **Performance Optimization**
- Minify HTML/JS
- Add caching headers
- Optimize image loading

6. **Documentation Updates**
- API documentation
- Deployment guide
- Configuration options

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/immich-metadata-editor.git
```

2. Install dependencies:
```bash
npm install
```

3. Create configuration:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Start the server:
```bash
npm start
```

## Usage

1. Add metadata link to an image:
```bash
node metadatatest.js --id <asset-id>
```

2. Access the editor:
```
http://your-server:3000/edit?id=<asset-id>
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Credits

- Uses [Immich](https://github.com/immich-app/immich) for photo management
- Built with Express.js and React
- Uses Tailwind CSS for styling
- Code Generated in Claude