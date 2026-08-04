import { getSite } from "@/lib/content";

/**
 * The only place `site.url` is read to build absolute URLs. Every other module
 * that needs a full URL (sitemap, robots, schema, metadata) goes through this
 * file rather than reading `site.url` directly, so the domain has exactly one
 * point of assembly.
 */

/** Site origin with no trailing slash, e.g. "https://example.com". */
export function siteOrigin(): string {
  const { url } = getSite();
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Resolve a root-relative path against the site origin.
 *
 * `path` must start with "/". Passing "/" itself returns the bare origin with
 * no trailing slash, matching how canonical URLs are conventionally written.
 */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`absoluteUrl expects a root-relative path, got "${path}"`);
  }
  const origin = siteOrigin();
  return path === "/" ? origin : `${origin}${path}`;
}
