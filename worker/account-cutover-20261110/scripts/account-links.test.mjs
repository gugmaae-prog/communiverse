import test from 'node:test';
import assert from 'node:assert/strict';
import { brandedAccountURL, legacyAccountRedirect, brandedAccountResponse, socialAccountRoute } from '../account-links.mjs';
const ready = { CV_ACCOUNT_CUTOVER_READY: 'true', CV_APP_BASE_URL: 'https://communiverseclubs.com/account/' };

test('keeps branded account navigation on Communiverse', () => {
  const page = 'https://communiverseclubs.com/account/sign-in/';
  assert.equal(brandedAccountURL('https://espacios.me/communiverse/sign-in/', page), '/account/sign-in/');
  assert.equal(brandedAccountURL('/communiverse/join/?intent=artist', page), '/account/join/?intent=artist');
  assert.equal(brandedAccountURL('/communiverse/auth/google', page), '/account/auth/google');
  assert.equal(brandedAccountURL('https://communiverseclubs.com/communiverse/workspace/', page), '/account/workspace/');
  assert.equal(brandedAccountURL('/account/profile/', page), '/account/profile/');
});

test('leaves public, external, and API links intact', () => {
  const page = 'https://communiverseclubs.com/circles/';
  for (const value of ['/circles/', '/communiverse/api/account/login', 'https://www.instagram.com/', '#main', 'mailto:hello@communiverseclubs.com']) {
    assert.equal(brandedAccountURL(value, page), value);
  }
});

test('moves only legacy account navigation to the branded route', () => {
  const request = new Request('https://communiverseclubs.com/communiverse/workspace/?tab=profile');
  const response = legacyAccountRedirect(request, ready);
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('Location'), 'https://communiverseclubs.com/account/workspace/?tab=profile');
  assert.equal(legacyAccountRedirect(request, { ...ready, CV_ACCOUNT_CUTOVER_READY: 'false' }), null);
  assert.equal(legacyAccountRedirect(new Request('https://communiverseclubs.com/communiverse/auth/migration/start'), ready), null);
  assert.equal(legacyAccountRedirect(new Request('https://communiverseclubs.com/communiverse/api/account/login'), ready), null);
});

test('rewrites account API destinations without changing other JSON', async () => {
  const response = new Response(JSON.stringify({ error: 'Sign in to continue.', signInUrl: 'https://espacios.me/communiverse/sign-in/', circleUrl: 'https://communiverseclubs.com/circles/' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const result = await brandedAccountResponse(response, new Request('https://communiverseclubs.com/communiverse/api/account/session'), ready);
  assert.equal(result.status, 401);
  assert.deepEqual(await result.json(), { error: 'Sign in to continue.', signInUrl: 'https://communiverseclubs.com/account/sign-in/', circleUrl: 'https://communiverseclubs.com/circles/' });
});

test('keeps social callback and cookies on the branded host', async () => {
  let called;
  const env = { ...ready, MARKETPLACE: { fetch: async request => {
    called = request.url;
    return new Response(null, { status: 303, headers: { Location: '/communiverse/profile/', 'Set-Cookie': '__Host-cv-account=sample; Path=/; Secure; HttpOnly' } });
  } } };
  const result = await socialAccountRoute(new Request('https://communiverseclubs.com/account/auth/callback/?state=example'), env);
  assert.equal(called, 'https://communiverseclubs.com/communiverse/auth/callback/?state=example');
  assert.equal(result.headers.get('Location'), 'https://communiverseclubs.com/account/profile/');
  assert.equal(result.headers.get('Set-Cookie'), '__Host-cv-account=sample; Path=/; Secure; HttpOnly');
});
