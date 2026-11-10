// A narrow public-media bridge. E2 credentials stay in Cloudflare bindings.
const HOST = 's3.us-west-2.idrivee2.com';
const REGION = 'us-east-1';
const BUCKET = 'espacios-store-f';
const PREFIX = 'communiverse-public/20261111/';
const LIMIT = 16 * 1024 * 1024;
const encoder = new TextEncoder();
const emptyHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const types = { webp: 'image/webp', avif: 'image/avif', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml' };

const hex = bytes => Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('');
const sha256 = async bytes => hex(await crypto.subtle.digest('SHA-256', bytes));
const encode = value => encodeURIComponent(value).replace(/[!'()*]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase());
const response = (status, message) => Response.json({ ok: false, error: message }, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

export function parseMediaPath(pathname) {
  if (!pathname.startsWith('/cv-media/')) return null;
  const path = pathname.slice('/cv-media/'.length);
  if (path.length > 300 || !/^[a-zA-Z0-9/._-]+$/.test(path) || path.includes('//') || path.split('/').some(part => part === '.' || part === '..')) return null;
  if (!/^communiverse\/(?:_public\/(?:media|domain-portraits-[0-9]{8})|_portraits|_curro-portrait|_hira-portrait|_curro|_artworks|_circles|_taz|_brand)\//.test(path)) return null;
  const extension = path.match(/\.([a-z]+)$/)?.[1];
  if (!types[extension]) return null;
  return { key: PREFIX + path, contentType: types[extension] };
}

function authorized(request, token) {
  if (typeof token !== 'string' || token.length < 48) return false;
  const value = request.headers.get('authorization') || '';
  if (!value.startsWith('Bearer ') || value.length !== token.length + 7) return false;
  const supplied = value.slice(7);
  let difference = 0;
  for (let i = 0; i < token.length; i++) difference |= token.charCodeAt(i) ^ supplied.charCodeAt(i);
  return difference === 0;
}

async function hmac(key, value) {
  const imported = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', imported, encoder.encode(value)));
}

async function signedFetch(env, method, key, payload, contentType, checksum) {
  const path = '/' + BUCKET + '/' + key.split('/').map(encode).join('/');
  const stamp = new Date().toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const day = stamp.slice(0, 8);
  const scope = `${day}/${REGION}/s3/aws4_request`;
  const bodyHash = payload ? await sha256(payload) : emptyHash;
  const headers = { host: HOST, 'x-amz-content-sha256': bodyHash, 'x-amz-date': stamp };
  if (method === 'PUT') {
    headers['content-type'] = contentType;
    headers['if-none-match'] = '*';
    headers['x-amz-acl'] = 'private';
    headers['x-amz-meta-sha256'] = checksum;
  }
  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map(name => `${name}:${headers[name]}\n`).join('');
  const canonical = `${method}\n${path}\n\n${canonicalHeaders}\n${names.join(';')}\n${bodyHash}`;
  let signingKey = await hmac(encoder.encode('AWS4' + env.E2F_SECRET), day);
  for (const part of [REGION, 's3', 'aws4_request']) signingKey = await hmac(signingKey, part);
  const signature = hex(await hmac(signingKey, `AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${await sha256(encoder.encode(canonical))}`));
  delete headers.host;
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${env.E2F_KEY}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`;
  if (method === 'GET') headers['accept-encoding'] = 'identity';
  return fetch(`https://${HOST}${path}`, { method, headers, body: payload, redirect: 'manual', signal: AbortSignal.timeout(30000) });
}

async function boundedBody(request) {
  const declared = request.headers.get('content-length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > LIMIT)) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > LIMIT) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (!length || declared !== null && Number(declared) !== length) return null;
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/cv-media/health' && request.method === 'GET') {
      return Response.json({ ok: true, storage: 'idrive-e2', scope: 'communiverse-public' }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const media = parseMediaPath(url.pathname);
    if (!media || url.search) return response(404, 'not_found');
    if (!['GET', 'HEAD', 'PUT'].includes(request.method)) return response(405, 'method_not_allowed');
    if (!env.E2F_KEY || !env.E2F_SECRET) return response(503, 'storage_unconfigured');
    try {
    if (request.method === 'PUT') {
      if (!authorized(request, env.CV_E2_UPLOAD_TOKEN)) return response(401, 'unauthorized');
      if (request.headers.get('content-type') !== media.contentType) return response(415, 'invalid_type');
      const body = await boundedBody(request);
      if (!body) return response(413, 'invalid_size');
      const checksum = await sha256(body);
      if (request.headers.get('x-content-sha256') !== checksum) return response(422, 'checksum_mismatch');
      const stored = await signedFetch(env, 'PUT', media.key, body, media.contentType, checksum);
      await stored.body?.cancel();
      if (![200, 201, 412].includes(stored.status)) return response(502, 'storage_write_failed');
      const verified = await signedFetch(env, 'GET', media.key);
      if (verified.status !== 200) { await verified.body?.cancel(); return response(502, 'readback_failed'); }
      const actual = await verified.arrayBuffer();
      if (actual.byteLength !== body.byteLength || await sha256(actual) !== checksum) return response(409, 'readback_mismatch');
      return Response.json({ ok: true, verified: true, bytes: body.byteLength, sha256: checksum, alreadyExists: stored.status === 412 }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const stored = await signedFetch(env, 'GET', media.key);
    if (stored.status === 404) { await stored.body?.cancel(); return response(404, 'not_found'); }
    if (stored.status !== 200 || stored.headers.get('content-encoding')) { await stored.body?.cancel(); return response(502, 'storage_read_failed'); }
    const headers = new Headers({ 'Content-Type': media.contentType, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' });
    for (const name of ['etag', 'content-length', 'last-modified']) {
      const value = stored.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (request.method === 'HEAD') { await stored.body?.cancel(); return new Response(null, { status: 200, headers }); }
    return new Response(stored.body, { status: 200, headers });
    } catch {
      return response(502, 'storage_unavailable');
    }
  },
};
