import type { PageContent } from "@/types/page";
import type { SiteConfig } from "@/types/site";

import { buildLocalBusiness } from "./localBusiness";
import { buildBreadcrumbList } from "./breadcrumb";
import { buildFAQPage } from "./faq";
import { buildReviewGraphs } from "./review";
import { buildWebSite } from "./website";
import { buildService } from "./service";
import type { JsonLdGraph } from "./types";

export type { JsonLdGraph } from "./types";

/**
 * Build every schema.org graph a page should emit, per PRD §6.
 *
 * Two sources feed this, deliberately kept separate:
 *
 * - **Always, every page:** LocalBusiness and BreadcrumbList. Not driven by
 *   `page.schema` — every site needs its entity signal on every page.
 * - **Automatic, from section presence:** an FAQ section adds FAQPage; a
 *   Testimonials section with real ratings adds Review + AggregateRating.
 *   This is unconditional — a content author cannot forget to declare it,
 *   and cannot declare it without the section existing to back it.
 * - **Explicit, from `page.schema`:** WebSite and Service, which need a
 *   page-level intent (only home is a WebSite; only a `pageType: "service"`
 *   page is a Service) rather than being inferable from sections alone.
 */
export function buildSchema(page: PageContent, site: SiteConfig): JsonLdGraph[] {
  const graphs: JsonLdGraph[] = [buildLocalBusiness(site), buildBreadcrumbList(page)];

  for (const section of page.sections) {
    if (section.type === "FAQ") {
      graphs.push(buildFAQPage(section.props.items));
    }
    if (section.type === "Testimonials") {
      graphs.push(...buildReviewGraphs(section.props.items));
    }
  }

  if (page.schema.includes("WebSite")) {
    graphs.push(buildWebSite(site));
  }

  if (page.schema.includes("Service") && page.pageType === "service") {
    graphs.push(
      buildService(site.business, {
        name: page.seo.title,
        description: page.seo.description,
        path: page.seo.canonicalPath,
      }),
    );
  }

  return graphs;
}
