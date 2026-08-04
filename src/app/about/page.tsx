import { getPage, getSite } from "@/lib/content";
import { renderSections } from "@/lib/sections";

export default function AboutPage() {
  const page = getPage("about");
  return <>{renderSections(page.sections, getSite())}</>;
}
