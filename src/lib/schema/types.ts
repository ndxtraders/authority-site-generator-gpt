/**
 * One schema.org node. Builders return nodes without "@context" — the envelope
 * is added once in `buildSchema`/`JsonLd`, not repeated per node, so multiple
 * graphs on a page share a single `@graph` array.
 */
export type JsonLdGraph = { "@type": string } & Record<string, unknown>;
