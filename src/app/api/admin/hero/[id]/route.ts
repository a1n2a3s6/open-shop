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
    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        titleAr: body.titleAr !== undefined ? String(body.titleAr) : undefined,
        titleEn: body.titleEn !== undefined ? (body.titleEn ? String(body.titleEn) : null) : undefined,
        subtitleAr: body.subtitleAr !== undefined ? (body.subtitleAr ? String(body.subtitleAr) : null) : undefined,
        subtitleEn: body.subtitleEn !== undefined ? (body.subtitleEn ? String(body.subtitleEn) : null) : undefined,
        buttonTextAr: body.buttonTextAr !== undefined ? (body.buttonTextAr ? String(body.buttonTextAr) : null) : undefined,
        buttonTextEn: body.buttonTextEn !== undefined ? (body.buttonTextEn ? String(body.buttonTextEn) : null) : undefined,
        buttonLink: body.buttonLink !== undefined ? (body.buttonLink ? String(body.buttonLink) : null) : undefined,
        imageUrl: body.imageUrl !== undefined ? String(body.imageUrl) : undefined,
        mobileImageUrl: body.mobileImageUrl !== undefined ? (body.mobileImageUrl ? String(body.mobileImageUrl) : null) : undefined,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) || 0 : undefined,
        isActive: body.isActive !== undefined ? !!body.isActive : undefined,
      },
    });
    return NextResponse.json({ slide });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تحديث البانر", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    await prisma.heroSlide.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر حذف البانر", 500);
  }
}
