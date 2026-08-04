import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://roofrepairmodesto.com",
      lastModified: new Date(),
    },
    {
      url: "https://roofrepairmodesto.com/services",
      lastModified: new Date(),
    },
    {
      url: "https://roofrepairmodesto.com/about",
      lastModified: new Date(),
    },
    {
      url: "https://roofrepairmodesto.com/contact",
      lastModified: new Date(),
    },
  ];
}
