import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [paidAgg, totalOrders, newOrders, customers, lowStock, recentOrders, unread, paidOrders7] =
    await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalKwd: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: "NEW" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 10 } },
        orderBy: { stock: "asc" },
        take: 8,
        select: { id: true, nameAr: true, stock: true, lowStockThreshold: true, imagesJson: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      }),
      prisma.notification.count({ where: { isRead: false, targetType: "ADMIN" } }),
      prisma.order.findMany({
        where: { paymentStatus: "PAID", createdAt: { gte: since } },
        select: { createdAt: true, totalKwd: true },
      }),
    ]);

  const days: { date: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const total = paidOrders7
      .filter((o) => o.createdAt >= d && o.createdAt < next)
      .reduce((s, o) => s + o.totalKwd, 0);
    days.push({ date: d.toISOString().slice(0, 10), total: Math.round(total * 1000) / 1000 });
  }

  return NextResponse.json({
    revenueKwd: paidAgg._sum.totalKwd ?? 0,
    totalOrders,
    newOrders,
    customers,
    lowStockCount: lowStock.filter((p) => p.stock <= p.lowStockThreshold).length,
    lowStock,
    recentOrders,
    unread,
    days,
  });
}
