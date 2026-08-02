import { Button } from "@/components/ui/button";

export interface HeroProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryButton: string;
  secondaryButton: string;
}

export default function Hero({
  eyebrow,
  headline,
  subheadline,
  primaryButton,
  secondaryButton,
}: HeroProps) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-24">
      <p className="font-semibold uppercase tracking-widest text-blue-600">
  {eyebrow}
</p>


        <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight text-slate-900">
          {headline}
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
          {subheadline}
        </p>

        <div className="mt-10 flex gap-4">
          <Button size="lg">
            {primaryButton}
          </Button>

          <Button
            size="lg"
            variant="outline"
          >
            {secondaryButton}
          </Button>
        </div>
      </div>
    </section>
  );
}
