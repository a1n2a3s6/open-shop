import { NextResponse } from "next/server";
import { requireAdmin } from "./auth";

export async function adminApiGuard() {
  const user = await requireAdmin();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }
  return { user, response: null };
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
