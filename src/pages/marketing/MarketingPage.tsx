import { ArrowRight, Check } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router";
import lnLogo from "@/assets/league-night-logo.png";
import pages from "./marketing-pages.json";
import { resolveMarketingPage } from "./marketingPageData";

export default function MarketingPage() {
  const page = resolveMarketingPage(useLocation().pathname);
  if (!page) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 px-5 py-3 md:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2" aria-label="League Night Pro home">
            <img src={lnLogo} alt="" className="h-10 w-auto" />
            <span className="text-sm font-black tracking-tight">League Night Pro</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-2 py-2 text-sm font-bold text-slate-500 hover:text-slate-950">
              Sign in
            </Link>
            <Link to="/#register" className="rounded-lg bg-slate-950 px-3.5 py-2 text-sm font-bold text-white">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20 md:px-8">
        <section className="py-14 md:py-20">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{page.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
              {page.heading}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{page.intro}</p>
            <Link to="/#register" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
              Start a league <ArrowRight size={15} />
            </Link>
        </section>

        <section className="border-y border-slate-200 py-8" aria-label="Highlights">
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {page.highlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <Check size={16} className="shrink-0 text-emerald-700" /> {highlight}
              </div>
            ))}
          </div>
        </section>

        <section className="py-14">
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {page.sections.map((section) => (
                <article key={section.title} className="py-7">
                  <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">{section.body}</p>
                </article>
              ))}
            </div>
        </section>

        <section className="pb-14">
            <h2 className="text-2xl font-black tracking-tight">Common questions</h2>
            <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="py-4">
                  <summary className="cursor-pointer text-base font-bold">{faq.question}</summary>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
        </section>

        <section className="rounded-2xl bg-slate-50 p-6 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h2 className="text-xl font-black tracking-tight">Run your next season in one place.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create an administrator account and configure the league.</p>
          </div>
          <Link to="/#register" className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white md:mt-0">
            Get started <ArrowRight size={15} />
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-5 py-7 text-xs text-slate-500 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <span>© {new Date().getFullYear()} League Night LLC</span>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Product pages">
            {pages.filter((item) => item.slug !== page.slug).map((item) => (
              <Link key={item.slug} to={`/${item.slug}`} className="hover:text-slate-950">{item.eyebrow}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
