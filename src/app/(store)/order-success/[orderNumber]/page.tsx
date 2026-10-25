import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MapPin, Printer, ArrowRight, ShieldCheck, Truck, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from "@/lib/constants";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const { orderNumber } = params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, shippingCompany: true },
  });

  if (!order) {
    notFound();
  }

  const orderStatusAr =
    ORDER_STATUS[order.orderStatus as keyof typeof ORDER_STATUS] || order.orderStatus;
  const paymentStatusAr =
    PAYMENT_STATUS[order.paymentStatus as keyof typeof PAYMENT_STATUS] || order.paymentStatus;
  const paymentMethodAr =
    PAYMENT_METHODS[order.paymentMethod as keyof typeof PAYMENT_METHODS] || order.paymentMethod;

  return (
    <div className="container-luxe py-10 sm:py-14">
      {/* Success banner */}
      <div className="no-print mx-auto max-w-2xl text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-success">
          <CheckCircle2 size={46} strokeWidth={1.8} />
        </div>
        <h1 className="mt-4 font-cairo text-2xl font-bold text-ink sm:text-3xl">
          تم استلام طلبك بنجاح في كسيرات!
        </h1>
        <p className="mt-2 text-sm text-muted">
          شكراً لثقتك بنا. طلبك رقم <strong className="text-brand">#{order.orderNumber}</strong> قيد المراجعة وسنوافيك بالتحديثات.
        </p>
      </div>

      {/* Invoice Card */}
      <div className="print-area mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-black/[0.08] bg-white p-6 shadow-luxe sm:p-8">
        {/* Invoice Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-charcoal text-brand">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
                  <path d="M12 3c2.2 2.6 3.4 5.3 3.4 8.2 0 2.8-1.4 5.2-3.4 7.2-2-2-3.4-4.4-3.4-7.2C8.6 8.3 9.8 5.6 12 3Z" fill="currentColor" />
                </svg>
              </span>
              <div>
                <span className="block font-amiri text-xl font-bold text-ink">كسيرات | Kseerat</span>
                <span className="block text-[9px] font-bold tracking-[0.25em] text-brand">دار عطور كويتية فاخرة</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              الكويت · هاتف: +965 2222 8888 · support@kseerat.com
            </p>
          </div>

          <div className="text-start sm:text-left">
            <span className="block font-cairo text-sm font-bold text-brand">فاتورة شراء معتمدة</span>
            <span className="block font-mono text-xs font-bold text-ink">#{order.orderNumber}</span>
            <span className="block text-[11px] text-muted">
              {new Date(order.createdAt).toLocaleDateString("ar-KW", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Order & Customer Details Grid */}
        <div className="grid gap-6 border-b border-black/10 py-6 sm:grid-cols-2">
          {/* Customer Details */}
          <div>
            <h3 className="font-cairo text-xs font-bold uppercase tracking-wider text-muted">
              بيانات العميل
            </h3>
            <p className="mt-2 text-sm font-bold text-ink">
              {order.customerFirstName} {order.customerLastName}
            </p>
            <p className="mt-0.5 text-xs text-muted" dir="ltr">
              {order.customerPhoneCode} {order.customerPhone}
            </p>
            {order.customerEmail && (
              <p className="text-xs text-muted">{order.customerEmail}</p>
            )}
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-[11px] font-bold text-brand">
              <span>طريقة الدفع:</span>
              <span>{paymentMethodAr}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-cairo text-xs font-bold uppercase tracking-wider text-muted">
              عنوان التوصيل
            </h3>
            <p className="mt-2 text-xs font-bold text-ink">
              {order.country} · {order.governorate} · {order.cityArea}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {order.blockStreet}، مبنى {order.houseBuilding} {order.floorApartment ? `، ${order.floorApartment}` : ""}
            </p>
            {order.addressNotes && (
              <p className="mt-1 text-[11px] text-muted italic">
                ملاحظات: {order.addressNotes}
              </p>
            )}

            {order.googleMapsUrl && (
              <a
                href={order.googleMapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="no-print mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
              >
                <MapPin size={12} /> فتح الموقع على Google Maps 📍
              </a>
            )}
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-3 border-b border-black/10 py-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="text-muted">حالة الطلب:</span>
            <span className="rounded-full bg-brand/15 px-3 py-0.5 text-brand">
              {orderStatusAr}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted">حالة الدفع:</span>
            <span
              className={`rounded-full px-3 py-0.5 ${
                order.paymentStatus === "PAID"
                  ? "bg-emerald-100 text-success"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {paymentStatusAr}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted">شركة الشحن:</span>
            <span className="text-ink">{order.shippingCompanyName || "الشحن و التوصيل"}</span>
          </div>
        </div>

        {/* Ordered items table */}
        <div className="py-6">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-black/10 text-muted">
                <th className="pb-3 font-bold">المنتج</th>
                <th className="pb-3 text-center font-bold">الكمية</th>
                <th className="pb-3 text-left font-bold">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.nameAr}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-bold text-ink">{item.nameAr}</p>
                        {item.variantNameAr && (
                          <p className="text-[10px] text-muted">{item.variantNameAr}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center font-bold text-ink">{item.quantity}</td>
                  <td className="py-3 text-left font-bold text-sale">
                    {(item.totalPriceKwd * order.exchangeRateUsed).toFixed(2)} {order.currencyCode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Totals */}
        <div className="border-t border-black/10 pt-4">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>مجموع المنتجات</span>
              <span className="font-bold text-ink">
                {(order.subtotalKwd * order.exchangeRateUsed).toFixed(2)} {order.currencyCode}
              </span>
            </div>
            {order.discountKwd > 0 && (
              <div className="flex justify-between font-bold text-sale">
                <span>الخصم {order.couponCode ? `(${order.couponCode})` : ""}</span>
                <span>
                  -{(order.discountKwd * order.exchangeRateUsed).toFixed(2)} {order.currencyCode}
                </span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>رسوم الشحن</span>
              <span className="font-bold text-ink">
                {order.shippingCostKwd === 0
                  ? "مجاني"
                  : `${(order.shippingCostKwd * order.exchangeRateUsed).toFixed(2)} ${order.currencyCode}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-3 text-sm font-bold">
              <span className="font-cairo text-ink">الإجمالي النهائي</span>
              <span className="font-cairo text-lg font-extrabold text-sale">
                {order.totalInSelectedCurrency.toFixed(2)} {order.currencyCode}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 border-t border-black/5 pt-4 text-center text-[10px] text-muted">
          بكل فخر... صُنع في الكويت ويُشحن لجميع دول الخليج العربي · شكراً لشرائكم من كسيرات
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      <div className="no-print mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
        <PrintButton />
        <Link
          href={`/order-track?order=${order.orderNumber}`}
          className="btn-dark flex-1 py-3 text-xs"
        >
          <Truck size={15} /> تتبع حالة الطلب
        </Link>
        <Link href="/" className="btn-ghost flex-1 py-3 text-center text-xs">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
