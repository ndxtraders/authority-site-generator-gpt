import { buildLlmsTxt } from "@/lib/llms";

// Unlike sitemap.ts/robots.ts (special-cased "static by default" metadata
// files), a plain Route Handler is dynamic by default even with no
// request-time data — force-static is required to get the same static output
// PRD D5 requires everywhere else.
export const dynamic = "force-static";

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
