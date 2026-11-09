const TYPES = {webp:'image/webp', jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', avif:'image/avif', gif:'image/gif', svg:'image/svg+xml', ico:'image/x-icon'};
export function mediaType(response, request) {
  const u = new URL(request.url);
  if (!['communiverseclubs.com','www.communiverseclubs.com','preview.communiverseclubs.com'].includes(u.hostname) || !['GET','HEAD'].includes(request.method) || !response.ok) return response;
  const type = TYPES[u.pathname.match(/\.([a-z]+)$/i)?.[1]?.toLowerCase()];
  if (!type || !/^application\/octet-stream(?:;|$)/i.test(response.headers.get('Content-Type') || '')) return response;
  const headers = new Headers(response.headers);
  headers.set('Content-Type', type);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
