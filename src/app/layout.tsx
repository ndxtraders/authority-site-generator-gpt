import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { site } from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.business.name,
  description: site.seo.description,
  telephone: site.business.phone,
  email: site.business.email,
  url: site.business.website,
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

export const metadata: Metadata = {
  title: site.seo.title,
  description: site.seo.description,
  alternates: {
    canonical: site.seo.canonical,
  },
  openGraph: {
    title: site.seo.title,
    description: site.seo.description,
    url: site.seo.canonical,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
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

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}

