import Link from "next/link";
import { Globe2, Headset, Truck, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import OpenLoginButton from "@/components/OpenLoginButton";
import { ShopProduct } from "@/lib/shopTypes";

export const dynamic = "force-dynamic";

const productInclude = { variants: { orderBy: { priceKwd: "asc" as const } } };

function SectionHeader({ title, href, accent }: { title: string; href: string; accent?: boolean }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className={`h-7 w-1.5 rounded-full ${accent ? "bg-sale" : "bg-brand"}`} />
        <h2 className="section-title">{title}</h2>
      </div>
      <Link href={href} className="shrink-0 text-xs font-bold text-brand transition hover:text-brand-dark">
        عرض الكل ←
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [slides, categories, offers, newArrivals, bestSellers, featured, settings] = await Promise.all([
    prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 8 }),
    prisma.product.findMany({ where: { isActive: true, isSpecialOffer: true }, include: productInclude, take: 8, orderBy: { updatedAt: "desc" } }),
    prisma.product.findMany({ where: { isActive: true, isNewArrival: true }, include: productInclude, take: 8, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { isActive: true, isBestSeller: true }, include: productInclude, take: 8, orderBy: { updatedAt: "desc" } }),
    prisma.product.findMany({ where: { isActive: true, isFeatured: true }, include: productInclude, take: 4, orderBy: { updatedAt: "desc" } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div className="bg-cream">
      <HeroCarousel
        slides={slides.map((s) => ({
          id: s.id,
          titleAr: s.titleAr,
          titleEn: s.titleEn,
          subtitleAr: s.subtitleAr,
          subtitleEn: s.subtitleEn,
          buttonTextAr: s.buttonTextAr,
          buttonTextEn: s.buttonTextEn,
          buttonLink: s.buttonLink,
          imageUrl: s.imageUrl,
          mobileImageUrl: s.mobileImageUrl,
        }))}
      />

      <section className="container-luxe -mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-black/[0.05] bg-white p-4 shadow-card sm:grid-cols-3 lg:grid-cols-4">
          {[
            { icon: Globe2, title: "تغطية خليجية شاملة", desc: "شحن لجميع دول الخليج من الكويت" },
            { icon: Truck, title: "توصيل سريع", desc: "خلال 24 ساعة داخل الكويت" },
            { icon: Headset, title: "دعم فاخر", desc: "خدمة عملاء على مدار الساعة" },
            { icon: Sparkles, title: "منتجات أصلية", desc: "عود وعطور فاخرة مختارة" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl px-2 py-2.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-brand">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink">{title}</p>
                <p className="truncate text-[11px] text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="container-luxe mt-14">
          <SectionHeader title="العروض الحصرية" href="/category/offers" accent />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {offers.map((p, i) => (
              <ProductCard key={p.id} product={p as unknown as ShopProduct} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="container-luxe mt-14">
        <SectionHeader title="تسوق حسب القسم" href="/category/perfumes" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/[0.06] bg-brand-light shadow-card"
            >
              {c.imageUrl && (
                <img
                  src={c.imageUrl}
                  alt={c.nameAr}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-center">
                <p className="font-cairo text-sm font-bold text-white sm:text-base">{c.nameAr}</p>
                <p className="text-[10px] text-white/80">{c.nameEn}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-luxe mt-14">
          <SectionHeader title="مختارات كسيرات" href="/search?q=" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p as unknown as ShopProduct} index={i} />
            ))}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="container-luxe mt-14">
          <SectionHeader title="وصل حديثاً" href="/category/perfumes" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p as unknown as ShopProduct} index={i} />
            ))}
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="container-luxe mt-14">
          <SectionHeader title="الأكثر مبيعاً" href="/category/best-sellers" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((p, i) => (
              <ProductCard key={p.id} product={p as unknown as ShopProduct} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 bg-cream luxe-pattern py-14">
        <div className="container-luxe text-center">
          <span className="text-xs font-bold tracking-[0.3em] text-brand">قصتنا</span>
          <h2 className="mt-3 font-cairo text-2xl font-bold text-ink sm:text-3xl">
            {settings?.storyTitleAr || "حكايتنا مع العطر"}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-quote text-xl leading-[2.2] text-ink/90 sm:text-2xl">
            «{settings?.storyQuoteAr || "في كسيرات، نؤمن أن العطر قصةٌ تُعاش، وذكرى تبقى، وإرثٌ يمتد عبر الأجيال."}»
          </p>
          <p className="mt-4 text-sm font-semibold text-muted">
            {settings?.storySignatureAr || "عائلة كسيرات . المؤسسون"}
          </p>
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="gold-divider" />
            <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs font-semibold sm:flex-row">
              <Link href="/info/story" className="text-brand transition hover:text-brand-dark">
                اقرأ قصتنا ←
              </Link>
              <span className="text-muted">
                {settings?.heritageFooterNote || "بكل فخر... صُنع في الكويت ويُشحن لجميع دول الخليج"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-luxe mt-16">
        <h2 className="section-title mb-6 text-center">تجربة تثق بها</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              title: settings?.trust1TitleAr || "تغطية خليجية شاملة",
              desc: settings?.trust1DescAr || "شحن سريع من المقر الرئيسي بالكويت لجميع دول الخليج.",
              icon: Globe2,
            },
            {
              title: settings?.trust2TitleAr || "تواصل معنا",
              desc: settings?.trust2DescAr || "خدمة عملاء 965 2222 8888 · الأحد – الخميس 8:00 ص – 10:00 م",
              icon: Headset,
            },
            {
              title: settings?.trust3TitleAr || "شحن مجاني",
              desc: settings?.trust3DescAr || "على الطلبات التي تتجاوز الحد الأدنى حسب الدولة والعملة.",
              icon: Truck,
            },
          ].map(({ title, desc, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center shadow-card">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-brand/30 bg-brand-light text-brand">
                <Icon size={26} strokeWidth={1.5} />
              </span>
              <h3 className="mt-4 font-cairo text-base font-bold text-ink">{title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-luxe mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-charcoal px-6 py-14 text-center shadow-luxe">
          <div className="pointer-events-none absolute inset-0 opacity-70 luxe-pattern" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-cairo text-2xl font-bold text-white sm:text-3xl">
              {settings?.loyaltyTitleAr || "انضم الآن، واستمتع بمزايا حصرية"}
            </h2>
            <p className="mt-3 text-sm text-white/75">
              {settings?.loyaltySubtitleAr || "اكسب نقاط ولاء . اكتشف الجديد . احفظ منتجاتك المفضلة"}
            </p>
            <div className="mt-7 flex justify-center">
              <OpenLoginButton className="btn-brand px-10 py-3.5 text-sm">تسجيل الدخول</OpenLoginButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}