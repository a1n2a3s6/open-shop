import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { ShopProduct } from "@/lib/shopTypes";

export const dynamic = "force-dynamic";

const include = { variants: { orderBy: { priceKwd: "asc" as const } } };

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const isBest = slug === "best-sellers";
  const isOffers = slug === "offers";

  const category = await prisma.category.findUnique({ where: { slug } });

  let products;
  if (isBest) {
    products = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include,
      orderBy: { updatedAt: "desc" },
    });
  } else if (isOffers) {
    products = await prisma.product.findMany({
      where: { isActive: true, isSpecialOffer: true },
      include,
      orderBy: { updatedAt: "desc" },
    });
  } else {
    if (!category) notFound();
    products = await prisma.product.findMany({
      where: { isActive: true, categoryId: category.id },
      include,
      orderBy: { updatedAt: "desc" },
    });
  }

  const title = isBest
    ? "الأكثر مبيعًا"
    : isOffers
    ? "العروض"
    : category?.nameAr || slug;
  const subtitle = isBest
    ? "القطع الأكثر حباً من عملاء كسيرات"
    : isOffers
    ? "عروض حصرية لفترة محدودة"
    : category?.descriptionAr;

  return (
    <div className="container-luxe py-10">
      <div className="mb-8 text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-brand">KSEERAT</p>
        <h1 className="mt-2 font-cairo text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-sm text-muted">{subtitle}</p>}
        <div className="gold-divider mx-auto mt-6 max-w-xs" />
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white py-20 text-center">
          <p className="text-sm font-semibold text-muted">لا توجد منتجات في هذا القسم حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p as unknown as ShopProduct} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}