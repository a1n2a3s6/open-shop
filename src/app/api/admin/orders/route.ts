import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const payment = url.searchParams.get("payment");
  const country = url.searchParams.get("country");
  const q = url.searchParams.get("q")?.trim();

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.orderStatus = status;
  if (payment && payment !== "ALL") where.paymentStatus = payment;
  if (country && country !== "ALL") where.country = country;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { customerFirstName: { contains: q } },
      { customerLastName: { contains: q } },
      { customerPhone: { contains: q } },
      { customerEmail: { contains: q } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json({ orders });
}
