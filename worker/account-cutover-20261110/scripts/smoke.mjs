import assert from 'node:assert/strict';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const options = convertV4MiniflareOptions({
  modules: true,
  scriptPath: resolve(root, 'build/worker.mjs'),
  compatibilityDate: '2026-10-09',
  bindings: {
    CV_ENVIRONMENT: 'development',
    CV_ACCOUNT_CUTOVER_READY: 'true',
    CV_APP_BASE_URL: 'https://communiverseclubs.com/account/',
    PUBLIC_DOMAIN_REDIRECTS: 'off',
  },
  d1Databases: { COMMUNIVERSE_DB: 'cv-smoke' },
  serviceBindings: {
    MARKETPLACE: () => new Response('<!doctype html><html><head><link rel="canonical" href="https://espacios.me/communiverse/sign-in/"></head><body><main>Account fixture</main></body></html>', { headers: { 'Content-Type': 'text/html' } }),
    SEARCH: () => new Response('Unavailable', { status: 503 }),
    BOOKING: () => new Response('Unavailable', { status: 503 }),
    LEGACY_MEDIA: () => new Response('Not found', { status: 404 }),
  },
  assets: {
    directory: process.env.CV_ASSETS_DIR || resolve(root, '../../../live-worker/assets'),
    binding: 'ASSETS',
    routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: true },
    assetConfig: { html_handling: 'none', not_found_handling: 'none' },
  },
});

const mf = new Miniflare(options);
try {
  await mf.ready;
  const base = 'https://communiverseclubs.com';
  const home = await mf.dispatchFetch(base + '/');
  const homeHTML = await home.text();
  assert.equal(home.status, 200);
  assert.doesNotMatch(homeHTML, /data-cv-account-paused/);

  for (const path of ['/account/sign-in/', '/account/join/', '/account/workspace/']) {
    const response = await mf.dispatchFetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /Account fixture/, path);
  }
  const legacy = await mf.dispatchFetch(base + '/communiverse/workspace/', { redirect: 'manual' });
  assert.equal(legacy.status, 307);
  assert.equal(legacy.headers.get('Location'), base + '/account/workspace/');

  const session = await mf.dispatchFetch(base + '/communiverse/api/account/session');
  assert.equal(session.status, 401);
  assert.equal((await session.json()).signInUrl, base + '/account/sign-in/');

  for (const path of ['/account/auth/google', '/account/auth/linkedin']) {
    const response = await mf.dispatchFetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /Account fixture/, path);
  }
  console.log('Local account route smoke passed.');
} finally {
  await mf.dispose();
}
