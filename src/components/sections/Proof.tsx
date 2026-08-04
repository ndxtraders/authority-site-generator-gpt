import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import type { ProofProps } from "@/types/sections";

export default function Proof({ eyebrow, title, description, stats }: ProofProps) {
  return (
    <Section id="proof" className="bg-white">
      <Container>
        <div className="rounded-3xl border border-slate-200 bg-slate-900 px-8 py-12 text-white sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">{description}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 p-6">
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
