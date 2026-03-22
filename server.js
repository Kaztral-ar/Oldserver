// VAULT - Improved Node.js Backend Server // Focus: stability, error handling, non-blocking I/O // Run: node vault_server_improved.js

const http = require('http'); const fs = require('fs'); const path = require('path'); const os = require('os');

// ── CONFIG ── const PORT = process.env.PORT || 3000; const ROOT = __dirname; const UPLOADS = path.join(ROOT, 'uploads');

// Ensure uploads dir exists if (!fs.existsSync(UPLOADS)) { fs.mkdirSync(UPLOADS, { recursive: true }); }

// ── MIME TYPES ── const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.zip': 'application/zip', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.txt': 'text/plain', '.md': 'text/markdown', '.webp': 'image/webp' };

// ── UTILITIES ── function setCORS(res) { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); }

function sendJSON(res, status, payload) { setCORS(res); res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(payload)); }

function safeFileName(name) { return path.basename(name).replace(/[^a-zA-Z0-9.-() ]/g, ''); }

// ── MULTIPART PARSER (safer) ── async function parseMultipart(req) { return new Promise((resolve, reject) => { const chunks = [];

req.on('data', chunk => chunks.push(chunk));
req.on('end', () => {
  try {
    const buffer = Buffer.concat(chunks);
    const type = req.headers['content-type'] || '';
    const match = type.match(/boundary=(.+)$/);

    if (!match) return reject(new Error('Invalid multipart request'));

    const boundary = Buffer.from('--' + match[1]);
    const files = [];

    let start = 0;
    while (true) {
      const bStart = buffer.indexOf(boundary, start);
      if (bStart === -1) break;

      const headerStart = bStart + boundary.length + 2;
      const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
      if (headerEnd === -1) break;

      const header = buffer.slice(headerStart, headerEnd).toString();
      const fileMatch = header.match(/filename="([^"]+)"/);

      if (fileMatch) {
        const dataStart = headerEnd + 4;
        const nextBoundary = buffer.indexOf(boundary, dataStart);
        const dataEnd = nextBoundary - 2;

        files.push({
          filename: fileMatch[1],
          data: buffer.slice(dataStart, dataEnd)
        });
      }

      start = headerEnd;
    }

    resolve(files);
  } catch (err) {
    reject(err);
  }
});

req.on('error', reject);

}); }

// ── FILE STATS ── function getFiles() { try { const names = fs.readdirSync(UPLOADS); let total = 0;

const files = names.map(name => {
  const filePath = path.join(UPLOADS, name);
  const stat = fs.statSync(filePath);
  total += stat.size;

  return {
    name,
    size: stat.size,
    modified: stat.mtimeMs
  };
}).sort((a, b) => b.modified - a.modified);

return { files, total };

} catch (err) { return { files: [], total: 0 }; } }

// ── ROUTES ── const server = http.createServer(async (req, res) => { try { const url = decodeURIComponent(req.url.split('?')[0]);

// Preflight
if (req.method === 'OPTIONS') {
  setCORS(res);
  res.writeHead(204);
  return res.end();
}

// GET FILES
if (req.method === 'GET' && url === '/api/files') {
  const { files, total } = getFiles();

  return sendJSON(res, 200, {
    files,
    totalSize: total,
    ram: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    }
  });
}

// UPLOAD
if (req.method === 'POST' && url === '/api/upload') {
  const files = await parseMultipart(req);

  if (!files.length) {
    return sendJSON(res, 400, { error: 'No files uploaded' });
  }

  const results = [];

  for (const file of files) {
    const name = safeFileName(file.filename);
    const dest = path.join(UPLOADS, name);

    await fs.promises.writeFile(dest, file.data);

    results.push({ name, size: file.data.length });
  }

  return sendJSON(res, 200, { ok: true, files: results });
}

// DELETE
if (req.method === 'DELETE' && url.startsWith('/api/files/')) {
  const name = safeFileName(url.replace('/api/files/', ''));
  const filePath = path.join(UPLOADS, name);

  if (!fs.existsSync(filePath)) {
    return sendJSON(res, 404, { error: 'File not found' });
  }

  await fs.promises.unlink(filePath);
  return sendJSON(res, 200, { ok: true });
}

// DOWNLOAD
if (req.method === 'GET' && url.startsWith('/uploads/')) {
  const name = safeFileName(url.replace('/uploads/', ''));
  const filePath = path.join(UPLOADS, name);

  if (!fs.existsSync(filePath)) {
    setCORS(res);
    res.writeHead(404);
    return res.end('Not found');
  }

  const ext = path.extname(filePath);
  const type = MIME[ext] || 'application/octet-stream';

  setCORS(res);
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Disposition': `attachment; filename="${name}"`
  });

  return fs.createReadStream(filePath).pipe(res);
}

// SERVE INDEX
if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
  const filePath = path.join(ROOT, 'index.html');

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('index.html not found');
  }

  setCORS(res);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  return fs.createReadStream(filePath).pipe(res);
}

// 404
setCORS(res);
res.writeHead(404);
res.end('Not found');

} catch (err) { console.error('[ERROR]', err); sendJSON(res, 500, { error: 'Internal server error' }); } });

// ── START SERVER ── server.listen(PORT, () => { console.log(\nVAULT server running on http://localhost:${PORT}); console.log(Uploads directory: ${UPLOADS}\n); });
