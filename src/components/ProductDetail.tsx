"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useStore, useCurrency, useT } from "@/store/useStore";
import { formatPrice, resolvePrice } from "@/lib/pricing";
import { parseJson, cn } from "@/lib/utils";
import type { ShopVariant } from "@/lib/shopTypes";

export type ProductDetailData = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  sku: string;
  shortDescAr: string | null;
  fullDescAr: string | null;
  basePriceKwd: number;
  discountPriceKwd: number | null;
  currencyPricesJson: string;
  stock: number;
  imagesJson: string;
  weightGrams: number | null;
  topNotesAr: string | null;
  heartNotesAr: string | null;
  baseNotesAr: string | null;
  fragranceFamilyAr: string | null;
  longevity: number;
  sillage: number;
  gender: string;
  season: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  variants: ShopVariant[];
  categoryNameAr: string | null;
  categorySlug: string | null;
};

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink/80">{label}</span>
        <span className="font-bold text-brand">{value}/5</span>
      </div>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={cn("h-1.5 flex-1 rounded-full", n <= value ? "bg-brand" : "bg-black/10")}
          />
        ))}
      </div>
    </div>
  );
}

function PyramidCard({ label, value, tone }: { label: string; value: string | null; tone: string }) {
  return (
    <div className={cn("rounded-2xl border p-4", tone)}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 text-sm font-semibold leading-6 text-ink">{value || "—"}</p>
    </div>
  );
}

export default function ProductDetail({ product }: { product: ProductDetailData }) {
  const router = useRouter();
  const t = useT();
  const currency = useCurrency();
  const lang = useStore((s) => s.lang);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);

  const images = parseJson<string[]>(product.imagesJson, []);
  const variants = product.variants ?? [];
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const [variantId, setVariantId] = useState<string | null>(defaultVariant?.id ?? null);
  const [activeImage, setActiveImage] = useState(images[0] || "/icons/icon-192.svg");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.id === variantId) ?? defaultVariant ?? null;
  const source = variant
    ? { priceKwd: variant.priceKwd, discountPriceKwd: variant.discountPriceKwd, currencyPricesJson: variant.currencyPricesJson }
    : { priceKwd: product.basePriceKwd, discountPriceKwd: product.discountPriceKwd, currencyPricesJson: product.currencyPricesJson };

  const resolved = resolvePrice(source, currency);
  const stock = variant ? variant.stock : product.stock;
  const wished = wishlist.some((w) => w.productId === product.id);

  const handleAdd = (redirect: boolean) => {
    if (stock <= 0) return;
    addToCart({
      productId: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      image: activeImage,
      variantId: variant?.id ?? null,
      variantName: variant?.nameAr ?? null,
      unitPriceKwd: source.discountPriceKwd && source.discountPriceKwd > 0 ? source.discountPriceKwd : source.priceKwd,
      originalPriceKwd: source.discountPriceKwd && source.discountPriceKwd > 0 ? source.priceKwd : null,
      quantity,
      stock,
    });
    if (redirect) {
      router.push("/checkout");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const metaChips = [
    product.fragranceFamilyAr && { label: "العائلة العطرية", value: product.fragranceFamilyAr },
    { label: "الجنس", value: product.gender },
    { label: "الموسم", value: product.season },
    product.weightGrams ? { label: "الوزن", value: `${product.weightGrams} جم` } : null,
    { label: "رمز المنتج", value: product.sku },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="container-luxe py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
        <Link href="/" className="hover:text-brand">الرئيسية</Link>
        <span>/</span>
        {product.categorySlug && (
          <>
            <Link href={`/category/${product.categorySlug}`} className="hover:text-brand">
              {product.categoryNameAr}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink/70">{product.nameAr}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-brand-light shadow-card">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0.6, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={activeImage}
              alt={product.nameAr}
              className="aspect-square w-full object-cover"
            />
            <div className="absolute right-4 top-4 flex flex-col gap-1.5">
              {resolved.hasDiscount && (
                <span className="rounded-full bg-sale px-3 py-1 text-[11px] font-bold text-white shadow">
                  خصم {resolved.discountPercent}%
                </span>
              )}
              {product.isNewArrival && (
                <span className="rounded-full bg-charcoal px-3 py-1 text-[11px] font-bold text-white shadow">وصل حديثاً</span>
              )}
              {product.isBestSeller && (
                <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-white shadow">الأكثر مبيعاً</span>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar">
              {images.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition",
                    activeImage === img ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.categoryNameAr && (
            <span className="pill bg-brand-light text-brand">{product.categoryNameAr}</span>
          )}
          <h1 className="mt-3 font-cairo text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {lang === "ar" ? product.nameAr : product.nameEn || product.nameAr}
          </h1>
          {product.shortDescAr && <p className="mt-3 text-sm leading-7 text-muted">{product.shortDescAr}</p>}

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-sale">{formatPrice(resolved.price, currency)}</span>
            {resolved.hasDiscount && (
              <span className="pb-1 text-base text-muted line-through">{formatPrice(resolved.base, currency)}</span>
            )}
            {resolved.hasDiscount && (
              <span className="mb-1 rounded-full bg-sale/10 px-2.5 py-1 text-[11px] font-bold text-sale">
                وفّر {formatPrice(resolved.base - resolved.price, currency)}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {metaChips.map((chip) => (
              <span key={chip.label} className="pill border border-black/[0.07] bg-white text-ink/70">
                <span className="text-muted">{chip.label}:</span> {chip.value}
              </span>
            ))}
          </div>

          {variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-bold text-ink">الخيارات</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={v.stock <= 0}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-bold transition",
                      v.id === variant?.id
                        ? "border-brand bg-brand text-white"
                        : "border-black/10 text-ink/70 hover:border-brand hover:text-brand",
                      v.stock <= 0 && "cursor-not-allowed opacity-40 line-through"
                    )}
                  >
                    {lang === "ar" ? v.nameAr : v.nameEn || v.nameAr}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-black/10 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center rounded-full text-brand transition hover:bg-brand-light"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                className="grid h-11 w-11 place-items-center rounded-full text-brand transition hover:bg-brand-light"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className={cn("text-xs font-bold", stock > 5 ? "text-success" : stock > 0 ? "text-amber-600" : "text-sale")}>
              {stock > 0 ? (stock <= 5 ? `كمية محدودة (${stock})` : `متوفر (${stock})`) : "غير متوفر"}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => handleAdd(false)}
              disabled={stock <= 0}
              className="btn-brand flex-1 py-3.5 text-sm"
            >
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}
              {added ? "تمت الإضافة" : "أضف للسلة"}
            </button>
            <button
              onClick={() => handleAdd(true)}
              disabled={stock <= 0}
              className="btn-dark flex-1 py-3.5 text-sm"
            >
              <Zap size={16} /> اشترِ الآن
            </button>
            <button
              onClick={() =>
                toggleWishlist({
                  productId: product.id,
                  slug: product.slug,
                  nameAr: product.nameAr,
                  nameEn: product.nameEn,
                  image: activeImage,
                  priceKwd: source.discountPriceKwd && source.discountPriceKwd > 0 ? source.discountPriceKwd : source.priceKwd,
                })
              }
              title="المفضلة"
              className={cn(
                "grid h-[52px] w-[52px] place-items-center rounded-full border transition",
                wished ? "border-sale bg-sale/5 text-sale" : "border-black/10 text-ink/70 hover:border-sale hover:text-sale"
              )}
            >
              <Heart size={20} fill={wished ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-brand-light/70 p-3 text-[11px] text-ink/75">
            <Check size={15} className="text-success" /> منتج أصلي 100% مع ضمان الأصالة من كسيرات · شحن لجميع دول الخليج
          </div>

          {product.fullDescAr && (
            <div className="mt-6 border-t border-black/5 pt-6">
              <h3 className="font-cairo text-lg font-bold text-ink">الوصف</h3>
              <p className="mt-2 text-sm leading-8 text-muted">{product.fullDescAr}</p>
            </div>
          )}

          <div className="mt-6 border-t border-black/5 pt-6">
            <h3 className="font-cairo text-lg font-bold text-ink">الهرم العطري</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <PyramidCard label="قمة العطر" value={product.topNotesAr} tone="border-brand/30 bg-brand-light/50" />
              <PyramidCard label="قلب العطر" value={product.heartNotesAr} tone="border-black/10 bg-white" />
              <PyramidCard label="قاعدة العطر" value={product.baseNotesAr} tone="border-charcoal/20 bg-cream" />
            </div>
          </div>

          <div className="mt-6 border-t border-black/5 pt-6">
            <h3 className="font-cairo text-lg font-bold text-ink">أداء العطر</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <RatingBar label="الثبات" value={product.longevity} />
              <RatingBar label="الفوحان" value={product.sillage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}