import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function uniqueSlug(base: string) {
  let slug = slugify(base);
  let i = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    if (!body.nameAr) return errorResponse("اسم القسم مطلوب");
    const slug = body.slug ? await uniqueSlug(body.slug) : await uniqueSlug(body.nameEn || body.nameAr);
    const category = await prisma.category.create({
      data: {
        nameAr: String(body.nameAr),
        nameEn: body.nameEn ? String(body.nameEn) : null,
        slug,
        descriptionAr: body.descriptionAr ? String(body.descriptionAr) : null,
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
        sortOrder: Number(body.sortOrder) || 0,
        showInNavbar: body.showInNavbar !== false,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ category });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر إنشاء القسم", 500);
  }
}
