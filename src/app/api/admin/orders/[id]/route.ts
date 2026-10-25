import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard, errorResponse } from "@/lib/api";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { finalizeOrder, pushOrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, user: true },
  });
  if (!order) return errorResponse("الطلب غير موجود", 404);
  return NextResponse.json({ order });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  try {
    const body = await req.json();
    const current = await prisma.order.findUnique({ where: { id: params.id } });
    if (!current) return errorResponse("الطلب غير موجود", 404);

    if (body.paymentStatus === "PAID" && current.paymentStatus !== "PAID") {
      const result = await finalizeOrder(current.orderNumber);
      if (!result.ok) return errorResponse("تعذر تأكيد الدفع", 500);
    }

    let orderStatus = current.orderStatus;
    if (body.orderStatus && body.orderStatus in ORDER_STATUS) {
      orderStatus = body.orderStatus;
    }

    let paymentStatus = current.paymentStatus;
    if (body.paymentStatus && body.paymentStatus in PAYMENT_STATUS) {
      paymentStatus = body.paymentStatus;
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { orderStatus, paymentStatus },
      include: { items: true },
    });

    if (body.orderStatus && body.orderStatus !== current.orderStatus) {
      const label = ORDER_STATUS[body.orderStatus as keyof typeof ORDER_STATUS] || body.orderStatus;
      await pushOrderStatus(order.orderNumber, label);
    }

    return NextResponse.json({ ok: true, order });
  } catch (e) {
    console.error(e);
    return errorResponse("تعذر تحديث الطلب", 500);
  }
}
