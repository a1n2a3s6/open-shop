import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PushBanner from "@/components/PushBanner";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  const categoryLite = categories.map((c) => ({
    id: c.id,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    slug: c.slug,
    showInNavbar: c.showInNavbar,
  }));

  return (
    <>
      <Header
        categories={categoryLite}
        settings={{ announcementAr: settings?.announcementAr ?? null, phone: settings?.phone ?? null }}
      />
      <main className="min-h-[50vh]">{children}</main>
      <Footer
        categories={categoryLite}
        settings={
          settings
            ? {
                phone: settings.phone,
                whatsapp: settings.whatsapp,
                workingHoursAr: settings.workingHoursAr,
                commercialRegistration: settings.commercialRegistration,
                taxNumber: settings.taxNumber,
                heritageFooterNote: settings.heritageFooterNote,
                instagram: settings.instagram,
                twitter: settings.twitter,
                snapchat: settings.snapchat,
                tiktok: settings.tiktok,
                facebook: settings.facebook,
                youtube: settings.youtube,
                showPaymentIcons: settings.showPaymentIcons,
              }
            : null
        }
      />
      <WhatsAppButton number={settings?.whatsapp ?? null} />
      <PushBanner />
    </>
  );
}