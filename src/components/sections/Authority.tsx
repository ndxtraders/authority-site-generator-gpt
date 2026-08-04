import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import SectionHeading from "@/components/common/SectionHeading";
import type { AuthorityProps } from "@/types/sections";

export default function Authority({ eyebrow, title, description, items, callout }: AuthorityProps) {
  return (
    <Section id="authority" className="bg-white">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-7 text-slate-700">
              {callout}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
