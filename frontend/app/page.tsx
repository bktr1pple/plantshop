import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import HomeContent from "./HomeContent";
import FeaturedPlants from "./FeaturedPlants";
import { fetchServerPublicSiteSettings } from "@/lib/server-api";
import { buildOpenGraph, toMetaDescription } from "@/lib/seo";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";
import type { PaginatedPlantsResponse, Plant } from "@/app/types/plant";

export const revalidate = 300;

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:3001";

async function fetchFeaturedPlants(): Promise<Plant[]> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/plants?page=1&limit=8`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as Partial<PaginatedPlantsResponse>;
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

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
  const [settings, featuredPlants] = await Promise.all([
    fetchServerPublicSiteSettings({ revalidate: 300 }),
    fetchFeaturedPlants(),
  ]);
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
      <HomeContent
        featuredPlants={<FeaturedPlants plants={featuredPlants} />}
      />
    </>
  );
}
