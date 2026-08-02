import Hero from "@/components/sections/Hero";

import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero {...site.hero} />
    </>
  );
}
