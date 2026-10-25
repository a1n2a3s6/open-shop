import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { siteUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

const providers = {
  google: { email: "demo.google@kseerat.com", first: "ضيف", last: "Google" },
  apple: { email: "demo.apple@kseerat.com", first: "ضيف", last: "Apple" },
  facebook: { email: "demo.facebook@kseerat.com", first: "ضيف", last: "Facebook" },
} as const;

function safeRedirect(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const providerParam = (url.searchParams.get("provider") || "google") as keyof typeof providers;
  const provider = providers[providerParam] ? providerParam : "google";
  const redirect = safeRedirect(url.searchParams.get("redirect"));

  if (provider === "google" && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${siteUrl()}/api/auth/google/callback`,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
      state: redirect,
    });
    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  const demo = providers[provider];
  let user = await prisma.user.findUnique({ where: { email: demo.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demo.email,
        firstName: demo.first,
        lastName: demo.last,
        role: "CUSTOMER",
        loyaltyPoints: 50,
      },
    });
  }
  await createSession(user.id);
  return NextResponse.redirect(`${siteUrl()}${redirect}?social=${provider}`);
}
