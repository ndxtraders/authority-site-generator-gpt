import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPage, getSite } from "@/lib/content";

const site = getSite();
const home = getPage("home");

// TEMPORARY (Phase 2.3 replaces this).
// One hardcoded LocalBusiness literal emitted on every page, ignoring
// site.schema.businessType and omitting address, geo, hours, and sameAs.
// Replaced by the schema generator in src/lib/schema/.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.business.name,
  description: home.seo.description,
  telephone: site.business.phone,
  email: site.business.email,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.business.city,
    addressRegion: site.business.state,
  },
  areaServed: site.business.region,
  serviceType: site.business.primaryService,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// TEMPORARY (Phase 2.2 replaces this).
// Site-wide defaults only. Every page currently inherits the home page's title,
// description, and canonical, which is defect #9 — three of four pages declare
// the home page as canonical. Fixed by per-page generateMetadata in 2.2.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: home.seo.title,
  description: home.seo.description,
  alternates: {
    canonical: home.seo.canonicalPath,
  },
  openGraph: {
    title: home.seo.title,
    description: home.seo.description,
    url: home.seo.canonicalPath,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: home.seo.title,
    description: home.seo.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Header />

        <main className="flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
