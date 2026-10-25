import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { nameAr: { contains: q } },
        { nameEn: { contains: q } },
        { sku: { contains: q } },
        { shortDescAr: { contains: q } },
        { fragranceFamilyAr: { contains: q } },
      ],
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      slug: p.slug,
      basePriceKwd: p.basePriceKwd,
      discountPriceKwd: p.discountPriceKwd,
      currencyPricesJson: p.currencyPricesJson,
      images: parseJson<string[]>(p.imagesJson, []),
    })),
  });
}
