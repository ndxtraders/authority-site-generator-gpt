import siteData from "../../content/site.json";
import homePage from "../../content/pages/home.json";
import aboutPage from "../../content/pages/about.json";
import servicesPage from "../../content/pages/services.json";
import contactPage from "../../content/pages/contact.json";
import thankYouPage from "../../content/pages/thank-you.json";

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
 * The casts below are load-bearing but safe: JSON carries no literal types, so
 * `sections[].type` widens to `string` and cannot satisfy the `Section` union on
 * its own. `scripts/validate-content.ts` is what actually proves the shape, and
 * it gates the build via `prebuild`. Never weaken the validator to make a cast
 * pass.
 */

const PAGES = {
  home: homePage as unknown as PageContent,
  about: aboutPage as unknown as PageContent,
  services: servicesPage as unknown as PageContent,
  contact: contactPage as unknown as PageContent,
  "thank-you": thankYouPage as unknown as PageContent,
} satisfies Record<string, PageContent>;

export type KnownPageSlug = keyof typeof PAGES;

export function getSite(): SiteConfig {
  return siteData as unknown as SiteConfig;
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
