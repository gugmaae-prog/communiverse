const MAX_BODY_BYTES = 16384;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
  });
}

async function readBody(request) {
  if (Number(request.headers.get("Content-Length")) > MAX_BODY_BYTES) {
    throw new RangeError("Request too large");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing body");
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("Request too large");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

export async function handleWaitlist(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Use POST to submit a request." }, 405, { Allow: "POST" });
  }
  const origin = request.headers.get("Origin");
  if (origin !== new URL(request.url).origin) {
    return json({ error: "Please submit from the Communiverse website." }, 403);
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Please send a JSON request." }, 415);
  }

  try {
    if (!env.WAITLIST_NETWORK_LIMITER) throw new Error("Missing network limiter");
    const network = request.headers.get("CF-Connecting-IP") || "local-preview";
    const { success } = await env.WAITLIST_NETWORK_LIMITER.limit({ key: `communiverse:network:${network}` });
    if (!success) return json({ error: "Please wait a minute before trying again." }, 429, { "Retry-After": "60" });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "waitlist_network_limit_failed",
        errorType: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    return json({ error: "The form is temporarily unavailable. Please try again shortly." }, 503);
  }

  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    return json(
      { error: error instanceof RangeError ? "Your message is too long." : "The request could not be read." },
      error instanceof RangeError ? 413 : 400,
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Check the form and try again." }, 400);
  }
  const payload = body;
  if (payload.website) return json({ error: "Please leave the website field empty." }, 400);

  const fields = [
    ["name", 1, 120],
    ["email", 3, 254],
    ["subject", 0, 160],
    ["message", 8, 4000],
  ];
  const values = { name: "", email: "", subject: "", message: "" };
  const errors = {};
  for (const [key, min, max] of fields) {
    const candidate = payload[key];
    const value = typeof candidate === "string" ? candidate.trim() : "";
    values[key] = value;
    if (value.includes("\u0000")) errors[key] = "Remove the invalid character and try again.";
    else if ([...value].length < min || value.length > max) errors[key] = `Please enter ${min}–${max} characters.`;
  }
  values.email = values.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (Object.keys(errors).length) return json({ error: "Check the highlighted fields.", errors }, 400);
  if (typeof payload.requestId !== "string" || !UUID.test(payload.requestId)) {
    return json({ error: "Refresh the page and try again." }, 400);
  }

  // The database requires a non-empty subject. An empty optional field uses this default.
  values.subject = values.subject || "General enquiry";
  const requestId = payload.requestId;

  try {
    if (!env.WAITLIST_DB || !env.WAITLIST_LIMITER) throw new Error("Missing waitlist bindings");
    const emailHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(values.email));
    const key = Array.from(new Uint8Array(emailHash), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const { success } = await env.WAITLIST_LIMITER.limit({ key: `communiverse:waitlist:${key}` });
    if (!success) return json({ error: "Please wait a minute before trying again." }, 429, { "Retry-After": "60" });

    const result = await env.WAITLIST_DB.prepare(
      "INSERT INTO waitlist_submissions (id, name, email, subject, message) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(id) DO NOTHING",
    )
      .bind(requestId, values.name, values.email, values.subject, values.message)
      .run();
    if (!result.success) throw new Error("Waitlist insert failed");
    if (!result.meta.changes) {
      const existing = await env.WAITLIST_DB.prepare(
        "SELECT name, email, subject, message FROM waitlist_submissions WHERE id = ?1",
      )
        .bind(requestId)
        .first();
      if (!existing || fields.some(([key]) => existing[key] !== values[key])) {
        return json({ error: "This request has changed. Refresh the page before submitting again." }, 409);
      }
    }
    return json({ ok: true, reference: requestId }, result.meta.changes ? 201 : 200);
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "waitlist_save_failed",
        requestId,
        errorType: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    return json(
      { error: "We could not save your request. Please try again, or email hello@communiverseclubs.com." },
      503,
    );
  }
}
