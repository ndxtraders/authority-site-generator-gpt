import { getAllPages, getSite } from "@/lib/content";
import { absoluteUrl } from "@/lib/url";

/**
 * Build the llms.txt body (https://llmstxt.org) — a plain-text map for AI
 * crawlers: what the site is, who it serves, and every page with a one-line
 * description. Derived entirely from content, the same way sitemap.xml is
 * (PRD §6), so it can never drift from what actually exists.
 */
export function buildLlmsTxt(): string {
  const site = getSite();
  const { business } = site;

  const lines = [
    `# ${business.name}`,
    "",
    `> ${business.primaryService} services in ${business.region}.`,
    "",
    "## Pages",
    "",
  ];

  for (const page of getAllPages()) {
    lines.push(`- [${page.seo.title}](${absoluteUrl(page.seo.canonicalPath)}): ${page.seo.description}`);
  }

  lines.push("");
  return lines.join("\n");
}
