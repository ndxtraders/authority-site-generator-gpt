import type { Metadata } from "next";

import { getPage, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { renderSections } from "@/lib/sections";
import { buildSchema } from "@/lib/schema";
import JsonLd from "@/components/common/JsonLd";

export function generateMetadata(): Metadata {
  return buildPageMetadata(getPage("about"));
}

export default function AboutPage() {
  const site = getSite();
  const page = getPage("about");
  return (
    <>
      <JsonLd graphs={buildSchema(page, site)} />
      {renderSections(page.sections, site)}
    </>
  );
}
