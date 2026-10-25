import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ slides });
}

export async function POST(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    if (!body.titleAr || !body.imageUrl) return errorResponse("العنوان والصورة مطلوبان");
    const slide = await prisma.heroSlide.create({
      data: {
        titleAr: String(body.titleAr),
        titleEn: body.titleEn ? String(body.titleEn) : null,
        subtitleAr: body.subtitleAr ? String(body.subtitleAr) : null,
        subtitleEn: body.subtitleEn ? String(body.subtitleEn) : null,
        buttonTextAr: body.buttonTextAr ? String(body.buttonTextAr) : null,
        buttonTextEn: body.buttonTextEn ? String(body.buttonTextEn) : null,
        buttonLink: body.buttonLink ? String(body.buttonLink) : null,
        imageUrl: String(body.imageUrl),
        mobileImageUrl: body.mobileImageUrl ? String(body.mobileImageUrl) : null,
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ slide });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر إنشاء البانر", 500);
  }
}
