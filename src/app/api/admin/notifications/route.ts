import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApiGuard } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);
  return NextResponse.json({ notifications, unread });
}

export async function PATCH(req: Request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  const body = await req.json().catch(() => ({}));
  if (body.id) {
    await prisma.notification.update({ where: { id: Number(body.id) }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({ data: { isRead: true } });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;
  await prisma.notification.deleteMany({ where: { targetType: "ADMIN" } });
  return NextResponse.json({ ok: true });
}
