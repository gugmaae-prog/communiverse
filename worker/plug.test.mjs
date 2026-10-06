import assert from "node:assert/strict";
import test from "node:test";
import worker from "./index.js";
import {
  decodeEntities,
  handlePlug,
  loadPlugDirectory,
  matchPlug,
  parseDirectory,
  RELEASE,
  safeImageUrl,
} from "./plug.js";
import {
  circlesOverlap,
  layoutCircles,
  patchProfileHtml,
  presentMembers,
  readPlugCategories,
  stepEase,
  stepSpring,
  tidyName,
} from "./plug-present.js";

const DIRECTORY_URL = "https://espacios-auth-central.thekeifferjapeth.workers.dev/plug";

function article({ slug = "hello", name = "Keiffer Japeth", href = `/plug/u/${slug}`, spec = "Founder", location = "Dubai", image = "https://example.com/a.jpg", chips = ["Architecture"], summary = "Founder at espacios.me", extra = "" } = {}) {
  const avatar = image
    ? `<img class="pc-av" src="${image}" alt="">`
    : `<div class="pc-av pc-av-fb">K</div>`;
  return `<article class="pc" data-slug="${slug}"><div class="pc-head">${avatar}<div><a class="pc-name" href="${href}">${name}</a><div class="pc-spec">${spec}</div><div class="pc-loc">${location}</div></div></div><div class="pc-more"><p>${summary}</p><div class="chips">${chips.map((chip) => `<span class="chip">${chip}</span>`).join("")}</div></div>${extra}</article>`;
}

test("categories, names, layout, and spring overshoot", () => {
  assert.deepEqual(readPlugCategories({ chips: ["Architecture", "ambassador"], plugCategory: "artist" }), ["artist", "ambassador"]);
  assert.deepEqual(readPlugCategories({ chips: ["marketing"] }), []);
  assert.equal(tidyName("VINAYA G S"), "Vinaya G S");
  assert.equal(tidyName("keiffer japeth cantara"), "Keiffer Japeth Cantara");

  const shown = presentMembers([
    { slug: "hello", name: "Keiffer Japeth", spec: "Founder", image: "https://example.com/a.jpg", chips: [], profileUrl: "/communiverse/plug/u/hello" },
    { slug: "keiffer-japeth-25693b", name: "Keiffer Japeth", spec: "Member", image: "/plug/asset/x.jpg", chips: [], profileUrl: "/communiverse/plug/u/keiffer-japeth-25693b" },
    { slug: "keiffer-japeth-57832a", name: "Keiffer Japeth", spec: "Founder", image: "https://example.com/face.jpg", chips: ["ambassador"], profileUrl: "/communiverse/plug/u/keiffer-japeth-57832a" },
    { slug: "keiffer-japeth-cantara-6ed4b8", name: "keiffer japeth cantara", spec: "Founder", image: "https://example.com/c.jpg", chips: [], profileUrl: "/x" },
    { slug: "dilfaz-group-30f2eb", name: "Dilfaz Group", spec: "Founder", image: "https://example.com/logo.jpg", chips: [], profileUrl: "/x" },
    { slug: "gugma-ae-4e8b34", name: "gugma ae", spec: "Baker", chips: [], profileUrl: "/x" },
    { slug: "member-11a676", name: "Member", spec: "Member", chips: [], profileUrl: "/x" },
    { slug: "naina-singh-47e7ca", name: "Naina Singh", spec: "Designer", image: "https://example.com/n.jpg", chips: ["artist"], profileUrl: "/communiverse/plug/u/naina-singh-47e7ca" },
  ]);
  assert.equal(shown.filter((member) => member.name === "Keiffer Japeth").length, 1);
  assert.equal(shown.find((member) => member.name === "Keiffer Japeth").slug, "keiffer-japeth-57832a");
  assert.equal(shown.some((member) => member.slug === "hello" || member.name === "Dilfaz Group" || member.name === "Member"), false);
  assert.equal(shown.find((member) => member.slug === "naina-singh-47e7ca").plugCategories.join(" "), "artist");

  for (const mode of ["wide", "tight"]) {
    const layout = layoutCircles(["a", "b", "c", "d", "e", "f", "g", "h"], mode);
    assert.equal(circlesOverlap(layout), false);
  }

  let pos = 0;
  let vel = 0;
  let peak = 0;
  for (let i = 0; i < 60; i += 1) {
    [pos, vel] = stepSpring(pos, vel, 100, 1 / 60);
    peak = Math.max(peak, pos);
  }
  assert.ok(peak > 108, `expected overshoot, peak ${peak}`);
  assert.ok(Math.abs(pos - 100) < 3, `expected to settle within a second, at ${pos}`);
  const eased = stepEase(0, 100, 0.22, 0.22);
  assert.ok(eased > 50 && eased < 80);

  const broken = `<body><script>var ap=location.pathname.replace(//$/,"");var next=1;</script></body>`;
  const fixed = patchProfileHtml(broken);
  assert.equal(fixed.includes('replace(//$/,"")'), false);
  assert.match(fixed, /Back to Communiverse/);
  assert.doesNotThrow(() => new Function(fixed.match(/<script>([\s\S]*?)<\/script>/)[1]));
});

test("parseDirectory keeps public cards and drops unsafe ones", () => {
  const html = [
    article(),
    article({
      slug: "ada-lovelace-1",
      name: "Ada <script>alert(1)</script> Lovelace",
      spec: "Engineer",
      image: "javascript:alert(1)",
      chips: ["Systems", "ada@example.com", "555-010-0199"],
      summary: "Builds tools",
    }),
    article({ slug: "../secret", name: "Nope" }),
    article({ slug: "mismatch", href: "/plug/u/other", name: "Mismatch" }),
    `<article class="story" data-slug="hello"><a class="pc-name" href="/plug/u/hello">Duplicate shape</a></article>`,
  ].join("");
  const members = parseDirectory(html);
  assert.equal(members.length, 2);
  assert.equal(members[0].profileUrl, "/communiverse/plug/u/hello");
  assert.equal(members[0].name, "Keiffer Japeth");
  assert.equal(members[0].chips[0], "Architecture");
  assert.equal(members[1].name, "Ada alert(1) Lovelace");
  assert.equal(members[1].image, "");
  assert.deepEqual(members[1].chips, ["Systems"]);
  assert.equal(safeImageUrl("/plug/asset/e2c/avatars/x.jpg"), `${DIRECTORY_URL.replace(/\/plug$/, "")}/plug/asset/e2c/avatars/x.jpg`);
  assert.equal(safeImageUrl("http://example.com/a.jpg"), "");
  assert.equal(decodeEntities("Dubai &amp; Co"), "Dubai & Co");
});

test("matchPlug serves the people page and ignores other routes and hosts", () => {
  assert.equal(matchPlug(new URL("https://espacios.me/communiverse/plug")), "page");
  assert.equal(matchPlug(new URL("https://www.espacios.me/communiverse/plug/")), "page");
  assert.equal(matchPlug(new URL("https://espacios.me/communiverse/people/")), "people");
  assert.equal(matchPlug(new URL(`https://espacios.me/communiverse/_public/${RELEASE}.css`)), "css");
  assert.deepEqual(matchPlug(new URL("https://espacios.me/communiverse/plug/u/hello")), { kind: "profile", slug: "hello" });
  assert.equal(matchPlug(new URL("https://espacios.me/communiverse/ambassadors/")), null);
  assert.equal(matchPlug(new URL("https://espacios.me/communiverse/makers/")), null);
  assert.equal(matchPlug(new URL("https://espacios.me/communiverse/")), null);
  assert.equal(matchPlug(new URL("https://espacios.me/plug")), null);
  assert.equal(matchPlug(new URL("https://example.com/communiverse/plug/")), null);
  assert.equal(matchPlug(new URL("https://espacios.me.evil.test/communiverse/plug/")), null);
});

test("handler renders members, redirects people, and rejects other methods", async () => {
  const html = `<section>${article()}${article({ slug: "naina-singh-47e7ca", name: "Naina Singh", spec: "Designer", location: "Iloilo" })}</section>`;
  const fetchImpl = async () => {
    const response = new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    Object.defineProperty(response, "url", { value: DIRECTORY_URL });
    return response;
  };
  const page = await handlePlug(new Request("https://espacios.me/communiverse/plug/"), { fetchImpl });
  assert.equal(page.status, 200);
  assert.equal(page.headers.get("x-communiverse-release"), RELEASE);
  assert.match(page.headers.get("content-type"), /text\/html/);
  const body = await page.text();
  assert.match(body, /Find your people/);
  assert.match(body, /data-filter="communiverse"/);
  assert.match(body, /data-filter="ambassador"/);
  assert.match(body, /data-filter="artist"/);
  assert.match(body, />All</);
  assert.match(body, /\/communiverse\/plug\/u\/naina-singh-47e7ca/);
  assert.doesNotMatch(body, /plug\/u\/hello/);
  assert.match(body, /Naina Singh/);
  assert.doesNotMatch(body, /Send an Offer|Ask Aether|mailto:/);
  assert.equal(await handlePlug(new Request("https://example.com/communiverse/plug/"), { fetchImpl }), null);
  assert.equal(await handlePlug(new Request("https://espacios.me/communiverse/makers/"), { fetchImpl }), null);

  const redirect = await handlePlug(new Request("https://www.espacios.me/communiverse/people"));
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get("location"), "https://www.espacios.me/communiverse/plug/");

  const denied = await handlePlug(new Request("https://espacios.me/communiverse/plug/", { method: "POST" }));
  assert.equal(denied.status, 405);

  const css = await handlePlug(new Request(`https://espacios.me/communiverse/_public/${RELEASE}.css`));
  const cssText = await css.text();
  assert.match(cssText, /\.cv-plug/);
  assert.match(cssText, /#f3f6fb/);
  assert.doesNotMatch(cssText, /background-size:\s*18px/);
});

test("a failed directory fetch still explains Plug and invents nobody", async () => {
  const fetchImpl = async () => {
    throw new Error("offline");
  };
  const page = await handlePlug(new Request("https://espacios.me/communiverse/plug"), { fetchImpl });
  const body = await page.text();
  assert.equal(page.status, 200);
  assert.match(body, /https:\/\/espacios\.me\/plug/);
  assert.match(body, /could not read the public member directory/);
  assert.doesNotMatch(body, /data-slug=/);
});

test("worker routing serves plug and leaves other communiverse paths alone", async () => {
  const seen = [];
  const env = {
    ASSETS: {
      fetch(request) {
        seen.push(new URL(request.url).pathname);
        return new Response(`asset:${new URL(request.url).pathname}`, { status: 200 });
      },
    },
  };
  const plug = await worker.fetch(new Request("https://espacios.me/communiverse/plug/"), env);
  assert.equal(plug.status, 200);
  assert.equal(plug.headers.get("x-communiverse-release"), RELEASE);
  const plugBody = await plug.text();
  assert.match(plugBody, /Find your people/);
  assert.doesNotMatch(plugBody, /Send an Offer/);
  assert.deepEqual(seen, []);

  const makers = await worker.fetch(new Request("https://espacios.me/communiverse/makers"), env);
  assert.equal(await makers.text(), "asset:/makers/");

  const ambassadors = await worker.fetch(new Request("https://www.espacios.me/communiverse/ambassadors/"), env);
  const ambassadorsBody = await ambassadors.text();
  assert.match(ambassadorsBody, /Find the makers/);
  assert.match(ambassadors.headers.get("x-communiverse-release") || "", /ambassadors/);
  assert.match(ambassadorsBody, /\/communiverse\/plug\//);

  const local = await worker.fetch(new Request("http://127.0.0.1/communiverse/plug/"), env);
  assert.match(await local.text(), /^asset:/);

  const nested = await worker.fetch(new Request("https://espacios.me/communiverse/plug/u/haseeb-wasim-5626fe"), env);
  const profile = await nested.text();
  assert.match(profile, /Back to Communiverse/);
  assert.equal(profile.includes('replace(//$/,"")'), false);
  assert.deepEqual(seen, ["/makers/", "/plug/"]);
});

test("loadPlugDirectory reads the live public directory", async () => {
  const directory = await loadPlugDirectory();
  assert.equal(directory.ok, true);
  assert.ok(directory.members.length > 10, `expected public profiles, got ${directory.members.length}`);
  for (const member of directory.members) {
    assert.match(member.profileUrl, /^\/communiverse\/plug\/u\/[a-z0-9-]+$/i);
    assert.ok(member.name);
    assert.equal(member.name.includes("<"), false);
  }
  assert.ok(directory.members.some((member) => member.slug === "hello"));
});
