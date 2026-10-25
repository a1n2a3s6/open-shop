"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useStore, useCurrency } from "@/store/useStore";
import { formatPrice, round } from "@/lib/pricing";

export default function WishlistPage() {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const currency = useCurrency();
  const lang = useStore((s) => s.lang);

  return (
    <div className="container-luxe py-10">
      <h1 className="font-cairo text-2xl font-bold text-ink sm:text-3xl">المفضلة</h1>
      <p className="mt-2 text-sm text-muted">{wishlist.length} منتج</p>

      {wishlist.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-black/10 bg-white py-20 text-center">
          <Heart size={42} className="mx-auto text-brand/50" />
          <p className="mt-4 text-sm font-semibold text-muted">لم تقم بإضافة أي منتج للمفضلة بعد.</p>
          <Link href="/" className="btn-brand mt-6">
            متابعة التسوق
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((w) => (
            <div key={w.productId} className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
              <button
                onClick={() => toggleWishlist(w)}
                className="absolute left-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-sale shadow-sm"
              >
                <Trash2 size={15} />
              </button>
              <Link href={`/product/${w.slug}`} className="aspect-[4/5] overflow-hidden bg-brand-light">
                <img src={w.image} alt={w.nameAr} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </Link>
              <div className="flex flex-1 flex-col p-3.5">
                <Link href={`/product/${w.slug}`} className="line-clamp-2 text-sm font-bold text-ink hover:text-brand">
                  {lang === "ar" ? w.nameAr : w.nameEn || w.nameAr}
                </Link>
                <p className="mt-2 text-[15px] font-extrabold text-sale">
                  {formatPrice(round(w.priceKwd * (currency.exchangeRateFromKwd || 1), currency.decimals), currency)}
                </p>
                <button
                  onClick={() =>
                    addToCart({
                      productId: w.productId,
                      slug: w.slug,
                      nameAr: w.nameAr,
                      nameEn: w.nameEn,
                      image: w.image,
                      unitPriceKwd: w.priceKwd,
                      stock: 99,
                    })
                  }
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark"
                >
                  <ShoppingBag size={14} /> أضف للسلة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}