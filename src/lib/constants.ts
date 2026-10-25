export const ORDER_STATUS = {
  NEW: "جديد",
  PROCESSING: "جاري التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "قيد الانتظار",
  PAID: "مدفوع",
  FAILED: "فشل",
  REFUNDED: "مسترد",
} as const;

export const PAYMENT_METHODS = {
  MYFATOORAH_MOCK_KNET: "كي نت - MyFatoorah",
  MYFATOORAH_MOCK_CARD: "بطاقة ائتمانية - MyFatoorah",
  MYFATOORAH_MOCK_APPLEPAY: "Apple Pay - MyFatoorah",
  COD: "الدفع عند الاستلام",
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS;
export type PaymentStatusKey = keyof typeof PAYMENT_STATUS;

export const GCC = [
  { code: "KWD", countryAr: "الكويت", flag: "🇰🇼", dial: "+965" },
  { code: "SAR", countryAr: "السعودية", flag: "🇸🇦", dial: "+966" },
  { code: "AED", countryAr: "الإمارات", flag: "🇦🇪", dial: "+971" },
  { code: "QAR", countryAr: "قطر", flag: "🇶🇦", dial: "+974" },
  { code: "BHD", countryAr: "البحرين", flag: "🇧🇭", dial: "+973" },
  { code: "OMR", countryAr: "سلطنة عمان", flag: "🇴🇲", dial: "+968" },
] as const;
