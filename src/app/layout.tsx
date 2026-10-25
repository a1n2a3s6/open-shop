import type { Metadata, Viewport } from "next";
import "./globals.css";
import StoreBootstrap from "@/components/StoreBootstrap";
import LoginModal from "@/components/LoginModal";
import AddToCartToast from "@/components/AddToCartToast";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "كسيرات | Kseerat — عطور ودهن عود فاخر",
  description:
    "كسيرات | Kseerat — دار عطور كويتية فاخرة. عطور شرقية، دهن عود كمبودي، مبسوس وبخور، زيوت عطرية وهدايا فاخرة تُشحن لجميع دول الخليج.",
  manifest: "/manifest.json",
  applicationName: "كسيرات | Kseerat",
  keywords: ["عطور", "عود", "بخور", "كسيرات", "الكويت", "Kseerat", "perfume", "oud"],
  openGraph: {
    title: "كسيرات | Kseerat",
    description: "عطور ودهن عود فاخر من قلب الكويت إلى جميع دول الخليج",
    type: "website",
    locale: "ar_KW",
  },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#B39A7B",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [currencies, settings] = await Promise.all([
    prisma.currency.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  const safeSettings = settings
    ? {
        id: settings.id,
        storeNameAr: settings.storeNameAr,
        storeNameEn: settings.storeNameEn,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        announcementAr: settings.announcementAr,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        workingHoursAr: settings.workingHoursAr,
      }
    : null;

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Cairo:wght@400;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream antialiased">
        <StoreBootstrap currencies={JSON.parse(JSON.stringify(currencies))} settings={safeSettings} />
        {children}
        <LoginModal />
        <AddToCartToast />
      </body>
    </html>
  );
}
