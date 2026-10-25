import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    const id = Number(params.id);
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: body.code !== undefined ? String(body.code).trim().toUpperCase() : undefined,
        discountType: body.discountType !== undefined ? String(body.discountType) : undefined,
        discountValue: body.discountValue !== undefined ? Number(body.discountValue) : undefined,
        minOrderKwd: body.minOrderKwd !== undefined ? Math.max(0, Number(body.minOrderKwd) || 0) : undefined,
        maxUses: body.maxUses !== undefined ? Math.max(0, Number(body.maxUses) || 0) : undefined,
        expiresAt:
          body.expiresAt !== undefined ? (body.expiresAt ? new Date(body.expiresAt) : null) : undefined,
        isActive: body.isActive !== undefined ? !!body.isActive : undefined,
      },
    });
    return NextResponse.json({ coupon });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تحديث الكوبون", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    await prisma.coupon.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر حذف الكوبون", 500);
  }
}
