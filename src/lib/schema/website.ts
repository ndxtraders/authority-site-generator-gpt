import type { SiteConfig } from "@/types/site";
import type { JsonLdGraph } from "./types";

/** Home only (PRD §6: "Home: + WebSite"), driven by home.json's schema array. */
export function buildWebSite(site: SiteConfig): JsonLdGraph {
  return {
    "@type": "WebSite",
    name: site.business.name,
    url: site.url,
  };
}
