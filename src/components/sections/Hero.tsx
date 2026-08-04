import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import type { HeroProps } from "@/types/sections";

export default function Hero({
  eyebrow,
  headline,
  subheadline,
  primaryButton,
  secondaryButton,
}: HeroProps) {
  return (
    <section className="bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_50%)] bg-slate-50">
      <Container className="py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            {eyebrow}
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {headline}
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
            {subheadline}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg">{primaryButton}</Button>
            <Button size="lg" variant="outline">
              {secondaryButton}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
