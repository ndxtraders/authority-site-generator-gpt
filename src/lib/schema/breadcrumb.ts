import type { PageContent } from "@/types/page";
import type { SiteConfig } from "@/types/site";
import { schemaAbsoluteUrl } from "./entity.ts";
import type { JsonLdGraph } from "./types";

/**
 * Labels are derived from `page.slug`, not `page.seo.title` — titles carry the
 * "| Business Name" suffix (e.g. "About Us | Acme Co"), which would read wrong
 * as a breadcrumb crumb. The slug is guaranteed present on
 * every page, including future dynamic `[slug]` routes, so this needs no
 * extra content field.
 */
function labelFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * PRD §6 lists BreadcrumbList under "All pages," home included — for home
 * that's a single-item trail back to itself, which is the conventional
 * degenerate case rather than an omission.
 */
export function buildBreadcrumbList(page: PageContent, site: SiteConfig): JsonLdGraph {
  const items =
    page.pageType === "home"
      ? [{ name: labelFromSlug(page.slug), url: schemaAbsoluteUrl(site, page.seo.canonicalPath) }]
      : [
          { name: "Home", url: schemaAbsoluteUrl(site, "/") },
          {
            name: labelFromSlug(page.slug),
            url: schemaAbsoluteUrl(site, page.seo.canonicalPath),
          },
        ];

  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
