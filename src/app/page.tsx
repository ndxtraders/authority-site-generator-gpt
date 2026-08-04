import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Proof from "@/components/sections/Proof";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";

import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero {...site.hero} />
      <Services {...site.services} />
      <WhyChooseUs {...site.whyChooseUs} />
      <Proof {...site.proof} />
      <Process {...site.process} />
      <Testimonials {...site.testimonials} />
      <FAQ {...site.faq} />
      <CTA {...site.cta} />
    </>
  );
}
