// Private Communiverse account service. The version URL is never an account API without CV_AUTH_TOKEN.
const HOST = 's3.us-west-2.idrivee2.com';
const REGION = 'us-east-1';
const BUCKET = 'espacios-store-f';
const PREFIX = 'communiverse-private/20261115/';
const te = new TextEncoder();
const td = new TextDecoder();
const HEX = /^[a-f0-9]+$/;
const HANDLE = /^[a-z0-9][a-z0-9._-]{2,39}$/;
const PHONE = /^\+[1-9]\d{7,14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
const bytes = value => new Uint8Array(value.match(/../g).map(pair => parseInt(pair, 16)));
const random = count => hex(crypto.getRandomValues(new Uint8Array(count)));
const sha = async value => hex(await crypto.subtle.digest('SHA-256', typeof value === 'string' ? te.encode(value) : value));
const error = (code, status = 400) => Object.assign(new Error(code), { status });
const reply = (value, status = 200) => Response.json(value, { status, headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' } });
const clean = (value, max) => String(value ?? '').trim().slice(0, max);
const nameOf = value => clean(value, 40).toLowerCase();
const constantEqual = (a, b) => { a = String(a); b = String(b); let diff = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return diff === 0; };
const requireEnv = env => { if (!env.E2F_KEY || !env.E2F_SECRET || !/^[a-f0-9]{64}$/.test(env.CV_AUTH_ROOT || '') || !env.CV_AUTH_TOKEN || env.CV_AUTH_TOKEN.length < 48) throw error('unconfigured', 503); };
const pathEncode = value => encodeURIComponent(value).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

async function hmac(key, message) {
  const imported = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', imported, te.encode(message)));
}
async function index(env, scope, value) { return hex(await hmac(bytes(env.CV_AUTH_ROOT), `${scope}:${value}`)); }
async function aesKey(env) {
  const material = await crypto.subtle.digest('SHA-256', te.encode(`communiverse-v1-aes:${env.CV_AUTH_ROOT}`));
  return crypto.subtle.importKey('raw', material, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
async function seal(env, key, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode(key) }, await aesKey(env), te.encode(JSON.stringify(data)));
  return { v: 1, iv: hex(iv), data: hex(ciphertext) };
}
async function open(env, key, value) {
  if (value?.v !== 1 || !/^[a-f0-9]{24}$/.test(value.iv || '') || !HEX.test(value.data || '')) throw error('corrupt_record', 503);
  try { return JSON.parse(td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(value.iv), additionalData: te.encode(key) }, await aesKey(env), bytes(value.data)))); }
  catch { throw error('corrupt_record', 503); }
}
async function signedFetch(env, method, key, payload, etag) {
  if (!/^(accounts|sessions|limits)\/[a-z0-9/_-]+\.json$/.test(key) || key.includes('//') || key.includes('..')) throw error('invalid_key');
  const path = '/' + BUCKET + '/' + (PREFIX + key).split('/').map(pathEncode).join('/');
  const stamp = new Date().toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const day = stamp.slice(0, 8);
  const scope = `${day}/${REGION}/s3/aws4_request`;
  const bodyHash = payload === undefined ? EMPTY_HASH : await sha(payload);
  const headers = { host: HOST, 'x-amz-content-sha256': bodyHash, 'x-amz-date': stamp };
  if (method === 'PUT') {
    headers['content-type'] = 'application/json';
    headers[etag ? 'if-match' : 'if-none-match'] = etag || '*';
  }
  const names = Object.keys(headers).sort();
  const canonical = `${method}\n${path}\n\n${names.map(n => `${n}:${headers[n]}\n`).join('')}\n${names.join(';')}\n${bodyHash}`;
  let signing = await hmac(te.encode('AWS4' + env.E2F_SECRET), day);
  for (const part of [REGION, 's3', 'aws4_request']) signing = await hmac(signing, part);
  const signature = hex(await hmac(signing, `AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${await sha(canonical)}`));
  delete headers.host;
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${env.E2F_KEY}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`;
  if (method === 'GET') headers['accept-encoding'] = 'identity';
  return fetch(`https://${HOST}${path}`, { method, headers, body: payload, redirect: 'manual', signal: AbortSignal.timeout(15000) });
}
async function get(env, key) {
  const r = await signedFetch(env, 'GET', key);
  if (r.status === 404) { await r.body?.cancel(); return { value: null, etag: null }; }
  if (r.status !== 200 || r.headers.get('content-encoding')) { await r.body?.cancel(); throw error('storage_unavailable', 503); }
  const text = await r.text();
  if (text.length > 65536 || !r.headers.get('etag')) throw error('storage_unavailable', 503);
  try { return { value: JSON.parse(text), etag: r.headers.get('etag') }; }
  catch { throw error('corrupt_record', 503); }
}
async function put(env, key, value, etag = null) {
  const r = await signedFetch(env, 'PUT', key, te.encode(JSON.stringify(value)), etag);
  await r.body?.cancel();
  if (r.status === 409 || r.status === 412) throw error('conflict', 409);
  if (![200, 201].includes(r.status)) throw error('storage_unavailable', 503);
  if (!r.headers.get('etag')) throw error('storage_unavailable', 503);
  return r.headers.get('etag');
}
async function record(env, key) {
  const row = await get(env, key);
  return { value: row.value ? await open(env, key, row.value) : null, etag: row.etag };
}
async function writeRecord(env, key, value, etag = null) { return put(env, key, await seal(env, key, value), etag); }
async function derive(env, password, salt, algorithm = 'pbkdf2-chain-6x100000') {
  let material = algorithm === 'legacy-pbkdf2' ? te.encode(password) : await hmac(bytes(env.CV_AUTH_ROOT), `password:${password}`);
  const rounds = algorithm === 'legacy-pbkdf2' ? 1 : 6;
  for (let round = 0; round < rounds; round++) {
    const key = await crypto.subtle.importKey('raw', material, 'PBKDF2', false, ['deriveBits']);
    const roundSalt = algorithm === 'legacy-pbkdf2' ? te.encode(salt) : te.encode(`${salt}:${round}`);
    material = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: roundSalt, iterations: 100000 }, key, 256));
  }
  return hex(material);
}
async function passwordOK(env, account, password) {
  if (account && !['active', 'hidden'].includes(account.status)) return false;
  const algorithm = account?.password?.algorithm || 'pbkdf2-chain-6x100000';
  const salt = account?.password?.salt || '00'.repeat(24);
  const actual = await derive(env, password, salt, algorithm);
  return !!account?.password?.hash && constantEqual(actual, account.password.hash);
}
async function limit(env, scope, value, maximum) {
  const slot = Math.floor(Date.now() / 900000);
  const key = `limits/${slot}/${await index(env, scope, value)}.json`;
  for (let i = 0; i < 5; i++) {
    const row = await get(env, key);
    const count = (row.value?.count || 0) + 1;
    if (count > maximum) throw error('too_many_attempts', 429);
    try { await put(env, key, { count }, row.etag); return; }
    catch (e) { if (e.status !== 409) throw e; }
  }
  throw error('too_many_attempts', 429);
}
const accountKey = async (env, name) => `accounts/${await index(env, 'username', name)}.json`;
const sessionKey = async (env, token) => `sessions/${await sha(token)}.json`;
async function issueSession(env, account, key) {
  const token = random(32);
  await writeRecord(env, await sessionKey(env, token), { key, epoch: account.epoch || 0, expires: Date.now() + 30 * 86400000, revoked: false });
  return token;
}
async function session(env, token) {
  if (!/^[a-f0-9]{64}$/.test(token || '')) throw error('signed_out', 401);
  const key = await sessionKey(env, token);
  const row = await record(env, key);
  if (!row.value || row.value.revoked || row.value.expires < Date.now()) throw error('signed_out', 401);
  const account = await record(env, row.value.key);
  if (!account.value || (account.value.epoch || 0) !== row.value.epoch) throw error('signed_out', 401);
  return { ...row, key, account: account.value, accountEtag: account.etag, accountKey: row.value.key };
}
function publicProfile(account) {
  return { username: account.username, first_name: account.first_name, contact_email: account.email, phone: account.phone, city: account.city || '', craft: account.craft || '', login_kind: 'username', member_id: account.member_id || null };
}
async function action(env, name, b, ip) {
  const username = nameOf(b.username);
  if (['signup', 'login', 'recover', 'import'].includes(name) && !HANDLE.test(username)) throw error('invalid_username');
  if (['signup', 'login', 'recover'].includes(name)) {
    await limit(env, 'ip', ip || 'unknown', 30);
    await limit(env, 'username', username, 12);
  }
  if (name === 'signup') {
    const first_name = clean(b.first_name, 80), email = clean(b.email, 254).toLowerCase();
    const phone = clean(b.phone, 24).replace(/[\s()-]/g, '');
    const password = String(b.password || '');
    if (!first_name || !EMAIL.test(email) || !PHONE.test(phone) || password.length < 12 || password.length > 72 || b.consent !== 'yes') throw error('invalid_signup');
    const key = await accountKey(env, username);
    if ((await get(env, key)).value) throw error('username_unavailable', 409);
    const recovery_code = random(24);
    const salt = random(24);
    const account = { v: 1, username, member_id: crypto.randomUUID(), first_name, email, phone, city: '', craft: '', status: 'active', epoch: 0, created_at: new Date().toISOString(), password: { algorithm: 'pbkdf2-chain-6x100000', salt, hash: await derive(env, password, salt) }, recovery_hash: await sha(recovery_code) };
    await writeRecord(env, key, account);
    const token = await issueSession(env, account, key);
    return { token, recovery_code };
  }
  if (name === 'import') {
    const key = await accountKey(env, username);
    const p = b.password || {};
    if (!/^[a-f0-9]{64}$/i.test(p.hash || '') || !Number.isInteger(p.iterations) || p.iterations !== 100000 || !p.salt || !(b.member_id || b.staff_id)) throw error('invalid_import');
    const account = { v: 1, username, member_id: b.member_id || null, staff_id: b.staff_id || null, first_name: clean(b.first_name, 80), email: clean(b.email, 254).toLowerCase(), phone: clean(b.phone, 24), city: clean(b.city, 100), craft: clean(b.craft, 160), status: b.status, epoch: 0, created_at: b.created_at, password: { algorithm: 'legacy-pbkdf2', salt: p.salt, hash: p.hash.toLowerCase() }, recovery_hash: null, needs_recovery: true };
    try { await writeRecord(env, key, account); return { imported: true, member_id: b.member_id || null, staff_id: b.staff_id || null }; }
    catch (e) { if (e.status !== 409) throw e; const existing = await record(env, key); if (existing.value?.member_id === (b.member_id || null) && existing.value?.staff_id === (b.staff_id || null) && existing.value?.username === username) return { imported: false }; throw e; }
  }
  if (name === 'login') {
    const password = String(b.password || '');
    if (!password || password.length > 200) throw error('invalid_credentials', 401);
    const key = await accountKey(env, username);
    const row = await record(env, key);
    if (!(await passwordOK(env, row.value, password))) throw error('invalid_credentials', 401);
    let account = row.value;
    let recovery_code;
    if (account.password.algorithm === 'legacy-pbkdf2' || account.needs_recovery) {
      const salt = random(24);
      recovery_code = random(24);
      account = { ...account, password: { algorithm: 'pbkdf2-chain-6x100000', salt, hash: await derive(env, password, salt) }, recovery_hash: await sha(recovery_code), needs_recovery: false };
      await writeRecord(env, key, account, row.etag);
    }
    return { token: await issueSession(env, account, key), ...(recovery_code ? { recovery_code } : {}) };
  }
  if (name === 'recover') {
    const code = clean(b.recovery_code, 80).toLowerCase(), password = String(b.password || '');
    if (!/^[a-f0-9]{48}$/.test(code) || password.length < 12 || password.length > 72) throw error('invalid_recovery');
    const key = await accountKey(env, username), row = await record(env, key);
    const hash = await sha(code);
    if (!row.value?.recovery_hash || !constantEqual(row.value.recovery_hash, hash)) throw error('invalid_recovery', 401);
    const salt = random(24);
    const recovery_code = random(24);
    const account = { ...row.value, password: { algorithm: 'pbkdf2-chain-6x100000', salt, hash: await derive(env, password, salt) }, recovery_hash: await sha(recovery_code), epoch: (row.value.epoch || 0) + 1 };
    await writeRecord(env, key, account, row.etag);
    return { token: await issueSession(env, account, key), recovery_code };
  }
  const current = await session(env, String(b.token || ''));
  if (name === 'session') return { profile: publicProfile(current.account) };
  if (name === 'logout') { await writeRecord(env, current.key, { ...current.value, revoked: true }, current.etag); return { signed_out: true }; }
  if (name === 'profile') {
    const account = { ...current.account, first_name: clean(b.first_name, 80), email: clean(b.email, 254).toLowerCase(), phone: clean(b.phone, 24).replace(/[\s()-]/g, ''), city: clean(b.city, 100), craft: clean(b.craft, 160) };
    if (!account.first_name || !EMAIL.test(account.email) || !PHONE.test(account.phone)) throw error('invalid_profile');
    await writeRecord(env, current.accountKey, account, current.accountEtag);
    return { profile: publicProfile(account) };
  }
  if (name === 'rotate') {
    if (!(await passwordOK(env, current.account, String(b.password || '')))) throw error('invalid_credentials', 401);
    const recovery_code = random(24);
    await writeRecord(env, current.accountKey, { ...current.account, recovery_hash: await sha(recovery_code) }, current.accountEtag);
    return { recovery_code };
  }
  throw error('not_found', 404);
}
export default {
  async fetch(request, env) {
    try {
      requireEnv(env);
      const supplied = request.headers.get('authorization') || '';
      if (!constantEqual(supplied, `Bearer ${env.CV_AUTH_TOKEN}`)) return reply({ error: 'unauthorized' }, 401);
      const url = new URL(request.url);
      if (url.search || !url.pathname.startsWith('/cv-auth/')) return reply({ error: 'not_found' }, 404);
      if (url.pathname === '/cv-auth/health' && request.method === 'GET') {
        const probe = await get(env, 'limits/health/probe.json');
        return reply({ ok: true, storage: 'idrive-e2', readable: probe.value === null || !!probe.value });
      }
      if (request.method !== 'POST') return reply({ error: 'method_not_allowed' }, 405);
      if (Number(request.headers.get('content-length') || 0) > 8192) return reply({ error: 'too_large' }, 413);
      const body = await request.text();
      if (body.length > 8192) return reply({ error: 'too_large' }, 413);
      const data = JSON.parse(body);
      const result = await action(env, url.pathname.slice('/cv-auth/'.length), data, request.headers.get('x-cv-client-ip'));
      return reply(result);
    } catch (cause) {
      const status = cause?.status || 503;
      if (status === 503) console.error('Communiverse private account service unavailable', cause?.message || 'unknown');
      return reply({ error: cause?.message || 'storage_unavailable' }, status);
    }
  },
};
