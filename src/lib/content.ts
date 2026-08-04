import siteData from "../../content/site.json";
import homePage from "../../content/pages/home.json";
import aboutPage from "../../content/pages/about.json";
import servicesPage from "../../content/pages/services.json";
import contactPage from "../../content/pages/contact.json";
import thankYouPage from "../../content/pages/thank-you.json";

import { parseContentBundle } from "@/lib/content-schema";
import type { PageContent, PageType } from "@/types/page";
import type { SiteConfig } from "@/types/site";

/**
 * Content access. This is the only module that knows where content comes from
 * (PROJECT.md Rule 5) — swapping JSON for a CMS or database means changing this
 * file and nothing else.
 *
 * Pages are imported statically rather than read from disk so every route stays
 * statically prerenderable. Adding a page means adding an import and one entry
 * in `PAGES`; Phase 4 replaces this with directory enumeration for the dynamic
 * `[slug]` routes.
 *
 * Imported JSON is untrusted until the shared runtime parser succeeds. The same
 * parser is used by `scripts/validate-content.mts`, so build-time rendering and
 * standalone validation enforce one executable contract.
 */

const parsedContent = parseContentBundle(
  { source: "content/site.json", data: siteData },
  [
    { source: "content/pages/home.json", routePath: "/", data: homePage },
    { source: "content/pages/about.json", routePath: "/about", data: aboutPage },
    { source: "content/pages/services.json", routePath: "/services", data: servicesPage },
    { source: "content/pages/contact.json", routePath: "/contact", data: contactPage },
    {
      source: "content/pages/thank-you.json",
      routePath: "/thank-you",
      data: thankYouPage,
    },
  ],
);

const [home, about, services, contact, thankYou] = parsedContent.pages;

const PAGES = {
  home,
  about,
  services,
  contact,
  "thank-you": thankYou,
} satisfies Record<string, PageContent>;

export type KnownPageSlug = keyof typeof PAGES;

export function getSite(): SiteConfig {
  return parsedContent.site;
}

/** Throws on an unknown slug — a missing page is a build error, not a 404. */
export function getPage(slug: KnownPageSlug): PageContent {
  const page = PAGES[slug];
  if (!page) {
    throw new Error(`No content found for page "${slug}"`);
  }
  return page;
}

export function getAllPages(): PageContent[] {
  return Object.values(PAGES);
}

export function getPagesByType(pageType: PageType): PageContent[] {
  return getAllPages().filter((page) => page.pageType === pageType);
}
