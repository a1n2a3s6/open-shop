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

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const companies = await prisma.shippingCompany.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ companies });
}

export async function POST(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    if (!body.nameAr) return errorResponse("اسم شركة الشحن مطلوب");
    const company = await prisma.shippingCompany.create({
      data: {
        nameAr: String(body.nameAr),
        deliveryTimeAr: body.deliveryTimeAr ? String(body.deliveryTimeAr) : null,
        logoUrl: body.logoUrl ? String(body.logoUrl) : null,
        baseCostKwd: Math.max(0, Number(body.baseCostKwd) || 0),
        supportedCountriesJson: normalizeCountries(body.supportedCountries ?? body.supportedCountriesJson),
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ company });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر إنشاء شركة الشحن", 500);
  }
}
