/**
 * Same-origin proxy for the staging backend.
 * Vercel Root Directory: apps/web. Set BACKEND_API_URL (server-side, no /api/v1 suffix).
 * Functions are matched before the SPA rewrite, so /api/v1/* never falls through to index.html.
 */
const BACKEND = process.env.BACKEND_API_URL;

export default async function handler(req, res) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', requestId);

  if (!BACKEND) {
    res.status(503).json({
      error: {
        code: 'BACKEND_NOT_CONFIGURED',
        message: '백엔드 주소가 설정되지 않았습니다.',
        requestId,
      },
    });
    return;
  }

  const rawPath = req.query.path;
  const segments = Array.isArray(rawPath) ? rawPath.join('/') : (rawPath ?? '');
  const target = new URL(`${BACKEND.replace(/\/+$/, '')}/api/v1/${segments}`);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) target.searchParams.append(key, String(item));
    }
  }

  const headers = {};
  for (const name of ['authorization', 'content-type', 'accept']) {
    if (req.headers[name]) headers[name] = req.headers[name];
  }

  const init = { method: req.method, headers };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  }

  try {
    const response = await fetch(target, init);
    const body = await response.text();
    res.status(response.status);
    res.setHeader('content-type', response.headers.get('content-type') || 'application/json');
    const upstreamRequestId = response.headers.get('x-request-id');
    if (upstreamRequestId) res.setHeader('x-request-id', upstreamRequestId);
    res.send(body);
  } catch {
    res.status(502).json({
      error: {
        code: 'BACKEND_UNREACHABLE',
        message: '백엔드에 연결할 수 없습니다.',
        requestId,
      },
    });
  }
}
