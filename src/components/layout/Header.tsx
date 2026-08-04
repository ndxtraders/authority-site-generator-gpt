import Link from "next/link";

import { getSite } from "@/lib/content";
import CallLink from "@/components/common/CallLink";
import MobileNav from "@/components/layout/MobileNav";
import { buttonVariants } from "@/components/ui/button";

export default function Header() {
  const site = getSite();

  return (
    <header className="relative border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
            {site.business.name}
          </Link>

          <p className="text-sm text-slate-500">
            {site.business.city}, {site.business.state}
          </p>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {site.navigation.links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <CallLink conversion={site.conversion} className="text-sm font-medium text-slate-600 hover:text-slate-900" />
          <Link href="/contact" className={buttonVariants()}>
            {site.navigation.cta}
          </Link>
        </div>

        <MobileNav links={site.navigation.links} cta={site.navigation.cta} conversion={site.conversion} />
      </div>
    </header>
  );
}
