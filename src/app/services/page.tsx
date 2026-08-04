import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import CTA from "@/components/sections/CTA";

import { site } from "@/lib/site";

export default function ServicesPage() {
  return (
    <>
      <Hero
        eyebrow={site.hero.eyebrow}
        headline="Reliable roofing services for every stage of ownership"
        subheadline="Whether you need a quick repair, a full replacement, or a professional inspection, our team is ready to help."
        primaryButton={site.hero.primaryButton}
        secondaryButton={site.hero.secondaryButton}
      />
      <Services
        eyebrow={site.services.eyebrow}
        title={site.services.title}
        description={site.services.description}
        items={site.services.items}
      />
      <CTA
        eyebrow={site.cta.eyebrow}
        title={site.cta.title}
        description={site.cta.description}
        primaryButton={site.cta.primaryButton}
        secondaryButton={site.cta.secondaryButton}
      />
    </>
  );
}
