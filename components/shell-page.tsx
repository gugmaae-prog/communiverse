import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function ShellPage() {
  return (
    <div className="min-h-screen bg-black">
      <SiteHeader tone="light" />
      <main className="pt-12 lg:pt-[120px]">
        <SiteFooter />
      </main>
    </div>
  );
}
