import type { MetadataRoute } from "next";

import { getAllPages } from "@/lib/content";
import { absoluteUrl } from "@/lib/url";

/**
 * Enumerates content instead of a hand-maintained list (defect #6) — a new
 * page file appears here automatically. `getAllPages()` is a static import
 * map today (Phase 1) and becomes real directory enumeration once dynamic
 * `[slug]` routes exist (Phase 4); this file does not change either way.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return getAllPages().map((page) => ({
    url: absoluteUrl(page.seo.canonicalPath),
    lastModified: new Date(),
  }));
}
