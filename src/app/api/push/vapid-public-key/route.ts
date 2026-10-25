import { NextResponse } from "next/server";
import { getVapidKeys } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const keys = await getVapidKeys();
    return NextResponse.json({ publicKey: keys.publicKey });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ publicKey: "" }, { status: 500 });
  }
}
