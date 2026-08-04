import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { buildSchema } from "@/lib/schema";
import { getLegalPage, isLegalSlug, LEGAL_SLUGS } from "@/lib/legal";
import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import JsonLd from "@/components/common/JsonLd";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  return buildPageMetadata(getLegalPage(slug, getSite()).page);
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();

  const site = getSite();
  const legal = getLegalPage(slug, site);

  return (
    <>
      <JsonLd graphs={buildSchema(legal.page, site)} />
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {legal.title}
            </h1>

            <div className="mt-10 space-y-8">
              {legal.blocks.map((block) => (
                <div key={block.heading}>
                  <h2 className="text-lg font-semibold text-slate-900">{block.heading}</h2>
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
