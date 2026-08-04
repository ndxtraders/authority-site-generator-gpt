import type { SectionType } from "../types/sections.ts";

/**
 * Every section type, as a runtime value.
 *
 * Typing this as `Record<SectionType, true>` makes the compiler enforce both
 * directions: omit a section type and the object is missing a key, invent one
 * and the key is not assignable.
 *
 * This lives apart from `sections.tsx` on purpose — the content validator runs
 * in plain Node and must not pull React components into its import graph.
 */
const SECTION_TYPE_SET: Record<SectionType, true> = {
  Hero: true,
  Services: true,
  WhyChooseUs: true,
  Proof: true,
  Process: true,
  Testimonials: true,
  FAQ: true,
  CTA: true,
  Authority: true,
  Answer: true,
  ContactInfo: true,
  ContactForm: true,
};

export const SECTION_TYPES = Object.keys(SECTION_TYPE_SET) as SectionType[];

export function isSectionType(value: string): value is SectionType {
  return Object.prototype.hasOwnProperty.call(SECTION_TYPE_SET, value);
}
