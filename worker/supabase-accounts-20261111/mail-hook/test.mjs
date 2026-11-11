import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';

const source = await readFile(new URL('../build/espacios-mail-patched.mjs', import.meta.url), 'utf8');
const section = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const helpers = section('function isCommuniverseAuthRedirect', '__name(safeSupabaseAuthRedirect');
const copies = section('function supabaseAuthEmailCopy', '__name(supabaseAuthEmailCopy');
const context = { URL, cleanText: value => value, DEFAULT_WORKSPACE_APP_ROOT: 'mail.espacios.me' };
runInNewContext(`${helpers}\n${copies}`, context);
const env = { PUBLIC_ORIGIN: 'https://mail.espacios.me', WORKSPACE_APP_ROOT: 'mail.espacios.me' };
const confirm = 'https://communiverseclubs.com/account/confirm/';
const reset = 'https://communiverseclubs.com/account/reset/';
assert.equal(context.safeSupabaseAuthRedirect(env, confirm, 'signup'), confirm);
assert.equal(context.safeSupabaseAuthRedirect(env, reset, 'recovery'), reset);
assert.equal(context.safeSupabaseAuthRedirect(env, confirm, 'recovery'), 'https://mail.espacios.me/workspace');
assert.equal(context.safeSupabaseAuthRedirect(env, 'https://communiverseclubs.com/account/confirm/evil', 'signup'), 'https://mail.espacios.me/onboarding');
assert.equal(context.safeSupabaseAuthRedirect(env, 'https://mail.espacios.me/workspace', 'signup'), 'https://mail.espacios.me/workspace');
assert.match(context.supabaseAuthEmailCopy('signup', confirm).subject, /Communiverse/);
assert.match(context.supabaseAuthEmailCopy('recovery', reset).subject, /Communiverse/);
assert.match(context.supabaseAuthEmailCopy('signup').subject, /Espacios Mail/);
assert.match(source, /handoff\.hash = new URLSearchParams/);
assert.match(source, /response\.headers\.set\("Referrer-Policy", "no-referrer"\)/);
const sendMail = section('async function sendSupabaseAuthEmail', '__name(sendSupabaseAuthEmail');
assert.equal((sendMail.match(/if \(!skipLog\) await env\.DB\.prepare/g) || []).length, 4);
const resend = section('async function sendCommuniverseResendEmail', 'function renderSupabaseAuthEmail');
const calls = [];
const deliveryContext = {
  crypto: webcrypto,
  TextEncoder,
  AbortSignal,
  fetch: async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ id: 'email_test_id' }), { status: 200 });
  },
};
runInNewContext(resend, deliveryContext);
const input = { action: 'signup', tokenHash: 'private-confirmation-token-hash', email: 'member@example.com' };
const rendered = { subject: 'Confirm your account', html: '<p>Confirm</p>', text: 'Confirm' };
assert.equal(await deliveryContext.sendCommuniverseResendEmail({ CV_RESEND_API_KEY: 'test-key' }, input, rendered), 'email_test_id');
assert.equal(calls[0].url, 'https://api.resend.com/emails');
assert.equal(calls[0].options.headers.authorization, 'Bearer test-key');
assert.ok(calls[0].options.headers['idempotency-key'].startsWith('cv-auth-'));
assert.ok(!calls[0].options.headers['idempotency-key'].includes(input.tokenHash));
assert.deepEqual(JSON.parse(calls[0].options.body).to, ['member@example.com']);
assert.equal(JSON.parse(calls[0].options.body).from, 'Communiverse <accounts@auth.communiverseclubs.com>');
console.log('Mail hook redirect, copy, and Resend delivery checks passed');
