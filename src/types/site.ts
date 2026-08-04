/**
 * Site-wide configuration — everything that is true across every page.
 *
 * Page-level content lives in `content/pages/*.json` and is typed in `./page`.
 */

export interface PostalAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface GeoCoordinates {
  latitude: string;
  longitude: string;
}

export interface Business {
  name: string;
  industry: string;
  primaryService: string;
  city: string;
  state: string;
  region: string;
  phone: string;
  email: string;
  /** Contractor licence number. Surfaced as a trust signal and in schema. */
  licenseNumber: string;
  /** schema.org priceRange, e.g. "$$". */
  priceRange: string;
  address: PostalAddress;
  geo: GeoCoordinates;
  /** schema.org openingHours strings, e.g. "Mo-Fr 08:00-17:00". */
  hours: string[];
  /** Profile URLs used for schema.org sameAs — GBP, Facebook, Yelp. */
  sameAs: string[];
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

export interface FooterConfig {
  headline: string;
  copyright: string;
}

export interface SchemaConfig {
  /** schema.org LocalBusiness subtype, e.g. "RoofingContractor", "Plumber". */
  businessType: string;
}

export interface ConversionConfig {
  /**
   * E.164 format (e.g. "+12095550148"), used verbatim in `tel:` hrefs.
   * Distinct from `business.phone` so a real deployment can configure a call
   * tracking number without changing the business's official NAP record used
   * in schema and legal pages (PRD §8).
   */
  trackingPhone: string;
  /** Human-readable formatted version of trackingPhone, shown in UI text. */
  displayPhone: string;
  /**
   * Where a validated lead is forwarded once real delivery (email/CRM) is
   * wired up. Empty until a provider is chosen — see
   * `src/lib/actions/contact.ts`. Not a URL the browser calls directly; the
   * form submits via a Server Action, not fetch.
   */
  formEndpoint: string;
  /** Root-relative path the form redirects to on success. */
  thankYouPath: string;
  /** Selects the CTA pattern a niche pack uses (PRD §8). Not yet consumed. */
  model: "emergency" | "considered" | "mixed";
}

export interface SiteConfig {
  /** Canonical origin, no trailing slash. The only place the domain appears. */
  url: string;
  business: Business;
  branding: Branding;
  navigation: Navigation;
  footer: FooterConfig;
  schema: SchemaConfig;
  conversion: ConversionConfig;
}
