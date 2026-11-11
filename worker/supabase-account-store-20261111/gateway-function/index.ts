import postgres from 'npm:postgres@3.4.7';
import { createClient } from 'npm:@supabase/supabase-js@2.119.0';

const databaseUrl = Deno.env.get('SUPABASE_DB_URL');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const publishableKey = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default || Deno.env.get('SUPABASE_ANON_KEY');
const gatewaySecret = Deno.env.get('CV_ACCOUNT_GATEWAY_SECRET');
if (!databaseUrl || !supabaseUrl || !serviceKey || !publishableKey || !gatewaySecret) throw Error('Communiverse gateway is not configured');

const sql = postgres(databaseUrl, { max: 2, prepare: false, idle_timeout: 20 });
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const passwordClient = () => createClient(supabaseUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const handlePattern = /^[a-z0-9][a-z0-9._-]{2,39}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+[1-9]\d{7,14}$/;
const internalDomain = 'accounts.communiverse.invalid';
const enc = new TextEncoder();
const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const response = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } });

function equal(a: string, b: string): boolean {
  const left = enc.encode(a), right = enc.encode(b);
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}
async function digest(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value)));
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function attemptKey(scope: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(gatewaySecret!), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(`${scope}:${value}`)));
  return `${scope}:` + [...signature].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function allowed(scope: string, ip: string, limit: number): Promise<boolean> {
  const key = await attemptKey(scope, ip);
  const rows = await sql<{ attempts: number }[]>`
    insert into communiverse.cv_auth_attempts(attempt_key,attempts,reset_at)
    values (${key},1,now()+interval '15 minutes')
    on conflict (attempt_key) do update set
      attempts=case when communiverse.cv_auth_attempts.reset_at<=now() then 1 else communiverse.cv_auth_attempts.attempts+1 end,
      reset_at=case when communiverse.cv_auth_attempts.reset_at<=now() then now()+interval '15 minutes' else communiverse.cv_auth_attempts.reset_at end
    returning attempts`;
  return rows[0].attempts <= limit;
}
async function reserved(tx: any, username: string): Promise<boolean> {
  const matches = await tx`
    select 1 from communiverse.cv_accounts where lower(username)=${username}
    union select 1 from communiverse.cv_staff where lower(username)=${username}
    union select 1 from communiverse.cv_auth_profiles where lower(username)=${username}
    limit 1`;
  return matches.length > 0;
}
async function signup(body: Record<string, unknown>) {
  const username = clean(body.username, 40).toLowerCase();
  const firstName = clean(body.first_name, 80);
  const contactEmail = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 24).replace(/[\s()-]/g, '');
  const password = String(body.password ?? '');
  if (!handlePattern.test(username) || !firstName || !emailPattern.test(contactEmail) || !phonePattern.test(phone) || password.length < 12 || password.length > 72 || body.consent !== 'yes') return response({ error: 'Check your name, username, email, phone and password.' }, 400);

  const identity = `cv-${crypto.randomUUID()}@${internalDomain}`;
  const recoveryCode = Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
  const recoveryHash = await digest(recoveryCode);
  let authId: string | undefined;
  try {
    await sql.begin(async tx => {
      await tx`select pg_advisory_xact_lock(hashtext(${username}))`;
      if (await reserved(tx, username)) throw Error('username_taken');
      const created = await admin.auth.admin.createUser({ email: identity, password, email_confirm: true, user_metadata: { communiverse: true } });
      if (created.error || !created.data.user) throw Error('auth_creation_failed');
      authId = created.data.user.id;
      const memberId = crypto.randomUUID();
      await tx`
        insert into communiverse.cv_members
          (id,request_key,email,phone,first_name,city,craft,kind,status,email_verified_at,confirmation_hash,confirmation_expires_at)
        values (${memberId},${`supabase:${authId}`},${identity},${phone},${firstName},'','','member','active',null,'','')`;
      await tx`
        insert into communiverse.cv_auth_profiles(auth_user_id,member_id,username,login_kind,contact_email,recovery_code_hash,auth_email)
        values (${authId}::uuid,${memberId},${username},'username',${contactEmail},${recoveryHash},${identity})`;
    });
  } catch (cause) {
    if (authId) await admin.auth.admin.deleteUser(authId).catch(() => {});
    const code = (cause as { code?: string })?.code || (cause instanceof Error ? cause.message : '');
    if (code === 'username_taken' || code === '23505') return response({ error: 'That username is unavailable.' }, 409);
    console.error('Communiverse signup failed', code === 'auth_creation_failed' ? code : 'storage');
    return response({ error: 'Signup is temporarily unavailable.' }, 503);
  }
  const signed = await passwordClient().auth.signInWithPassword({ email: identity, password });
  if (signed.error || !signed.data.session) return response({ error: 'Account created. Please sign in with your username and password.' }, 503);
  return response({ session: signed.data.session, recovery_code: recoveryCode });
}

async function legacyIdentity(username: string, password: string): Promise<{ identity: string; recovery_code?: string } | null> {
  let createdId: string | undefined;
  try {
    return await sql.begin(async tx => {
      await tx`select pg_advisory_xact_lock(hashtext(${username}))`;
      const linked = await tx<{ email: string }[]>`
        select coalesce(p.auth_email,m.email) as email from communiverse.cv_auth_profiles p
        join communiverse.cv_members m on m.id=p.member_id where lower(p.username)=${username} limit 1`;
      if (linked[0]) return { identity: linked[0].email };
      const legacy = await tx<{ member_id: string; salt: string; password_hash: string; iterations: number; email: string }[]>`
        select a.member_id,a.salt,a.password_hash,a.iterations,m.email
        from communiverse.cv_accounts a join communiverse.cv_members m on m.id=a.member_id
        where lower(a.username)=${username} and m.status in ('active','hidden') limit 1`;
      const account = legacy[0];
      if (!account || account.iterations < 100000 || account.iterations > 500000 || !/^[a-f0-9]{64}$/i.test(account.password_hash)) return null;
      const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(account.salt), iterations: account.iterations }, key, 256));
      const hash = [...bits].map(b => b.toString(16).padStart(2, '0')).join('');
      if (!equal(hash, account.password_hash.toLowerCase())) return null;
      const identity = `cv-${crypto.randomUUID()}@${internalDomain}`;
      const recoveryCode = Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
      const created = await admin.auth.admin.createUser({ email: identity, password, email_confirm: true, user_metadata: { communiverse: true } });
      if (created.error || !created.data.user) throw Error('auth_creation_failed');
      createdId = created.data.user.id;
      await tx`
        insert into communiverse.cv_auth_profiles(auth_user_id,member_id,username,login_kind,contact_email,recovery_code_hash,auth_email)
        values (${createdId}::uuid,${account.member_id},${username},'username',${account.email},${await digest(recoveryCode)},${identity})`;
      return { identity, recovery_code: recoveryCode };
    });
  } catch (cause) {
    if (createdId) await admin.auth.admin.deleteUser(createdId).catch(() => {});
    console.error('Communiverse legacy login migration failed', (cause as { code?: string })?.code || 'unknown');
    throw cause;
  }
}

async function login(body: Record<string, unknown>) {
  const usernameOrEmail = clean(body.username, 254).toLowerCase();
  const password = String(body.password ?? '');
  if (!usernameOrEmail || !password || password.length > 200) return response({ error: 'Check your username and password.' }, 401);
  let identity = usernameOrEmail;
  let recoveryCode: string | undefined;
  if (!usernameOrEmail.includes('@')) {
    const rows = await sql<{ email: string }[]>`
      select coalesce(p.auth_email,m.email) as email from communiverse.cv_auth_profiles p
      join communiverse.cv_members m on m.id=p.member_id
      where lower(p.username)=${usernameOrEmail} and p.login_kind='username' limit 1`;
    if (rows[0]) identity = rows[0].email;
    else {
      const migrated = await legacyIdentity(usernameOrEmail, password);
      identity = migrated?.identity || `cv-missing@${internalDomain}`;
      recoveryCode = migrated?.recovery_code;
    }
  }
  const signed = await passwordClient().auth.signInWithPassword({ email: identity, password });
  if (signed.error || !signed.data.session) return response({ error: 'Check your username and password.' }, 401);
  return response({ session: signed.data.session, ...(recoveryCode ? { recovery_code: recoveryCode } : {}) });
}

async function recover(body: Record<string, unknown>) {
  const username = clean(body.username, 40).toLowerCase();
  const code = clean(body.recovery_code, 80).toLowerCase();
  const password = String(body.password ?? '');
  if (!handlePattern.test(username) || !/^[a-f0-9]{48}$/.test(code) || password.length < 12 || password.length > 72) return response({ error: 'Check the username, recovery code and new password.' }, 400);
  try {
    const session = await sql.begin(async tx => {
      const rows = await tx<{ auth_user_id: string; email: string; recovery_code_hash: string }[]>`
        select p.auth_user_id,coalesce(p.auth_email,m.email) as email,p.recovery_code_hash from communiverse.cv_auth_profiles p
        join communiverse.cv_members m on m.id=p.member_id
        where lower(p.username)=${username} and p.login_kind='username' for update of p`;
      const item = rows[0];
      const inputHash = await digest(code);
      if (!item?.recovery_code_hash || !equal(inputHash, item.recovery_code_hash)) throw Error('invalid_code');
      const updated = await admin.auth.admin.updateUserById(item.auth_user_id, { password });
      if (updated.error) throw Error('auth_update_failed');
      await tx`update communiverse.cv_auth_profiles set recovery_code_hash=null,updated_at=now() where auth_user_id=${item.auth_user_id}::uuid`;
      const signed = await passwordClient().auth.signInWithPassword({ email: item.email, password });
      if (signed.error || !signed.data.session) throw Error('sign_in_failed');
      return signed.data.session;
    });
    return response({ session });
  } catch (cause) {
    const code = cause instanceof Error ? cause.message : '';
    if (code === 'invalid_code') return response({ error: 'That recovery code is invalid or has already been used.' }, 401);
    console.error('Communiverse recovery failed', code === 'auth_update_failed' ? code : 'storage');
    return response({ error: 'Recovery is temporarily unavailable.' }, 503);
  }
}

async function rotate(body: Record<string, unknown>) {
  const access = clean(body.access_token, 8192);
  const password = String(body.password ?? '');
  if (!access || !password) return response({ error: 'Sign in to continue.' }, 401);
  const client = passwordClient();
  const current = await client.auth.getUser(access);
  const identity = current.data.user?.email || '';
  if (current.error || !current.data.user || !identity.endsWith(`@${internalDomain}`)) return response({ error: 'Sign in to continue.' }, 401);
  const verified = await passwordClient().auth.signInWithPassword({ email: identity, password });
  if (verified.error || !verified.data.session) return response({ error: 'Check your current password.' }, 401);
  const code = Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
  const hash = await digest(code);
  const updated = await sql`
    update communiverse.cv_auth_profiles set recovery_code_hash=${hash},updated_at=now()
    where auth_user_id=${current.data.user.id}::uuid and login_kind='username' returning auth_user_id`;
  if (!updated.length) return response({ error: 'Your profile is temporarily unavailable.' }, 503);
  return response({ recovery_code: code });
}

Deno.serve(async request => {
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
  const supplied = request.headers.get('x-cv-gateway-secret') || '';
  if (!equal(supplied, gatewaySecret!)) return response({ error: 'Forbidden' }, 403);
  if (Number(request.headers.get('content-length') || 0) > 8192) return response({ error: 'Request too large' }, 413);
  let body: Record<string, unknown>;
  try { body = await request.json(); if (!body || typeof body !== 'object' || JSON.stringify(body).length > 8192) throw Error(); }
  catch { return response({ error: 'Invalid request' }, 400); }
  const action = clean(body.action, 20);
  if (!['signup', 'login', 'recover', 'rotate'].includes(action)) return response({ error: 'Not found' }, 404);
  const ip = clean(request.headers.get('x-cv-client-ip'), 100) || 'unknown';
  try {
    if (!await allowed(action, ip, action === 'signup' ? 6 : action === 'login' ? 25 : 8)) return response({ error: 'Please try again later.' }, 429);
    if (action === 'signup') return signup(body);
    if (action === 'login') return login(body);
    if (action === 'recover') return recover(body);
    return rotate(body);
  } catch (cause) {
    console.error('Communiverse gateway failed', (cause as { code?: string })?.code || 'unknown');
    return response({ error: 'Accounts are temporarily unavailable.' }, 503);
  }
});
