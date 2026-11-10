import application from './modules/enabled-worker.mjs';
import { unavailableMedia } from '../repairs/account-media-20261109/unavailable-media.mjs';
import { mediaType } from '../repairs/account-media-20261109/media-type.mjs';
import { brandedAccountResponse, legacyAccountRedirect, socialAccountRoute } from './account-links.mjs';
export { RegistrationDelivery, isPublicExperience } from './modules/enabled-worker.mjs';

export default {
  async fetch(request, env, ctx) {
    const redirect = legacyAccountRedirect(request, env);
    const social = redirect ? null : await socialAccountRoute(request, env);
    const response = redirect || social || mediaType(unavailableMedia(await brandedAccountResponse(await application.fetch(request, env, ctx), request, env), request), request);
    const headers = new Headers(response.headers);
    headers.set('X-Communiverse-Release', 'account-cutover-20261110');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
  async scheduled(controller, env, ctx) {
    if (application.scheduled) return application.scheduled(controller, env, ctx);
  },
};
