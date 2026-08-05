import type { SiteConfig } from "@/types/site";

/** Stable identifiers used to connect every node in the site's entity graph. */
export function businessEntityId(site: SiteConfig): string {
  return `${site.url}/#business`;
}

export function websiteEntityId(site: SiteConfig): string {
  return `${site.url}/#website`;
}

export function pageEntityId(
  site: SiteConfig,
  path: string,
  fragment: string,
): string {
  return `${schemaAbsoluteUrl(site, path)}#${fragment}`;
}

/** Resolve a schema URL without reading application-global content. */
export function schemaAbsoluteUrl(site: SiteConfig, path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`schemaAbsoluteUrl expects a root-relative path, got "${path}"`);
  }
  return path === "/" ? site.url : `${site.url}${path}`;
}
