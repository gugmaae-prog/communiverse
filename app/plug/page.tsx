import type { Metadata } from "next";
import Script from "next/script";
import { loadPlugDirectory, renderPlugShell, SCRIPT, STYLE } from "../../worker/plug.js";

export const metadata: Metadata = {
  title: { absolute: "Plug | Communiverse" },
  description:
    "Find your people. Plug is the Communiverse member network: public profiles, with messages, offers, teams, courses, and ratings on Plug.",
  alternates: { canonical: "/plug" },
};

export default async function PlugPage() {
  let directory: { ok: boolean; members: unknown[] } = { ok: false, members: [] };
  try {
    directory = await loadPlugDirectory();
  } catch {
    directory = { ok: false, members: [] };
  }

  const shell = renderPlugShell(directory);
  const focused = shell.includes('id="cv-person-name"');

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Instrument+Sans:wght@400;500;600&display=swap"
      />
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className={focused ? "cv-plug is-focused" : "cv-plug"} dangerouslySetInnerHTML={{ __html: shell }} />
      <Script id="cv-plug-page" strategy="afterInteractive">
        {SCRIPT}
      </Script>
    </>
  );
}
