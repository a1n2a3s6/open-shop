"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Truck,
  CreditCard,
  User,
  Check,
  Edit2,
  Navigation,
  Search,
  Tag,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useStore, useCurrency } from "@/store/useStore";
import { formatPrice, round } from "@/lib/pricing";
import { GCC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { playChime } from "@/lib/pushClient";

type ShippingOption = {
  id: number;
  nameAr: string;
  deliveryTimeAr: string | null;
  logoUrl: string | null;
  baseCostKwd: number;
  costKwd: number;
  costConverted: number;
  isFree: boolean;
};

const KUWAIT_GOVERNORATES = [
  "العاصمة",
  "حولي",
  "الفروانية",
  "الأحمدي",
  "الجهراء",
  "مبارك الكبير",
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const clearCart = useStore((s) => s.clearCart);
  const user = useStore((s) => s.user);
  const currency = useCurrency();
  const rate = currency.exchangeRateFromKwd || 1;

  // Active Accordion Step: 1 | 2 | 3 | 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Cart Drawer toggle in header
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountKwd, setDiscountKwd] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponBox, setShowCouponBox] = useState(false);

  // Step 1: Customer Info
  const [isGuest, setIsGuest] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("+965");
  const [phone, setPhone] = useState("");
  const [step1Done, setStep1Done] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Address & Map
  const [country, setCountry] = useState(currency.countryAr || "الكويت");
  const [governorate, setGovernorate] = useState("حولي");
  const [cityArea, setCityArea] = useState("");
  const [blockStreet, setBlockStreet] = useState("");
  const [houseBuilding, setHouseBuilding] = useState("");
  const [floorApartment, setFloorApartment] = useState("");
  const [addressNotes, setAddressNotes] = useState("");
  const [latitude, setLatitude] = useState<number | null>(29.3759);
  const [longitude, setLongitude] = useState<number | null>(47.9774);
  const [formattedMapAddress, setFormattedMapAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Step 3: Shipping
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [shippingCostKwd, setShippingCostKwd] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  // Step 4: Payment & Simulator Modal
  const [paymentMethod, setPaymentMethod] = useState("MYFATOORAH_MOCK_KNET");
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(null);

  // Auto-fill customer info if logged in
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhoneCode(user.phoneCountryCode || "+965");
      setPhone(user.phoneNumber || "");
      setIsGuest(false);
      setStep1Done(true);
      setStep(2);
    }
  }, [user]);

  // Subtotal calculations
  const subtotalKwd = round(
    cart.reduce((s, item) => s + item.unitPriceKwd * item.quantity, 0),
    3
  );
  const subtotalConverted = round(subtotalKwd * rate, currency.decimals);
  const discountConverted = round(discountKwd * rate, currency.decimals);
  const netSubtotalKwd = Math.max(0, round(subtotalKwd - discountKwd, 3));

  const totalKwd = round(netSubtotalKwd + shippingCostKwd, 3);
  const totalConverted = round(totalKwd * rate, currency.decimals);

  // Load Shipping Options when Subtotal or Currency changes
  useEffect(() => {
    let active = true;
    setShippingLoading(true);
    fetch(`/api/shipping?currency=${currency.code}&subtotalKwd=${netSubtotalKwd}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const options: ShippingOption[] = data.companies || [];
        setShippingOptions(options);
        if (options.length > 0) {
          const chosen = options[0];
          setSelectedShippingId(chosen.id);
          setShippingCostKwd(chosen.costKwd);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setShippingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currency.code, netSubtotalKwd]);

  // Request browser location
  const detectLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      alert("خاصية تحديد الموقع غير مدعومة في جهازك");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setFormattedMapAddress(`إحداثيات محددة: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("تعذر الوصول لموقعك الحالي. يرجى تفعيل إذن الموقع بالمتصفح");
      },
      { timeout: 10000 }
    );
  };

  // Coupon application
  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
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
      setShowCouponBox(false);
    } catch {
      setCouponError("تعذر التحقق من الكوبون");
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle Step 1 Confirmation
  const confirmStep1 = () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setStep1Error("يرجى تعبئة الاسم الأول، الاسم الأخير، ورقم الجوال");
      return;
    }
    setStep1Error(null);
    setStep1Done(true);
    setStep(2);
  };

  // Handle Step 2 Confirmation
  const confirmStep2 = () => {
    if (!cityArea.trim() || !blockStreet.trim() || !houseBuilding.trim()) {
      setStep2Error("يرجى تعبئة المدينة/المنطقة، القطعة والشارع، ورقم المنزل");
      return;
    }
    setStep2Error(null);
    setStep2Done(true);
    setStep(3);
  };

  // Handle Step 3 Confirmation
  const confirmStep3 = () => {
    const option = shippingOptions.find((o) => o.id === selectedShippingId) || shippingOptions[0];
    if (option) {
      setShippingCostKwd(option.costKwd);
    }
    setStep3Done(true);
    setStep(4);
  };

  // Initiate Order Submission
  const submitOrder = async () => {
    setPayError(null);
    setPaying(true);

    try {
      const payload = {
        customer: {
          firstName,
          lastName,
          email: email || null,
          phoneCode,
          phone,
        },
        address: {
          country,
          governorate,
          cityArea,
          blockStreet,
          houseBuilding,
          floorApartment: floorApartment || null,
          addressNotes: addressNotes || null,
          latitude,
          longitude,
          googleMapsUrl:
            latitude && longitude
              ? `https://www.google.com/maps?q=${latitude},${longitude}`
              : null,
          formattedMapAddress,
        },
        items: cart.map((c) => ({
          productId: c.productId,
          variantId: c.variantId || null,
          quantity: c.quantity,
        })),
        shippingCompanyId: selectedShippingId,
        currencyCode: currency.code,
        couponCode: couponCode || null,
        paymentMethod,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || "تعذر إنشاء الطلب، يرجى المحاولة ثانية");
        setPaying(false);
        return;
      }

      setCurrentOrderNumber(data.orderNumber);

      if (paymentMethod === "COD") {
        // Cash on delivery directly finalized
        playChime();
        clearCart();
        router.push(`/order-success/${data.orderNumber}`);
        return;
      }

      if (data.mode === "LIVE" && data.invoiceUrl) {
        // Redirect to real MyFatoorah gateway
        clearCart();
        window.location.href = data.invoiceUrl;
        return;
      }

      // Open Mock Payment Simulator Modal
      setSimulatorOpen(true);
      setPaying(false);
    } catch {
      setPayError("تعذر الاتصال بالخادم");
      setPaying(false);
    }
  };

  // Complete Simulated Payment (Approve or Decline)
  const finalizePaymentSimulation = async (approve: boolean) => {
    if (!currentOrderNumber) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/orders/${currentOrderNumber}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: approve }),
      });
      const data = await res.json();
      if (!res.ok || !approve) {
        setPayError("تم رفض عملية الدفع من قبل البنك (محاكاة فشل الدفع). يمكنك المحاولة ثانية.");
        setSimulatorOpen(false);
        setPaying(false);
        return;
      }

      playChime();
      clearCart();
      router.push(`/order-success/${currentOrderNumber}`);
    } catch {
      setPayError("تعذر تأكيد الدفع");
      setSimulatorOpen(false);
      setPaying(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-luxe py-20 text-center">
        <h1 className="font-cairo text-2xl font-bold">سلة التسوق فارغة</h1>
        <p className="mt-2 text-sm text-muted">لا يمكن إتمام الطلب دون إضافة منتجات للسلة</p>
        <Link href="/" className="btn-brand mt-6">
          تصفح المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Distraction-Free Luxury Checkout Header (Matching Screenshots) */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white shadow-sm">
        <div className="container-luxe py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-brand/40 bg-charcoal text-brand">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
                  <path d="M12 3c2.2 2.6 3.4 5.3 3.4 8.2 0 2.8-1.4 5.2-3.4 7.2-2-2-3.4-4.4-3.4-7.2C8.6 8.3 9.8 5.6 12 3Z" fill="currentColor" />
                </svg>
              </span>
              <span>
                <span className="block font-amiri text-xl font-bold text-ink">كسيرات</span>
                <span className="block text-[8px] font-bold tracking-[0.3em] text-brand">KSEERAT</span>
              </span>
            </Link>

            {/* Total and Coupon Link */}
            <div className="text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted">إجمالي الطلب:</span>
                <span className="font-cairo text-lg font-extrabold text-sale">
                  {formatPrice(totalConverted, currency)}
                </span>
              </div>
              {!couponCode ? (
                <button
                  onClick={() => setShowCouponBox((v) => !v)}
                  className="text-[11px] font-bold text-brand transition hover:underline"
                >
                  عندك كوبون خصم؟
                </button>
              ) : (
                <span className="text-[11px] font-bold text-success">
                  تم تطبيق الخصم: {couponCode}
                </span>
              )}
            </div>
          </div>

          {/* Drawer trigger */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setShowOrderDrawer((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-cream/70 px-4 py-1 text-xs font-bold text-ink transition hover:border-brand"
            >
              <span>تفاصيل الطلب ({cart.length})</span>
              {showOrderDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Expandable Order Details */}
          {showOrderDrawer && (
            <div className="mt-3 space-y-2.5 rounded-2xl border border-black/10 bg-white p-4 shadow-luxe">
              <div className="max-h-60 space-y-2.5 overflow-y-auto pe-1">
                {cart.map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.image || "/icons/icon-192.svg"}
                        alt={item.nameAr}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-ink">{item.nameAr}</p>
                        <p className="text-[10px] text-muted">
                          {item.variantName || ""} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-sale">
                      {formatPrice(
                        round(item.unitPriceKwd * item.quantity * rate, currency.decimals),
                        currency
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Coupon Box */}
          {showCouponBox && !couponCode && (
            <div className="mt-3 flex max-w-sm gap-2 rounded-2xl border border-brand/30 bg-white p-2 shadow-sm">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="أدخل رمز الكوبون"
                className="input-luxe py-2 text-xs uppercase"
              />
              <button
                onClick={applyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="btn-brand px-4 py-2 text-xs"
              >
                {couponLoading ? "..." : "تطبيق"}
              </button>
            </div>
          )}
          {couponError && <p className="mt-1 text-xs font-semibold text-sale">{couponError}</p>}
        </div>
      </header>

      {/* Main 4-Step Accordion Form */}
      <main className="container-luxe max-w-3xl py-8">
        {payError && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-sale/30 bg-red-50 p-4 text-xs font-bold text-sale shadow-sm">
            <AlertCircle size={18} />
            <span>{payError}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* STEP 1: معلومات العميل */}
          <section className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-black/5 bg-white p-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                    step1Done ? "bg-success text-white" : "bg-brand text-white"
                  )}
                >
                  {step1Done ? <Check size={14} /> : "1"}
                </span>
                <h2 className="font-cairo text-sm font-bold text-ink">معلومات العميل</h2>
              </div>
              {step1Done && step !== 1 && (
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-brand transition hover:bg-cream"
                >
                  <Edit2 size={12} /> تعديل
                </button>
              )}
            </div>

            {step === 1 ? (
              <div className="p-5">
                {step1Error && (
                  <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-sale">
                    {step1Error}
                  </div>
                )}

                {!user && !isGuest ? (
                  <div>
                    <div className="rounded-2xl border border-black/[0.06] bg-cream/70 p-5 text-center">
                      <p className="text-xs font-bold text-ink">
                        لديك حساب بالفعل في كسيرات؟ سجّل دخولك لكسب نقاط الولاء
                      </p>
                      <button
                        onClick={() =>
                          window.dispatchEvent(new CustomEvent("kseerat:open-login"))
                        }
                        className="btn-brand mt-4 px-8 py-2.5 text-xs font-bold"
                      >
                        تسجيل الدخول
                      </button>
                    </div>

                    <div className="relative my-6 text-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-black/10" />
                      </div>
                      <span className="relative bg-white px-3 text-xs text-muted">أو</span>
                    </div>

                    <button
                      onClick={() => setIsGuest(true)}
                      className="flex w-full items-center justify-between rounded-2xl border border-black/15 p-4 text-xs font-bold text-ink transition hover:border-brand hover:bg-cream"
                    >
                      <span className="text-brand">&lt; الشراء كضيف</span>
                      <span>متابعة الطلب بدون حساب</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-ink">
                      حيّاك، ضيفنا الكريم - فضلاً أضف بيانات التواصل معك.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label-luxe">الاسم الأول *</label>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="محمد"
                          className="input-luxe"
                        />
                      </div>
                      <div>
                        <label className="label-luxe">الاسم الأخير *</label>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="العازمي"
                          className="input-luxe"
                        />
                      </div>
                      <div>
                        <label className="label-luxe">البريد الإلكتروني (اختياري)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="input-luxe"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="label-luxe">رقم الجوال *</label>
                        <div className="flex gap-2">
                          <select
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value)}
                            className="input-luxe w-32 px-2"
                            dir="ltr"
                          >
                            {GCC.map((c) => (
                              <option key={c.dial} value={c.dial}>
                                {c.flag} {c.dial}
                              </option>
                            ))}
                          </select>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="5000 0000"
                            className="input-luxe flex-1"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    <button onClick={confirmStep1} className="btn-brand mt-5 w-full py-3 text-xs">
                      المتابعة كضيف ←
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-xs font-semibold text-ink/80">
                <span>
                  حيّاك، <strong>{firstName} {lastName}</strong> · {phoneCode} {phone}
                </span>
              </div>
            )}
          </section>

          {/* STEP 2: عنوان التوصيل والخريطة */}
          <section className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-black/5 bg-white p-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                    step2Done ? "bg-success text-white" : "bg-brand text-white"
                  )}
                >
                  {step2Done ? <Check size={14} /> : "2"}
                </span>
                <h2 className="font-cairo text-sm font-bold text-ink">عنوان التوصيل والخريطة</h2>
              </div>
              {step2Done && step !== 2 && (
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-brand transition hover:bg-cream"
                >
                  <Edit2 size={12} /> تعديل
                </button>
              )}
            </div>

            {step === 2 ? (
              <div className="p-5">
                {step2Error && (
                  <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-sale">
                    {step2Error}
                  </div>
                )}

                {/* Interactive Map Visual */}
                <div className="relative mb-5 overflow-hidden rounded-2xl border border-black/10 bg-slate-100 shadow-inner">
                  <div className="relative h-56 w-full bg-[#E5E3DF] p-4">
                    {/* Simulated Map Background Grid */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          "linear-gradient(#B39A7B 1px, transparent 1px), linear-gradient(90deg, #B39A7B 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                      }}
                    />

                    {/* Map center Pin */}
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="relative -mt-6 flex flex-col items-center animate-bounce">
                        <MapPin size={38} className="fill-brand text-charcoal shadow-lg" />
                        <span className="h-2 w-4 rounded-full bg-black/30 blur-[2px]" />
                      </div>
                    </div>

                    {/* Floating Map Controls */}
                    <button
                      onClick={detectLocation}
                      disabled={locating}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-md transition hover:bg-brand hover:text-white"
                    >
                      <Navigation size={14} className={locating ? "animate-spin" : ""} />
                      <span>{locating ? "جاري التحديد..." : "موقعي الحالي ⌖"}</span>
                    </button>

                    <div className="absolute top-3 inset-x-3 max-w-sm mx-auto">
                      <div className="relative">
                        <Search
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                        />
                        <input
                          value={formattedMapAddress}
                          onChange={(e) => setFormattedMapAddress(e.target.value)}
                          placeholder="ابحث عن عنوان أو اسحب الدبوس..."
                          className="h-9 w-full rounded-full border border-black/10 bg-white/95 pr-9 pl-3 text-xs outline-none shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="bg-white/80 p-2 text-center text-[10px] text-muted">
                    تم التقاط الإحداثيات تلقائياً: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                  </p>
                </div>

                {/* Structured Address Form */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label-luxe">الدولة *</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="input-luxe"
                    >
                      {GCC.map((c) => (
                        <option key={c.code} value={c.countryAr}>
                          {c.flag} {c.countryAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label-luxe">المحافظة *</label>
                    {country === "الكويت" ? (
                      <select
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="input-luxe"
                      >
                        {KUWAIT_GOVERNORATES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        placeholder="المنطقة / المحافظة"
                        className="input-luxe"
                      />
                    )}
                  </div>

                  <div>
                    <label className="label-luxe">المدينة / المنطقة *</label>
                    <input
                      value={cityArea}
                      onChange={(e) => setCityArea(e.target.value)}
                      placeholder="مثال: السالمية"
                      className="input-luxe"
                    />
                  </div>

                  <div>
                    <label className="label-luxe">القطعة والشارع *</label>
                    <input
                      value={blockStreet}
                      onChange={(e) => setBlockStreet(e.target.value)}
                      placeholder="قطعة 4، شارع سالم المبارك"
                      className="input-luxe"
                    />
                  </div>

                  <div>
                    <label className="label-luxe">رقم المنزل / المبنى *</label>
                    <input
                      value={houseBuilding}
                      onChange={(e) => setHouseBuilding(e.target.value)}
                      placeholder="منزل 12 أو برج النخبة"
                      className="input-luxe"
                    />
                  </div>

                  <div>
                    <label className="label-luxe">الدور / الشقة / إضافات</label>
                    <input
                      value={floorApartment}
                      onChange={(e) => setFloorApartment(e.target.value)}
                      placeholder="الدور الثاني - شقة 5"
                      className="input-luxe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label-luxe">علامة مميزة / ملاحظات التوصيل</label>
                    <textarea
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value)}
                      placeholder="بجوار المسجد الكبير، الاتصال قبل الوصول بـ 15 دقيقة..."
                      className="input-luxe h-20 resize-none py-2"
                    />
                  </div>
                </div>

                <button onClick={confirmStep2} className="btn-brand mt-5 w-full py-3 text-xs">
                  تأكيد عنوان التوصيل ←
                </button>
              </div>
            ) : (
              step2Done && (
                <div className="p-4 text-xs text-ink/80">
                  <p className="font-bold">
                    {country} - {governorate} - {cityArea}
                  </p>
                  <p className="mt-0.5 text-muted">
                    {blockStreet}، مبنى/منزل {houseBuilding} {floorApartment ? `، ${floorApartment}` : ""}
                  </p>
                </div>
              )
            )}
          </section>

          {/* STEP 3: شركة الشحن */}
          <section className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-black/5 bg-white p-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                    step3Done ? "bg-success text-white" : "bg-brand text-white"
                  )}
                >
                  {step3Done ? <Check size={14} /> : "3"}
                </span>
                <h2 className="font-cairo text-sm font-bold text-ink">شركة الشحن</h2>
              </div>
              {step3Done && step !== 3 && (
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-brand transition hover:bg-cream"
                >
                  <Edit2 size={12} /> تعديل
                </button>
              )}
            </div>

            {step === 3 ? (
              <div className="p-5">
                {shippingLoading ? (
                  <p className="py-6 text-center text-xs text-muted">جاري تحميل خيارات الشحن...</p>
                ) : (
                  <div className="space-y-3">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition",
                          selectedShippingId === opt.id
                            ? "border-brand bg-brand-light/40 shadow-sm"
                            : "border-black/10 hover:border-black/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShippingId === opt.id}
                            onChange={() => {
                              setSelectedShippingId(opt.id);
                              setShippingCostKwd(opt.costKwd);
                            }}
                            className="accent-brand"
                          />
                          <div>
                            <p className="text-xs font-bold text-ink">{opt.nameAr}</p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              {opt.deliveryTimeAr || "توصيل سريع وموثوق"}
                            </p>
                          </div>
                        </div>

                        <span className="font-cairo text-xs font-bold">
                          {opt.isFree ? (
                            <span className="text-success font-extrabold">شحن مجاني</span>
                          ) : (
                            formatPrice(opt.costConverted, currency)
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  onClick={confirmStep3}
                  className="btn-dark mt-5 w-full py-3 text-xs font-bold"
                >
                  تأكيد شركة الشحن ←
                </button>
              </div>
            ) : (
              step3Done && (
                <div className="p-4 text-xs font-semibold text-ink/80">
                  <span>
                    تم اختيار:{" "}
                    <strong>
                      {shippingOptions.find((o) => o.id === selectedShippingId)?.nameAr || "الشحن و التوصيل"}
                    </strong>{" "}
                    ({shippingCostKwd === 0 ? "مجاني" : formatPrice(round(shippingCostKwd * rate, currency.decimals), currency)})
                  </span>
                </div>
              )
            )}
          </section>

          {/* STEP 4: الدفع */}
          <section className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-black/5 bg-white p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                  4
                </span>
                <h2 className="font-cairo text-sm font-bold text-ink">طريقة الدفع</h2>
              </div>
            </div>

            {step === 4 && (
              <div className="p-5">
                <div className="space-y-3">
                  {[
                    {
                      id: "MYFATOORAH_MOCK_KNET",
                      title: "كي نت (KNET - MyFatoorah)",
                      desc: "الدفع الفوري الآمن بالبطاقات المصرفية الكويتية",
                    },
                    {
                      id: "MYFATOORAH_MOCK_CARD",
                      title: "بطاقة ائتمانية (Visa / Mastercard - MyFatoorah)",
                      desc: "الدفع ببطاقات فيزا وماستركارد الدولية والخليجية",
                    },
                    {
                      id: "MYFATOORAH_MOCK_APPLEPAY",
                      title: "Apple Pay (MyFatoorah)",
                      desc: "دفع سريع وبلمسة واحدة عبر أجهزة Apple",
                    },
                    {
                      id: "COD",
                      title: "الدفع عند الاستلام (Cash on Delivery)",
                      desc: "ادفع نقداً عند استلام شحنتك من مندوب التوصيل",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition",
                        paymentMethod === method.id
                          ? "border-brand bg-brand-light/40 shadow-sm"
                          : "border-black/10 hover:border-black/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="accent-brand"
                        />
                        <div>
                          <p className="text-xs font-bold text-ink">{method.title}</p>
                          <p className="mt-0.5 text-[11px] text-muted">{method.desc}</p>
                        </div>
                      </div>
                      <CreditCard size={18} className="text-brand/60" />
                    </label>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-black/10 bg-cream p-4">
                  <div className="flex items-center justify-between font-cairo">
                    <span className="text-xs font-bold text-muted">المبلغ الإجمالي المستحق:</span>
                    <span className="text-xl font-extrabold text-sale">
                      {formatPrice(totalConverted, currency)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={submitOrder}
                  disabled={paying}
                  className="btn-brand mt-5 w-full py-3.5 text-sm font-bold shadow-md"
                >
                  {paying ? "جاري المعالجة..." : "إتمام الدفع وتأكيد الطلب ✓"}
                </button>

                <p className="mt-3 text-center text-[10px] text-muted">
                  بالضغط على إتمام الدفع أنت توافق على شروط الخدمة وسياسة الاسترجاع في كسيرات
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Realistic MyFatoorah Payment Simulator Modal */}
      {simulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Gateway Header */}
            <div className="bg-charcoal p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-charcoal">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-wider">MYFATOORAH GATEWAY</p>
                    <p className="text-[10px] text-brand">بوابة الدفع الإلكتروني المعتمدة</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  وضع المحاكاة التجريبي
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-white/10 p-3 text-center">
                <p className="text-[11px] text-white/75">قيمة الفاتورة للطلب #{currentOrderNumber}</p>
                <p className="mt-1 font-cairo text-2xl font-extrabold text-brand">
                  {formatPrice(totalConverted, currency)}
                </p>
              </div>
            </div>

            {/* Simulated Card / Bank Info */}
            <div className="p-6">
              <p className="text-xs font-bold text-ink">بيانات البطاقة التجريبية</p>
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-black/10 bg-slate-50 p-3 text-xs">
                  <span className="block text-[10px] text-muted">البنك المصدر:</span>
                  <span className="font-bold">بنك الكويت الوطني (NBK) / KNET</span>
                </div>
                <div className="rounded-xl border border-black/10 bg-slate-50 p-3 text-xs">
                  <span className="block text-[10px] text-muted">رقم البطاقة الافتراضي:</span>
                  <span className="font-mono font-bold" dir="ltr">
                    •••• •••• •••• 4242
                  </span>
                </div>
              </div>

              {/* Action Simulation Buttons */}
              <div className="mt-6 space-y-2.5">
                <button
                  onClick={() => finalizePaymentSimulation(true)}
                  disabled={paying}
                  className="btn-brand w-full py-3 text-xs font-bold"
                >
                  {paying ? "جاري التأكيد..." : "✓ محاكاة دفع ناجح (Approve Payment)"}
                </button>
                <button
                  onClick={() => finalizePaymentSimulation(false)}
                  disabled={paying}
                  className="w-full rounded-full border border-sale/40 py-2.5 text-xs font-bold text-sale transition hover:bg-red-50"
                >
                  ✕ محاكاة فشل الدفع (Decline)
                </button>
              </div>

              <p className="mt-4 text-center text-[10px] text-muted">
                هذه محاكاة تجريبية مدمجة لنظام الدفع MyFatoorah لاختبار الطلبات محلياً.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
