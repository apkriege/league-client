import { useEffect } from "react";
import { Link } from "react-router";
import lnLogo from "@/assets/league-night-logo.png";
import { publicLinks } from "@/config/publicLinks";
import type { LegalDocument } from "./legalDocuments";

type LegalDocumentPageProps = {
  document: LegalDocument;
};

const policyLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refunds", href: "/refunds" },
];

export default function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  useEffect(() => {
    const previousTitle = window.document.title;
    window.document.title = `${document.title} | League Night Pro`;
    return () => {
      window.document.title = previousTitle;
    };
  }, [document.title]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="League Night Pro home">
            <img src={lnLogo} alt="" className="h-11 w-auto" />
            <span className="text-sm font-black tracking-wide">League Night Pro</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <Link to="/" className="transition hover:text-slate-950">
              Home
            </Link>
            <Link to="/login" className="rounded-lg bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <div className="mb-8 border-b border-slate-200 pb-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">League Night LLC</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{document.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{document.description}</p>
          <p className="mt-4 text-xs font-semibold text-slate-500">Effective {document.effectiveDate}</p>
        </div>

        <article className="space-y-8">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-black tracking-tight text-slate-900">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-600">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-6 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} League Night LLC. All rights reserved.</span>
          <nav className="flex flex-wrap gap-4 font-bold text-slate-700" aria-label="Legal policies">
            {policyLinks.map((link) => (
              <Link key={link.href} to={link.href} className="transition hover:text-blue-700">
                {link.label}
              </Link>
            ))}
            {publicLinks.supportEmail && (
              <a href={`mailto:${publicLinks.supportEmail}`} className="transition hover:text-blue-700">
                Contact
              </a>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
