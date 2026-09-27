import type { Metadata } from "next";
import { ShellPage } from "@/components/shell-page";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  alternates: { canonical: "/for-founders" },
};

export default function ForFoundersPage() {
  return <ShellPage />;
}
