import postgres from 'npm:postgres@3.4.7';
import { createClient } from 'npm:@supabase/supabase-js@2.119.0';

const databaseUrl = Deno.env.get('SUPABASE_DB_URL');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const keys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}');
const publishableKey = keys.default || Deno.env.get('SUPABASE_ANON_KEY');
if (!databaseUrl || !supabaseUrl || !publishableKey) throw Error('Communiverse Auth is not configured');

const sql = postgres(databaseUrl, { max: 1, prepare: false, idle_timeout: 20 });
const supabase = createClient(supabaseUrl, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
const handlePattern = /^[a-z0-9][a-z0-9._-]{2,39}$/;
const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const reply = (body: object, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, no-store' },
});

type User = { id: string; email?: string; email_confirmed_at?: string; user_metadata?: Record<string, unknown> };
type Profile = { username: string; id: string; first_name: string; city: string; craft: string; kind: string; phone: string; contact_email: string; login_kind: string };

async function ensureProfile(user: User, requested?: string): Promise<Profile> {
  const email = clean(user.email, 254).toLowerCase();
  if (!email || !user.email_confirmed_at) throw new Error('email_unverified');
  return await sql.begin(async tx => {
    const existing = await tx<Profile[]>`
      select p.username,m.id,m.first_name,m.city,m.craft,m.kind,m.phone,
        coalesce(p.contact_email,m.email) as contact_email,p.login_kind
      from communiverse.cv_auth_profiles p
      join communiverse.cv_members m on m.id=p.member_id
      where p.auth_user_id=${user.id}::uuid for update of p,m`;
    if (existing[0]) return existing[0];
    // A synthetic Auth identity must never claim a legacy member by email.
    if (email.endsWith('@accounts.communiverse.invalid')) throw new Error('incomplete_profile');
    await tx`select pg_advisory_xact_lock(hashtext(${email}))`;

    let members = await tx<{ id: string; first_name: string; city: string; craft: string; kind: string; phone: string }[]>`
      select id,first_name,city,craft,kind,phone from communiverse.cv_members
      where lower(email)=${email} for update`;
    const legacy = members[0]
      ? await tx<{ username: string }[]>`
          select username from communiverse.cv_accounts where member_id=${members[0].id} limit 1`
      : [];
    const suggested = clean(requested || legacy[0]?.username || user.user_metadata?.username, 40).toLowerCase();
    if (!handlePattern.test(suggested)) throw new Error('username_required');
    if (!legacy[0] || legacy[0].username.toLowerCase() !== suggested) {
      const reserved = await tx`
        select 1 from communiverse.cv_accounts where lower(username)=${suggested}
        union select 1 from communiverse.cv_staff where lower(username)=${suggested}
        union select 1 from communiverse.cv_auth_profiles where lower(username)=${suggested}
        limit 1`;
      if (reserved.length) throw new Error('username_taken');
    }
    if (!members[0]) {
      const memberId = crypto.randomUUID();
      const firstName = clean(user.user_metadata?.first_name, 80) || suggested;
      // Public metadata is editable by the account owner; artist status is curated.
      const kind = 'member';
      members = await tx<{ id: string; first_name: string; city: string; craft: string; kind: string; phone: string }[]>`
        insert into communiverse.cv_members
          (id,request_key,email,phone,first_name,city,craft,kind,status,email_verified_at,confirmation_hash,confirmation_expires_at)
        values (${memberId},${`supabase:${user.id}`},${email},'',${firstName},'','',${kind},'active',${new Date().toISOString()},'','')
        returning id,first_name,city,craft,kind,phone`;
    }
    await tx`
      insert into communiverse.cv_auth_profiles(auth_user_id,member_id,username)
      values (${user.id}::uuid,${members[0].id},${suggested})`;
    return { username: suggested, contact_email: email, login_kind: 'email', ...members[0] };
  });
}

Deno.serve(async request => {
  if (!['GET', 'POST', 'PATCH'].includes(request.method)) return reply({ error: 'Method not allowed' }, 405);
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return reply({ error: 'Sign in to continue' }, 401);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return reply({ error: 'Sign in to continue' }, 401);
  const user = data.user as User;
  if (!user.email_confirmed_at) return reply({ error: 'Confirm your email first' }, 403);
  let body: Record<string, unknown> = {};
  if (request.method !== 'GET') {
    try { body = await request.json(); } catch { return reply({ error: 'Invalid request' }, 400); }
    if (JSON.stringify(body).length > 2000) return reply({ error: 'Request too large' }, 413);
  }
  try {
    const profile = await ensureProfile(user, request.method === 'POST' ? clean(body.username, 40) : undefined);
    if (request.method === 'PATCH') {
      const firstName = clean(body.first_name, 80);
      const city = clean(body.city, 100);
      const craft = clean(body.craft, 160);
      if (!firstName) return reply({ error: 'A name is required' }, 400);
      const contactEmail = clean(body.email, 254).toLowerCase();
      const phone = clean(body.phone, 24).replace(/[\s()-]/g, '');
      if (profile.login_kind === 'username' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) || !/^\+[1-9]\d{7,14}$/.test(phone))) return reply({ error: 'Enter a valid email and phone with country code' }, 400);
      const updated = await sql.begin(async tx => {
        const member = await tx<Profile[]>`
          update communiverse.cv_members
          set first_name=${firstName},city=${city},craft=${craft},phone=${profile.login_kind === 'username' ? phone : profile.phone}
          where id=${profile.id}
          returning id,first_name,city,craft,kind,phone`;
        if (profile.login_kind === 'username') await tx`
          update communiverse.cv_auth_profiles set contact_email=${contactEmail},updated_at=now()
          where auth_user_id=${user.id}::uuid`;
        return { username: profile.username, login_kind: profile.login_kind, contact_email: profile.login_kind === 'username' ? contactEmail : profile.contact_email, ...member[0] };
      });
      return reply({ profile: updated });
    }
    return reply({ profile });
  } catch (cause) {
    const code = (cause as { code?: string })?.code || (cause instanceof Error ? cause.message : '');
    if (code === 'email_unverified') return reply({ error: 'Confirm your email first' }, 403);
    if (code === 'username_required') return reply({ error: 'Choose a username', code }, 409);
    if (code === 'username_taken' || code === '23505') return reply({ error: 'That username is taken', code: 'username_taken' }, 409);
    if (code === 'incomplete_profile') return reply({ error: 'Your account needs repair before it can be used' }, 503);
    console.error('Communiverse profile operation failed', (cause as { code?: string })?.code || 'unknown');
    return reply({ error: 'Your profile is temporarily unavailable' }, 503);
  }
});
