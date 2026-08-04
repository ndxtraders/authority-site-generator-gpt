import siteData from "../../content/site.json";
import type { SiteContent } from "../types/site";

export const site: SiteContent = siteData as SiteContent;

export function getSiteContent() {
  return site;
}

