// app/layout.tsx — Server Component
import "./globals.css";
import type { Metadata, Viewport } from "next";
import ClientWrapper from "./ClientWrapper"; // наш client-only wrapper
import { fetchServerPublicSiteSettings } from "@/lib/server-api";
import { getSiteUrl } from "@/lib/site-url";

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "PlantShop — преміум рослини з доставкою",
    template: "%s | PlantShop"
  },
  description: "Ексклюзивні рослини, професійний догляд та авторські рішення для створення ідеального простору",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "PlantShop",
    images: ["/images/block.jpg"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Anti-FOUC: застосовуємо збережену/системну тему до першого кадру.
// Інлайн у <head> серверного layout — скрипт виконується до гідрації і
// не потрапляє в клієнтське React-дерево (раніше next/script у
// ClientWrapper кидав React-попередження про <script> на 404-сторінці).
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',(t||(d?'dark':'light'))==='dark');}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSettings = await fetchServerPublicSiteSettings({ revalidate: 300 });

  return (
    <html lang="uk" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ClientWrapper initialSettings={initialSettings}>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
