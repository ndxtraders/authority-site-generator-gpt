import type { FAQItem } from "@/types/sections";
import type { JsonLdGraph } from "./types";

/** Auto-added for any page carrying an FAQ section (PRD §6). */
export function buildFAQPage(items: FAQItem[]): JsonLdGraph {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
