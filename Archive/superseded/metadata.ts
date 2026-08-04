import { site } from "@/lib/site";

export const pageMetadata = {
  home: {
    title: site.seo.title,
    description: site.seo.description,
  },
  services: {
    title: `Services | ${site.business.name}`,
    description: `Explore ${site.business.primaryService.toLowerCase()} services for homes and businesses in ${site.business.region}.`,
  },
  about: {
    title: `About | ${site.business.name}`,
    description: `Learn more about ${site.business.name} and the local service experience behind every project.`,
  },
  contact: {
    title: `Contact | ${site.business.name}`,
    description: `Get in touch with ${site.business.name} for a free estimate or emergency service request.`,
  },
};
