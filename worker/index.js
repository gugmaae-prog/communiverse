import { handleAmbassadors } from "./ambassadors.js";
import { handlePlug } from "./plug.js";

const PREFIX = "/communiverse";

function strip(pathname) {
  if (pathname === PREFIX) return "/";
  if (pathname.startsWith(`${PREFIX}/`)) return pathname.slice(PREFIX.length) || "/";
  return null;
}

export default {
  async fetch(request, env) {
    const ambassadors = handleAmbassadors(request);
    if (ambassadors) return ambassadors;

    // Plug is a public directory page. It does not replace other Communiverse routes.
    const plug = await handlePlug(request);
    if (plug) return plug;

    const url = new URL(request.url);
    // Path rewriting ignores the host, so espacios.me and www.espacios.me
    // serve the same /communiverse paths.
    const stripped = strip(url.pathname);
    if (stripped == null) {
      return new Response("Not found", { status: 404 });
    }

    // Serve directory indexes directly so /communiverse/contact is the contact page,
    // and /communiverse is the home page, without a redirect that drops the base path.
    const last = stripped.split("/").pop() ?? "";
    url.pathname = stripped.endsWith("/") || last.includes(".") ? stripped : `${stripped}/`;

    return env.ASSETS.fetch(new Request(url, request));
  },
};
