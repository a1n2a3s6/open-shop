import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";
import {
  buildVariantData,
  normalizeCurrencyPrices,
  normalizeImages,
  productSlug,
} from "@/lib/productPayload";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function uniqueProductSlug(base: string) {
  let slug = slugify(base);
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: { orderBy: { priceKwd: "asc" } }, category: true },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    if (!body.nameAr) return errorResponse("اسم المنتج مطلوب");
    if (!body.categoryId) return errorResponse("القسم مطلوب");
    if (body.basePriceKwd == null || Number(body.basePriceKwd) <= 0)
      return errorResponse("السعر الأساسي مطلوب");

    const category = await prisma.category.findUnique({ where: { id: Number(body.categoryId) } });
    if (!category) return errorResponse("القسم غير موجود");

    const baseSku = String(body.sku || `KSR-${Date.now().toString().slice(-6)}`);
    const existingSku = await prisma.product.findUnique({ where: { sku: baseSku } });
    if (existingSku) return errorResponse("رمز المنتج (SKU) مستخدم مسبقاً", 409);

    const variants = buildVariantData(body.variants) ?? [];
    const stock = variants.length
      ? variants.reduce((s, v) => s + v.stock, 0)
      : Math.max(0, Number(body.stock) || 0);

    const slug = body.slug
      ? await uniqueProductSlug(body.slug)
      : await uniqueProductSlug(productSlug(body.nameEn, body.nameAr));

    const product = await prisma.product.create({
      data: {
        nameAr: String(body.nameAr),
        nameEn: body.nameEn ? String(body.nameEn) : null,
        slug,
        sku: baseSku,
        shortDescAr: body.shortDescAr ? String(body.shortDescAr) : null,
        fullDescAr: body.fullDescAr ? String(body.fullDescAr) : null,
        categoryId: Number(body.categoryId),
        basePriceKwd: Number(body.basePriceKwd),
        discountPriceKwd:
          body.discountPriceKwd != null && Number(body.discountPriceKwd) > 0
            ? Number(body.discountPriceKwd)
            : null,
        currencyPricesJson: normalizeCurrencyPrices(body.currencyPricesJson),
        stock,
        lowStockThreshold: Math.max(0, Number(body.lowStockThreshold) || 5),
        weightGrams: body.weightGrams ? Number(body.weightGrams) : null,
        imagesJson: normalizeImages(body.images ?? body.imagesJson),
        topNotesAr: body.topNotesAr ? String(body.topNotesAr) : null,
        heartNotesAr: body.heartNotesAr ? String(body.heartNotesAr) : null,
        baseNotesAr: body.baseNotesAr ? String(body.baseNotesAr) : null,
        fragranceFamilyAr: body.fragranceFamilyAr ? String(body.fragranceFamilyAr) : null,
        longevity: Math.min(5, Math.max(1, Number(body.longevity) || 3)),
        sillage: Math.min(5, Math.max(1, Number(body.sillage) || 3)),
        gender: body.gender ? String(body.gender) : "للجنسين",
        season: body.season ? String(body.season) : "جميع الفصول",
        isBestSeller: !!body.isBestSeller,
        isNewArrival: !!body.isNewArrival,
        isSpecialOffer: !!body.isSpecialOffer,
        isFeatured: !!body.isFeatured,
        isActive: body.isActive !== false,
        variants: variants.length ? { create: variants } : undefined,
      },
      include: { variants: true, category: true },
    });

    return NextResponse.json({ product });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر إنشاء المنتج", 500);
  }
}
