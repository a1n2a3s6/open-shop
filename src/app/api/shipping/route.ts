import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
import { round } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("currency") || "KWD";
  const subtotalKwd = Number(url.searchParams.get("subtotalKwd") || 0);

  const currency = await prisma.currency.findUnique({ where: { code } });
  const companies = await prisma.shippingCompany.findMany({ where: { isActive: true } });

  const rate = currency?.exchangeRateFromKwd || 1;
  const thresholdKwd = currency ? currency.freeShippingThreshold / rate : Infinity;
  const qualifiesFree = subtotalKwd > 0 && subtotalKwd >= thresholdKwd;

  const available = companies.filter((c) => {
    const countries = parseJson<string[]>(c.supportedCountriesJson, []);
    return countries.length === 0 || countries.includes(code);
  });

  const mapped = available.map((c) => {
    const free = qualifiesFree;
    const costKwd = free ? 0 : c.baseCostKwd;
    return {
      id: c.id,
      nameAr: c.nameAr,
      deliveryTimeAr: c.deliveryTimeAr,
      logoUrl: c.logoUrl,
      baseCostKwd: c.baseCostKwd,
      costKwd,
      costConverted: round(costKwd * rate, currency?.decimals ?? 2),
      isFree: free,
    };
  });

  if (!mapped.length && currency) {
    const costKwd = qualifiesFree ? 0 : currency.defaultShippingCost / rate;
    mapped.push({
      id: 0,
      nameAr: "الشحن و التوصيل",
      deliveryTimeAr: currency.estimatedDeliveryAr || "التوصيل خلال 2-4 أيام عمل",
      logoUrl: null,
      baseCostKwd: currency.defaultShippingCost / rate,
      costKwd,
      costConverted: round(costKwd * rate, currency.decimals),
      isFree: qualifiesFree,
    });
  }

  return NextResponse.json({
    companies: mapped,
    currency: currency
      ? {
          code: currency.code,
          symbolAr: currency.symbolAr,
          decimals: currency.decimals,
          exchangeRateFromKwd: currency.exchangeRateFromKwd,
          freeShippingThreshold: currency.freeShippingThreshold,
          freeShippingThresholdKwd: round(thresholdKwd, 3),
          defaultShippingCost: currency.defaultShippingCost,
        }
      : null,
    qualifiesFree,
  });
}
