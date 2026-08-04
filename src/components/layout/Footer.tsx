import Link from "next/link";

import { getSite } from "@/lib/content";
import { LEGAL_SLUGS } from "@/lib/legal";
import CallLink from "@/components/common/CallLink";

const LEGAL_LABELS: Record<(typeof LEGAL_SLUGS)[number], string> = {
  "privacy-policy": "Privacy Policy",
  "terms-conditions": "Terms & Conditions",
  disclaimer: "Disclaimer",
  accessibility: "Accessibility",
};

export default function Footer() {
  const site = getSite();

  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16 text-slate-300 lg:px-8">
        <h3 className="text-2xl font-semibold text-white">{site.business.name}</h3>

        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
          {site.footer.headline}
        </p>

        <div className="mt-8 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:gap-6">
          <CallLink conversion={site.conversion} className="hover:text-white" />
          <span>{site.business.email}</span>
          <span>{site.business.region}</span>
        </div>

        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          {LEGAL_SLUGS.map((slug) => (
            <Link key={slug} href={`/${slug}`} className="hover:text-slate-300">
              {LEGAL_LABELS[slug]}
            </Link>
          ))}
        </nav>

        <p className="mt-10 text-sm text-slate-500">{site.footer.copyright}</p>
      </div>
    </footer>
  );
}
