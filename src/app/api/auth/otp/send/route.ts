import { NextResponse } from "next/server";
import { createOtp } from "@/lib/otp";
import { smtpConfigured } from "@/lib/mailer";
import { errorResponse } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const channel = body.channel === "phone" ? "phone" : "email";
    const identifier = String(body.identifier || "").trim();

    if (channel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      return errorResponse("البريد الإلكتروني غير صالح");
    }
    if (channel === "phone" && !/^\+\d{7,15}$/.test(identifier)) {
      return errorResponse("رقم الجوال غير صالح");
    }

    const { code, emailed } = await createOtp(identifier, channel);
    const exposeCode = !smtpConfigured() || process.env.NODE_ENV !== "production";

    return NextResponse.json({
      ok: true,
      channel,
      emailed,
      devCode: exposeCode ? code : undefined,
      message: channel === "email" ? "تم إرسال رمز التحقق إلى بريدك" : "تم إرسال رمز التحقق إلى جوالك",
    });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر إرسال رمز التحقق", 500);
  }
}
