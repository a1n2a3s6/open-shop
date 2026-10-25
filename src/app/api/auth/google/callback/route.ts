import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { siteUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "/";
  const redirect = state.startsWith("/") && !state.startsWith("//") ? state : "/";

  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${siteUrl()}/?auth=failed`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${siteUrl()}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) return NextResponse.redirect(`${siteUrl()}/?auth=failed`);

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    const profile = await profileRes.json();
    const email = profile.email as string | undefined;
    if (!email) return NextResponse.redirect(`${siteUrl()}/?auth=failed`);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: profile.given_name || "عميل",
          lastName: profile.family_name || "Google",
          googleId: profile.sub,
          role: "CUSTOMER",
          loyaltyPoints: 50,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.sub } });
    }

    await createSession(user.id);
    return NextResponse.redirect(`${siteUrl()}${redirect}?social=google`);
  } catch (e) {
    console.error("Google callback failed", e);
    return NextResponse.redirect(`${siteUrl()}/?auth=failed`);
  }
}
