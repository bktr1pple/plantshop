import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import HomeContent from "./HomeContent";
import { fetchServerPublicSiteSettings } from "@/lib/server-api";
import { buildOpenGraph, toMetaDescription } from "@/lib/seo";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchServerPublicSiteSettings({ revalidate: 300 });
  const description = toMetaDescription(
    settings.heroSubtitle,
    "Ексклюзивні рослини, професійний догляд та авторські рішення для створення ідеального простору",
  );

  return {
    // Головна — єдина сторінка з повним title без template-суфікса.
    title: {
      absolute: `${settings.siteName} — преміум рослини та озеленення з доставкою`,
    },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: buildOpenGraph({
      url: "/",
      title: `${settings.siteName} — преміум рослини та озеленення`,
      description,
      images: ["/images/block.jpg"],
    }),
  };
}

export default async function HomePage() {
  const settings = await fetchServerPublicSiteSettings({ revalidate: 300 });
  const siteUrl = getSiteUrl();
  const telephone = settings.contactPhoneHref.replace(/^tel:/, "");

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: `${siteUrl}/`,
    inLanguage: "uk",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/plants?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.siteName,
    description: settings.footerDescription,
    url: `${siteUrl}/`,
    logo: absoluteUrl("/icons/icon-512x512.png"),
    image: absoluteUrl("/images/block.jpg"),
    telephone,
    email: settings.contactEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contactAddress,
      addressCountry: "UA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone,
      email: settings.contactEmail,
      availableLanguage: "Ukrainian",
    },
  };

  return (
    <>
      <JsonLd data={webSiteJsonLd} />
      <JsonLd data={localBusinessJsonLd} />
      <HomeContent />
    </>
  );
}
