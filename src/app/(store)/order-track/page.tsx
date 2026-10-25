"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Package, CheckCircle2, Clock, Truck, Check, AlertCircle } from "lucide-react";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type TrackedOrder = {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  customerFirstName: string;
  customerLastName: string;
  country: string;
  cityArea: string;
  shippingCompanyName: string | null;
  totalInSelectedCurrency: number;
  currencyCode: string;
  createdAt: string;
  items: { nameAr: string; quantity: number }[];
};

const STEPS = [
  { key: "NEW", label: "تم استلام الطلب", icon: Clock },
  { key: "PROCESSING", label: "جاري تجهيز العطور", icon: Package },
  { key: "SHIPPED", label: "تم تسليم الشحنة للمندوب", icon: Truck },
  { key: "DELIVERED", label: "تم التوصيل بنجاح", icon: CheckCircle2 },
];

export default function OrderTrackPage() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTrack = async (targetOrder: string) => {
    if (!targetOrder.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(targetOrder.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.orders || data.orders.length === 0) {
        // Try searching direct
        setError("لم نتمكن من العثور على طلب بهذا الرقم. تأكد من إدخال رقم الطلب الصحيح مثل KSR-10001");
        setOrder(null);
        return;
      }
      setOrder(data.orders[0]);
    } catch {
      setError("تعذر تتبع الطلب حالياً، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      fetchTrack(initialOrder);
    }
  }, [initialOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrack(orderNumber);
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "NEW":
        return 0;
      case "PROCESSING":
        return 1;
      case "SHIPPED":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;
  const isCancelled = order?.orderStatus === "CANCELLED";

  return (
    <div className="container-luxe py-12">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-bold tracking-[0.3em] text-brand">KSEERAT TRACKING</span>
        <h1 className="mt-2 font-cairo text-2xl font-bold text-ink sm:text-3xl">
          تتبع حالة طلبك
        </h1>
        <p className="mt-2 text-xs text-muted">
          أدخل رقم الطلب المرسل إليك عبر الرسائل أو البريد الإلكتروني (مثال: KSR-10001)
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="رقم الطلب (مثال: KSR-10001)"
            className="input-luxe text-center font-mono uppercase"
          />
          <button
            type="submit"
            disabled={loading || !orderNumber.trim()}
            className="btn-brand shrink-0 px-6"
          >
            {loading ? "..." : <Search size={16} />}
          </button>
        </form>

        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-sale/30 bg-red-50 p-4 text-xs font-semibold text-sale">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Details Card & Visual Stepper */}
      {order && (
        <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-3xl border border-black/[0.08] bg-white p-6 shadow-luxe sm:p-8">
          <div className="flex flex-col justify-between gap-2 border-b border-black/10 pb-5 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs text-muted">رقم الشحنة:</span>
              <p className="font-mono text-base font-extrabold text-brand">
                #{order.orderNumber}
              </p>
            </div>
            <div className="text-start sm:text-left">
              <span className="text-xs text-muted">تاريخ الطلب:</span>
              <p className="text-xs font-bold text-ink">
                {new Date(order.createdAt).toLocaleDateString("ar-KW", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stepper */}
          {isCancelled ? (
            <div className="my-8 rounded-2xl bg-red-50 p-4 text-center">
              <p className="font-cairo text-base font-bold text-sale">هذا الطلب ملغي</p>
              <p className="mt-1 text-xs text-muted">
                تم إلغاء هذا الطلب. إذا كان لديك استفسار يرجى التواصل مع خدمة العملاء.
              </p>
            </div>
          ) : (
            <div className="py-8">
              <div className="relative flex justify-between">
                {/* Connecting track line */}
                <div className="absolute top-5 inset-x-6 h-0.5 bg-black/10 -z-0" />
                <div
                  className="absolute top-5 right-6 h-0.5 bg-brand transition-all duration-700 -z-0"
                  style={{
                    width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%`,
                  }}
                />

                {STEPS.map((stepItem, idx) => {
                  const Icon = stepItem.icon;
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={stepItem.key}
                      className="relative z-10 flex flex-col items-center text-center"
                    >
                      <div
                        className={cn(
                          "grid h-10 w-10 place-items-center rounded-full border-2 transition-all duration-300",
                          isDone
                            ? "border-brand bg-brand text-white shadow-md"
                            : "border-black/15 bg-white text-muted",
                          isCurrent && "ring-4 ring-brand/20 scale-110"
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <p
                        className={cn(
                          "mt-3 text-[11px] font-bold max-w-[80px]",
                          isDone ? "text-ink" : "text-muted"
                        )}
                      >
                        {stepItem.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details list */}
          <div className="rounded-2xl border border-black/5 bg-cream/70 p-4 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">العميل:</span>
              <span className="font-bold text-ink">
                {order.customerFirstName} {order.customerLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">مدينة التوصيل:</span>
              <span className="font-bold text-ink">
                {order.country} - {order.cityArea}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">شركة الشحن:</span>
              <span className="font-bold text-ink">
                {order.shippingCompanyName || "الشحن و التوصيل"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">إجمالي الفاتورة:</span>
              <span className="font-bold text-sale">
                {order.totalInSelectedCurrency.toFixed(2)} {order.currencyCode}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              href={`/order-success/${order.orderNumber}`}
              className="btn-brand px-6 py-2.5 text-xs font-bold"
            >
              عرض الفاتورة الكاملة ←
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
