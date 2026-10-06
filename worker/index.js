import { handleWaitlist } from "./waitlist.js";

const PREFIX = "/communiverse";

function strip(pathname) {
  if (pathname === PREFIX) return "/";
  if (pathname.startsWith(`${PREFIX}/`)) return pathname.slice(PREFIX.length) || "/";
  return null;
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set(
    "Content-Security-Policy",
    "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Path rewriting ignores the host, so espacios.me and www.espacios.me
    // serve the same /communiverse paths.
    const stripped = strip(url.pathname);
    if (stripped == null) {
      return new Response("Not found", { status: 404 });
    }

    if (stripped.replace(/\/$/, "") === "/api/waitlist") return handleWaitlist(request, env);
    if (stripped.startsWith("/api/")) return new Response("Not found", { status: 404 });
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    // Serve directory indexes directly so /communiverse/contact is the contact page,
    // and /communiverse is the home page, without a redirect that drops the base path.
    const last = stripped.split("/").pop() ?? "";
    url.pathname = stripped.endsWith("/") || last.includes(".") ? stripped : `${stripped}/`;

    const response = await env.ASSETS.fetch(new Request(url, request));
    return withSecurityHeaders(response);
  },
};

export default worker;
