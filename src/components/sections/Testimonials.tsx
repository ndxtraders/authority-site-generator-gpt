import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import SectionHeading from "@/components/common/SectionHeading";
import type { TestimonialsProps } from "@/types/sections";

export default function Testimonials({ eyebrow, title, description, items }: TestimonialsProps) {
  return (
    <Section id="testimonials" className="bg-slate-50">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.author} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-base leading-8 text-slate-700">“{item.quote}”</p>
              <div className="mt-6">
                <p className="font-semibold text-slate-900">{item.author}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
