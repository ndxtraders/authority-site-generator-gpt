import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import ContactFormFields from "@/components/forms/ContactForm";
import type { ContactFormProps } from "@/types/sections";

/**
 * Section wrapper for the lead form. Keeps the client boundary confined to the
 * form itself so the rest of the page stays a Server Component.
 */
export default function ContactFormSection(props: ContactFormProps) {
  return (
    <Section id="contact-form" className="bg-slate-50">
      <Container>
        <div className="max-w-3xl">
          <ContactFormFields {...props} />
        </div>
      </Container>
    </Section>
  );
}
