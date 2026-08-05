import type { MetadataRoute } from "next";

import { getPage, getSite } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  const site = getSite();
  // Home's SEO description is the closest thing to a canonical site
  // description; there is no separate site-level description field.
  const description = getPage("home").seo.description;

  return {
    name: site.business.name,
    short_name: site.business.name,
    description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    // TEMPORARY: site.branding.primaryColor is a loose color name ("blue"),
    // not a validated color value — "blue" happens to be a legal CSS keyword,
    // but nothing enforces that going forward. Phase 6.1 (PRD D4) replaces
    // `branding` with real color values feeding the design token system;
    // this should read from that instead once it exists.
    theme_color: site.branding.primaryColor,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
