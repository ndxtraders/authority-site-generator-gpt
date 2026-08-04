import Hero from "@/components/sections/Hero";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Proof from "@/components/sections/Proof";

import { site } from "@/lib/site";

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About Us"
        headline="A local roofing team built on trust and clear communication"
        subheadline="We combine hands-on experience with responsive service so homeowners can feel confident every step of the way."
        primaryButton={site.hero.primaryButton}
        secondaryButton={site.hero.secondaryButton}
      />
      <WhyChooseUs
        eyebrow={site.whyChooseUs.eyebrow}
        title={site.whyChooseUs.title}
        description={site.whyChooseUs.description}
        items={site.whyChooseUs.items}
      />
      <Proof
        eyebrow={site.proof.eyebrow}
        title={site.proof.title}
        description={site.proof.description}
        stats={site.proof.stats}
      />
    </>
  );
}
