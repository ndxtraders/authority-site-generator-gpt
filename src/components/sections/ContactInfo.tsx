import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import type { ContactInfoProps } from "@/types/sections";
import type { Business } from "@/types/site";

/**
 * NAP block.
 *
 * Labels come from page content; the values come from site config so the business
 * name, phone, and service area have exactly one source. `business` is injected by
 * the renderer rather than imported here, keeping this component prop-driven.
 */
export default function ContactInfo({
  title,
  description,
  phoneLabel,
  emailLabel,
  areaLabel,
  business,
}: ContactInfoProps & { business: Business }) {
  return (
    <Section id="contact-info" className="bg-slate-50">
      <Container>
        <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>

          <dl className="mt-8 space-y-3 text-sm text-slate-700">
            <div className="flex gap-2">
              <dt className="font-semibold">{phoneLabel}:</dt>
              <dd>{business.phone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">{emailLabel}:</dt>
              <dd>{business.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">{areaLabel}:</dt>
              <dd>{business.region}</dd>
            </div>
          </dl>
        </div>
      </Container>
    </Section>
  );
}
