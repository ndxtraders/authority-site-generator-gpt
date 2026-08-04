/**
 * Section props and the Section discriminated union.
 *
 * `SectionPropsMap` is the single source of truth. Both `SectionType` and the
 * `Section` union are derived from it, so a new section can only be added in one
 * place and the three can never drift apart.
 */

// ---------------------------------------------------------------------------
// Shared item shapes
// ---------------------------------------------------------------------------

export interface TitledItem {
  title: string;
  description: string;
}

export interface ServiceItem extends TitledItem {
  bullets: string[];
}

export interface ProofStat {
  value: string;
  label: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  /**
   * Star rating out of 5, if the business actually collected one. Optional and
   * omitted by default — do not backfill a placeholder value. Review and
   * AggregateRating schema (PRD §6) are only emitted for testimonials that
   * carry a real rating; fabricating one would be a false structured-data
   * claim about a real business. See `src/lib/schema/review.ts`.
   */
  rating?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Section props
// ---------------------------------------------------------------------------

/** Common heading fields shared by most sections. */
interface HeadedSection {
  eyebrow: string;
  title: string;
  description: string;
}

export interface HeroProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryButton: string;
  secondaryButton: string;
}

export interface ServicesProps extends HeadedSection {
  items: ServiceItem[];
  itemCta: string;
}

export interface WhyChooseUsProps extends HeadedSection {
  items: TitledItem[];
}

export interface ProofProps extends HeadedSection {
  stats: ProofStat[];
}

export interface ProcessProps extends HeadedSection {
  steps: TitledItem[];
}

export interface TestimonialsProps extends HeadedSection {
  items: TestimonialItem[];
}

export interface FAQProps extends HeadedSection {
  items: FAQItem[];
}

export interface CTAProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
}

export interface AuthorityProps extends HeadedSection {
  items: TitledItem[];
  callout: string;
}

/** AEO answer-first block. One question, one direct answer, made citable. */
export interface AnswerProps {
  question: string;
  answer: string;
}

/**
 * NAP block. Carries only the *labels* — the phone, email, and service area
 * values come from site config, injected by the renderer (see `lib/sections.tsx`).
 */
export interface ContactInfoProps {
  title: string;
  description: string;
  phoneLabel: string;
  emailLabel: string;
  areaLabel: string;
}

export interface FormField {
  label: string;
  placeholder: string;
}

export interface ContactFormProps {
  title: string;
  description: string;
  fields: {
    name: FormField;
    phone: FormField;
    email: FormField;
    message: FormField;
  };
  submitLabel: string;
  submittingLabel: string;
  /** Fallback shown when the server action fails without a specific message. */
  errorMessage: string;
}

// ---------------------------------------------------------------------------
// The map, the union, and the type key
// ---------------------------------------------------------------------------

/**
 * Every section type the framework can render, mapped to its **content** props —
 * exactly what a page's JSON must supply.
 *
 * A component may require more than this. `ContactInfo`, for example, also needs
 * the business NAP, which belongs to site config rather than page content; the
 * renderer injects it and the compiler checks that injection at the switch. Keep
 * this map to content only, so JSON and types stay one-to-one.
 *
 * Adding a section means adding one line here, one component, one key in
 * `SECTION_TYPE_SET`, and one case in `renderSection`. Miss either of the last
 * two and the build fails.
 */
export interface SectionPropsMap {
  Hero: HeroProps;
  Services: ServicesProps;
  WhyChooseUs: WhyChooseUsProps;
  Proof: ProofProps;
  Process: ProcessProps;
  Testimonials: TestimonialsProps;
  FAQ: FAQProps;
  CTA: CTAProps;
  Authority: AuthorityProps;
  Answer: AnswerProps;
  ContactInfo: ContactInfoProps;
  ContactForm: ContactFormProps;
}

export type SectionType = keyof SectionPropsMap;

/**
 * A section as it appears in a page's `sections` array.
 *
 * This is a true discriminated union: narrowing on `type` narrows `props` to the
 * matching interface, so passing FAQ props to a Hero section is a compile error.
 */
export type Section = {
  [K in SectionType]: { type: K; props: SectionPropsMap[K] };
}[SectionType];
