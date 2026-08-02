import Link from "next/link";

import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div>
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            {site.business.name}
          </Link>

          <p className="text-sm text-slate-500">
            {site.business.city}, {site.business.state}
          </p>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/">Home</Link>

          <Link href="/services">Services</Link>

          <Link href="/about">About</Link>

          <Link href="/contact">Contact</Link>
        </nav>

        <Button>Free Estimate</Button>
      </div>
    </header>
  );
}
