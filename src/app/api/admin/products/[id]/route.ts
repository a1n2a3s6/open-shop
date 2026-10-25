import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";
import { buildVariantData, normalizeCurrencyPrices, normalizeImages } from "@/lib/productPayload";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true, category: true },
  });
  if (!product) return errorResponse("المنتج غير موجود", 404);
  return NextResponse.json({ product });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    const id = params.id;
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) return errorResponse("المنتج غير موجود", 404);

    if (body.sku && body.sku !== current.sku) {
      const conflict = await prisma.product.findUnique({ where: { sku: String(body.sku) } });
      if (conflict) return errorResponse("رمز المنتج (SKU) مستخدم مسبقاً", 409);
    }
    if (body.slug && body.slug !== current.slug) {
      const conflict = await prisma.product.findUnique({ where: { slug: String(body.slug) } });
      if (conflict) return errorResponse("الرابط (slug) مستخدم مسبقاً", 409);
    }

    const variants = buildVariantData(body.variants);
    let stock: number | undefined = undefined;
    if (variants) {
      stock = variants.reduce((s, v) => s + v.stock, 0);
    } else if (body.stock !== undefined) {
      stock = Math.max(0, Number(body.stock) || 0);
    }

    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        nameAr: body.nameAr !== undefined ? String(body.nameAr) : undefined,
        nameEn: body.nameEn !== undefined ? (body.nameEn ? String(body.nameEn) : null) : undefined,
        slug: body.slug ? String(body.slug) : undefined,
        sku: body.sku ? String(body.sku) : undefined,
        shortDescAr: body.shortDescAr !== undefined ? (body.shortDescAr ? String(body.shortDescAr) : null) : undefined,
        fullDescAr: body.fullDescAr !== undefined ? (body.fullDescAr ? String(body.fullDescAr) : null) : undefined,
        categoryId: body.categoryId !== undefined ? Number(body.categoryId) : undefined,
        basePriceKwd: body.basePriceKwd !== undefined ? Number(body.basePriceKwd) : undefined,
        discountPriceKwd:
          body.discountPriceKwd !== undefined
            ? body.discountPriceKwd != null && Number(body.discountPriceKwd) > 0
              ? Number(body.discountPriceKwd)
              : null
            : undefined,
        currencyPricesJson:
          body.currencyPricesJson !== undefined
            ? normalizeCurrencyPrices(body.currencyPricesJson)
            : undefined,
        stock,
        lowStockThreshold:
          body.lowStockThreshold !== undefined ? Math.max(0, Number(body.lowStockThreshold) || 0) : undefined,
        weightGrams: body.weightGrams !== undefined ? (body.weightGrams ? Number(body.weightGrams) : null) : undefined,
        imagesJson:
          body.images !== undefined || body.imagesJson !== undefined
            ? normalizeImages(body.images ?? body.imagesJson)
            : undefined,
        topNotesAr: body.topNotesAr !== undefined ? (body.topNotesAr ? String(body.topNotesAr) : null) : undefined,
        heartNotesAr: body.heartNotesAr !== undefined ? (body.heartNotesAr ? String(body.heartNotesAr) : null) : undefined,
        baseNotesAr: body.baseNotesAr !== undefined ? (body.baseNotesAr ? String(body.baseNotesAr) : null) : undefined,
        fragranceFamilyAr:
          body.fragranceFamilyAr !== undefined ? (body.fragranceFamilyAr ? String(body.fragranceFamilyAr) : null) : undefined,
        longevity: body.longevity !== undefined ? Math.min(5, Math.max(1, Number(body.longevity) || 3)) : undefined,
        sillage: body.sillage !== undefined ? Math.min(5, Math.max(1, Number(body.sillage) || 3)) : undefined,
        gender: body.gender !== undefined ? String(body.gender) : undefined,
        season: body.season !== undefined ? String(body.season) : undefined,
        isBestSeller: body.isBestSeller !== undefined ? !!body.isBestSeller : undefined,
        isNewArrival: body.isNewArrival !== undefined ? !!body.isNewArrival : undefined,
        isSpecialOffer: body.isSpecialOffer !== undefined ? !!body.isSpecialOffer : undefined,
        isFeatured: body.isFeatured !== undefined ? !!body.isFeatured : undefined,
        isActive: body.isActive !== undefined ? !!body.isActive : undefined,
        variants: variants ? { create: variants } : undefined,
      },
      include: { variants: true, category: true },
    });

    return NextResponse.json({ product });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تحديث المنتج", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, deleted: true });
  } catch (e) {
    console.error("delete product fallback", e);
    try {
      await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
      return NextResponse.json({
        ok: true,
        deleted: false,
        message: "المنتج مرتبط بطلبات سابقة، تم إخفاؤه من المتجر بدلاً من حذفه.",
      });
    } catch (e2) {
      console.error(e2);
      return errorResponse("تعذر حذف المنتج", 500);
    }
  }
}
