import Hero from "@/components/sections/Hero";
import ContactForm from "@/components/forms/ContactForm";
import Container from "@/components/common/Container";
import Section from "@/components/common/Section";

import { site } from "@/lib/site";

export default function ContactPage() {
  return (
    <>
      <Hero
        eyebrow="Contact Us"
        headline="Let’s talk about your roof project"
        subheadline="Tell us what’s going on and we’ll help you map out the right next step."
        primaryButton={site.hero.primaryButton}
        secondaryButton={site.hero.secondaryButton}
      />

      <Section className="bg-slate-50">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Get a fast response</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                We’re available for urgent issues, inspections, and general project questions. Call or fill out the form and we’ll get back to you soon.
              </p>
              <div className="mt-8 space-y-3 text-sm text-slate-700">
                <p><span className="font-semibold">Phone:</span> {site.business.phone}</p>
                <p><span className="font-semibold">Email:</span> {site.business.email}</p>
                <p><span className="font-semibold">Service Area:</span> {site.business.region}</p>
              </div>
            </div>

            <ContactForm heading="Request a free estimate" subheading="Share a few details and we’ll reach out with the next steps." />
          </div>
        </Container>
      </Section>
    </>
  );
}
