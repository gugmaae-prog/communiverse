import application from '../build/worker.mjs';
export { RegistrationDelivery } from '../build/worker.mjs';

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!['localhost', '127.0.0.1', 'communiverseclubs.com'].includes(url.hostname) && !url.hostname.endsWith('.workers.dev')) {
      return new Response('Development host only', { status: 403 });
    }
    url.protocol = 'https:';
    url.host = 'communiverseclubs.com';
    return application.fetch(new Request(url, request), env, ctx);
  },
};
