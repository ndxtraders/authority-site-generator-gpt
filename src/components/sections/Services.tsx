import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import SectionHeading from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import type { ServicesProps } from "@/types/sections";

export default function Services({ eyebrow, title, description, items, itemCta }: ServicesProps) {
  return (
    <Section id="services" className="bg-white">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {items.map((service) => (
            <div key={service.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{service.description}</p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <Button className="mt-8" variant="outline">
                {itemCta}
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
