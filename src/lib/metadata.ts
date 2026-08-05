import type { Metadata } from "next";

import { getSite } from "@/lib/content";
import type { PageContent } from "@/types/page";

/**
 * Build a page's `generateMetadata` return value from its content.
 *
 * Centralized rather than repeated per page because Next merges nested
 * metadata objects (`openGraph`, `alternates`) wholesale, not field-by-field —
 * every page must supply a complete, consistent shape or risk silently losing
 * fields it didn't think to set.
 *
 * `canonicalPath` and any OG image path stay root-relative here; `metadataBase`
 * on the root layout resolves them to absolute URLs. Do not resolve them with
 * `absoluteUrl()` first — see `node_modules/next/dist/docs/.../generate-metadata.md`,
 * "metadataBase": URL-based fields on a segment with `metadataBase` in scope
 * accept a relative path and get composed automatically.
 */
export function buildPageMetadata(page: PageContent): Metadata {
  const site = getSite();
  const { title, description, canonicalPath, indexable, ogImage } = page.seo;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: indexable
      ? undefined
      : {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: site.business.name,
      type: "website",
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
