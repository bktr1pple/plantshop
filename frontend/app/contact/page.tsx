import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ContactContent from "./ContactContent";
import { fetchServerPublicSiteSettings } from "@/lib/server-api";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Контакти — звʼязатися з PlantShop",
  description:
    "Контакти PlantShop: телефон, email, адреса та форма звернення. Допоможемо підібрати рослини, відповімо на питання щодо замовлення й озеленення.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    url: "/contact",
    title: "Контакти — звʼязатися з PlantShop",
    description:
      "Телефон, email, адреса та форма звернення PlantShop. Допоможемо підібрати рослини й відповімо на питання щодо замовлення.",
  },
};

export default async function ContactPage() {
  const settings = await fetchServerPublicSiteSettings({ revalidate: 300 });
  const siteUrl = getSiteUrl();
  const telephone = settings.contactPhoneHref.replace(/^tel:/, "");

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Контакти — ${settings.siteName}`,
    url: `${siteUrl}/contact`,
    inLanguage: "uk",
    about: {
      "@type": "LocalBusiness",
      name: settings.siteName,
      url: `${siteUrl}/`,
      telephone,
      email: settings.contactEmail,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.contactAddress,
        addressCountry: "UA",
      },
    },
  };

  return (
    <>
      <JsonLd data={contactPageJsonLd} />
      <ContactContent />
    </>
  );
}
