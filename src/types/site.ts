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

export interface Hero {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryButton: string;
  secondaryButton: string;
}

export interface SiteContent {
  business: Business;
  branding: Branding;
  hero: Hero;
}
