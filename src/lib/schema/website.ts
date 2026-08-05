import type { SiteConfig } from "@/types/site";
import { businessEntityId, websiteEntityId } from "./entity.ts";
import type { JsonLdGraph } from "./types";

/** Home only (PRD §6: "Home: + WebSite"), driven by home.json's schema array. */
export function buildWebSite(site: SiteConfig): JsonLdGraph {
  return {
    "@type": "WebSite",
    "@id": websiteEntityId(site),
    name: site.business.name,
    url: site.url,
    publisher: { "@id": businessEntityId(site) },
  };
}
