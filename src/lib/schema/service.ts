import type { SiteConfig } from "@/types/site";
import { businessEntityId, pageEntityId, schemaAbsoluteUrl } from "./entity.ts";
import type { JsonLdGraph } from "./types";

export interface ServiceInput {
  name: string;
  description: string;
  /** Root-relative path to the service's own page. */
  path: string;
}

/**
 * PRD §6: "Service: + Service" for pageType "service" pages.
 *
 * No content of that page type exists yet — `/services/[slug]` is Phase 4
 * (Hub-and-spoke routing). Built now so 2.3 delivers the full schema module
 * set the plan lists; `buildSchema` below wires it the moment a page declares
 * `pageType: "service"`, using that page's own seo.title/description as the
 * service name/description.
 */
export function buildService(site: SiteConfig, service: ServiceInput): JsonLdGraph {
  const { business } = site;

  return {
    "@type": "Service",
    "@id": pageEntityId(site, service.path, "service"),
    name: service.name,
    description: service.description,
    url: schemaAbsoluteUrl(site, service.path),
    serviceType: business.primaryService,
    provider: { "@id": businessEntityId(site) },
    areaServed: business.region,
  };
}
