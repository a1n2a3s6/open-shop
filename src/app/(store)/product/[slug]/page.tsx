import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import { parseJson } from "@/lib/utils";
import type { ShopProduct } from "@/lib/shopTypes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) return { title: "المنتج غير موجود | كسيرات" };

  const images = parseJson<string[]>(product.imagesJson, []);
  const mainImage = images[0] || "/icons/icon-512.svg";

  return {
    title: `${product.nameAr} | كسيرات`,
    description: product.shortDescAr || product.fullDescAr || "عطور ودهن عود فاخر من كسيرات",
    openGraph: {
      title: `${product.nameAr} | كسيرات`,
      description: product.shortDescAr || "عطور ودهن عود فاخر من كسيرات",
      images: [{ url: mainImage }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: { priceKwd: "asc" } },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: {
      variants: { orderBy: { priceKwd: "asc" } },
    },
    take: 4,
    orderBy: { updatedAt: "desc" },
  });

  const detailData = {
    id: product.id,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    slug: product.slug,
    sku: product.sku,
    shortDescAr: product.shortDescAr,
    fullDescAr: product.fullDescAr,
    basePriceKwd: product.basePriceKwd,
    discountPriceKwd: product.discountPriceKwd,
    currencyPricesJson: product.currencyPricesJson,
    stock: product.stock,
    imagesJson: product.imagesJson,
    weightGrams: product.weightGrams,
    topNotesAr: product.topNotesAr,
    heartNotesAr: product.heartNotesAr,
    baseNotesAr: product.baseNotesAr,
    fragranceFamilyAr: product.fragranceFamilyAr,
    longevity: product.longevity,
    sillage: product.sillage,
    gender: product.gender,
    season: product.season,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    variants: product.variants.map((v) => ({
      id: v.id,
      nameAr: v.nameAr,
      nameEn: v.nameEn,
      sku: v.sku,
      stock: v.stock,
      priceKwd: v.priceKwd,
      discountPriceKwd: v.discountPriceKwd,
      currencyPricesJson: v.currencyPricesJson,
      isDefault: v.isDefault,
    })),
    categoryNameAr: product.category?.nameAr ?? null,
    categorySlug: product.category?.slug ?? null,
  };

  return (
    <div className="bg-cream">
      <ProductDetail product={detailData} />

      {relatedProducts.length > 0 && (
        <section className="container-luxe pb-16">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="h-7 w-1.5 rounded-full bg-brand" />
            <h2 className="section-title">منتجات قد تنال إعجابك</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p as unknown as ShopProduct}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
