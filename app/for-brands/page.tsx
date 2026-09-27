import type { Metadata } from "next";
import { ShellPage } from "@/components/shell-page";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  alternates: { canonical: "/for-brands" },
};

export default function ForBrandsPage() {
  return <ShellPage />;
}
