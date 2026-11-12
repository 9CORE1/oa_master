import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname);
const PORT = Number(process.env.PORT) || 5500;
const HOST = '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

/**
 * 요청 URL 경로를 워크스페이스 내부 안전한 파일 경로로 변환합니다.
 * @param {string} rawUrl - HTTP 요청 URL
 * @returns {string|null} 파일 절대 경로 또는 유효하지 않을 경우 null
 */
function resolveSafeFilePath(rawUrl) {
  const urlPath = (rawUrl || '/').split('?')[0].split('#')[0];
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch (err) {
    return null;
  }

  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const resolvedPath = path.resolve(ROOT_DIR, relativePath);

  if (!resolvedPath.startsWith(ROOT_DIR + path.sep) && resolvedPath !== ROOT_DIR) {
    return null;
  }

  return resolvedPath;
}

const server = http.createServer((req, res) => {
  try {
    const filePath = resolveSafeFilePath(req.url);
    if (!filePath || !fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const indexFile = path.join(filePath, 'index.html');
      if (!fs.existsSync(indexFile)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
      fs.createReadStream(indexFile).pipe(res);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('로컬 서버 요청 처리 중 오류:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`포트 ${PORT}가 이미 사용 중입니다. PORT 환경변수로 다른 포트를 지정해 주세요.`);
  } else {
    console.error('로컬 서버 실행 오류:', err);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`OA MASTER 로컬 확인 서버 실행 중: http://localhost:${PORT}`);
  console.log(`AI × OA 콜라보 허브: http://localhost:${PORT}/ai_office.html`);
});

