import type { PageContent } from "@/types/page";
import type { SiteConfig } from "@/types/site";

import { buildLocalBusiness } from "./localBusiness.ts";
import { buildBreadcrumbList } from "./breadcrumb.ts";
import { buildFAQPage } from "./faq.ts";
import { buildReviewGraphs } from "./review.ts";
import { buildWebSite } from "./website.ts";
import { buildService } from "./service.ts";
import type { JsonLdGraph } from "./types";

export type { JsonLdGraph } from "./types.ts";

export interface BuildSchemaOptions {
  /** Verified location name supplied by Phase 4 location content. */
  areaServed?: string;
}

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
export function buildSchema(
  page: PageContent,
  site: SiteConfig,
  options: BuildSchemaOptions = {},
): JsonLdGraph[] {
  const graphs: JsonLdGraph[] = [
    buildLocalBusiness(site, { areaServed: options.areaServed }),
    buildBreadcrumbList(page, site),
  ];

  for (const section of page.sections) {
    if (section.type === "FAQ") {
      graphs.push(buildFAQPage(section.props.items));
    }
    if (section.type === "Testimonials") {
      graphs.push(
        ...buildReviewGraphs(site, page.seo.canonicalPath, section.props.items),
      );
    }
  }

  if (page.schema.includes("WebSite")) {
    graphs.push(buildWebSite(site));
  }

  if (page.schema.includes("Service") && page.pageType === "service") {
    graphs.push(
      buildService(site, {
        name: page.seo.title,
        description: page.seo.description,
        path: page.seo.canonicalPath,
      }),
    );
  }

  return graphs;
}
