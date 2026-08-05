import type { TestimonialItem } from "@/types/sections";
import type { SiteConfig } from "@/types/site";
import { businessEntityId, pageEntityId } from "./entity.ts";
import type { JsonLdGraph } from "./types";

/**
 * Review + AggregateRating for a page's Testimonials section (PRD §6).
 *
 * `TestimonialItem.rating` is optional. This only builds Review/AggregateRating
 * nodes from testimonials that carry a real rating, and returns `[]` if none
 * do — which is the current state of every site shipped so far. An
 * AggregateRating requires a numeric ratingValue; there is no honest way to
 * produce one without real rating data, and Google treats fabricated review
 * markup as spam. Do not backfill a placeholder rating to make this "work" —
 * ask for real testimonial ratings in content instead.
 */
export function buildReviewGraphs(
  site: SiteConfig,
  pagePath: string,
  items: TestimonialItem[],
): JsonLdGraph[] {
  // A rating in sample content is still unsupported public proof. H.4's
  // production gate verifies the private evidence ledger before a site can use
  // the public-safe `verified` state; that ledger never enters browser output.
  if (site.contentState !== "verified") return [];

  const rated = items.filter(
    (item): item is TestimonialItem & { rating: number } =>
      typeof item.rating === "number" && item.rating >= 1 && item.rating <= 5,
  );

  if (rated.length === 0) return [];

  const reviews: JsonLdGraph[] = rated.map((item, index) => ({
    "@type": "Review",
    "@id": pageEntityId(site, pagePath, `review-${index + 1}`),
    itemReviewed: { "@id": businessEntityId(site) },
    author: { "@type": "Person", name: item.author },
    reviewBody: item.quote,
    reviewRating: {
      "@type": "Rating",
      ratingValue: item.rating,
      bestRating: 5,
      worstRating: 1,
    },
  }));

  const average = rated.reduce((sum, item) => sum + item.rating, 0) / rated.length;

  const aggregate: JsonLdGraph = {
    "@type": "AggregateRating",
    "@id": pageEntityId(site, pagePath, "aggregate-rating"),
    itemReviewed: { "@id": businessEntityId(site) },
    ratingValue: Number(average.toFixed(1)),
    reviewCount: rated.length,
    bestRating: 5,
    worstRating: 1,
  };

  return [aggregate, ...reviews];
}
