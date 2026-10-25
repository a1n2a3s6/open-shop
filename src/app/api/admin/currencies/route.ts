import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const currencies = await prisma.currency.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ currencies });
}

export async function PUT(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    const rows: Record<string, unknown>[] = Array.isArray(body.currencies)
      ? body.currencies
      : Array.isArray(body)
      ? body
      : [body];

    let updated = 0;
    for (const row of rows) {
      const code = String(row.code || "");
      if (!code) continue;
      const exists = await prisma.currency.findUnique({ where: { code } });
      if (!exists) continue;
      const rate = row.exchangeRateFromKwd !== undefined ? Number(row.exchangeRateFromKwd) : undefined;
      if (code === "KWD" && rate !== undefined && rate !== 1) {
        continue;
      }
      await prisma.currency.update({
        where: { code },
        data: {
          exchangeRateFromKwd: rate !== undefined && rate > 0 ? rate : undefined,
          decimals: row.decimals !== undefined ? Number(row.decimals) : undefined,
          freeShippingThreshold:
            row.freeShippingThreshold !== undefined ? Number(row.freeShippingThreshold) : undefined,
          defaultShippingCost:
            row.defaultShippingCost !== undefined ? Number(row.defaultShippingCost) : undefined,
          estimatedDeliveryAr:
            row.estimatedDeliveryAr !== undefined
              ? row.estimatedDeliveryAr
                ? String(row.estimatedDeliveryAr)
                : null
              : undefined,
        },
      });
      updated++;
    }

    const currencies = await prisma.currency.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ ok: true, updated, currencies });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تحديث أسعار الصرف", 500);
  }
}
