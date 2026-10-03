const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv; charset=utf-8'
};

function createServer(port) {
    const server = http.createServer((req, res) => {
        // Parse URL
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        let pathname = decodeURIComponent(parsedUrl.pathname);

        if (pathname === '/' || pathname === '') {
            pathname = '/index.html';
        }

        const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(ROOT_DIR, safePath);

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
            res.writeHead(204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            res.end();
            return;
        }

        // Direct Save Image Endpoint
        if (req.method === 'POST' && pathname === '/api/save-image') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const base64Data = (data.image || '').replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    const fileName = data.filename || 'Exam_Result_A4.png';
                    
                    // Save to user's D:\Downloads and project folder
                    const targetPaths = [
                        path.join('D:\\Downloads', fileName),
                        path.join(ROOT_DIR, fileName)
                    ];

                    let savedPath = '';
                    for (const p of targetPaths) {
                        try {
                            fs.writeFileSync(p, buffer);
                            savedPath = p;
                        } catch (e) {
                            console.error(`Failed to write to ${p}:`, e);
                        }
                    }

                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: true, path: savedPath }));
                } catch (err) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }

        // Save Template Endpoint (Legacy compatibility)
        if (req.method === 'POST' && pathname === '/api/save-template') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const templatePath = path.join(ROOT_DIR, 'saved_template.json');
                    fs.writeFileSync(templatePath, body, 'utf8');
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: true }));
                } catch (err) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }

        // Get Saved Template Endpoint (Legacy compatibility)
        if (req.method === 'GET' && pathname === '/api/get-template') {
            const templatePath = path.join(ROOT_DIR, 'saved_template.json');
            if (fs.existsSync(templatePath)) {
                const data = fs.readFileSync(templatePath, 'utf8');
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            } else {
                res.writeHead(404, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ exists: false }));
            }
            return;
        }

        // Get Features Endpoint
        if (req.method === 'GET' && pathname === '/api/get-features') {
            const featuresPath = path.join(ROOT_DIR, 'saved_features.json');
            if (fs.existsSync(featuresPath)) {
                const data = fs.readFileSync(featuresPath, 'utf8');
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            } else {
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ exists: false }));
            }
            return;
        }

        // Save All Features Endpoint
        if (req.method === 'POST' && pathname === '/api/save-features') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const featuresPath = path.join(ROOT_DIR, 'saved_features.json');
                    fs.writeFileSync(featuresPath, body, 'utf8');
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: true }));
                } catch (err) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }

        // Save Single Feature Format Endpoint
        if (req.method === 'POST' && pathname === '/api/save-feature') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const payload = JSON.parse(body);
                    const featuresPath = path.join(ROOT_DIR, 'saved_features.json');
                    let stored = { features: [] };
                    if (fs.existsSync(featuresPath)) {
                        try {
                            stored = JSON.parse(fs.readFileSync(featuresPath, 'utf8'));
                        } catch (e) {}
                    }
                    if (!Array.isArray(stored.features)) stored.features = [];

                    const idx = stored.features.findIndex(f => f.id === payload.id);
                    if (idx >= 0) {
                        stored.features[idx] = { ...stored.features[idx], ...payload, updatedAt: new Date().toISOString() };
                    } else {
                        stored.features.push({ ...payload, updatedAt: new Date().toISOString() });
                    }

                    fs.writeFileSync(featuresPath, JSON.stringify(stored, null, 2), 'utf8');
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: true, feature: payload }));
                } catch (err) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }

        // Delete Feature Endpoint
        if (req.method === 'POST' && pathname === '/api/delete-feature') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const { featureId } = JSON.parse(body);
                    const featuresPath = path.join(ROOT_DIR, 'saved_features.json');
                    if (fs.existsSync(featuresPath)) {
                        const stored = JSON.parse(fs.readFileSync(featuresPath, 'utf8'));
                        if (Array.isArray(stored.features)) {
                            stored.features = stored.features.filter(f => f.id !== featureId);
                            fs.writeFileSync(featuresPath, JSON.stringify(stored, null, 2), 'utf8');
                        }
                    }
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: true }));
                } catch (err) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }

        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        });
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is currently in use. Trying port ${port + 1}...`);
            createServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(port, () => {
        console.log('====================================================');
        console.log('  ប្រព័ន្ធពិនិត្យលទ្ធផលសិស្ស - Local Web Server');
        console.log('====================================================');
        console.log(`  Local Server running at: http://localhost:${port}`);
        console.log(`  Network Server:          http://127.0.0.1:${port}`);
        console.log('====================================================');
        console.log('  Press Ctrl+C to stop the server.');
    });
}

createServer(DEFAULT_PORT);
