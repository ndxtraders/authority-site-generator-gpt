"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import CallLink from "@/components/common/CallLink";
import { buttonVariants } from "@/components/ui/button";
import type { ConversionConfig, NavigationLink } from "@/types/site";

export interface MobileNavProps {
  links: NavigationLink[];
  cta: string;
  conversion: ConversionConfig;
}

/**
 * Header's mobile disclosure menu. Isolated in its own client component so
 * `Header` itself stays a Server Component — only the toggle needs state.
 */
export default function MobileNav({ links, cta, conversion }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {open ? (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full z-50 border-b border-slate-200 bg-white px-6 py-6 shadow-lg"
        >
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-slate-700 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
            <CallLink
              conversion={conversion}
              className="text-base font-medium text-slate-700 hover:text-slate-900"
            />
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className={buttonVariants({ className: "w-full justify-center" })}
            >
              {cta}
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
