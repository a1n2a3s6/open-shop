import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    if (!code) return errorResponse("رمز الكوبون مطلوب");
    const type = body.discountType === "FIXED_KWD" ? "FIXED_KWD" : "PERCENTAGE";
    const value = Number(body.discountValue);
    if (!Number.isFinite(value) || value <= 0) return errorResponse("قيمة الخصم غير صحيحة");
    if (type === "PERCENTAGE" && value > 100) return errorResponse("نسبة الخصم لا تتجاوز 100%");

    const exists = await prisma.coupon.findUnique({ where: { code } });
    if (exists) return errorResponse("رمز الكوبون مستخدم مسبقاً", 409);

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType: type,
        discountValue: value,
        minOrderKwd: Math.max(0, Number(body.minOrderKwd) || 0),
        maxUses: Math.max(0, Number(body.maxUses) || 0),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ coupon });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر إنشاء الكوبون", 500);
  }
}
