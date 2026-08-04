import type { Metadata } from "next";

import { getPage, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { renderSections } from "@/lib/sections";
import { buildSchema } from "@/lib/schema";
import JsonLd from "@/components/common/JsonLd";

export function generateMetadata(): Metadata {
  return buildPageMetadata(getPage("home"));
}

export default function HomePage() {
  const site = getSite();
  const page = getPage("home");
  return (
    <>
      <JsonLd graphs={buildSchema(page, site)} />
      {renderSections(page.sections, site)}
    </>
  );
}
