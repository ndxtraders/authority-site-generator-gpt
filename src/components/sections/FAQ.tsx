import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import SectionHeading from "@/components/common/SectionHeading";
import type { FAQProps } from "@/types/sections";

export default function FAQ({ eyebrow, title, description, items }: FAQProps) {
  return (
    <Section id="faq" className="bg-white">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <div className="mt-12 space-y-4">
          {items.map((item) => (
            <div key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
