import type { Key, ReactElement } from "react";

import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Proof from "@/components/sections/Proof";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Authority from "@/components/sections/Authority";
import Answer from "@/components/sections/Answer";
import ContactInfo from "@/components/sections/ContactInfo";
import ContactFormSection from "@/components/sections/ContactForm";

import type { Section } from "@/types/sections";
import type { SiteConfig } from "@/types/site";

export { SECTION_TYPES, isSectionType } from "@/lib/section-types";

/**
 * Render one section from content.
 *
 * This is a switch rather than a component lookup table, deliberately.
 *
 * With a lookup table, `REGISTRY[section.type]` and `section.props` are resolved
 * independently: the first widens to a union of component types, the second to a
 * union of props types, and TypeScript has no way to know the two came from the
 * same union member. The only way to make it compile is a cast or a
 * `@ts-expect-error`, which discards exactly the safety the discriminated union
 * exists to provide — Hero props would happily flow into the FAQ component.
 *
 * A switch narrows `section.type` and `section.props` together, so every case
 * below is fully checked with no casts. The `never` binding in the default case
 * turns a missing case into a compile error, which is what makes an unregistered
 * section type fail the build.
 *
 * `site` is the injection point for sections that need site-wide data on top of
 * their content props — `ContactInfo` needs the business NAP, which must have a
 * single source rather than being copied into every page's JSON. Server
 * Components cannot use React context, so the renderer passes it explicitly and
 * the compiler checks each injection below.
 */
export function renderSection(section: Section, key: Key, site: SiteConfig): ReactElement {
  switch (section.type) {
    case "Hero":
      return <Hero key={key} {...section.props} conversion={site.conversion} />;
    case "Services":
      return <Services key={key} {...section.props} />;
    case "WhyChooseUs":
      return <WhyChooseUs key={key} {...section.props} />;
    case "Proof":
      return <Proof key={key} {...section.props} />;
    case "Process":
      return <Process key={key} {...section.props} />;
    case "Testimonials":
      return <Testimonials key={key} {...section.props} />;
    case "FAQ":
      return <FAQ key={key} {...section.props} />;
    case "CTA":
      return <CTA key={key} {...section.props} conversion={site.conversion} />;
    case "Authority":
      return <Authority key={key} {...section.props} />;
    case "Answer":
      return <Answer key={key} {...section.props} />;
    case "ContactInfo":
      return <ContactInfo key={key} {...section.props} business={site.business} />;
    case "ContactForm":
      return <ContactFormSection key={key} {...section.props} />;
    default: {
      // Unreachable when the switch is exhaustive. Reached only if JSON content
      // carries a type the compiler never saw — the validator's job to prevent.
      const unhandled: never = section;
      throw new Error(
        `Unknown section type: ${JSON.stringify((unhandled as Section).type)}`,
      );
    }
  }
}

/** Render a page's ordered section list. */
export function renderSections(sections: Section[], site: SiteConfig): ReactElement[] {
  return sections.map((section, index) => renderSection(section, index, site));
}
