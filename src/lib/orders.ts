import { prisma } from "./prisma";
import { notifyAdminNewOrder, notifyCustomerStatus, sendPushToUser, sendPushToRole } from "./push";

export async function nextOrderNumber() {
  const count = await prisma.order.count();
  let seq = 10001 + count;
  for (let i = 0; i < 20; i++) {
    const candidate = `KSR-${seq + i}`;
    const exists = await prisma.order.findUnique({ where: { orderNumber: candidate } });
    if (!exists) return candidate;
  }
  return `KSR-${Date.now().toString().slice(-6)}`;
}

export async function finalizeOrder(orderNumber: string) {
  const existing = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!existing) return { ok: false as const, error: "NOT_FOUND" };
  if (existing.paymentStatus === "PAID") return { ok: true as const, order: existing, alreadyPaid: true };

  const order = await prisma.$transaction(async (tx) => {
    for (const item of existing.items) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: Math.max(0, variant.stock - item.quantity) },
          });
        }
      }
      if (item.productId) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: Math.max(0, product.stock - item.quantity) },
          });
        }
      }
    }

    if (existing.couponCode) {
      await tx.coupon.updateMany({
        where: { code: existing.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return tx.order.update({
      where: { id: existing.id },
      data: { paymentStatus: "PAID", orderStatus: existing.orderStatus === "CANCELLED" ? "NEW" : existing.orderStatus },
      include: { items: true },
    });
  });

  const customerPayload = {
    title: "كسيرات | تم استلام طلبك بنجاح",
    body: `طلبك #${order.orderNumber} بقيمة ${order.totalInSelectedCurrency.toFixed(2)} ${order.currencyCode} تم استلامه بنجاح. سنوافيك بالتحديثات.`,
    url: `/order-success/${order.orderNumber}`,
    tag: `order-${order.orderNumber}`,
  };

  if (order.userId) {
    const sent = await sendPushToUser(order.userId, customerPayload);
    if (sent.sent === 0) await sendPushToRole("CUSTOMER", customerPayload);
  } else {
    await sendPushToRole("CUSTOMER", customerPayload);
  }

  await notifyAdminNewOrder({
    orderNumber: order.orderNumber,
    totalInSelectedCurrency: order.totalInSelectedCurrency,
    currencyCode: order.currencyCode,
    customerFirstName: order.customerFirstName,
    customerLastName: order.customerLastName,
  });

  return { ok: true as const, order, alreadyPaid: false };
}

export async function markOrderPaidViaGateway(orderNumber: string, paymentId?: string) {
  const result = await finalizeOrder(orderNumber);
  if (result.ok && paymentId) {
    await prisma.order.update({
      where: { orderNumber },
      data: { myfatoorahPaymentId: paymentId },
    });
  }
  return result;
}

export async function pushOrderStatus(orderNumber: string, statusLabel: string) {
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) return;
  await notifyCustomerStatus(
    { orderNumber: order.orderNumber, userId: order.userId, paymentStatus: order.paymentStatus },
    statusLabel
  );
}
