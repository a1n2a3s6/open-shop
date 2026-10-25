import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

const PUBLIC_FIELDS = [
  "storeNameAr",
  "storeNameEn",
  "logoUrl",
  "primaryColor",
  "announcementAr",
  "storyTitleAr",
  "storyQuoteAr",
  "storySignatureAr",
  "heritageFooterNote",
  "trust1TitleAr",
  "trust1DescAr",
  "trust2TitleAr",
  "trust2DescAr",
  "trust3TitleAr",
  "trust3DescAr",
  "phone",
  "workingHoursAr",
  "whatsapp",
  "commercialRegistration",
  "taxNumber",
  "instagram",
  "twitter",
  "snapchat",
  "tiktok",
  "facebook",
  "youtube",
  "loyaltyTitleAr",
  "loyaltySubtitleAr",
  "googleMapsApiKey",
  "myfatoorahApiKey",
  "myfatoorahBaseUrl",
] as const;

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) return errorResponse("الإعدادات غير موجودة", 404);
  const { vapidPrivateKey, ...safe } = settings;
  return NextResponse.json({ settings: safe, vapidPublicKey: settings.vapidPublicKey });
}

export async function PUT(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const field of PUBLIC_FIELDS) {
      if (body[field] !== undefined) {
        data[field] = body[field] === "" ? null : String(body[field]);
      }
    }
    if (body.showPaymentIcons !== undefined) data.showPaymentIcons = !!body.showPaymentIcons;
    if (body.myfatoorahMode !== undefined) {
      data.myfatoorahMode = body.myfatoorahMode === "LIVE" ? "LIVE" : "MOCK";
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });
    const { vapidPrivateKey, ...safe } = settings;
    return NextResponse.json({ ok: true, settings: safe });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تحديث الإعدادات", 500);
  }
}
