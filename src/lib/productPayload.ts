import { slugify } from "./utils";

export function normalizeCurrencyPrices(input: unknown): string {
  if (!input) return "{}";
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed ?? {});
    } catch {
      return "{}";
    }
  }
  if (typeof input === "object") {
    const clean: Record<string, { base?: number; discount?: number }> = {};
    for (const [code, value] of Object.entries(input as Record<string, unknown>)) {
      const v = value as { base?: unknown; discount?: unknown } | undefined;
      if (!v) continue;
      const base = Number(v.base);
      const discount = Number(v.discount);
      if ((base && base > 0) || (discount && discount > 0)) {
        clean[code] = {
          base: base > 0 ? base : undefined,
          discount: discount > 0 ? discount : undefined,
        };
      }
    }
    return JSON.stringify(clean);
  }
  return "{}";
}

export function normalizeImages(input: unknown): string {
  if (Array.isArray(input)) {
    return JSON.stringify(input.map((x) => String(x).trim()).filter(Boolean));
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return "[]";
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return JSON.stringify(parsed.filter(Boolean));
      } catch {
        /* fallthrough */
      }
    }
    return JSON.stringify(
      trimmed
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
  return "[]";
}

export function buildVariantData(variants: unknown) {
  if (!Array.isArray(variants)) return null;
  const list = variants
    .map((raw) => {
      const v = raw as Record<string, unknown>;
      if (!v?.nameAr) return null;
      return {
        nameAr: String(v.nameAr),
        nameEn: v.nameEn ? String(v.nameEn) : null,
        sku: v.sku ? String(v.sku) : null,
        stock: Math.max(0, Number(v.stock) || 0),
        priceKwd: Math.max(0, Number(v.priceKwd) || 0),
        discountPriceKwd:
          v.discountPriceKwd != null && Number(v.discountPriceKwd) > 0
            ? Number(v.discountPriceKwd)
            : null,
        currencyPricesJson: normalizeCurrencyPrices(v.currencyPricesJson),
        isDefault: !!v.isDefault,
      };
    })
    .filter(Boolean) as {
    nameAr: string;
    nameEn: string | null;
    sku: string | null;
    stock: number;
    priceKwd: number;
    discountPriceKwd: number | null;
    currencyPricesJson: string;
    isDefault: boolean;
  }[];

  if (list.length && !list.some((v) => v.isDefault)) list[0].isDefault = true;
  if (list.filter((v) => v.isDefault).length > 1) {
    let seen = false;
    for (const v of list) {
      if (v.isDefault) {
        if (seen) v.isDefault = false;
        seen = true;
      }
    }
  }
  return list;
}

export function productSlug(nameEn: string | null | undefined, nameAr: string, fallback?: string) {
  return slugify(nameEn || fallback || nameAr);
}
