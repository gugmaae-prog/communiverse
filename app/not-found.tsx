import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#121814] text-[#f5f4f1]">
      <SiteHeader />
      <main className="flex min-h-screen flex-col justify-end px-6 pb-16 pt-32 md:px-16">
        <p className="font-serif text-[clamp(6rem,18vw,14rem)] font-medium leading-none tracking-[-0.06em]">404</p>
        <p className="mt-4 max-w-md font-serif text-[22px] font-medium">This page does not exist.</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-14 w-fit items-center rounded-full border border-[#f5f4f1]/40 px-8 font-sans font-medium hover:bg-[#f5f4f1] hover:text-[#121814]"
        >
          Back to Communiverse
        </Link>
      </main>
    </div>
  );
}
