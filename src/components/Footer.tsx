"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, Music2, Ghost, Phone, Mail, MapPin } from "lucide-react";
import { useStore } from "@/store/useStore";

type FooterSettings = {
  phone: string | null;
  whatsapp: string | null;
  workingHoursAr: string | null;
  commercialRegistration: string | null;
  taxNumber: string | null;
  heritageFooterNote: string | null;
  instagram: string | null;
  twitter: string | null;
  snapchat: string | null;
  tiktok: string | null;
  facebook: string | null;
  youtube: string | null;
  showPaymentIcons: boolean;
} | null;

type CategoryLite = { id: number; nameAr: string; nameEn: string | null; slug: string };

export default function Footer({
  categories,
  settings,
}: {
  categories: CategoryLite[];
  settings: FooterSettings;
}) {
  const lang = useStore((s) => s.lang);
  const ar = lang === "ar";

  const shopLinks = categories.slice(0, 7);
  const socials = [
    { href: settings?.instagram, icon: Instagram, label: "Instagram" },
    { href: settings?.twitter, icon: Twitter, label: "X" },
    { href: settings?.snapchat, icon: Ghost, label: "Snapchat" },
    { href: settings?.tiktok, icon: Music2, label: "TikTok" },
    { href: settings?.facebook, icon: Facebook, label: "Facebook" },
    { href: settings?.youtube, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-16 bg-brand text-white">
      <div className="container-luxe py-10">
        <div className="flex flex-col items-center justify-between gap-5 border-b border-white/20 pb-7 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href={`tel:${(settings?.phone || "").replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm font-bold">
              <Phone size={17} />
              <span dir="ltr">{settings?.phone}</span>
            </a>
            <span className="hidden h-4 w-px bg-white/30 sm:block" />
            <span className="text-xs text-white/85">{settings?.workingHoursAr || "الأحد – الخميس 8:00 ص – 10:00 م"}</span>
            <span className="hidden h-4 w-px bg-white/30 sm:block" />
            <span className="flex items-center gap-1.5 text-xs text-white/85">
              <MapPin size={14} /> {ar ? "الكويت" : "Kuwait"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href as string}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/30 transition hover:bg-white hover:text-brand"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-9 py-9 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-charcoal text-brand">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
                  <path d="M12 3c2.2 2.6 3.4 5.3 3.4 8.2 0 2.8-1.4 5.2-3.4 7.2-2-2-3.4-4.4-3.4-7.2C8.6 8.3 9.8 5.6 12 3Z" fill="currentColor" />
                </svg>
              </span>
              <span>
                <span className="block font-amiri text-2xl font-bold">كسيرات</span>
                <span className="block text-[9px] tracking-[0.3em] text-white/80">KSEERAT</span>
              </span>
            </div>
            <p className="mt-4 text-xs leading-6 text-white/85">
              {ar
                ? "دار عطور كويتية فاخرة. نصنع العطور ودهن العود والبخور بعناية، ونشحنها لجميع دول الخليج العربي."
                : "A Kuwaiti luxury perfume house. We craft fine perfumes, oud oils and bakhoor, shipped across the GCC."}
            </p>
            <div className="mt-4 space-y-1.5 text-xs text-white/85">
              <p className="flex items-center gap-2">
                <Mail size={13} /> hello@kseerat.com
              </p>
              <p>{settings?.heritageFooterNote || "بكل فخر... صُنع في الكويت ويُشحن لجميع دول الخليج"}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-cairo text-base font-bold">{ar ? "المتجر" : "Store"}</h3>
            <ul className="space-y-2.5 text-xs text-white/85">
              {shopLinks.map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="transition hover:text-white hover:underline">
                    {ar ? c.nameAr : c.nameEn || c.nameAr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-cairo text-base font-bold">{ar ? "المساعدة" : "Help"}</h3>
            <ul className="space-y-2.5 text-xs text-white/85">
              <li><Link href="/info/complaints" className="transition hover:text-white hover:underline">{ar ? "الشكاوى والاستفسارات" : "Complaints & inquiries"}</Link></li>
              <li><Link href="/info/privacy" className="transition hover:text-white hover:underline">{ar ? "الخصوصية وشروط الاستخدام" : "Privacy & terms"}</Link></li>
              <li><Link href="/info/faq" className="transition hover:text-white hover:underline">{ar ? "الأسئلة الشائعة" : "FAQ"}</Link></li>
              <li><Link href="/info/shipping" className="transition hover:text-white hover:underline">{ar ? "سياسة الشحن والاستبدال والاسترجاع" : "Shipping & returns"}</Link></li>
              <li><Link href="/order-track" className="transition hover:text-white hover:underline">{ar ? "تتبع طلبك" : "Track your order"}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-cairo text-base font-bold">{ar ? "عن كسيرات" : "About Kseerat"}</h3>
            <ul className="space-y-2.5 text-xs text-white/85">
              <li><Link href="/info/story" className="transition hover:text-white hover:underline">{ar ? "قصتنا" : "Our story"}</Link></li>
              <li><Link href="/info/blog" className="transition hover:text-white hover:underline">{ar ? "المدونة" : "Blog"}</Link></li>
              <li><Link href="/info/contact" className="transition hover:text-white hover:underline">{ar ? "تواصل معنا" : "Contact us"}</Link></li>
              <li><Link href="/wishlist" className="transition hover:text-white hover:underline">{ar ? "المفضلة" : "Wishlist"}</Link></li>
            </ul>
            <div className="mt-5 rounded-xl bg-white/10 p-3 text-[11px] leading-5 text-white/85">
              <p>{ar ? "خدمة العملاء" : "Customer service"}</p>
              <p className="font-bold text-white" dir="ltr">{settings?.phone}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-6 text-[11px] text-white/80 md:flex-row">
          {settings?.showPaymentIcons !== false && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/30 px-2.5 py-1.5">
              {["Apple Pay", "Mastercard", "Visa", "KNET", "MyFatoorah", "Cash on Delivery"].map((p) => (
                <span key={p} className="rounded bg-white/95 px-2 py-0.5 text-[9px] font-bold text-ink">
                  {p}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>{settings?.commercialRegistration}</span>
            <span>{settings?.taxNumber}</span>
          </div>
          <p>© {new Date().getFullYear()} كسيرات | Kseerat — All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
