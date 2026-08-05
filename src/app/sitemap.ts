import type { MetadataRoute } from "next";

import { getAllPages, getSite } from "@/lib/content";
import { getAllLegalPages } from "@/lib/legal";
import { absoluteUrl } from "@/lib/url";

/**
 * Enumerates content instead of a hand-maintained list (defect #6) — a new
 * page file appears here automatically. `getAllPages()` is a static import
 * map today (Phase 1) and becomes real directory enumeration once dynamic
 * `[slug]` routes exist (Phase 4); this file does not change either way.
 *
 * Legal pages are generated rather than authored (`src/lib/legal.ts`), so they
 * are enumerated separately rather than living in `getAllPages()`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...getAllPages(), ...getAllLegalPages(getSite()).map((legal) => legal.page)];

  return pages
    .filter((page) => page.seo.indexable)
    .map((page) => ({
      url: absoluteUrl(page.seo.canonicalPath),
    }));
}
