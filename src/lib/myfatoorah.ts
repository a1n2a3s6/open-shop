import { prisma } from "./prisma";

export type MfConfig = {
  mode: "MOCK" | "LIVE";
  apiKey: string;
  baseUrl: string;
};

export async function getMyFatoorahConfig(): Promise<MfConfig> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  const mode = (settings?.myfatoorahMode || process.env.MYFATOORAH_MODE || "MOCK") === "LIVE" ? "LIVE" : "MOCK";
  const apiKey = settings?.myfatoorahApiKey || process.env.MYFATOORAH_API_KEY || "";
  const baseUrl =
    settings?.myfatoorahBaseUrl || process.env.MYFATOORAH_BASE_URL || "https://apitest.myfatoorah.com";
  return { mode, apiKey, baseUrl };
}

export type InitiatePaymentArgs = {
  orderNumber: string;
  amount: number;
  currencyCode: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
};

export type InitiatePaymentResult = {
  mode: "MOCK" | "LIVE";
  invoiceId?: string;
  invoiceUrl?: string;
};

export async function initiatePayment(args: InitiatePaymentArgs): Promise<InitiatePaymentResult> {
  const config = await getMyFatoorahConfig();
  if (config.mode === "MOCK" || !config.apiKey) {
    return { mode: "MOCK", invoiceId: `MOCK-${args.orderNumber}` };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${config.baseUrl}/v2/Invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      InvoiceValue: args.amount,
      DisplayCurrencyIso: args.currencyCode,
      CustomerName: args.customerName,
      CustomerEmail: args.customerEmail || undefined,
      CustomerMobile: args.customerPhone,
      CustomerReference: args.orderNumber,
      Language: "ar",
      NotificationOption: "LNK",
      CallBackUrl: `${siteUrl}/order-success/${args.orderNumber}`,
      ErrorUrl: `${siteUrl}/checkout?error=payment`,
    }),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data?.Data?.InvoiceUrl) {
    throw new Error(data?.Message || "MyFatoorah initiatePayment failed");
  }
  return {
    mode: "LIVE",
    invoiceId: String(data.Data.InvoiceId ?? ""),
    invoiceUrl: data.Data.InvoiceUrl,
  };
}

export async function executePayment(paymentId: string) {
  const config = await getMyFatoorahConfig();
  if (config.mode === "MOCK") return { status: "PAID" as const, paymentId };
  const res = await fetch(`${config.baseUrl}/v2/GetPaymentStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ Key: paymentId, KeyType: "PaymentId" }),
    cache: "no-store",
  });
  const data = await res.json();
  const paid = String(data?.Data?.InvoiceStatus || "").toUpperCase() === "PAID";
  return { status: paid ? ("PAID" as const) : ("FAILED" as const), raw: data };
}

export async function getPaymentStatus(invoiceId: string) {
  const config = await getMyFatoorahConfig();
  if (config.mode === "MOCK") return { status: "PENDING" as const, mock: true };
  const res = await fetch(`${config.baseUrl}/v2/GetPaymentStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ Key: invoiceId, KeyType: "InvoiceId" }),
    cache: "no-store",
  });
  const data = await res.json();
  return { status: data?.Data?.InvoiceStatus, raw: data };
}
