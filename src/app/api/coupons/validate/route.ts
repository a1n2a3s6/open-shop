import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api";
import { round } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotalKwd = Number(body.subtotalKwd || 0);
    if (!code) return errorResponse("رمز الكوبون مطلوب");

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) return errorResponse("رمز الكوبون غير صالح", 404);
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now())
      return errorResponse("انتهت صلاحية الكوبون", 410);
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
      return errorResponse("تم استنفاد استخدامات الكوبون", 410);
    if (subtotalKwd < coupon.minOrderKwd)
      return errorResponse(`الحد الأدنى للطلب ${coupon.minOrderKwd.toFixed(3)} د.ك`, 422);

    const rawDiscount =
      coupon.discountType === "PERCENTAGE"
        ? (subtotalKwd * coupon.discountValue) / 100
        : coupon.discountValue;

    const discountKwd = round(Math.min(rawDiscount, subtotalKwd), 3);

    return NextResponse.json({
      ok: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountKwd,
    });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر التحقق من الكوبون", 500);
  }
}
