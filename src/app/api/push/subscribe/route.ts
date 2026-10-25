import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const endpoint = String(body.endpoint || "");
    const p256dh = String(body.keys?.p256dh || "");
    const auth = String(body.keys?.auth || "");
    if (!endpoint || !p256dh || !auth) return errorResponse("بيانات الاشتراك غير مكتملة");

    const user = await getSessionUser();
    const requestedRole = body.userRole === "ADMIN" ? "ADMIN" : "CUSTOMER";
    if (requestedRole === "ADMIN" && user?.role !== "ADMIN") {
      return errorResponse("غير مصرح", 403);
    }
    const role = user?.role === "ADMIN" && requestedRole === "ADMIN" ? "ADMIN" : "CUSTOMER";

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        endpoint,
        p256dh,
        auth,
        userRole: role,
        userId: user?.id ?? null,
        userAgent: body.userAgent || null,
      },
      update: {
        p256dh,
        auth,
        userRole: role,
        userId: user?.id ?? null,
        userAgent: body.userAgent || null,
      },
    });

    return NextResponse.json({ ok: true, role });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر حفظ اشتراك الإشعارات", 500);
  }
}
