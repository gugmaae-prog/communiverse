import application, { RegistrationDelivery, isPublicExperience } from '../idrive-media-20261111/entry.mjs';
import keifferPortrait from './portraits/keiffer-384.webp';
import lunaPortrait from './portraits/luna-384.webp';

export { RegistrationDelivery, isPublicExperience };

const HOSTS = new Set(['communiverseclubs.com', 'www.communiverseclubs.com']);
const LEGACY_NAV_CLIENT = /^\/communiverse\/_domain\/public-domain-[^/]+\/_render\/events-framing-20261027-v6\/client\.js$/;
const LEGACY_JOIN_CLIENT = /^\/communiverse\/_domain\/public-domain-[^/]+\/_public\/20261008-marketplace-1b-join\.js$/;
const LEGACY_ROUTER_CLIENT = /^\/communiverse\/_domain\/public-domain-[^/]+\/navigation\.js$/;
const LEGACY_IDENTITY_CLIENT = /^\/communiverse\/_domain\/public-domain-[^/]+\/identity\.js$/;
const NAV_ASSET_VERSION = 'cv-auth-nav-20261115-v3';
const PORTRAIT_ASSET_VERSION = 'cv-portrait-20261115-v1';
const PORTRAIT_PREFIX = '/communiverse/_optimized-portraits/20261115-v1/';
const PORTRAIT_ROUTES = new Map([
  [`${PORTRAIT_PREFIX}keiffer-384.webp`, keifferPortrait],
  [`${PORTRAIT_PREFIX}luna-384.webp`, lunaPortrait],
]);
const PORTRAIT_ORIGINALS = new Map([
  ['/communiverse/_circles/20261022-v1/keiffer-1024.webp', `${PORTRAIT_PREFIX}keiffer-384.webp`],
  ['/communiverse/_circles/20261022-v1/luna-1024.webp', `${PORTRAIT_PREFIX}luna-384.webp`],
]);
const portraitBytes = dataUrl => Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), character => character.charCodeAt(0));
const PORTRAIT_BYTES = new Map([...PORTRAIT_ROUTES].map(([path, data]) => [path, portraitBytes(data)]));
const HANDLE = /^[a-z0-9][a-z0-9._-]{2,39}$/;
const htmlEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const cookieValue = (request, name) => request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1] || '';
const cookie = (name, value, age) => `${name}=${encodeURIComponent(value)}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;
const authCookies = token => [cookie('__Host-cv-account', token, 30 * 86400), cookie('__Host-cv-sb-access', '', 0), cookie('__Host-cv-sb-refresh', '', 0)];
const clearCookies = () => [cookie('__Host-cv-account', '', 0), cookie('__Host-cv-sb-access', '', 0), cookie('__Host-cv-sb-refresh', '', 0)];
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
async function gateway(request, env, action, body) {
  if (!env.CV_IDRIVE_AUTH_URL || !env.CV_IDRIVE_AUTH_TOKEN) return { status: 503, result: { error: 'Accounts are temporarily unavailable.' } };
  const response = await fetch(`${env.CV_IDRIVE_AUTH_URL}/cv-auth/${action}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.CV_IDRIVE_AUTH_TOKEN}`, 'content-type': 'application/json', 'x-cv-client-ip': request.headers.get('cf-connecting-ip') || 'unknown' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  return { status: response.status, result: await response.json().catch(() => ({})) };
}

async function currentSession(request, env) {
  const token = cookieValue(request, '__Host-cv-account');
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const { status, result } = await gateway(request, env, 'session', { token });
  if (status === 200 && result.profile) return { token, profile: result.profile, cookies: [] };
  if (status === 401) return null;
  throw Error('Account storage is unavailable');
}

async function profile(request, env, session, method = 'GET', data = undefined) {
  if (method === 'GET') return { status: 200, result: { profile: session.profile } };
  return gateway(request, env, 'profile', { ...data, token: session.token });
}

const style = `<style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1c2b43;background:#eaf1f9}*{box-sizing:border-box}body{margin:0;min-height:100svh;background:radial-gradient(circle at 53% 8%,#f8fbff 0,#eaf1f9 52%,#e4edf7 100%);display:flex;flex-direction:column}a{color:inherit;text-decoration:none}button,input{font:inherit}.cv-auth-header{height:76px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 clamp(18px,3vw,48px);border-bottom:1px solid #ffffffa8}.cv-auth-logo{font-size:20px;font-weight:640;letter-spacing:-.05em}.cv-auth-logo:before{content:"";display:inline-block;width:24px;height:24px;vertical-align:-5px;margin-right:10px;border-radius:50%;background:radial-gradient(circle,#fff4d3 0 14%,#ff9b63 35%,#ffcbad 55%,#f7c5aa 70%,transparent 72%)}.cv-auth-nav{display:flex;gap:6px;align-items:center;padding:5px;background:#ffffffaa;border:1px solid #fff;border-radius:999px;box-shadow:0 10px 30px #38507011}.cv-auth-nav a{padding:10px 15px;border-radius:999px;font-size:13px}.cv-auth-nav a:hover,.cv-auth-nav a:focus-visible{background:#dfeafc}.cv-auth-right{justify-self:end;display:flex;gap:10px;align-items:center}.cv-auth-right a{font-size:13px}.cv-auth-pill,.cv-auth-button{background:#2860ce;color:white!important;border-radius:999px;border:1px solid #2355b7;padding:11px 17px;box-shadow:inset 0 1px #ffffff66,0 5px 14px #17429c1c;cursor:pointer}.cv-auth-button{width:100%;font-weight:610;padding:14px 20px}.cv-auth-main{width:min(100%,1180px);margin:auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,460px);gap:clamp(30px,7vw,100px);align-items:center;padding:46px 28px 70px}.cv-auth-copy h1{font-size:clamp(44px,6vw,84px);line-height:.98;letter-spacing:-.07em;font-weight:540;max-width:600px;margin:0 0 28px}.cv-auth-copy p{font-size:clamp(16px,1.4vw,21px);line-height:1.55;color:#53627a;max-width:480px}.cv-auth-card{background:#ffffffb9;border:1px solid #fff;border-radius:30px;padding:clamp(24px,4vw,42px);box-shadow:0 28px 80px #24456a19;backdrop-filter:blur(24px)}.cv-auth-card h2{font-size:25px;letter-spacing:-.045em;font-weight:580;margin:0 0 8px}.cv-auth-card>p{font-size:14px;color:#62718a;line-height:1.5;margin:0 0 24px}.cv-auth-card form{display:grid;gap:15px}.cv-auth-card label{display:grid;gap:7px;font-size:13px;font-weight:560}.cv-auth-card input{width:100%;min-height:48px;border:1px solid #cdd8e8;border-radius:13px;padding:0 14px;background:#f9fbff;color:#1c2b43;outline:none}.cv-auth-card input:focus{border-color:#4b78d9;box-shadow:0 0 0 3px #4b78d920}.cv-auth-card input[type=checkbox]{width:17px;min-height:17px}.cv-auth-card .check{display:flex;align-items:flex-start;gap:10px;font-weight:400;line-height:1.5;color:#526078}.cv-auth-card .fine{font-size:12px;line-height:1.5;color:#6d7d93}.cv-auth-card .fine a{text-decoration:underline;text-underline-offset:2px}.cv-auth-status{min-height:20px;font-size:13px;line-height:1.5;color:#b13c45;margin:0;overflow-wrap:anywhere}.cv-auth-status.success{color:#256b52}.cv-auth-switch{font-size:13px;color:#64728a;margin-top:22px}.cv-auth-switch a{color:#2058bc;font-weight:600}.cv-auth-profile{display:grid;gap:16px}.cv-auth-profile dl{display:grid;grid-template-columns:100px 1fr;gap:10px 18px;font-size:14px}.cv-auth-profile dt{color:#65738a}.cv-auth-profile dd{margin:0;overflow-wrap:anywhere}.cv-auth-footer{padding:20px clamp(18px,3vw,48px);border-top:1px solid #cbd8e7;display:flex;justify-content:space-between;gap:16px;color:#52617a;font-size:12px}.cv-auth-footer nav{display:flex;gap:20px}@media(max-width:720px){.cv-auth-header{grid-template-columns:1fr auto;height:auto;min-height:68px}.cv-auth-nav{display:none}.cv-auth-main{grid-template-columns:1fr;padding:38px 18px 48px;gap:16px}.cv-auth-copy h1{font-size:42px;margin-bottom:14px}.cv-auth-copy p{font-size:15px}.cv-auth-card{border-radius:24px}.cv-auth-footer{flex-wrap:wrap}}@media(max-width:390px){.cv-auth-right{gap:6px}.cv-auth-right a{font-size:12px}.cv-auth-pill{padding:9px 12px}}@media(prefers-reduced-motion:no-preference){.cv-auth-card{animation:rise .4s ease-out both}@keyframes rise{from{opacity:.5;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}}
</style>`;
const sharedHeaderStyle = `<style data-cv-shared-header>
/* The retained exhibition header has OS-dark rules, while the public shell stays light. */
@media(prefers-color-scheme:dark){html[data-cv-social][data-cv-design]:not([data-theme="dark"]) #cv-social-header{color:#243248!important}html[data-cv-social][data-cv-design]:not([data-theme="dark"]) #cv-social-header :is(.cv-universe-logo,.cv-account-link){color:#243248!important}html[data-cv-social][data-cv-design]:not([data-theme="dark"]) #cv-social-header nav{background:rgba(255,255,255,.88)!important;border-color:rgba(73,100,143,.19)!important}html[data-cv-social][data-cv-design]:not([data-theme="dark"]) #cv-social-header nav a{color:#243248!important}html[data-cv-social][data-cv-design]:not([data-theme="dark"]) #cv-social-header nav a[aria-current="page"]{background:#e2ebfb!important;color:#174ba9!important}}
#cv-social-header .cv-account a.cv-account-join{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 14px;border:1px solid #2558bc;border-radius:999px;background:#2b61ce;color:#fff!important;font-weight:600;box-shadow:inset 0 1px #ffffff66,0 5px 14px #17429c1c}
#cv-social-header .cv-account a.cv-account-join:hover{background:#1f53ba}
#cv-social-header .cv-account a:focus-visible,#cv-social-header nav a:focus-visible,#cv-social-header .cv-auth-logo:focus-visible{outline:2px solid #245bc6;outline-offset:3px}
.cv-auth-header{height:80px;background:#f3f7fc;border-bottom:1px solid #ffffffa8}
.cv-auth-logo{display:inline-flex;align-items:center;gap:8px;font-size:20px;font-weight:500;letter-spacing:-.055em;white-space:nowrap}
.cv-auth-logo:before{display:none}.cv-auth-logo img{width:34px;height:34px;object-fit:contain}
.cv-auth-nav{background:#ffffffd9}.cv-auth-nav a{min-height:44px;display:inline-flex;align-items:center;justify-content:center}
.cv-auth-right{gap:4px}.cv-auth-right a{min-height:44px;display:inline-flex;align-items:center;justify-content:center;padding:8px 10px}
.cv-auth-right a.cv-account-join{padding:8px 14px}
.cv-auth-skip{position:absolute;left:12px;top:-60px;z-index:1000;padding:10px 14px;background:#fff;border-radius:10px}.cv-auth-skip:focus{top:8px}
@media(max-width:720px){.cv-auth-header{height:126px;min-height:126px;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:62px 54px;padding:0 16px 10px;column-gap:8px}.cv-auth-logo{grid-column:1;grid-row:1;font-size:19px}.cv-auth-right{grid-column:2;grid-row:1}.cv-auth-nav{display:flex;grid-column:1/-1;grid-row:2;justify-self:stretch;justify-content:space-between;width:100%;padding:5px}.cv-auth-nav a{flex:1;padding:8px 4px;font-size:13px}}
@media(max-width:360px){.cv-auth-logo{font-size:17px;gap:5px}.cv-auth-logo img{width:27px;height:27px}.cv-auth-right a{font-size:12px;padding:7px 5px}.cv-auth-right a.cv-account-join{padding:7px 10px}#cv-social-header .cv-account a.cv-account-join{padding:7px 10px}}
</style>`;
const shell = (title, intro, card) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${htmlEscape(title)} | Communiverse</title>${style}${sharedHeaderStyle}</head><body><header class="cv-auth-header" id="cv-social-header"><a class="cv-auth-skip" href="#cv-auth-main">Skip to content</a><a class="cv-auth-logo" href="/" aria-label="Communiverse home"><img src="/communiverse/_brand/20261020-v22/logo-96.png" width="34" height="34" alt="" decoding="async"><span>Communiverse</span></a><nav class="cv-auth-nav" aria-label="Main navigation"><a href="/">Discover</a><a href="/events/">Events</a><a href="/clubs/">Clubs</a><a href="/circles/">Circles</a></nav><div class="cv-auth-right cv-account"><a class="cv-account-link" href="/sign-in/">Sign in</a><a class="cv-auth-pill cv-account-join" href="/join/">Join</a></div></header><main class="cv-auth-main" id="cv-auth-main"><div class="cv-auth-copy"><h1>${htmlEscape(title)}</h1><p>${htmlEscape(intro)}</p></div><section class="cv-auth-card">${card}</section></main><footer class="cv-auth-footer"><a href="/">Communiverse</a><nav><a href="/works/">Works</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></footer></body></html>`;
const page = (html, status = 200, cookies = []) => {
  const headers = new Headers({ 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' });
  for (const value of cookies) headers.append('set-cookie', value);
  return new Response(html, { status, headers });
};
const script = `<script>document.addEventListener('submit',async e=>{const f=e.target;if(!f.matches('[data-account-form]'))return;e.preventDefault();if(!f.reportValidity())return;const out=f.querySelector('[role=status]');const button=f.querySelector('button[type=submit]');const data=Object.fromEntries(new FormData(f));if(data.confirm_password!==undefined&&data.password!==data.confirm_password){out.textContent='Passwords do not match.';return}button.disabled=true;out.textContent='Working…';try{const r=await fetch(f.action,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(data)});const x=await r.json();if(!r.ok)throw Error(x.error||'Please try again.');if(x.recovery_code){out.textContent=(f.action.endsWith('/rotate-recovery')?'Save your new recovery code somewhere private: ':'Your account is ready. Save this one-time recovery code somewhere private: ')+x.recovery_code+'. Keep it safe; it is shown only once.';out.classList.add('success');f.querySelectorAll('input[type=password]').forEach(i=>i.value='');const link=document.createElement('a');link.href='/account/';link.textContent='Open my account →';out.after(link);return}if(x.next){location.assign(x.next);return}out.textContent=x.message||'Done.';out.classList.add('success');f.reset();button.disabled=false}catch(error){out.textContent=error.message;button.disabled=false}},true);</script>`;
const joinPage = () => page(shell('Make your circle.', 'Choose a username, then explore the artists, clubs, and people who make Communiverse.', `<h2>Create an account</h2><p>Sign in with your username and password. Your email and phone are saved as contact details; they are not verified yet.</p><form data-account-form action="/account/api/signup"><label>First name<input name="first_name" autocomplete="given-name" maxlength="80" required></label><label>Username<input name="username" autocomplete="username" autocapitalize="none" spellcheck="false" pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,39}" minlength="3" maxlength="40" required></label><label>Email<input type="email" name="email" autocomplete="email" maxlength="254" required></label><label>Phone with country code<input type="tel" name="phone" autocomplete="tel" placeholder="+971501234567" maxlength="24" required></label><label>Password<input type="password" name="password" autocomplete="new-password" minlength="12" maxlength="72" required></label><label>Confirm password<input type="password" name="confirm_password" autocomplete="new-password" minlength="12" maxlength="72" required></label><label class="check"><input type="checkbox" name="consent" value="yes" required><span>I agree to the <a href="/terms/">Terms</a> and <a href="/privacy/">Privacy Policy</a>.</span></label><button class="cv-auth-button" type="submit">Create account</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><p class="cv-auth-switch">Already a member? <a href="/sign-in/">Sign in</a></p>${script}`));
const signInPage = () => page(shell('Welcome back.', 'Sign in to your circle and keep your profile in one place.', `<h2>Sign in</h2><p>Use your username and password. If you had an account before, use your existing username.</p><form data-account-form action="/account/api/login"><label>Username<input name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required></label><label>Password<input type="password" name="password" autocomplete="current-password" required></label><button class="cv-auth-button" type="submit">Sign in</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><p class="cv-auth-switch"><a href="/account/forgot/">Use a recovery code</a></p><p class="cv-auth-switch">New to Communiverse? <a href="/join/">Create an account</a></p>${script}`));
const forgotPage = () => page(shell('Recover your circle.', 'Use the one-time recovery code you saved when you created your account.', `<h2>Set a new password</h2><form data-account-form action="/account/api/recover"><label>Username<input name="username" autocomplete="username" autocapitalize="none" required></label><label>Recovery code<input name="recovery_code" autocomplete="off" maxlength="80" required></label><label>New password<input type="password" name="password" autocomplete="new-password" minlength="12" maxlength="72" required></label><label>Confirm new password<input type="password" name="confirm_password" autocomplete="new-password" minlength="12" maxlength="72" required></label><button class="cv-auth-button" type="submit">Set new password</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><p class="cv-auth-switch">Need help with an older account? Contact us through <a href="/contact/">Communiverse</a> for help.</p>${script}`));

async function accountPage(request, env) {
  const session = await currentSession(request, env);
  if (!session) return redirect('/sign-in/');
  const { status, result } = await profile(request, env, session);
  if (status === 409) return page(shell('Choose your username.', 'Your email is confirmed. Choose a name for your circle.', `<h2>Choose a username</h2><form data-account-form action="/account/api/username"><label>Username<input name="username" autocomplete="username" pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,39}" required></label><button class="cv-auth-button" type="submit">Save username</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form>${script}`), 200, session.cookies);
  if (status !== 200 || !result.profile) return page(shell('Your account.', 'Your profile is temporarily unavailable.', '<h2>Please try again shortly.</h2><p><a href="/circles/">Explore Circles</a></p>'), 503, session.cookies);
  const p = result.profile;
  return page(shell('Your circle.', 'Your profile gives people a way to find and connect with you.', `<div class="cv-auth-profile"><h2>${htmlEscape(p.first_name || p.username)}</h2><dl><dt>Username</dt><dd>@${htmlEscape(p.username)}</dd><dt>Email</dt><dd>${htmlEscape(p.contact_email || '')}${p.login_kind === 'username' ? ' · unverified' : ''}</dd><dt>Phone</dt><dd>${htmlEscape(p.phone || 'Not added')}${p.login_kind === 'username' ? ' · unverified' : ''}</dd><dt>City</dt><dd>${htmlEscape(p.city || 'Add your city')}</dd><dt>Interest</dt><dd>${htmlEscape(p.craft || 'Add your interests')}</dd></dl><form data-account-form action="/account/api/profile"><label>First name<input name="first_name" value="${htmlEscape(p.first_name)}" maxlength="80" required></label>${p.login_kind === 'username' ? `<label>Contact email<input type="email" name="email" value="${htmlEscape(p.contact_email)}" maxlength="254" required></label><label>Phone with country code<input type="tel" name="phone" value="${htmlEscape(p.phone)}" maxlength="24" required></label>` : ''}<label>City<input name="city" value="${htmlEscape(p.city)}" maxlength="100"></label><label>Art or interests<input name="craft" value="${htmlEscape(p.craft)}" maxlength="160"></label><button class="cv-auth-button" type="submit">Save profile</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form>${p.login_kind === 'username' ? `<form data-account-form action="/account/api/rotate-recovery"><label>Current password<input type="password" name="password" autocomplete="current-password" required></label><button type="submit">Create a new recovery code</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form>` : ''}<form data-account-form action="/account/api/logout"><button type="submit">Sign out</button><p class="cv-auth-status" role="status" aria-live="polite"></p></form><p><a href="/circles/">Meet the people →</a></p></div>${script}`), 200, session.cookies);
}


const serviceMessage = code => ({
  invalid_username: 'Use 3–40 letters, numbers, dots, underscores or dashes.',
  invalid_signup: 'Check your name, username, email, phone and password.',
  username_unavailable: 'That username is unavailable.',
  invalid_credentials: 'Check your username and password.',
  invalid_recovery: 'That recovery code is invalid or has already been used.',
  invalid_profile: 'Check your profile details.',
  too_many_attempts: 'Too many attempts. Try again in 15 minutes.',
  signed_out: 'Sign in to continue.',
})[code] || 'Accounts are temporarily unavailable.';

async function idriveApi(request, env, action) {
  if (request.method !== 'POST' || !sameOrigin(request)) return json({ error: 'Invalid request.' }, 403);
  let body;
  try { body = await readBody(request); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (['signup', 'recover'].includes(action) && body.password !== body.confirm_password) return json({ error: 'Passwords do not match.' }, 400);
  if (['signup', 'login', 'recover'].includes(action)) {
    const { status, result } = await gateway(request, env, action, body);
    if (status !== 200 || !result.token) return json({ error: serviceMessage(result.error) }, status);
    return result.recovery_code ? json({ recovery_code: result.recovery_code }, 200, authCookies(result.token)) : json({ next: '/account/' }, 200, authCookies(result.token));
  }
  if (action === 'logout') {
    const token = cookieValue(request, '__Host-cv-account');
    if (token) {
      const { status, result } = await gateway(request, env, 'logout', { token });
      if (status !== 200 && status !== 401) return json({ error: serviceMessage(result.error) }, status);
    }
    return json({ next: '/' }, 200, clearCookies());
  }
  const session = await currentSession(request, env);
  if (!session) return json({ error: 'Sign in to continue.' }, 401, clearCookies());
  if (action === 'rotate-recovery') {
    const { status, result } = await gateway(request, env, 'rotate', { token: session.token, password: String(body.password || '') });
    return status === 200 ? json({ recovery_code: result.recovery_code }) : json({ error: serviceMessage(result.error) }, status);
  }
  if (action === 'profile') {
    const fields = { first_name: clean(body.first_name, 80), email: email(body.email), phone: clean(body.phone, 24), city: clean(body.city, 100), craft: clean(body.craft, 160) };
    const { status, result } = await gateway(request, env, 'profile', { ...fields, token: session.token });
    return status === 200 ? json({ next: '/account/' }) : json({ error: serviceMessage(result.error) }, status);
  }
  return json({ error: 'Not found.' }, 404);
}

// The retained public bundle still injects a pause script for the old D1 account
// routes. Keep its disabled workspace controls, but let the new account routes work.
const pausedAccountScript = `(function(){
  'use strict';
  const gated='[data-heart],[data-follow],[data-follow-circle],[data-record-save],[data-feed-mode="saved"],[data-feed-mode="following"],[data-artist-view="following"],[data-circle-view="following"]';
  const active=/^\\/(?:sign-in|signin|login|join|account)(?:\\/|$)/;
  const oldPrivate=/^\\/(?:workspace|profile|onboarding|confirm|apply|host|auth)(?:\\/|$)/;
  function pausedLink(link){
    try{
      const url=new URL(link.getAttribute('href'),location.href);
      if(url.origin!==location.origin)return false;
      const path=url.pathname.replace(/^\\/communiverse(?=\\/|$)/,'')||'/';
      return !active.test(path)&&(oldPrivate.test(path)||/^\\/events\\/host(?:\\/|$)/.test(path));
    }catch{return false}
  }
  function disable(node){node.disabled=true;node.setAttribute('aria-disabled','true');node.title='This feature is temporarily unavailable';node.dataset.cvAccountPaused='true'}
  function accountDestination(link){
    if(!link?.matches?.('#cv-social-header .cv-account a'))return null;
    const label=link.textContent.trim().toLowerCase();
    if(label==='sign in')return '/sign-in/';
    if(label==='join')return '/join/';
    if(label==='my circle')return '/account/';
    return null;
  }
  function repairAccountLinks(root){
    const links=[...root.matches?.('#cv-social-header .cv-account a')?[root]:[],...root.querySelectorAll?.('#cv-social-header .cv-account a')||[]];
    for(const link of links){const path=accountDestination(link);if(path&&link.getAttribute('href')!==path)link.setAttribute('href',path)}
  }
  function scan(root){
    repairAccountLinks(root);
    if(root.matches?.(gated))disable(root);
    for(const node of root.querySelectorAll?.(gated)||[])disable(node);
    if(root.matches?.('a[href]')&&pausedLink(root)){root.remove();return}
    for(const link of root.querySelectorAll?.('a[href]')||[])if(pausedLink(link))link.remove();
  }
  window.CV_URLS=Object.freeze({...window.CV_URLS,accountAvailable:false,accountBase:location.origin+'/account/',accountOrigin:location.origin});
  document.addEventListener('click',event=>{const account=event.target.closest?.('#cv-social-header .cv-account a'),path=accountDestination(account);if(path&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();event.stopImmediatePropagation();location.assign(path);return}const node=event.target.closest?.(gated+',a[href]');if(node&&(node.matches(gated)||node.matches('a[href]')&&pausedLink(node))){event.preventDefault();event.stopImmediatePropagation()}},true);
  new MutationObserver(changes=>{for(const change of changes){if(change.type==='attributes'){scan(change.target);continue}for(const node of change.addedNodes)if(node.nodeType===1)scan(node)}}).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
  document.addEventListener('DOMContentLoaded',()=>scan(document));
})();`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetHost = HOSTS.has(url.hostname) || (env.CV_LOCAL_ACCOUNT_TEST === 'true' && (url.hostname === '127.0.0.1' || url.hostname === 'localhost'));
    if (targetHost) {
      const path = url.pathname;
      if ((request.method === 'GET' || request.method === 'HEAD') && PORTRAIT_BYTES.has(path)) {
        const bytes = PORTRAIT_BYTES.get(path);
        return new Response(request.method === 'HEAD' ? null : bytes, { headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff', 'content-length': String(bytes.byteLength) } });
      }
      try {
        if (request.method === 'GET' && ['/sign-in', '/signin', '/signin/', '/login', '/login/', '/account/login', '/account/login/', '/communiverse/login', '/communiverse/login/', '/communiverse/sign-in', '/communiverse/sign-in/', '/communiverse/account/login', '/communiverse/account/login/'].includes(path)) return redirect('/sign-in/');
        if (request.method === 'GET' && path === '/join') return redirect('/join/');
        if (request.method === 'GET' && path === '/account') return redirect('/account/');
        if (request.method === 'GET' && path === '/account/forgot') return redirect('/account/forgot/');
        if (request.method === 'GET' && path === '/join/') return joinPage();
        if (request.method === 'GET' && path === '/sign-in/') return signInPage();
        if (request.method === 'GET' && path === '/account/forgot/') return forgotPage();
        if (request.method === 'GET' && path === '/account/confirm/') return redirect('/account/forgot/');
        if (request.method === 'GET' && path === '/account/reset/') return redirect('/account/forgot/');
        if (request.method === 'GET' && path === '/account/') return accountPage(request, env);
        if (path.startsWith('/account/api/')) return idriveApi(request, env, path.split('/').filter(Boolean).pop());
      } catch (cause) {
        console.error('Communiverse account route failed', path, cause instanceof Error ? cause.name : 'unknown');
        return path.startsWith('/account/api/') ? json({ error: 'Accounts are temporarily unavailable.' }, 503) : page(shell('Account service.', 'Please try again shortly.', '<h2>We could not load this page.</h2><p><a href="/">Go home</a></p>'), 503);
      }
    }
    const response = await application.fetch(request, env, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (targetHost && response.status === 200 && contentType.includes('javascript') && [LEGACY_NAV_CLIENT, LEGACY_JOIN_CLIENT, LEGACY_ROUTER_CLIENT, LEGACY_IDENTITY_CLIENT].some(pattern => pattern.test(url.pathname))) {
      const source = await response.text();
      const branded = LEGACY_IDENTITY_CLIENT.test(url.pathname)
        ? source.replace("img.sizes=size==='orbit'?'(max-width:600px) 160px, 220px'", "img.sizes=size==='orbit'?'(max-width:600px) 64px, 100px'")
        : LEGACY_NAV_CLIENT.test(url.pathname)
        ? source.replaceAll('https://espacios.me/communiverse/sign-in/', 'https://communiverseclubs.com/sign-in/').replaceAll('https://espacios.me/communiverse/join/', 'https://communiverseclubs.com/join/')
        : LEGACY_JOIN_CLIENT.test(url.pathname)
          ? source.replaceAll('https://espacios.me/communiverse/', 'https://communiverseclubs.com/')
          : source.replace('|sign-in|signin|join|', '|').replace('|account|', '|');
      if (branded === source) console.error('Expected legacy client setting was not found', url.pathname);
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.delete('etag');
      headers.set('cache-control', 'public, max-age=31536000, immutable');
      headers.set('x-communiverse-auth-nav', LEGACY_IDENTITY_CLIENT.test(url.pathname) ? PORTRAIT_ASSET_VERSION : NAV_ASSET_VERSION);
      return new Response(branded, { status: response.status, headers });
    }
    if (!targetHost || response.status !== 200 || !contentType.includes('text/html')) return response;
    const signed = !!cookieValue(request, '__Host-cv-account');
    const actions = signed ? '<a class="cv-account-link" href="/account/">My circle</a>' : '<a class="cv-account-link" href="/sign-in/">Sign in</a><a class="cv-account-join" href="/join/">Join</a>';
    const transformed = new HTMLRewriter()
      .on('head', { element(element) { element.append('<style data-cv-account-nav>#cv-social-header .cv-account{gap:4px}#cv-social-header .cv-account a{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:6px 8px;box-sizing:border-box;text-decoration:none}@media(max-width:600px){#cv-social-header .cv-account a{font-size:12px}}</style>' + sharedHeaderStyle, { html: true }); } })
      .on('img[src]', { element(element) {
        const src = element.getAttribute('src');
        const optimized = PORTRAIT_ORIGINALS.get(src);
        if (optimized) { element.setAttribute('src', optimized); element.removeAttribute('srcset'); }
        if (element.getAttribute('data-cv-avatar') === 'orbit' && element.hasAttribute('srcset')) element.setAttribute('sizes', '(max-width: 600px) 64px, 100px');
      } })
      .on('script[src]', { element(element) { const src = element.getAttribute('src'); if (LEGACY_IDENTITY_CLIENT.test(src || '')) element.setAttribute('src', `${src}?v=${PORTRAIT_ASSET_VERSION}`); else if ([LEGACY_NAV_CLIENT, LEGACY_JOIN_CLIENT, LEGACY_ROUTER_CLIENT].some(pattern => pattern.test(src || ''))) element.setAttribute('src', `${src}?v=${NAV_ASSET_VERSION}`); } })
      .on('script[data-cv-account-paused]', { element(element) { element.setInnerContent(pausedAccountScript, { html: true }); } })
      .on('.cv-account', { element(element) { element.setInnerContent(actions, { html: true }); } })
      .transform(response);
    const headers = new Headers(transformed.headers);
    headers.set('x-communiverse-release', 'idrive-accounts-20261115');
    return new Response(transformed.body, { status: transformed.status, headers });
  },
  async scheduled(controller, env, ctx) {
    if (application.scheduled) return application.scheduled(controller, env, ctx);
  },
};
