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

export interface SiteContent {
  business: Business;
}
