// app/layout.tsx — Server Component
import "./globals.css";
import type { Metadata, Viewport } from "next";
import ClientWrapper from "./ClientWrapper"; // наш client-only wrapper

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Plant Shop - Преміум рослини",
    template: "%s | Plant Shop"
  },
  description: "Ексклюзивні рослини, професійний догляд та авторські рішення для створення ідеального простору",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
