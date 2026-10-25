import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

function normalizeCountries(input: unknown) {
  if (Array.isArray(input)) return JSON.stringify(input);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return JSON.stringify(parsed);
    } catch {
      return JSON.stringify(
        input
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    }
  }
  return JSON.stringify([]);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    const id = Number(params.id);
    const company = await prisma.shippingCompany.update({
      where: { id },
      data: {
        nameAr: body.nameAr !== undefined ? String(body.nameAr) : undefined,
        deliveryTimeAr:
          body.deliveryTimeAr !== undefined
            ? body.deliveryTimeAr
              ? String(body.deliveryTimeAr)
              : null
            : undefined,
        logoUrl: body.logoUrl !== undefined ? (body.logoUrl ? String(body.logoUrl) : null) : undefined,
        baseCostKwd:
          body.baseCostKwd !== undefined ? Math.max(0, Number(body.baseCostKwd) || 0) : undefined,
        supportedCountriesJson:
          body.supportedCountries !== undefined || body.supportedCountriesJson !== undefined
            ? normalizeCountries(body.supportedCountries ?? body.supportedCountriesJson)
            : undefined,
        isActive: body.isActive !== undefined ? !!body.isActive : undefined,
      },
    });
    return NextResponse.json({ company });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تحديث شركة الشحن", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    await prisma.shippingCompany.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    try {
      await prisma.shippingCompany.update({ where: { id: Number(params.id) }, data: { isActive: false } });
      return NextResponse.json({ ok: true, softDeleted: true });
    } catch {
      return errorResponse("تعذر حذف شركة الشحن", 500);
    }
  }
}
