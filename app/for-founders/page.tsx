import type { Metadata } from "next";
import { ArticlePage } from "@/components/article-page";
import { articles } from "@/data/pages";

export const metadata: Metadata = {
  title: { absolute: articles.founders.metaTitle },
  alternates: { canonical: "/for-founders" },
};

export default function ForFoundersPage() {
  return <ArticlePage article={articles.founders} />;
}
