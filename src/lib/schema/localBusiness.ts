import type { SiteConfig } from "@/types/site";
import { businessEntityId } from "./entity.ts";
import type { JsonLdGraph } from "./types";

export interface LocalBusinessOptions {
  /**
   * Overrides `business.region` for a location page's areaServed (PRD §6:
   * "Location: + LocalBusiness with areaServed"). Phase 4 passes this once
   * `content/locations/*.json` exists; no current page needs it.
   */
  areaServed?: string;
}

/**
 * `@type` comes from `site.schema.businessType` (e.g. "RoofingContractor"),
 * never hardcoded — a niche pack changes the business type by changing this
 * one JSON field, no code change (defect #11).
 *
 * Fields with no data yet (`geo`, `hours`, `sameAs`, empty address parts) are
 * omitted rather than emitted empty. `content/site.json` currently has these
 * blank; the validator warns on it (Phase 1.7) but does not block the build,
 * since the framework is pre-launch. Emitting `"streetAddress": ""` would be
 * worse than omitting the field — never emit a known-false or empty claim.
 */
export function buildLocalBusiness(
  site: SiteConfig,
  options: LocalBusinessOptions = {},
): JsonLdGraph {
  const { business } = site;

  const address: Record<string, unknown> = {
    "@type": "PostalAddress",
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    addressCountry: business.address.country,
  };
  if (business.address.street) address.streetAddress = business.address.street;
  if (business.address.postalCode) address.postalCode = business.address.postalCode;

  const graph: JsonLdGraph = {
    "@type": site.schema.businessType,
    "@id": businessEntityId(site),
    name: business.name,
    telephone: business.phone,
    email: business.email,
    url: site.url,
    address,
    areaServed: options.areaServed ?? business.region,
  };

  if (business.geo.latitude && business.geo.longitude) {
    graph.geo = {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    };
  }
  if (business.hours.length > 0) graph.openingHours = business.hours;
  if (business.sameAs.length > 0) graph.sameAs = business.sameAs;
  if (business.priceRange) graph.priceRange = business.priceRange;

  return graph;
}
