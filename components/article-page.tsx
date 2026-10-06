import type { articles } from "@/data/pages";
import { PillLink } from "@/components/pill-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { home } from "@/data/home";

type Article = (typeof articles)[keyof typeof articles];

export function ArticlePage({ article }: { article: Article }) {
  return (
    <div className="bg-[#121814] text-[#f5f4f1]">
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-5 pb-24 pt-28 md:px-10 md:pt-36">
        <p className="font-serif text-sm italic text-[#a39e94]">{article.eyebrow}</p>
        <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#f5f4f1]/55">{article.kicker}</p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl font-medium leading-[0.95] tracking-tight md:text-6xl">
          {article.heading}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{article.lede}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#f5f4f1]/60">{article.note}</p>
        <div className="mt-8">
          <PillLink href={article.cta.href}>{article.cta.label}</PillLink>
        </div>
        <div className="mt-20 grid gap-16">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <p className="font-serif text-sm italic text-[#a39e94]">{section.eyebrow}</p>
              <h2 className="mt-3 max-w-3xl font-serif text-3xl font-medium leading-tight tracking-tight md:text-5xl">
                {section.heading}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{section.body}</p>
            </section>
          ))}
        </div>
        <section className="mt-20">
          <h2 className="font-serif text-3xl font-medium md:text-5xl">{home.fourWays.heading}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {home.fourWays.items.map((item) => (
              <div key={item.n}>
                <p className="font-serif text-sm italic text-[#a39e94]">{item.n}</p>
                <h3 className="mt-2 text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#f5f4f1]/75">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
