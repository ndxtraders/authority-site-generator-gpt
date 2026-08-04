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

export interface SiteConfig {
  /** Canonical origin, no trailing slash. The only place the domain appears. */
  url: string;
  business: Business;
  branding: Branding;
  navigation: Navigation;
  footer: FooterConfig;
  schema: SchemaConfig;
}
