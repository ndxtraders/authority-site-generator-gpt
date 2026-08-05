import type { JsonLdGraph } from "@/lib/schema";
import { serializeJsonLd } from "@/lib/schema/serialize";

interface JsonLdProps {
  graphs: JsonLdGraph[];
}

/**
 * Renders a page's schema.org graphs as one `<script type="application/ld+json">`,
 * wrapped in a single `@graph` array so multiple node types share one `@context`
 * instead of repeating it per node.
 */
export default function JsonLd({ graphs }: JsonLdProps) {
  if (graphs.length === 0) return null;

  const payload = {
    "@context": "https://schema.org",
    "@graph": graphs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
    />
  );
}
