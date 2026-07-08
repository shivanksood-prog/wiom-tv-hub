// CORS proxy: forwards /api/* to wiom.tv and adds CORS headers,
// so the hub's replicated dashboard (GitHub Pages) can read live data.
const http = require('http');

const UPSTREAM = 'https://wiom.tv';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  if (req.method !== 'GET' || !req.url.startsWith('/api/')) {
    res.writeHead(404, CORS); return res.end('not found');
  }
  try {
    const r = await fetch(UPSTREAM + req.url, { signal: AbortSignal.timeout(15000) });
    const body = Buffer.from(await r.arrayBuffer());
    res.writeHead(r.status, {
      ...CORS,
      'Content-Type': r.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch (e) {
    res.writeHead(502, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'upstream failed' }));
  }
}).listen(process.env.PORT || 8080, () => console.log('cors proxy up'));
