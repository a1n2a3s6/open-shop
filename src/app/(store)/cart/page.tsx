"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  X,
  CheckCircle2,
} from "lucide-react";
import { useStore, useCurrency } from "@/store/useStore";
import { formatPrice, round } from "@/lib/pricing";

export default function CartPage() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const setQuantity = useStore((s) => s.setQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);
  const currency = useCurrency();
  const lang = useStore((s) => s.lang);

  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountKwd, setDiscountKwd] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Subtotal calculation in KWD
  const subtotalKwd = round(
    cart.reduce((sum, item) => sum + item.unitPriceKwd * item.quantity, 0),
    3
  );

  // Rate conversion
  const rate = currency.exchangeRateFromKwd || 1;
  const subtotalConverted = round(subtotalKwd * rate, currency.decimals);
  const discountConverted = round(discountKwd * rate, currency.decimals);

  // Free shipping threshold
  const freeThresholdKwd = currency.freeShippingThreshold / rate;
  const qualifiesFreeShipping = subtotalKwd > 0 && subtotalKwd >= freeThresholdKwd;
  const remainingForFreeShipping = Math.max(0, freeThresholdKwd - subtotalKwd);
  const remainingConverted = round(remainingForFreeShipping * rate, currency.decimals);
  const progressPercent = freeThresholdKwd > 0
    ? Math.min(100, Math.round((subtotalKwd / freeThresholdKwd) * 100))
    : 100;

  const totalKwd = Math.max(0, round(subtotalKwd - discountKwd, 3));
  const totalConverted = round(totalKwd * rate, currency.decimals);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotalKwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "رمز الكوبون غير صالح");
        return;
      }
      setCouponCode(data.coupon.code);
      setDiscountKwd(data.discountKwd);
      setCouponSuccess(`تم تطبيق الخصم (${data.coupon.code})`);
      setCouponInput("");
    } catch {
      setCouponError("تعذر التحقق من الكوبون");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountKwd(0);
    setCouponSuccess(null);
    setCouponError(null);
  };

  if (cart.length === 0) {
    return (
      <div className="container-luxe py-16 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-brand/30 bg-brand-light text-brand">
          <ShoppingBag size={44} strokeWidth={1.3} />
        </div>
        <h1 className="mt-5 font-cairo text-2xl font-bold text-ink sm:text-3xl">
          سلة التسوق فارغة
        </h1>
        <p className="mt-2 text-sm text-muted">
          اكتشف مجموعتنا الفاخرة من العطور ودهن العود الملكي والمبسوس
        </p>
        <Link href="/" className="btn-brand mt-7 px-8 py-3.5 text-sm">
          تصفح المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-ink sm:text-3xl">سلة التسوق</h1>
          <p className="mt-1 text-xs text-muted">
            لديك {cart.reduce((s, c) => s + c.quantity, 0)} قطع في سلتك
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-sale transition hover:underline"
        >
          تفريغ السلة
        </button>
      </div>

      {/* Free Shipping Alert & Progress Bar */}
      {currency.freeShippingThreshold > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-brand/20 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 font-bold text-ink">
              <Truck size={17} className="text-brand" />
              {qualifiesFreeShipping ? (
                <span className="text-success">تهانينا! طلبيتك مؤهلة للشحن المجاني 🎁</span>
              ) : (
                <span>
                  أضف بـ <strong className="text-brand">{formatPrice(remainingConverted, currency)}</strong> للحصول على شحن مجاني
                </span>
              )}
            </span>
            <span className="text-[11px] font-bold text-muted">{progressPercent}%</span>
          </div>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Right Column: Items list */}
        <div className="space-y-3.5">
          {cart.map((item) => {
            const unitConverted = round(item.unitPriceKwd * rate, currency.decimals);
            const lineTotalConverted = round(item.unitPriceKwd * item.quantity * rate, currency.decimals);
            const originalLineConverted = item.originalPriceKwd
              ? round(item.originalPriceKwd * item.quantity * rate, currency.decimals)
              : null;

            return (
              <div
                key={item.key}
                className="group relative flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white p-3.5 shadow-card transition sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-light"
                  >
                    <img
                      src={item.image || "/icons/icon-192.svg"}
                      alt={item.nameAr}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-cairo text-sm font-bold text-ink transition hover:text-brand"
                    >
                      {lang === "ar" ? item.nameAr : item.nameEn || item.nameAr}
                    </Link>
                    {item.variantName && (
                      <p className="mt-0.5 inline-block rounded bg-cream px-2 py-0.5 text-[11px] font-semibold text-brand">
                        {item.variantName}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-sale">
                        {formatPrice(lineTotalConverted, currency)}
                      </span>
                      {originalLineConverted && originalLineConverted > lineTotalConverted && (
                        <span className="text-xs text-muted line-through">
                          {formatPrice(originalLineConverted, currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-3 sm:border-0 sm:pt-0">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 rounded-full border border-black/10 bg-cream/70 p-1">
                    <button
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:bg-brand hover:text-white disabled:opacity-30"
                      title="إنقاص"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-7 text-center font-cairo text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      disabled={item.stock > 0 && item.quantity >= item.stock}
                      className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:bg-brand hover:text-white disabled:opacity-30"
                      title="زيادة"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-red-100 bg-red-50 text-sale transition hover:bg-sale hover:text-white"
                    title="حذف من السلة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2 text-center sm:text-start">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand transition hover:underline"
            >
              <span>← متابعة التسوق وإضافة المزيد</span>
            </Link>
          </div>
        </div>

        {/* Left Column: Summary and Checkout */}
        <div className="space-y-4">
          {/* Coupon box */}
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card">
            <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Tag size={15} className="text-brand" />
              لديك كوبون خصم؟
            </p>

            {couponCode ? (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-success/30 bg-emerald-50 px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-success">
                  <CheckCircle2 size={15} />
                  {couponCode} (-{formatPrice(discountConverted, currency)})
                </span>
                <button
                  onClick={removeCoupon}
                  className="rounded p-1 text-muted transition hover:bg-emerald-100 hover:text-sale"
                  title="إلغاء الكوبون"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="أدخل رمز الكوبون"
                  className="input-luxe flex-1 py-2.5 text-xs uppercase"
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="btn-brand shrink-0 px-4 py-2.5 text-xs"
                >
                  {couponLoading ? "جاري التحقق..." : "تطبيق"}
                </button>
              </div>
            )}

            {couponError && (
              <p className="mt-2 text-[11px] font-semibold text-sale">{couponError}</p>
            )}
            {couponSuccess && !couponCode && (
              <p className="mt-2 text-[11px] font-semibold text-success">{couponSuccess}</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
            <h2 className="font-cairo text-base font-bold text-ink">ملخص الطلب</h2>

            <div className="mt-4 space-y-2.5 border-b border-black/5 pb-4 text-xs">
              <div className="flex items-center justify-between text-muted">
                <span>مجموع المنتجات</span>
                <span className="font-bold text-ink">
                  {formatPrice(subtotalConverted, currency)}
                </span>
              </div>

              {discountConverted > 0 && (
                <div className="flex items-center justify-between text-sale font-bold">
                  <span>الخصم ({couponCode})</span>
                  <span>-{formatPrice(discountConverted, currency)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted">
                <span>الشحن</span>
                <span className="font-bold">
                  {qualifiesFreeShipping ? (
                    <span className="text-success">مجاني</span>
                  ) : (
                    "يُحسب عند إتمام الطلب"
                  )}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between font-cairo">
              <span className="text-sm font-bold text-ink">الإجمالي التقديري</span>
              <span className="text-xl font-extrabold text-sale">
                {formatPrice(totalConverted, currency)}
              </span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="btn-brand mt-5 w-full py-3.5 text-sm font-bold shadow-md"
            >
              إتمام الطلب ←
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
              <ShieldCheck size={14} className="text-brand" />
              <span>دفع آمن 100% · عطور أصلية معتمدة · شحن سريع</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
