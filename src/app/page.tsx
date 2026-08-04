import { getPage, getSite } from "@/lib/content";
import { renderSections } from "@/lib/sections";

export default function HomePage() {
  const page = getPage("home");
  return <>{renderSections(page.sections, getSite())}</>;
}
