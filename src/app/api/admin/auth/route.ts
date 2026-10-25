import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: "admin@kseerat.com",
          firstName: "مدير",
          lastName: "كسيرات",
          phoneCountryCode: "+965",
          phoneNumber: "50000000",
          role: "ADMIN",
        },
      });
    }

    await createSession(admin.id);
    return NextResponse.json({ ok: true, user: admin });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to authenticate admin" }, { status: 500 });
  }
}
