import type { Metadata } from "next";
import { ArticlePage } from "@/components/article-page";
import { articles } from "@/data/pages";

export const metadata: Metadata = {
  title: { absolute: articles.startups.metaTitle },
  alternates: { canonical: "/for-startups" },
};

export default function ForStartupsPage() {
  return <ArticlePage article={articles.startups} />;
}
