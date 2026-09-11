/* Tiny static server for local preview. Also accepts POSTs from
   tools/optimize-images.html, which re-encodes the source artwork
   down to the sizes the page actually renders it at. */
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd();
const types = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
  '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml',
  '.json':'application/json'
};

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/__save') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 40e6) req.destroy(); });
    req.on('end', () => {
      try {
        const { name, dataUri } = JSON.parse(body);
        if (!/^[a-z0-9_-]+\.txt$/i.test(name)) throw new Error('bad name');
        fs.writeFileSync(path.join(root, '.build', 'parts', name), dataUri);
        console.log('saved parts/' + name, (dataUri.length / 1024).toFixed(1) + ' kB');
        res.writeHead(200); res.end('ok');
      } catch (e) {
        console.error('save failed', e.message);
        res.writeHead(400); res.end(e.message);
      }
    });
    return;
  }

  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(4173, () => console.log('serving on http://localhost:4173'));
