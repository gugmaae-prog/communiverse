const PREFIX = "/communiverse";

function strip(pathname) {
  if (pathname === PREFIX) return "/";
  if (pathname.startsWith(`${PREFIX}/`)) return pathname.slice(PREFIX.length) || "/";
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
