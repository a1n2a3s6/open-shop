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
    const category = await prisma.category.update({
      where: { id },
      data: {
        nameAr: body.nameAr !== undefined ? String(body.nameAr) : undefined,
        nameEn: body.nameEn !== undefined ? (body.nameEn ? String(body.nameEn) : null) : undefined,
        slug: body.slug ? String(body.slug) : undefined,
        descriptionAr: body.descriptionAr !== undefined ? (body.descriptionAr ? String(body.descriptionAr) : null) : undefined,
        imageUrl: body.imageUrl !== undefined ? (body.imageUrl ? String(body.imageUrl) : null) : undefined,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) || 0 : undefined,
        showInNavbar: body.showInNavbar !== undefined ? !!body.showInNavbar : undefined,
        isActive: body.isActive !== undefined ? !!body.isActive : undefined,
      },
    });
    return NextResponse.json({ category });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تحديث القسم", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const id = Number(params.id);
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return errorResponse(`لا يمكن حذف القسم لاحتوائه على ${count} منتج. انقل المنتجات أولاً.`, 409);
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر حذف القسم", 500);
  }
}
