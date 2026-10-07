import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const release = '20261007-shared-plug-ui-1';
const origin = 'https://espacios.me';
const sha = b => createHash('sha256').update(b).digest('hex');
const rows = [];
async function check(label, action) {
  try { const details = await action(); rows.push({ label, passed: true, ...details }); console.log('PASS', label); }
  catch (error) { rows.push({ label, passed: false, error: String(error.message || error) }); console.error('FAIL', label, String(error.message || error)); }
}
async function request(path, options = {}) {
  const response = await fetch(origin + path, { redirect: 'follow', signal: AbortSignal.timeout(30000), ...options });
  return response;
}
for (const ext of ['js', 'css']) await check('exact deployed ' + ext + ' matches GitHub', async () => {
  const source = 'worker/releases/shared-plug-ui-20261007/shared-plug-ui-20261007.' + (ext === 'js' ? 'txt' : 'css');
  const local = await readFile(source), path = '/communiverse/_public/' + release + '.' + ext;
  const r = await request(path), remote = Buffer.from(await r.arrayBuffer());
  assert.equal(r.status, 200); assert.equal(r.headers.get('x-communiverse-release'), release);
  assert.match(r.headers.get('cache-control') || '', /immutable/);
  assert.equal(sha(remote), sha(local));
  if (ext === 'js') { const result = spawnSync(process.execPath, ['--check'], { input: local }); assert.equal(result.status, 0, 'Client JS syntax'); }
  return { path, bytes: remote.length, sha256: sha(remote) };
});
for (const p of ['', 'about/', 'how-it-works/', 'makers/', 'for-founders/', 'for-brands/', 'for-startups/', 'contact/', 'ambassadors/', 'plug/', 'plug/person/haseeb-wasim/']) {
  const path = '/communiverse/' + p;
  await check(path, async () => { const r = await request(path), html = await r.text(); assert.equal(r.status, 200); assert.equal(r.headers.get('x-communiverse-release'), release); assert.ok(html.includes('data-cv-design="' + release + '"')); assert.ok(html.includes('/_public/' + release + '.css')); assert.ok(html.includes('/_public/' + release + '.js')); assert.equal(r.headers.get('x-content-type-options'), 'nosniff'); return { status: r.status, release: r.headers.get('x-communiverse-release') }; });
}
for (const p of ['internal/', 'ral/', 'api/admin/']) await check('private route ' + p, async () => { const r = await request('/communiverse/' + p); await r.arrayBuffer(); assert.equal(r.status, 404); return { status: r.status }; });
for (const suffix of ['.js', '.css']) await check('prior immutable squeeze-4' + suffix, async () => { const r = await request('/communiverse/_public/20260929-cylinder-squeeze-4' + suffix); await r.arrayBuffer(); assert.equal(r.status, 200); return { status: r.status }; });
await check('MP4 byte-range delivery remains intact', async () => { const r = await request('/communiverse/_public/media/loom-weaving.mp4', { headers: { Range: 'bytes=0-15' } }); const bytes = await r.arrayBuffer(); assert.equal(r.status, 206); assert.equal(bytes.byteLength, 16); assert.match(r.headers.get('content-type') || '', /video\/mp4/); assert.equal(r.headers.get('accept-ranges'), 'bytes'); return { status: r.status, contentRange: r.headers.get('content-range') }; });
await writeFile('verification-results.json', JSON.stringify({ checkedAt: new Date().toISOString(), release, mode: 'ordinary-public-requests-no-override', databaseWrites: false, checks: rows }, null, 2) + '\n');
if (rows.some(row => !row.passed)) process.exitCode = 1;
