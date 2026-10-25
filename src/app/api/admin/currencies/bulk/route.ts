import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";
import { round } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    const action = String(body.action || "");

    if (action === "reset-auto") {
      const products = await prisma.product.updateMany({ data: { currencyPricesJson: "{}" } });
      const variants = await prisma.productVariant.updateMany({ data: { currencyPricesJson: "{}" } });
      return NextResponse.json({
        ok: true,
        message: "تم تحويل جميع الأسعار إلى الحساب التلقائي حسب سعر الصرف",
        products: products.count,
        variants: variants.count,
      });
    }

    if (action === "percent") {
      const percent = Number(body.percent);
      if (!Number.isFinite(percent) || percent === 0) return errorResponse("أدخل نسبة صحيحة");
      if (percent <= -90) return errorResponse("النسبة منخفضة جداً");
      const factor = 1 + percent / 100;

      const products = await prisma.product.findMany({ include: { variants: true } });
      let updatedProducts = 0;
      let updatedVariants = 0;

      await prisma.$transaction(async (tx) => {
        for (const p of products) {
          await tx.product.update({
            where: { id: p.id },
            data: {
              basePriceKwd: Math.max(0.001, round(p.basePriceKwd * factor, 3)),
              discountPriceKwd:
                p.discountPriceKwd != null
                  ? Math.max(0.001, round(p.discountPriceKwd * factor, 3))
                  : null,
              currencyPricesJson: "{}",
            },
          });
          updatedProducts++;
          for (const v of p.variants) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                priceKwd: Math.max(0.001, round(v.priceKwd * factor, 3)),
                discountPriceKwd:
                  v.discountPriceKwd != null
                    ? Math.max(0.001, round(v.discountPriceKwd * factor, 3))
                    : null,
                currencyPricesJson: "{}",
              },
            });
            updatedVariants++;
          }
        }
      });

      return NextResponse.json({
        ok: true,
        message: `تم تطبيق تعديل ${percent > 0 ? "+" : ""}${percent}% على ${updatedProducts} منتج و ${updatedVariants} خيار`,
        products: updatedProducts,
        variants: updatedVariants,
      });
    }

    if (action === "rates") {
      const rates = body.rates as Record<string, number> | undefined;
      if (!rates) return errorResponse("بيانات أسعار الصرف مطلوبة");
      for (const [code, rate] of Object.entries(rates)) {
        if (code === "KWD") continue;
        const numeric = Number(rate);
        if (!Number.isFinite(numeric) || numeric <= 0) continue;
        await prisma.currency.updateMany({
          where: { code },
          data: { exchangeRateFromKwd: numeric },
        });
      }
      return NextResponse.json({ ok: true, message: "تم تحديث أسعار الصرف بنجاح" });
    }

    return errorResponse("إجراء غير معروف");
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تنفيذ التحديث الشامل", 500);
  }
}
