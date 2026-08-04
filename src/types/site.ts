export interface Business {
  name: string;
  industry: string;
  primaryService: string;
  city: string;
  state: string;
  region: string;
  phone: string;
  email: string;
  website: string;
}

export interface Branding {
  primaryColor: string;
  accentColor: string;
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface Navigation {
  links: NavigationLink[];
  cta: string;
}

export interface Hero {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryButton: string;
  secondaryButton: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  bullets: string[];
}

export interface ServicesSection {
  eyebrow: string;
  title: string;
  description: string;
  items: ServiceItem[];
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface WhyChooseUsSection {
  eyebrow: string;
  title: string;
  description: string;
  items: FeatureItem[];
}

export interface ProofStat {
  value: string;
  label: string;
}

export interface ProofSection {
  eyebrow: string;
  title: string;
  description: string;
  stats: ProofStat[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ProcessSection {
  eyebrow: string;
  title: string;
  description: string;
  steps: ProcessStep[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

export interface TestimonialsSection {
  eyebrow: string;
  title: string;
  description: string;
  items: TestimonialItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSection {
  eyebrow: string;
  title: string;
  description: string;
  items: FAQItem[];
}

export interface CTASection {
  eyebrow: string;
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
}

export interface FooterSection {
  headline: string;
  copyright: string;
}

export interface SEOSection {
  title: string;
  description: string;
  canonical: string;
}

export interface SchemaSection {
  businessType: string;
}

export interface SiteContent {
  business: Business;
  branding: Branding;
  navigation: Navigation;
  hero: Hero;
  services: ServicesSection;
  whyChooseUs: WhyChooseUsSection;
  proof: ProofSection;
  process: ProcessSection;
  testimonials: TestimonialsSection;
  faq: FAQSection;
  cta: CTASection;
  footer: FooterSection;
  seo: SEOSection;
  schema: SchemaSection;
}
