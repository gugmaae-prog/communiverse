import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const base = new URL('./', import.meta.url);
const captured = gunzipSync(await readFile(new URL('espacios-mail-baseline.mjs.gz', base)));
const expected = '61cca1da12155adba664478d3ba3a2f343db94c36b3b7d16e0e19c897db10cb2';
const digest = source => createHash('sha256').update(source).digest('hex');
if (digest(captured) !== expected) throw Error('Espacios Mail baseline changed');
let source = captured.toString('utf8');
function replaceOne(before, after) {
  if (source.split(before).length !== 2) throw Error(`Expected exactly one patch anchor: ${before.slice(0, 70)}`);
  source = source.replace(before, after);
}
function replaceInside(startAnchor, endAnchor, before, after) {
  const start = source.indexOf(startAnchor);
  const end = source.indexOf(endAnchor, start);
  if (start < 0 || end < 0) throw Error('Mail hook section is missing');
  const section = source.slice(start, end);
  if (section.split(before).length !== 2) throw Error(`Expected exactly one section anchor: ${before.slice(0, 70)}`);
  source = source.slice(0, start) + section.replace(before, after) + source.slice(end);
}

replaceOne('function safeSupabaseAuthRedirect(env, candidate, action) {', `function isCommuniverseAuthRedirect(candidate, action) {
  return action === "signup" && candidate === "https://communiverseclubs.com/account/confirm/" ||
    action === "recovery" && candidate === "https://communiverseclubs.com/account/reset/";
}
function safeSupabaseAuthRedirect(env, candidate, action) {
  if (isCommuniverseAuthRedirect(candidate, action)) return candidate;`);

replaceOne('function supabaseAuthEmailCopy(action) {', `function supabaseAuthEmailCopy(action, redirectTo = "") {
  if (isCommuniverseAuthRedirect(redirectTo, action)) {
    return action === "signup"
      ? { subject: "Confirm your Communiverse account", title: "Confirm your email", copy: "Confirm your email to finish creating your Communiverse account.", button: "Confirm and continue" }
      : { subject: "Reset your Communiverse password", title: "Reset your password", copy: "Use this secure link to choose a new Communiverse password.", button: "Reset password" };
  }`);
replaceOne('const copy = supabaseAuthEmailCopy(input.action);', 'const copy = supabaseAuthEmailCopy(input.action, input.redirectTo);\n  const brand = isCommuniverseAuthRedirect(input.redirectTo, input.action) ? "Communiverse" : "Espacios Mail";');
replaceOne('const copy = supabaseAuthEmailCopy(parsed.data.type);', 'const copy = supabaseAuthEmailCopy(parsed.data.type, parsed.data.redirect_to);');
replaceOne('text-transform:uppercase">Espacios Mail</p>', 'text-transform:uppercase">${brand}</p>');
replaceOne('Espacios Mail \\xB7 Secure workspace access</p>', '${brand} \\xB7 Secure account access</p>');
replaceInside('async function sendSupabaseAuthEmail', '__name(sendSupabaseAuthEmail', 'FromEmailAddress: "Espacios Mail <hello@espacios.me>",', 'FromEmailAddress: `${isCommuniverseAuthRedirect(input.redirectTo, input.action) ? "Communiverse" : "Espacios Mail"} <hello@espacios.me>`,');
replaceInside('async function sendSupabaseAuthEmail', '__name(sendSupabaseAuthEmail', 'fromName: "Espacios Mail",\n        replyTo: "hello@espacios.me",\n        subject: rendered.subject,', 'fromName: isCommuniverseAuthRedirect(input.redirectTo, input.action) ? "Communiverse" : "Espacios Mail",\n        replyTo: "hello@espacios.me",\n        subject: rendered.subject,');
replaceInside('async function sendSupabaseAuthEmail', '__name(sendSupabaseAuthEmail', 'const logId = uid("txn_email");\n  await env.DB.prepare(', 'const logId = uid("txn_email");\n  const skipLog = isCommuniverseAuthRedirect(input.redirectTo, input.action);\n  if (!skipLog) await env.DB.prepare(');
replaceInside('async function sendSupabaseAuthEmail', '__name(sendSupabaseAuthEmail', `    await env.DB.prepare(\n      "UPDATE transactional_email_log SET status='sent', ses_message_id=?, completed_at=CURRENT_TIMESTAMP WHERE id=?"`, `    if (!skipLog) await env.DB.prepare(\n      "UPDATE transactional_email_log SET status='sent', ses_message_id=?, completed_at=CURRENT_TIMESTAMP WHERE id=?"`);
replaceInside('async function sendSupabaseAuthEmail', '__name(sendSupabaseAuthEmail', `        await env.DB.prepare(\n          "UPDATE transactional_email_log SET status='sent', ses_message_id=?, completed_at=CURRENT_TIMESTAMP WHERE id=?"`, `        if (!skipLog) await env.DB.prepare(\n          "UPDATE transactional_email_log SET status='sent', ses_message_id=?, completed_at=CURRENT_TIMESTAMP WHERE id=?"`);
replaceInside('async function sendSupabaseAuthEmail', '__name(sendSupabaseAuthEmail', `    await env.DB.prepare(\n      "UPDATE transactional_email_log SET status='failed', error=?, completed_at=CURRENT_TIMESTAMP WHERE id=?"`, `    if (!skipLog) await env.DB.prepare(\n      "UPDATE transactional_email_log SET status='failed', error=?, completed_at=CURRENT_TIMESTAMP WHERE id=?"`);
replaceInside('async function sendSupabaseAuthEmail', '__name(sendSupabaseAuthEmail', `    } catch {\n    }\n    const message2 = errorMessage(error51).slice(0, 500);`, `    } catch (fallbackError) {\n      if (skipLog) console.warn(JSON.stringify({ message: "communiverse_auth_email_fallback_failed", error: errorMessage(fallbackError).replace(/[^\\s@]+@[^\\s@]+/g, "[email]").slice(0, 300) }));\n    }\n    const message2 = errorMessage(error51).slice(0, 500);`);
replaceOne(`  await verifySupabaseJwt(session.access_token, c.env);
  return appendSupabaseSessionCookies(
    c.redirect(redirectTo, 303),`, `  await verifySupabaseJwt(session.access_token, c.env);
  if (isCommuniverseAuthRedirect(redirectTo, parsed.data.type) && session.refresh_token) {
    const handoff = new URL(redirectTo);
    handoff.hash = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: String(session.expires_in ?? 3600),
      token_type: "bearer"
    }).toString();
    const response = c.redirect(handoff.toString(), 303);
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  return appendSupabaseSessionCookies(
    c.redirect(redirectTo, 303),`);

const output = new URL('../build/espacios-mail-patched.mjs', base);
await mkdir(new URL('../build/', base), { recursive: true });
await writeFile(output, source);
console.log(JSON.stringify({ baselineSHA256: expected, patchedSHA256: digest(Buffer.from(source)), bytes: Buffer.byteLength(source) }));
