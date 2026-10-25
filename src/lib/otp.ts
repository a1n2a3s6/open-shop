import { prisma } from "./prisma";
import { sendOtpEmail } from "./mailer";

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtp(identifier: string, channel: "email" | "phone") {
  await prisma.otpVerification.deleteMany({ where: { identifier, consumed: false } });
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otpVerification.create({
    data: { identifier, channel, code, expiresAt },
  });
  let emailed = false;
  if (channel === "email") {
    try {
      const res = await sendOtpEmail(identifier, code);
      emailed = res.sent;
    } catch (e) {
      console.error("OTP email failed", e);
    }
  }
  return { code, emailed };
}

export async function verifyAndConsumeOtp(identifier: string, code: string) {
  const otp = await prisma.otpVerification.findFirst({
    where: { identifier, code, consumed: false },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { ok: false as const, error: "INVALID" };
  if (otp.expiresAt.getTime() < Date.now()) return { ok: false as const, error: "EXPIRED" };
  await prisma.otpVerification.update({ where: { id: otp.id }, data: { consumed: true } });
  return { ok: true as const, channel: otp.channel };
}
