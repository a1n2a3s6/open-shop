import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: {
          totalKwd: true,
          paymentStatus: true,
          createdAt: true,
          country: true,
        },
      },
    },
  });

  const customers = users.map((u) => {
    const paid = u.orders.filter((o) => o.paymentStatus === "PAID");
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phoneCountryCode: u.phoneCountryCode,
      phoneNumber: u.phoneNumber,
      loyaltyPoints: u.loyaltyPoints,
      createdAt: u.createdAt,
      orderCount: u.orders.length,
      totalSpendKwd: paid.reduce((s, o) => s + o.totalKwd, 0),
      lastOrderAt: u.orders.length
        ? u.orders.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).createdAt
        : null,
      country: u.orders[0]?.country ?? null,
    };
  });

  const guestOrders = await prisma.order.findMany({
    where: { isGuest: true },
    orderBy: { createdAt: "desc" },
    select: {
      customerFirstName: true,
      customerLastName: true,
      customerEmail: true,
      customerPhoneCode: true,
      customerPhone: true,
      totalKwd: true,
      paymentStatus: true,
      createdAt: true,
      country: true,
    },
  });

  const guestMap = new Map<string, {
    name: string;
    phone: string;
    email: string | null;
    orderCount: number;
    totalSpendKwd: number;
    lastOrderAt: Date;
    country: string | null;
  }>();

  for (const o of guestOrders) {
    const key = `${o.customerPhoneCode}${o.customerPhone}`;
    const existing = guestMap.get(key);
    if (existing) {
      existing.orderCount++;
      if (o.paymentStatus === "PAID") existing.totalSpendKwd += o.totalKwd;
      if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
    } else {
      guestMap.set(key, {
        name: `${o.customerFirstName} ${o.customerLastName}`,
        phone: key,
        email: o.customerEmail,
        orderCount: 1,
        totalSpendKwd: o.paymentStatus === "PAID" ? o.totalKwd : 0,
        lastOrderAt: o.createdAt,
        country: o.country,
      });
    }
  }

  return NextResponse.json({
    customers,
    guests: Array.from(guestMap.values()),
    totalCustomers: customers.length,
    totalGuests: guestMap.size,
  });
}
