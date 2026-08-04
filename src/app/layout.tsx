import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getSite } from "@/lib/content";

const site = getSite();

// JSON-LD moved to each page (src/lib/schema/) — different pages need
// different graphs (only home is a WebSite, only pages with an FAQ section
// get FAQPage), which a single script in the shared layout could not express.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide defaults only (defect #9 fixed — every page now exports its own
// generateMetadata, see src/lib/metadata.ts). A plain string, not a template:
// content already bakes the "| Business Name" suffix into each page's
// seo.title, and a title.template would double it on top of a page's own
// title. This value only surfaces if a future page omits generateMetadata.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.business.name,
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
        <Header />

        <main className="flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
