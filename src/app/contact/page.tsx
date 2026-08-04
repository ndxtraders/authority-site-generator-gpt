import { getPage, getSite } from "@/lib/content";
import { renderSections } from "@/lib/sections";

export default function ContactPage() {
  const page = getPage("contact");
  return <>{renderSections(page.sections, getSite())}</>;
}
