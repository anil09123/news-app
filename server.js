import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;
const NEWS_API_BASE = 'https://newsapi.org/v2';
const DIST_DIR = path.join(__dirname, 'dist');

loadLocalEnv();

function loadLocalEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (!process.env[key]) {
      process.env[key] = valueParts.join('=').replace(/^['"]|['"]$/g, '');
    }
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': statusCode === 200 ? 'public, max-age=120' : 'no-store',
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
    };

    res.writeHead(200, {
      'Content-Type': typeMap[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
    });
    res.end(content);
  });
}

function proxyNewsApi(req, res, requestUrl) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return sendJson(res, 500, {
      status: 'error',
      message: 'NEWS_API_KEY is missing on the server. Add it in Render Environment Variables or local .env file.',
    });
  }

  const endpoint = requestUrl.searchParams.get('endpoint') || 'top-headlines';
  const allowedEndpoints = new Set(['top-headlines', 'everything']);

  if (!allowedEndpoints.has(endpoint)) {
    return sendJson(res, 400, {
      status: 'error',
      message: 'Invalid news endpoint.',
    });
  }

  const upstreamParams = new URLSearchParams(requestUrl.searchParams);
  upstreamParams.delete('endpoint');
  upstreamParams.set('apiKey', apiKey);

  const upstreamUrl = `${NEWS_API_BASE}/${endpoint}?${upstreamParams.toString()}`;
  const upstreamRequestOptions = new URL(upstreamUrl);
  upstreamRequestOptions.headers = {
    'Accept': 'application/json',
    'User-Agent': 'NewsPulse/1.0 (+https://github.com/anil09123/news-app)',
  };

  https
    .get(upstreamRequestOptions, (upstreamRes) => {
      let rawData = '';
      upstreamRes.on('data', (chunk) => {
        rawData += chunk;
      });
      upstreamRes.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          sendJson(res, upstreamRes.statusCode || 200, parsed);
        } catch {
          sendJson(res, 502, {
            status: 'error',
            message: 'News provider returned an invalid response.',
          });
        }
      });
    })
    .on('error', () => {
      sendJson(res, 502, {
        status: 'error',
        message: 'Unable to reach NewsAPI right now. Please try again later.',
      });
    });
}

function serveStatic(req, res, requestUrl) {
  const safePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  sendFile(res, filePath);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (requestUrl.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (requestUrl.pathname === '/api/news') {
    return proxyNewsApi(req, res, requestUrl);
  }

  return serveStatic(req, res, requestUrl);
});

server.listen(PORT, () => {
  console.log(`News app server running on port ${PORT}`);
});
