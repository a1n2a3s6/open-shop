"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useStore, useCurrency, useT } from "@/store/useStore";
import { formatPrice, resolvePrice } from "@/lib/pricing";
import { parseJson, cn } from "@/lib/utils";
import type { ShopProduct } from "@/lib/shopTypes";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: ShopProduct;
  index?: number;
}) {
  const t = useT();
  const currency = useCurrency();
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const lang = useStore((s) => s.lang);

  const variants = product.variants ?? [];
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const [variantId, setVariantId] = useState<string | null>(defaultVariant?.id ?? null);
  const variant = variants.find((v) => v.id === variantId) ?? defaultVariant ?? null;

  const source = variant
    ? {
        priceKwd: variant.priceKwd,
        discountPriceKwd: variant.discountPriceKwd,
        currencyPricesJson: variant.currencyPricesJson,
      }
    : {
        priceKwd: product.basePriceKwd,
        discountPriceKwd: product.discountPriceKwd,
        currencyPricesJson: product.currencyPricesJson,
      };

  const resolved = resolvePrice(source, currency);
  const images = parseJson<string[]>(product.imagesJson, []);
  const image = images[0] || "/icons/icon-192.svg";
  const stock = variant ? variant.stock : product.stock;
  const wished = wishlist.some((w) => w.productId === product.id);

  const handleAdd = () => {
    if (stock <= 0) return;
    addToCart({
      productId: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      image,
      variantId: variant?.id ?? null,
      variantName: variant?.nameAr ?? null,
      unitPriceKwd: source.discountPriceKwd && source.discountPriceKwd > 0 ? source.discountPriceKwd : source.priceKwd,
      originalPriceKwd:
        source.discountPriceKwd && source.discountPriceKwd > 0 ? source.priceKwd : null,
      stock,
    });
  };

  const handleWish = () => {
    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      image,
      priceKwd: source.discountPriceKwd && source.discountPriceKwd > 0 ? source.discountPriceKwd : source.priceKwd,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card transition hover:shadow-luxe"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-light">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={image}
            alt={product.nameAr}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        <div className="absolute right-3 top-3 flex flex-col items-start gap-1.5">
          {resolved.hasDiscount && (
            <span className="rounded-full bg-sale px-2.5 py-1 text-[10px] font-bold text-white shadow">
              خصم {resolved.discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded-full bg-charcoal px-2.5 py-1 text-[10px] font-bold text-white shadow">
              وصل حديثاً
            </span>
          )}
          {product.isBestSeller && (
            <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white shadow">
              الأكثر مبيعاً
            </span>
          )}
        </div>

        <button
          onClick={handleWish}
          aria-label={wished ? t("removeFromWishlist") : t("addToWishlist")}
          className={cn(
            "absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105",
            wished ? "text-sale" : "text-ink/70 hover:text-sale"
          )}
        >
          <Heart size={17} fill={wished ? "currentColor" : "none"} />
        </button>

        {stock <= 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-charcoal/85 py-2 text-center text-xs font-bold text-white">
            {t("outOfStock")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <Link href={`/product/${product.slug}`} className="line-clamp-2 min-h-[2.6rem] text-sm font-bold leading-snug text-ink transition hover:text-brand">
          {lang === "ar" ? product.nameAr : product.nameEn || product.nameAr}
        </Link>

        {variants.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                disabled={v.stock <= 0}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition",
                  v.id === variant?.id
                    ? "border-brand bg-brand text-white"
                    : "border-black/10 text-muted hover:border-brand hover:text-brand",
                  v.stock <= 0 && "cursor-not-allowed opacity-40 line-through"
                )}
              >
                {lang === "ar" ? v.nameAr : v.nameEn || v.nameAr}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-end gap-2">
          <span className="text-[15px] font-extrabold text-sale">{formatPrice(resolved.price, currency)}</span>
          {resolved.hasDiscount && (
            <span className="pb-0.5 text-[11px] text-muted line-through">{formatPrice(resolved.base, currency)}</span>
          )}
          {stock > 0 && stock <= 5 && (
            <span className="ms-auto pb-0.5 text-[10px] font-semibold text-amber-600">كمية محدودة</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={stock <= 0}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-black/20"
        >
          <ShoppingBag size={14} />
          {stock > 0 ? t("addToCart") : t("outOfStock")}
        </button>
      </div>
    </motion.div>
  );
}
