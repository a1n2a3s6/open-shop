import { parseJson } from "./utils";

export type CurrencyLite = {
  code: string;
  nameAr: string;
  countryAr: string;
  flag: string;
  symbolAr: string;
  exchangeRateFromKwd: number;
  decimals: number;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  estimatedDeliveryAr?: string | null;
};

export type CurrencyPriceMap = Record<
  string,
  { base?: number | null; discount?: number | null } | undefined
>;

export type PriceSource = {
  priceKwd: number;
  discountPriceKwd?: number | null;
  currencyPricesJson?: string | null;
};

export type ResolvedPrice = {
  base: number;
  price: number;
  discount: number | null;
  hasDiscount: boolean;
  discountPercent: number;
};

export function resolvePrice(source: PriceSource, currency: CurrencyLite): ResolvedPrice {
  const custom = parseJson<CurrencyPriceMap>(source.currencyPricesJson, {});
  const explicit = custom[currency.code];
  const rate = currency.exchangeRateFromKwd || 1;

  const base =
    explicit?.base != null && Number(explicit.base) > 0
      ? Number(explicit.base)
      : round(source.priceKwd * rate, currency.decimals);

  let discount: number | null = null;
  if (source.discountPriceKwd != null && Number(source.discountPriceKwd) > 0) {
    discount =
      explicit?.discount != null && Number(explicit.discount) > 0
        ? Number(explicit.discount)
        : round(Number(source.discountPriceKwd) * rate, currency.decimals);
  }

  const hasDiscount = discount != null && discount < base;
  const price = hasDiscount ? (discount as number) : base;
  const discountPercent = hasDiscount ? Math.round(((base - price) / base) * 100) : 0;

  return {
    base: round(base, currency.decimals),
    price: round(price, currency.decimals),
    discount: discount != null ? round(discount, currency.decimals) : null,
    hasDiscount,
    discountPercent,
  };
}

export function round(value: number, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * f) / f;
}

export function formatPrice(amount: number, currency?: CurrencyLite | null) {
  if (!currency) return `${amount.toFixed(3)} د.ك`;
  return `${amount.toFixed(currency.decimals)} ${currency.symbolAr}`;
}

export function convertFromKwd(amountKwd: number, currency: CurrencyLite) {
  return round(amountKwd * (currency.exchangeRateFromKwd || 1), currency.decimals);
}

export function freeShippingThresholdKwd(currency: CurrencyLite) {
  return round(currency.freeShippingThreshold / (currency.exchangeRateFromKwd || 1), 3);
}

export function defaultCurrency(): CurrencyLite {
  return {
    code: "KWD",
    nameAr: "دينار كويتي",
    countryAr: "الكويت",
    flag: "🇰🇼",
    symbolAr: "د.ك",
    exchangeRateFromKwd: 1,
    decimals: 3,
    freeShippingThreshold: 15,
    defaultShippingCost: 2,
    estimatedDeliveryAr: "التوصيل خلال 24 ساعة",
  };
}

export const GCC_COUNTRIES = [
  { code: "KWD", countryAr: "الكويت", flag: "🇰🇼", dial: "+965", nameEn: "Kuwait" },
  { code: "SAR", countryAr: "السعودية", flag: "🇸🇦", dial: "+966", nameEn: "Saudi Arabia" },
  { code: "AED", countryAr: "الإمارات", flag: "🇦🇪", dial: "+971", nameEn: "UAE" },
  { code: "QAR", countryAr: "قطر", flag: "🇶🇦", dial: "+974", nameEn: "Qatar" },
  { code: "BHD", countryAr: "البحرين", flag: "🇧🇭", dial: "+973", nameEn: "Bahrain" },
  { code: "OMR", countryAr: "سلطنة عمان", flag: "🇴🇲", dial: "+968", nameEn: "Oman" },
];

export const KUWAIT_GOVERNORATES = [
  "العاصمة",
  "حولي",
  "الفروانية",
  "الأحمدي",
  "الجهراء",
  "مبارك الكبير",
];

export function generateOrderNumber(sequence: number) {
  return `KSR-${10000 + sequence}`;
}

export function mapsUrl(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
