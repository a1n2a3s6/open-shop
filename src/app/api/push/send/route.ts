import { NextResponse } from "next/server";
import { adminApiGuard, errorResponse } from "@/lib/api";
import { broadcastToCustomers, sendPushToRole } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const message = String(body.body || "").trim();
    const url = body.url ? String(body.url) : "/";
    const image = body.image ? String(body.image) : undefined;
    const target = body.targetRole === "ADMIN" ? "ADMIN" : "CUSTOMER";

    if (!title || !message) return errorResponse("العنوان والرسالة مطلوبان");

    const payload = { title, body: message, url, image, tag: `broadcast-${Date.now()}` };

    const result =
      target === "ADMIN"
        ? await sendPushToRole("ADMIN", payload)
        : await broadcastToCustomers(payload, { targetType: "BROADCAST", imageUrl: image });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر إرسال الإشعارات", 500);
  }
}
