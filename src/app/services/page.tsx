import { getPage, getSite } from "@/lib/content";
import { renderSections } from "@/lib/sections";

export default function ServicesPage() {
  const page = getPage("services");
  return <>{renderSections(page.sections, getSite())}</>;
}
