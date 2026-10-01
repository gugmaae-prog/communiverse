import type { Metadata } from "next";
import { ArticlePage } from "@/components/article-page";
import { articles } from "@/data/pages";

export const metadata: Metadata = {
  title: { absolute: articles.about.metaTitle },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <ArticlePage article={articles.about} />;
}
