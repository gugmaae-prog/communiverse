import test from 'node:test';
import assert from 'node:assert/strict';
import gateway, { parseMediaPath } from './gateway.mjs';

test('only Communiverse public images resolve to the fixed prefix', () => {
  assert.deepEqual(parseMediaPath('/cv-media/communiverse/_portraits/curro.webp'), {
    key: 'communiverse-public/20261111/communiverse/_portraits/curro.webp', contentType: 'image/webp',
  });
  for (const path of [
    '/cv-media/cloudflare-backups/data.json', '/cv-media/communiverse/_portraits/../../cloudflare-backups/a.webp',
    '/cv-media/communiverse/_portraits/a%2Fb.webp', '/cv-media/communiverse/_public/media/a.js',
    '/cv-media/communiverse/_portraits/a.webp/evil',
  ]) assert.equal(parseMediaPath(path), null, path);
});

test('upload rejects unauthenticated and modified bytes before storage access', async () => {
  const url = 'https://example.test/cv-media/communiverse/_portraits/curro.webp';
  const env = { E2F_KEY: 'configured', E2F_SECRET: 'configured', CV_E2_UPLOAD_TOKEN: 'x'.repeat(96) };
  const unauthenticated = await gateway.fetch(new Request(url, { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: 'fake' }), env);
  assert.equal(unauthenticated.status, 401);
  const tampered = await gateway.fetch(new Request(url, { method: 'PUT', headers: { Authorization: 'Bearer ' + env.CV_E2_UPLOAD_TOKEN, 'Content-Type': 'image/webp', 'X-Content-SHA256': '0'.repeat(64) }, body: 'fake' }), env);
  assert.equal(tampered.status, 422);
  const query = await gateway.fetch(new Request(url + '?key=cloudflare-backups/a'), env);
  assert.equal(query.status, 404);
});
