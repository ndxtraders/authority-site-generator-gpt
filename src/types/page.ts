import type { Section } from "./sections";

/**
 * Page content. Every page in `content/` conforms to this shape regardless of
 * type, which is what lets one loader and one renderer serve all of them.
 */

export type PageType =
  | "home"
  | "about"
  | "contact"
  | "services"
  | "service"
  | "location"
  | "faq"
  | "legal"
  | "thank-you";

/** schema.org graphs a page opts into. Others are added automatically. */
export type SchemaGraph =
  | "WebSite"
  | "Service"
  | "FAQPage"
  | "BreadcrumbList"
  | "LocalBusiness"
  | "Review";

export interface PageSeo {
  title: string;
  description: string;
  /** Root-relative path, e.g. "/services". Resolved against `site.url`. */
  canonicalPath: string;
  ogImage?: string;
}

export interface PageContent {
  slug: string;
  pageType: PageType;
  seo: PageSeo;
  schema: SchemaGraph[];
  sections: Section[];
  internalLinks: string[];
}
