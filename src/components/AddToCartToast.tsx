"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import { useStore, useCurrency } from "@/store/useStore";
import { formatPrice, round } from "@/lib/pricing";

export default function AddToCartToast() {
  const lastAdded = useStore((s) => s.lastAdded);
  const dismiss = useStore((s) => s.dismissToast);
  const currency = useCurrency();

  useEffect(() => {
    if (!lastAdded) return;
    const timer = setTimeout(() => dismiss(), 6000);
    return () => clearTimeout(timer);
  }, [lastAdded, dismiss]);

  if (!lastAdded) return null;
  const item = lastAdded.item;
  const price = round(item.unitPriceKwd * (currency.exchangeRateFromKwd || 1), currency.decimals);
  const original =
    item.originalPriceKwd != null
      ? round(item.originalPriceKwd * (currency.exchangeRateFromKwd || 1), currency.decimals)
      : null;

  return (
    <div className="fixed left-3 top-3 z-[95] w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-luxe sm:left-5 sm:top-5">
      <div key={lastAdded.ts} className="h-1 bg-success animate-toast-progress" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-bold text-success">
            <CheckCircle2 size={17} />
            تمت الإضافة إلى سلة التسوق
          </div>
          <button onClick={dismiss} className="rounded-full p-0.5 text-muted transition hover:bg-cream">
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <img
            src={item.image || "/icons/icon-192.svg"}
            alt={item.nameAr}
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{item.nameAr}</p>
            {item.variantName && <p className="text-[11px] text-muted">{item.variantName}</p>}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-extrabold text-sale">{formatPrice(price, currency)}</span>
              {original && original > price && (
                <span className="text-[11px] text-muted line-through">{formatPrice(original, currency)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/checkout" onClick={dismiss} className="btn-brand py-2.5 text-xs">
            إتمام الطلب
          </Link>
          <Link
            href="/cart"
            onClick={dismiss}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brand py-2.5 text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
          >
            <ShoppingBag size={14} /> عرض السلة
          </Link>
        </div>
      </div>
    </div>
  );
}
