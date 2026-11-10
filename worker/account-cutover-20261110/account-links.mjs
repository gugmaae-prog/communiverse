const oldOrigins = new Set(['https://espacios.me', 'https://www.espacios.me']);
const accountPath = /^\/(?:sign-in|signin|join|workspace|profile|onboarding|confirm|apply|host|auth)(?:\/|$)/;
const ready = env => env.CV_ACCOUNT_CUTOVER_READY === 'true' && env.CV_APP_BASE_URL === 'https://communiverseclubs.com/account/';

export function brandedAccountURL(value, requestURL) {
  if (typeof value !== 'string' || !value || value.startsWith('#')) return value;
  let target;
  try { target = new URL(value, requestURL); } catch { return value; }
  const publicOrigin = new URL(requestURL).origin;
  if (target.origin !== publicOrigin && !oldOrigins.has(target.origin)) return value;
  const path = target.pathname.replace(/^\/communiverse(?=\/|$)/, '') || '/';
  if (!accountPath.test(path)) return value;
  return '/account' + path + target.search + target.hash;
}

export function legacyAccountRedirect(request, env) {
  if (!ready(env) || !['GET', 'HEAD'].includes(request.method)) return null;
  const url = new URL(request.url);
  if (url.origin !== 'https://communiverseclubs.com') return null;
  const path = url.pathname.replace(/^\/communiverse(?=\/)/, '');
  if (!accountPath.test(path) || /^\/auth\/(?:migration|finish)(?:\/|$)/.test(path)) return null;
  url.pathname = '/account' + path;
  return Response.redirect(url.href, 307);
}

export async function socialAccountRoute(request, env) {
  if (!ready(env) || request.method !== 'GET' || !env.MARKETPLACE) return null;
  const url = new URL(request.url);
  if (url.origin !== 'https://communiverseclubs.com' || !/^\/account\/auth\/(?:google|linkedin|callback)\/?$/.test(url.pathname)) return null;
  url.pathname = url.pathname.replace(/^\/account\//, '/communiverse/');
  const forwarded = new Headers();
  for (const name of ['Cookie']) {
    const value = request.headers.get(name);
    if (value) forwarded.set(name, value);
  }
  const response = await env.MARKETPLACE.fetch(new Request(url.href, forwarded.has('Cookie') ? { headers: forwarded, redirect: 'manual' } : { redirect: 'manual' }));
  const location = response.headers.get('Location');
  if (!location) return response;
  const branded = brandedAccountURL(location, request.url);
  if (branded === location) return response;
  const headers = new Headers(response.headers);
  headers.set('Location', new URL(branded, request.url).href);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function brandedAccountLinks(response, request, env) {
  if (!ready(env)) return response;
  if (!['GET', 'HEAD'].includes(request.method) || !response.headers.get('Content-Type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  for (const key of ['Content-Length', 'Content-Encoding', 'ETag', 'Last-Modified']) headers.delete(key);
  const html = new HTMLRewriter().on('a[href],form[action]', {
    element(element) {
      const attribute = element.tagName === 'form' ? 'action' : 'href';
      const before = element.getAttribute(attribute);
      const after = brandedAccountURL(before, request.url);
      if (after !== before) element.setAttribute(attribute, after);
    },
  }).on('link[rel="canonical"][href],meta[property="og:url"][content]', {
    element(element) {
      const attribute = element.tagName === 'link' ? 'href' : 'content';
      const before = element.getAttribute(attribute);
      const after = brandedAccountURL(before, request.url);
      if (after !== before) element.setAttribute(attribute, new URL(after, request.url).href);
    },
  }).on('script#cv-runtime-config', {
    text(chunk) {
      const before = chunk.text;
      const after = before.replace('"accountOrigin":"https://espacios.me"', '"accountOrigin":"https://communiverseclubs.com"').replace('"accountBase":"https://espacios.me/communiverse/"', '"accountBase":"https://communiverseclubs.com/account/"');
      if (after !== before) chunk.replace(after, { html: false });
    },
  }).transform(new Response(response.body, { status: response.status, statusText: response.statusText, headers }));
  return html;
}

export async function brandedAccountResponse(response, request, env) {
  response = brandedAccountLinks(response, request, env);
  if (!ready(env) || !response.headers.get('Content-Type')?.includes('application/json') || request.method === 'HEAD' || !/^\/(?:communiverse\/)?api\/(?:account|auth|workspace)(?:\/|$)/.test(new URL(request.url).pathname)) return response;
  const body = await response.text();
  if (!body.includes('espacios.me/communiverse/')) return new Response(body, response);
  const rewritten = body.replace(/https:\/\/(?:www\.)?espacios\.me\/communiverse\/(?:sign-in|signin|join|workspace|profile|onboarding|confirm|apply|host|auth)(?:\/[^"\s]*)?/g, url => new URL(brandedAccountURL(url, request.url), request.url).href);
  const headers = new Headers(response.headers);
  for (const key of ['Content-Length', 'Content-Encoding', 'ETag', 'Last-Modified']) headers.delete(key);
  return new Response(rewritten, { status: response.status, statusText: response.statusText, headers });
}
