import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAndConsumeOtp } from "@/lib/otp";
import { createSession, publicUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { GCC } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePhone(identifier: string) {
  const match = GCC.find((c) => identifier.startsWith(c.dial));
  if (!match) return { phoneCountryCode: "+965", phoneNumber: identifier.replace(/\D/g, "") };
  return { phoneCountryCode: match.dial, phoneNumber: identifier.slice(match.dial.length) };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const channel = body.channel === "phone" ? "phone" : "email";
    const identifier = String(body.identifier || "").trim();
    const code = String(body.code || "").trim();

    if (!identifier || !/^\d{6}$/.test(code)) {
      return errorResponse("بيانات التحقق غير مكتملة");
    }

    const result = await verifyAndConsumeOtp(identifier, code);
    if (!result.ok) {
      return errorResponse(result.error === "EXPIRED" ? "انتهت صلاحية الرمز، أعد الإرسال" : "رمز التحقق غير صحيح", 401);
    }

    let user = null as Awaited<ReturnType<typeof prisma.user.findFirst>>;

    if (channel === "email") {
      user = await prisma.user.findUnique({ where: { email: identifier } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: identifier,
            firstName: body.firstName || "عميل",
            lastName: body.lastName || "كسيرات",
            role: "CUSTOMER",
          },
        });
      }
    } else {
      const { phoneCountryCode, phoneNumber } = parsePhone(identifier);
      user = await prisma.user.findFirst({ where: { phoneNumber, phoneCountryCode } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            phoneCountryCode,
            phoneNumber,
            firstName: body.firstName || "عميل",
            lastName: body.lastName || "كسيرات",
            role: "CUSTOMER",
          },
        });
      }
    }

    if (!user) return errorResponse("تعذر إنشاء الحساب", 500);
    await createSession(user.id);
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر التحقق من الرمز", 500);
  }
}
