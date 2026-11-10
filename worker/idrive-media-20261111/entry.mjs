import application from './build/optimized-public-worker.mjs';
import { unavailableMedia } from '../repairs/account-media-20261109/unavailable-media.mjs';
import { mediaType } from '../repairs/account-media-20261109/media-type.mjs';
import portraits from './verified-portraits.json';

export { RegistrationDelivery, isPublicExperience } from './build/optimized-public-worker.mjs';

const GATEWAY = 'https://e5bb9d53-espacios-ai-router.thekeifferjapeth.workers.dev';
const verifiedPaths = new Set(portraits.map(record => record.path));
const publicHosts = new Set(['communiverseclubs.com', 'www.communiverseclubs.com']);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if ((request.method === 'GET' || request.method === 'HEAD') && publicHosts.has(url.hostname) && !url.search && verifiedPaths.has(url.pathname)) {
      try {
        const stored = await fetch(GATEWAY + '/cv-media' + url.pathname, { method: request.method, signal: AbortSignal.timeout(30000) });
        if (stored.status === 200 && stored.headers.get('content-type')?.startsWith('image/')) {
          const headers = new Headers(stored.headers);
          headers.set('X-Communiverse-Media-Storage', 'idrive-e2');
          headers.delete('set-cookie');
          return new Response(request.method === 'HEAD' ? null : stored.body, { status: 200, headers });
        }
        await stored.body?.cancel();
      } catch { /* Use the current verified public asset route if IDrive is unavailable. */ }
    }
    const response = mediaType(unavailableMedia(await application.fetch(request, env, ctx), request), request);
    const contentType = response.headers.get('content-type') || '';
    const publicHTML = response.status === 200 && publicHosts.has(url.hostname) && contentType.toLowerCase().includes('text/html');
    const visible = publicHTML
      ? new HTMLRewriter().on('.cv-account-unavailable', { element(element) { element.remove(); } }).transform(response)
      : response;
    const headers = new Headers(visible.headers);
    headers.set('X-Communiverse-Release', 'idrive-media-20261111-header');
    return new Response(visible.body, { status: visible.status, statusText: visible.statusText, headers });
  },
  async scheduled(controller, env, ctx) {
    if (application.scheduled) return application.scheduled(controller, env, ctx);
  },
};
