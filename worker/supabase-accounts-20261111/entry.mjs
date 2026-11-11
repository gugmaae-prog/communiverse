import { createClient } from '@supabase/supabase-js';
import application, { RegistrationDelivery, isPublicExperience } from '../idrive-media-20261111/entry.mjs';

export { RegistrationDelivery, isPublicExperience };

const HOSTS = new Set(['communiverseclubs.com', 'www.communiverseclubs.com']);
const CONFIRM_URL = 'https://communiverseclubs.com/account/confirm/';
const RESET_URL = 'https://communiverseclubs.com/account/reset/';
const HANDLE = /^[a-z0-9][a-z0-9._-]{2,39}$/;
const htmlEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const cookieValue = (request, name) => request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1] || '';
const cookie = (name, value, age) => `${name}=${encodeURIComponent(value)}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;
const authCookies = session => [cookie('__Host-cv-sb-access', session.access_token, Math.max(60, session.expires_in || 3600)), cookie('__Host-cv-sb-refresh', session.refresh_token, 90 * 86400)];
const clearCookies = () => [cookie('__Host-cv-sb-access', '', 0), cookie('__Host-cv-sb-refresh', '', 0)];
const json = (data, status = 200, cookies = []) => {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' });
  for (const value of cookies) headers.append('set-cookie', value);
  return new Response(JSON.stringify(data), { status, headers });
};
const redirect = (path, cookies = []) => {
  const headers = new Headers({ location: path, 'cache-control': 'no-store' });
  for (const value of cookies) headers.append('set-cookie', value);
  return new Response(null, { status: 303, headers });
};
const auth = env => createClient(env.SUPABASE_URL, env.SUPABASE_PUBLIC_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const sameOrigin = request => {
  const origin = request.headers.get('origin');
  return origin === new URL(request.url).origin;
};
const readBody = async request => {
  if (Number(request.headers.get('content-length') || 0) > 8192) throw Error('too_large');
  const body = await request.json();
  if (!body || typeof body !== 'object' || JSON.stringify(body).length > 8192) throw Error('invalid_body');
  return body;
};
const clean = (value, max) => String(value ?? '').trim().slice(0, max);
const email = value => clean(value, 254).toLowerCase();
const nextPath = value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/account/';

async function currentSession(request, env) {
  const client = auth(env);
  let access = decodeURIComponent(cookieValue(request, '__Host-cv-sb-access'));
  let refresh = decodeURIComponent(cookieValue(request, '__Host-cv-sb-refresh'));
  if (access) {
    const { data } = await client.auth.getUser(access);
    if (data.user) return { user: data.user, access, refresh, cookies: [] };
  }
  if (refresh) {
    const { data } = await client.auth.refreshSession({ refresh_token: refresh });
    if (data.session && data.user) return { user: data.user, access: data.session.access_token, refresh: data.session.refresh_token, cookies: authCookies(data.session) };
  }
  return null;
}

async function profile(request, env, session, method = 'GET', data = undefined) {
  const response = await fetch(`${env.SUPABASE_URL}/functions/v1/communiverse-profile-v1`, {
    method,
    headers: { apikey: env.SUPABASE_PUBLIC_KEY, authorization: `Bearer ${session.access}`, ...(data ? { 'content-type': 'application/json' } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
    signal: AbortSignal.timeout(12000),
  });
  const result = await response.json().catch(() => ({}));
  return { status: response.status, result };
}

const style = `<style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1c2b43;background:#eaf1f9}*{box-sizing:border-box}body{margin:0;min-height:100svh;background:radial-gradient(circle at 53% 8%,#f8fbff 0,#eaf1f9 52%,#e4edf7 100%);display:flex;flex-direction:column}a{color:inherit;text-decoration:none}button,input{font:inherit}.cv-auth-header{height:76px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 clamp(18px,3vw,48px);border-bottom:1px solid #ffffffa8}.cv-auth-logo{font-size:20px;font-weight:640;letter-spacing:-.05em}.cv-auth-logo:before{content:"";display:inline-block;width:24px;height:24px;vertical-align:-5px;margin-right:10px;border-radius:50%;background:radial-gradient(circle,#fff4d3 0 14%,#ff9b63 35%,#ffcbad 55%,#f7c5aa 70%,transparent 72%)}.cv-auth-nav{display:flex;gap:6px;align-items:center;padding:5px;background:#ffffffaa;border:1px solid #fff;border-radius:999px;box-shadow:0 10px 30px #38507011}.cv-auth-nav a{padding:10px 15px;border-radius:999px;font-size:13px}.cv-auth-nav a:hover,.cv-auth-nav a:focus-visible{background:#dfeafc}.cv-auth-right{justify-self:end;display:flex;gap:10px;align-items:center}.cv-auth-right a{font-size:13px}.cv-auth-pill,.cv-auth-button{background:#2860ce;color:white!important;border-radius:999px;border:1px solid #2355b7;padding:11px 17px;box-shadow:inset 0 1px #ffffff66,0 5px 14px #17429c1c;cursor:pointer}.cv-auth-button{width:100%;font-weight:610;padding:14px 20px}.cv-auth-main{width:min(100%,1180px);margin:auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,460px);gap:clamp(30px,7vw,100px);align-items:center;padding:46px 28px 70px}.cv-auth-copy h1{font-size:clamp(44px,6vw,84px);line-height:.98;letter-spacing:-.07em;font-weight:540;max-width:600px;margin:0 0 28px}.cv-auth-copy p{font-size:clamp(16px,1.4vw,21px);line-height:1.55;color:#53627a;max-width:480px}.cv-auth-card{background:#ffffffb9;border:1px solid #fff;border-radius:30px;padding:clamp(24px,4vw,42px);box-shadow:0 28px 80px #24456a19;backdrop-filter:blur(24px)}.cv-auth-card h2{font-size:25px;letter-spacing:-.045em;font-weight:580;margin:0 0 8px}.cv-auth-card>p{font-size:14px;color:#62718a;line-height:1.5;margin:0 0 24px}.cv-auth-card form{display:grid;gap:15px}.cv-auth-card label{display:grid;gap:7px;font-size:13px;font-weight:560}.cv-auth-card input{width:100%;min-height:48px;border:1px solid #cdd8e8;border-radius:13px;padding:0 14px;background:#f9fbff;color:#1c2b43;outline:none}.cv-auth-card input:focus{border-color:#4b78d9;box-shadow:0 0 0 3px #4b78d920}.cv-auth-card input[type=checkbox]{width:17px;min-height:17px}.cv-auth-card .check{display:flex;align-items:flex-start;gap:10px;font-weight:400;line-height:1.5;color:#526078}.cv-auth-card .fine{font-size:12px;line-height:1.5;color:#6d7d93}.cv-auth-card .fine a{text-decoration:underline;text-underline-offset:2px}.cv-auth-status{min-height:20px;font-size:13px;line-height:1.5;color:#b13c45;margin:0}.cv-auth-status.success{color:#256b52}.cv-auth-switch{font-size:13px;color:#64728a;margin-top:22px}.cv-auth-switch a{color:#2058bc;font-weight:600}.cv-auth-profile{display:grid;gap:16px}.cv-auth-profile dl{display:grid;grid-template-columns:100px 1fr;gap:10px 18px;font-size:14px}.cv-auth-profile dt{color:#65738a}.cv-auth-profile dd{margin:0}.cv-auth-footer{padding:20px clamp(18px,3vw,48px);border-top:1px solid #cbd8e7;display:flex;justify-content:space-between;gap:16px;color:#52617a;font-size:12px}.cv-auth-footer nav{display:flex;gap:20px}@media(max-width:720px){.cv-auth-header{grid-template-columns:1fr auto;height:auto;min-height:68px}.cv-auth-nav{display:none}.cv-auth-main{grid-template-columns:1fr;padding:38px 18px 48px;gap:16px}.cv-auth-copy h1{font-size:42px;margin-bottom:14px}.cv-auth-copy p{font-size:15px}.cv-auth-card{border-radius:24px}.cv-auth-footer{flex-wrap:wrap}}@media(max-width:390px){.cv-auth-right{gap:6px}.cv-auth-right a{font-size:12px}.cv-auth-pill{padding:9px 12px}}@media(prefers-reduced-motion:no-preference){.cv-auth-card{animation:rise .4s ease-out both}@keyframes rise{from{opacity:.5;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}}
</style>`;
const shell = (title, intro, card) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${htmlEscape(title)} | Communiverse</title>${style}</head><body><header class="cv-auth-header"><a class="cv-auth-logo" href="/">Communiverse</a><nav class="cv-auth-nav" aria-label="Main navigation"><a href="/">Discover</a><a href="/events/">Events</a><a href="/clubs/">Clubs</a><a href="/circles/">Circles</a></nav><div class="cv-auth-right"><a href="/sign-in/">Sign in</a><a class="cv-auth-pill" href="/join/">Join</a></div></header><main class="cv-auth-main"><div class="cv-auth-copy"><h1>${htmlEscape(title)}</h1><p>${htmlEscape(intro)}</p></div><section class="cv-auth-card">${card}</section></main><footer class="cv-auth-footer"><a href="/">Communiverse</a><nav><a href="/works/">Works</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></footer></body></html>`;
const page = (html, status = 200, cookies = []) => {
  const headers = new Headers({ 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' });
  for (const value of cookies) headers.append('set-cookie', value);
  return new Response(html, { status, headers });
};
const script = `<script>document.addEventListener('submit',async e=>{const f=e.target;if(!f.matches('[data-account-form]'))return;e.preventDefault();if(!f.reportValidity())return;const out=f.querySelector('[role=status]');const button=f.querySelector('button[type=submit]');const data=Object.fromEntries(new FormData(f));if(data.confirm_password!==undefined&&data.password!==data.confirm_password){out.textContent='Passwords do not match.';return}button.disabled=true;out.textContent='Working…';try{const r=await fetch(f.action,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(data)});const x=await r.json();if(!r.ok)throw Error(x.error||'Please try again.');if(x.next){location.assign(x.next);return}out.textContent=x.message||'Done.';out.classList.add('success');f.reset()}catch(error){out.textContent=error.message;button.disabled=false}},true);</script>`;
const joinPage = () => page(shell('Make your circle.', 'Choose a username, then explore the artists, clubs, and people who make Communiverse.', `<h2>Create an account</h2><p>Your username is how people will find you. We use your email for sign-in and recovery.</p><form data-account-form action="/account/api/signup"><label>First name<input name="first_name" autocomplete="given-name" maxlength="80" required></label><label>Username<input name="username" autocomplete="username" autocapitalize="none" spellcheck="false" pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,39}" minlength="3" maxlength="40" required></label><label>Email<input type="email" name="email" autocomplete="email" maxlength="254" required></label><label>Password<input type="password" name="password" autocomplete="new-password" minlength="12" maxlength="128" required></label><label>Confirm password<input type="password" name="confirm_password" autocomplete="new-password" minlength="12" maxlength="128" required></label><label class="check"><input type="checkbox" name="consent" value="yes" required><span>I agree to the <a href="/terms/">Terms</a> and <a href="/privacy/">Privacy Policy</a>.</span></label><button class="cv-auth-button" type="submit">Create account</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><p class="cv-auth-switch">Already a member? <a href="/sign-in/">Sign in</a></p>${script}`));
const signInPage = () => page(shell('Welcome back.', 'Sign in to your circle and keep your profile in one place.', `<h2>Sign in</h2><p>Use your email and password. Your username is shown on your profile.</p><form data-account-form action="/account/api/login"><label>Email<input type="email" name="email" autocomplete="email" required></label><label>Password<input type="password" name="password" autocomplete="current-password" required></label><button class="cv-auth-button" type="submit">Sign in</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><p class="cv-auth-switch"><a href="/account/forgot/">Forgot your password?</a></p><p class="cv-auth-switch">New to Communiverse? <a href="/join/">Create an account</a></p>${script}`));
const forgotPage = () => page(shell('Reset your password.', 'We will email a recovery link to your account address.', `<h2>Find your account</h2><p>Enter the email you used when joining.</p><form data-account-form action="/account/api/forgot"><label>Email<input type="email" name="email" autocomplete="email" required></label><button class="cv-auth-button" type="submit">Send recovery link</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form>${script}`));
const confirmPage = () => page(shell('Confirm your account.', 'Finishing your email confirmation.', `<h2>One moment</h2><p id="cv-confirm-status" role="status">Checking your confirmation link…</p><script>(async()=>{const out=document.getElementById('cv-confirm-status');const p=new URLSearchParams(location.hash.slice(1));history.replaceState(null,'',location.pathname);if(p.get('error')){out.textContent='This confirmation link could not be completed. Please try signing in or request a new link.';return}if(!p.get('access_token')||!p.get('refresh_token')){out.textContent='Open the link from your confirmation email.';return}try{const r=await fetch('/account/api/complete',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({access_token:p.get('access_token'),refresh_token:p.get('refresh_token')})});const x=await r.json();if(!r.ok)throw Error(x.error);location.replace('/account/')}catch{out.textContent='Your account could not be confirmed. Please try signing in.'}})()</script>`));
const resetPage = () => page(shell('Choose a new password.', 'Set a fresh password for your Communiverse account.', `<h2>New password</h2><form id="cv-reset"><label>Password<input type="password" name="password" minlength="12" maxlength="128" autocomplete="new-password" required></label><label>Confirm password<input type="password" name="confirm_password" minlength="12" maxlength="128" autocomplete="new-password" required></label><button class="cv-auth-button" type="submit">Save password</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><script>const p=new URLSearchParams(location.hash.slice(1));history.replaceState(null,'',location.pathname);document.getElementById('cv-reset').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,out=f.querySelector('[role=status]');if(f.password.value!==f.confirm_password.value){out.textContent='Passwords do not match.';return}if(!p.get('access_token')||!p.get('refresh_token')){out.textContent='Open the link from your recovery email.';return}const r=await fetch('/account/api/reset',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({access_token:p.get('access_token'),refresh_token:p.get('refresh_token'),password:f.password.value})});const x=await r.json();if(!r.ok){out.textContent=x.error||'Please try again.';return}location.replace('/account/')})</script>`));

async function accountPage(request, env) {
  const session = await currentSession(request, env);
  if (!session) return redirect('/sign-in/');
  const { status, result } = await profile(request, env, session);
  if (status === 409) return page(shell('Choose your username.', 'Your email is confirmed. Choose a name for your circle.', `<h2>Choose a username</h2><form data-account-form action="/account/api/username"><label>Username<input name="username" autocomplete="username" pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,39}" required></label><button class="cv-auth-button" type="submit">Save username</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form>${script}`), 200, session.cookies);
  if (status !== 200 || !result.profile) return page(shell('Your account.', 'Your profile is temporarily unavailable.', '<h2>Please try again shortly.</h2><p><a href="/circles/">Explore Circles</a></p>'), 503, session.cookies);
  const p = result.profile;
  return page(shell('Your circle.', 'Your profile gives people a way to find and connect with you.', `<div class="cv-auth-profile"><h2>${htmlEscape(p.first_name || p.username)}</h2><dl><dt>Username</dt><dd>@${htmlEscape(p.username)}</dd><dt>Email</dt><dd>${htmlEscape(session.user.email)}</dd><dt>City</dt><dd>${htmlEscape(p.city || 'Add your city')}</dd><dt>Interest</dt><dd>${htmlEscape(p.craft || 'Add your interests')}</dd></dl><form data-account-form action="/account/api/profile"><label>First name<input name="first_name" value="${htmlEscape(p.first_name)}" maxlength="80" required></label><label>City<input name="city" value="${htmlEscape(p.city)}" maxlength="100"></label><label>Art or interests<input name="craft" value="${htmlEscape(p.craft)}" maxlength="160"></label><button class="cv-auth-button" type="submit">Save profile</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><form data-account-form action="/account/api/logout"><button type="submit">Sign out</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><p><a href="/circles/">Meet the people →</a></p></div>${script}`), 200, session.cookies);
}

async function api(request, env, action) {
  if (request.method !== 'POST' || !sameOrigin(request)) return json({ error: 'Invalid request' }, 403);
  let body;
  try { body = await readBody(request); } catch { return json({ error: 'Invalid request' }, 400); }
  const client = auth(env);
  if (action === 'signup') {
    const address = email(body.email), username = clean(body.username, 40).toLowerCase(), firstName = clean(body.first_name, 80), password = String(body.password || '');
    if (!address.includes('@') || !HANDLE.test(username) || !firstName || password.length < 12 || password.length > 128 || password !== body.confirm_password || body.consent !== 'yes') return json({ error: 'Check the account details and try again.' }, 400);
    const { error } = await client.auth.signUp({ email: address, password, options: { emailRedirectTo: CONFIRM_URL, data: { username, first_name: firstName, communiverse: true } } });
    if (error) {
      if (error.status === 429 || error.message === 'Email rate limit exceeded') return json({ error: 'Please try again later.' }, 429);
      if (error.status >= 500) return json({ error: 'Signup is temporarily unavailable. Please try again later.' }, 503);
      return json({ error: 'Your account could not be created. Try again.' }, 400);
    }
    return json({ message: 'Check your email to confirm your account. Then return to sign in.' });
  }
  if (action === 'login') {
    const address = email(body.email), password = String(body.password || '');
    if (!address.includes('@') || !password) return json({ error: 'Check your email and password.' }, 401);
    const { data, error } = await client.auth.signInWithPassword({ email: address, password });
    if (error?.status >= 500) return json({ error: 'Sign in is temporarily unavailable. Please try again later.' }, 503);
    if (error || !data.session) return json({ error: 'Check your email and password, or confirm your email first.' }, 401);
    return json({ next: '/account/' }, 200, authCookies(data.session));
  }
  if (action === 'complete' || action === 'reset') {
    const access = String(body.access_token || ''), refresh = String(body.refresh_token || '');
    if (!access || !refresh || access.length > 8192 || refresh.length > 8192) return json({ error: 'This link is invalid or expired.' }, 400);
    const { data: before } = await client.auth.getUser(access);
    const { data, error } = await client.auth.refreshSession({ refresh_token: refresh });
    if (error || !before.user || !data.user || before.user.id !== data.user.id || !data.session) return json({ error: 'This link is invalid or expired.' }, 400);
    let authenticatedSession = data.session;
    if (action === 'reset') {
      const password = String(body.password || '');
      if (password.length < 12 || password.length > 128) return json({ error: 'Use a password of at least 12 characters.' }, 400);
      const { data: established, error: sessionError } = await client.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
      if (sessionError || !established.session) return json({ error: 'This link is invalid or expired.' }, 400);
      authenticatedSession = established.session;
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) return json({ error: 'The password could not be changed. Please request a new link.' }, 400);
    }
    return json({ next: '/account/' }, 200, authCookies(authenticatedSession));
  }
  if (action === 'forgot') {
    const address = email(body.email);
    if (!address.includes('@')) return json({ error: 'Enter a valid email address.' }, 400);
    const { error } = await client.auth.resetPasswordForEmail(address, { redirectTo: RESET_URL });
    if (error) return json({ error: 'Recovery email is temporarily unavailable. Please try again later.' }, 503);
    return json({ message: 'If that email has an account, we have sent a recovery link.' });
  }
  if (action === 'logout') {
    const session = await currentSession(request, env);
    if (session) {
      await client.auth.setSession({ access_token: session.access, refresh_token: session.refresh });
      await client.auth.signOut().catch(() => {});
    }
    return json({ next: '/' }, 200, clearCookies());
  }
  const session = await currentSession(request, env);
  if (!session) return json({ error: 'Sign in to continue.' }, 401, clearCookies());
  if (action === 'username') {
    const username = clean(body.username, 40).toLowerCase();
    if (!HANDLE.test(username)) return json({ error: 'Use 3–40 letters, numbers, dots, underscores or dashes.' }, 400);
    const { status, result } = await profile(request, env, session, 'POST', { username });
    return status === 200 ? json({ next: '/account/' }, 200, session.cookies) : json({ error: result.error || 'That username is unavailable.' }, status, session.cookies);
  }
  if (action === 'profile') {
    const fields = { first_name: clean(body.first_name, 80), city: clean(body.city, 100), craft: clean(body.craft, 160) };
    const { status, result } = await profile(request, env, session, 'PATCH', fields);
    return status === 200 ? json({ next: '/account/' }, 200, session.cookies) : json({ error: result.error || 'Your profile could not be saved.' }, status, session.cookies);
  }
  return json({ error: 'Not found.' }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetHost = HOSTS.has(url.hostname) || (env.CV_LOCAL_ACCOUNT_TEST === 'true' && (url.hostname === '127.0.0.1' || url.hostname === 'localhost'));
    if (targetHost) {
      const path = url.pathname;
      try {
        if (request.method === 'GET' && path === '/join/') return joinPage();
        if (request.method === 'GET' && path === '/sign-in/') return signInPage();
        if (request.method === 'GET' && path === '/account/forgot/') return forgotPage();
        if (request.method === 'GET' && path === '/account/confirm/') return confirmPage();
        if (request.method === 'GET' && path === '/account/reset/') return resetPage();
        if (request.method === 'GET' && path === '/account/') return accountPage(request, env);
        if (path.startsWith('/account/api/')) return api(request, env, path.split('/').filter(Boolean).pop());
      } catch (cause) {
        console.error('Communiverse account route failed', path, cause instanceof Error ? cause.name : 'unknown');
        return path.startsWith('/account/api/') ? json({ error: 'Accounts are temporarily unavailable.' }, 503) : page(shell('Account service.', 'Please try again shortly.', '<h2>We could not load this page.</h2><p><a href="/">Go home</a></p>'), 503);
      }
    }
    const response = await application.fetch(request, env, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (!targetHost || response.status !== 200 || !contentType.includes('text/html')) return response;
    const signed = !!cookieValue(request, '__Host-cv-sb-refresh');
    const actions = signed ? '<a class="cv-account-link" href="/account/">My circle</a>' : '<a class="cv-account-link" href="/sign-in/">Sign in</a><a class="cv-account-join" href="/join/">Join</a>';
    const transformed = new HTMLRewriter().on('.cv-account', { element(element) { element.setInnerContent(actions, { html: true }); } }).transform(response);
    const headers = new Headers(transformed.headers);
    headers.set('x-communiverse-release', 'supabase-accounts-20261111');
    return new Response(transformed.body, { status: transformed.status, headers });
  },
  async scheduled(controller, env, ctx) {
    if (application.scheduled) return application.scheduled(controller, env, ctx);
  },
};
