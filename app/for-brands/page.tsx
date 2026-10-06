import type { Metadata } from "next";
import { ArticlePage } from "@/components/article-page";
import { articles } from "@/data/pages";

export const metadata: Metadata = {
  title: { absolute: articles.brands.metaTitle },
  alternates: { canonical: "/for-brands" },
};

export default function ForBrandsPage() {
  return <ArticlePage article={articles.brands} />;
}
