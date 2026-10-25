import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { round } from "@/lib/pricing";
import { finalizeOrder, nextOrderNumber } from "@/lib/orders";
import { initiatePayment } from "@/lib/myfatoorah";
import { parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAYMENT_METHODS = [
  "MYFATOORAH_MOCK_KNET",
  "MYFATOORAH_MOCK_CARD",
  "MYFATOORAH_MOCK_APPLEPAY",
  "COD",
];

type IncomingItem = { productId?: string; variantId?: string | null; quantity?: number };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getSessionUser();
    const customer = body.customer || {};
    const address = body.address || {};
    const itemsInput: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
    const currencyCode = String(body.currencyCode || "KWD");
    const paymentMethod = String(body.paymentMethod || "MYFATOORAH_MOCK_KNET");

    if (!itemsInput.length) return errorResponse("سلة التسوق فارغة");
    if (!PAYMENT_METHODS.includes(paymentMethod)) return errorResponse("طريقة الدفع غير مدعومة");

    const required = [
      customer.firstName,
      customer.lastName,
      customer.phone,
      address.country,
      address.governorate,
      address.cityArea,
      address.blockStreet,
      address.houseBuilding,
    ];
    if (required.some((v) => !String(v || "").trim())) {
      return errorResponse("يرجى تعبئة جميع الحقول المطلوبة");
    }

    const currency = await prisma.currency.findUnique({ where: { code: currencyCode } });
    if (!currency) return errorResponse("العملة غير مدعومة");

    const productIds = Array.from(new Set(itemsInput.map((i) => String(i.productId || "")))).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    });
    if (!products.length) return errorResponse("المنتجات غير متوفرة");

    const orderItemsData: {
      productId: string;
      variantId: string | null;
      nameAr: string;
      variantNameAr: string | null;
      imageUrl: string | null;
      unitPriceKwd: number;
      quantity: number;
      totalPriceKwd: number;
    }[] = [];

    let subtotalKwd = 0;

    for (const item of itemsInput) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return errorResponse("أحد المنتجات لم يعد متوفراً");
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
      if (item.variantId && !variant) return errorResponse("الخيار المحدد غير متوفر");
      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock < qty) return errorResponse(`الكمية المطلوبة من ${product.nameAr} غير متوفرة`);

      const unitPriceKwd = variant
        ? variant.discountPriceKwd && variant.discountPriceKwd > 0
          ? variant.discountPriceKwd
          : variant.priceKwd
        : product.discountPriceKwd && product.discountPriceKwd > 0
        ? product.discountPriceKwd
        : product.basePriceKwd;

      const lineTotal = round(unitPriceKwd * qty, 3);
      subtotalKwd = round(subtotalKwd + lineTotal, 3);

      const images = parseJson<string[]>(product.imagesJson, []);
      orderItemsData.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        nameAr: product.nameAr,
        variantNameAr: variant?.nameAr ?? null,
        imageUrl: images[0] ?? null,
        unitPriceKwd,
        quantity: qty,
        totalPriceKwd: lineTotal,
      });
    }

    let discountKwd = 0;
    let couponCode: string | null = null;

    if (body.couponCode) {
      const code = String(body.couponCode).trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({ where: { code } });
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || coupon.expiresAt.getTime() > Date.now()) &&
        (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses) &&
        subtotalKwd >= coupon.minOrderKwd
      ) {
        const raw =
          coupon.discountType === "PERCENTAGE"
            ? (subtotalKwd * coupon.discountValue) / 100
            : coupon.discountValue;
        discountKwd = round(Math.min(raw, subtotalKwd), 3);
        couponCode = coupon.code;
      }
    }

    const netSubtotal = round(subtotalKwd - discountKwd, 3);
    const thresholdKwd = currency.freeShippingThreshold / (currency.exchangeRateFromKwd || 1);
    const qualifiesFree = netSubtotal >= thresholdKwd;

    let shippingCompany = null;
    let shippingCostKwd = 0;
    if (body.shippingCompanyId) {
      const company = await prisma.shippingCompany.findFirst({
        where: { id: Number(body.shippingCompanyId), isActive: true },
      });
      if (company) {
        const supported = parseJson<string[]>(company.supportedCountriesJson, []);
        if (!supported.length || supported.includes(currency.code)) {
          shippingCompany = company;
          shippingCostKwd = qualifiesFree ? 0 : company.baseCostKwd;
        }
      }
    }
    if (!shippingCompany) {
      shippingCostKwd = qualifiesFree ? 0 : round(currency.defaultShippingCost / (currency.exchangeRateFromKwd || 1), 3);
    }

    const totalKwd = round(netSubtotal + shippingCostKwd, 3);
    const totalInSelectedCurrency = round(totalKwd * (currency.exchangeRateFromKwd || 1), currency.decimals);
    const orderNumber = await nextOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user?.id ?? null,
        isGuest: !user,
        customerFirstName: String(customer.firstName).trim(),
        customerLastName: String(customer.lastName).trim(),
        customerPhoneCode: String(customer.phoneCode || "+965"),
        customerPhone: String(customer.phone).trim(),
        customerEmail: customer.email ? String(customer.email).trim() : null,
        country: String(address.country).trim(),
        governorate: String(address.governorate).trim(),
        cityArea: String(address.cityArea).trim(),
        blockStreet: String(address.blockStreet).trim(),
        houseBuilding: String(address.houseBuilding).trim(),
        floorApartment: address.floorApartment ? String(address.floorApartment) : null,
        addressNotes: address.addressNotes ? String(address.addressNotes) : null,
        latitude: address.latitude != null ? Number(address.latitude) : null,
        longitude: address.longitude != null ? Number(address.longitude) : null,
        googleMapsUrl: address.googleMapsUrl ? String(address.googleMapsUrl) : null,
        formattedMapAddress: address.formattedMapAddress ? String(address.formattedMapAddress) : null,
        shippingCompanyId: shippingCompany?.id ?? null,
        shippingCompanyName: shippingCompany?.nameAr ?? "الشحن و التوصيل",
        shippingCostKwd,
        currencyCode: currency.code,
        exchangeRateUsed: currency.exchangeRateFromKwd,
        subtotalKwd,
        discountKwd,
        couponCode,
        totalKwd,
        totalInSelectedCurrency,
        paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "NEW",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    if (paymentMethod === "COD") {
      const finalized = await finalizeOrder(order.orderNumber);
      return NextResponse.json({
        ok: true,
        orderNumber: order.orderNumber,
        mode: "COD",
        totalInSelectedCurrency,
        currencyCode: currency.code,
        paid: finalized.ok,
      });
    }

    try {
      const payment = await initiatePayment({
        orderNumber: order.orderNumber,
        amount: totalInSelectedCurrency,
        currencyCode: currency.code,
        customerName: `${order.customerFirstName} ${order.customerLastName}`,
        customerEmail: order.customerEmail,
        customerPhone: `${order.customerPhoneCode}${order.customerPhone}`,
      });

      if (payment.mode === "LIVE") {
        await prisma.order.update({
          where: { id: order.id },
          data: { myfatoorahInvoiceId: payment.invoiceId },
        });
      }

      return NextResponse.json({
        ok: true,
        orderNumber: order.orderNumber,
        mode: payment.mode,
        invoiceUrl: payment.invoiceUrl,
        totalInSelectedCurrency,
        currencyCode: currency.code,
      });
    } catch (payError) {
      console.error("Payment initiation failed", payError);
      return NextResponse.json(
        {
          error: "تعذر بدء عملية الدفع، يرجى المحاولة مجدداً",
          orderNumber: order.orderNumber,
        },
        { status: 502 }
      );
    }
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر إنشاء الطلب", 500);
  }
}
