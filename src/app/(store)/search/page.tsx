import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { ShopProduct } from "@/lib/shopTypes";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q || "").trim();
  const products = q
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { nameAr: { contains: q } },
            { nameEn: { contains: q } },
            { sku: { contains: q } },
            { shortDescAr: { contains: q } },
            { fullDescAr: { contains: q } },
            { fragranceFamilyAr: { contains: q } },
          ],
        },
        include: { variants: { orderBy: { priceKwd: "asc" } } },
      })
    : [];

  return (
    <div className="container-luxe py-10">
      <h1 className="font-cairo text-2xl font-bold text-ink sm:text-3xl">
        نتائج البحث {q ? `عن "${q}"` : ""}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {q ? `${products.length} نتيجة` : "اكتب كلمة البحث للعثور على منتجاتك"}
      </p>

      {products.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p as unknown as ShopProduct} index={i} />
          ))}
        </div>
      )}

      {q && products.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-black/10 bg-white py-20 text-center">
          <p className="text-sm font-semibold text-muted">لا توجد نتائج مطابقة لبحثك.</p>
        </div>
      )}
    </div>
  );
}