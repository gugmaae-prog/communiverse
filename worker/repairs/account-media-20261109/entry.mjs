import application from './modules/optimized-worker.mjs';
import { unavailableMedia } from './unavailable-media.mjs';
import { mediaType } from './media-type.mjs';
export { RegistrationDelivery, isPublicExperience } from './modules/optimized-worker.mjs';
export default {
  async fetch(request, env, ctx) {
    const response = mediaType(unavailableMedia(await application.fetch(request, env, ctx), request), request);
    const headers = new Headers(response.headers);
    headers.set('X-Communiverse-Repair', 'media-finish-20261109');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
  async scheduled(controller, env, ctx) {
    if (application.scheduled) return application.scheduled(controller, env, ctx);
  }
};
