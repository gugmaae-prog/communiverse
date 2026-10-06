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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="cv-plug" dangerouslySetInnerHTML={{ __html: renderPlugShell(directory) }} />
      <Script id="cv-plug-page" strategy="afterInteractive">
        {SCRIPT}
      </Script>
    </>
  );
}
