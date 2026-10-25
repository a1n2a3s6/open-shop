import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api";
import { finalizeOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { orderNumber: string } }) {
  try {
    const orderNumber = params.orderNumber;
    const body = await req.json().catch(() => ({}));
    const success = body.success !== false;

    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) return errorResponse("الطلب غير موجود", 404);

    if (!success) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ ok: false, error: "PAYMENT_DECLINED" }, { status: 402 });
    }

    const result = await finalizeOrder(orderNumber);
    if (!result.ok) return errorResponse(result.error, 500);

    const updated = await prisma.order.findUnique({ where: { orderNumber } });
    return NextResponse.json({ ok: true, order: updated });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تأكيد الدفع", 500);
  }
}
