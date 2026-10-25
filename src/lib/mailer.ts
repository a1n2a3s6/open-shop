import nodemailer from "nodemailer";

export function smtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendOtpEmail(to: string, code: string) {
  if (!smtpConfigured()) return { sent: false, reason: "SMTP not configured" };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Kseerat <no-reply@kseerat.com>",
    to,
    subject: `كسيرات | رمز التحقق ${code}`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;background:#FAF8F5;padding:32px">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:20px;padding:32px;border:1px solid #eee">
          <h1 style="color:#B39A7B;margin:0 0 8px">كسيرات | Kseerat</h1>
          <p style="color:#1F1F1F">رمز التحقق الخاص بك هو:</p>
          <div style="font-size:34px;letter-spacing:10px;font-weight:bold;color:#1A1A1A;background:#F5EFE8;padding:18px;border-radius:14px;text-align:center">${code}</div>
          <p style="color:#6B6B6B;font-size:13px;margin-top:18px">صالح لمدة 10 دقائق. إذا لم تطلب هذا الرمز تجاهل الرسالة.</p>
        </div>
      </div>`,
  });
  return { sent: true };
}
