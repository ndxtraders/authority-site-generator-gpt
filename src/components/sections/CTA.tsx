import Link from "next/link";

import CallLink from "@/components/common/CallLink";
import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import { buttonVariants } from "@/components/ui/button";
import type { CTAProps } from "@/types/sections";
import type { ConversionConfig } from "@/types/site";

export default function CTA({
  eyebrow,
  title,
  description,
  primaryButton,
  secondaryButton,
  conversion,
}: CTAProps & { conversion: ConversionConfig }) {
  return (
    <Section id="cta" className="bg-slate-900">
      <Container>
        <div className="rounded-3xl border border-white/10 bg-slate-950 px-8 py-14 text-center sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-300">{description}</p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/contact" className={buttonVariants({ size: "lg" })}>
              {primaryButton}
            </Link>
            <CallLink
              conversion={conversion}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "border-white/20 bg-white/10 text-white hover:bg-white/20",
              })}
            >
              {secondaryButton}
            </CallLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
