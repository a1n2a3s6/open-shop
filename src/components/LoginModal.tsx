"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Mail, Phone, ShieldCheck, X, UserCircle2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { GCC } from "@/lib/constants";

export default function LoginModal() {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useStore((s) => s.setUser);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"identifier" | "code">("identifier");
  const [email, setEmail] = useState("");
  const [dial, setDial] = useState("+965");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setError(null);
      setNotice(null);
    };
    window.addEventListener("kseerat:open-login", handler);
    return () => window.removeEventListener("kseerat:open-login", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const reset = () => {
    setOpen(false);
    setStep("identifier");
    setCode("");
    setDevCode(null);
    setError(null);
    setNotice(null);
    setLoading(false);
  };

  const targetIdentifier = tab === "email" ? email.trim() : `${dial}${phone.replace(/\D/g, "")}`;

  const sendOtp = async () => {
    setError(null);
    setNotice(null);
    if (tab === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("يرجى إدخال بريد إلكتروني صالح");
      return;
    }
    if (tab === "phone" && phone.replace(/\D/g, "").length < 7) {
      setError("يرجى إدخال رقم جوال صالح");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: targetIdentifier, channel: tab }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر إرسال الرمز");
        return;
      }
      setIdentifier(targetIdentifier);
      setStep("code");
      setDevCode(data.devCode || null);
      setNotice(data.emailed ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني" : "تم إنشاء رمز التحقق");
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError("أدخل رمز التحقق المكوّن من 6 أرقام");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, channel: tab, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "رمز التحقق غير صحيح");
        return;
      }
      setUser(data.user);
      window.dispatchEvent(new CustomEvent("kseerat:auth", { detail: data.user }));
      reset();
      router.refresh();
    } catch {
      setError("تعذر التحقق من الرمز");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onClick={reset}>
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-luxe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 pb-5">
          <button onClick={reset} className="absolute left-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-cream">
            <X size={18} />
          </button>
          <div className="flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-brand/30 bg-brand-light text-brand">
              <UserCircle2 size={38} strokeWidth={1.4} />
            </span>
            <h2 className="mt-3 font-cairo text-xl font-bold">تسجيل الدخول</h2>
            <p className="mt-1 text-xs text-muted">انضم إلى عائلة كسيرات واكسب نقاط الولاء</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-cream p-1">
            <button
              onClick={() => {
                setTab("email");
                setStep("identifier");
                setError(null);
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition",
                tab === "email" ? "bg-white text-brand shadow-sm" : "text-muted"
              )}
            >
              <Mail size={14} /> الدخول بالبريد الإلكتروني
            </button>
            <button
              onClick={() => {
                setTab("phone");
                setStep("identifier");
                setError(null);
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition",
                tab === "phone" ? "bg-white text-brand shadow-sm" : "text-muted"
              )}
            >
              <Phone size={14} /> الدخول برقم الجوال
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-xs font-semibold text-sale">{error}</div>
          )}

          {step === "identifier" ? (
            <div className="mt-4 space-y-3">
              {tab === "email" ? (
                <div>
                  <label className="label-luxe">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-luxe"
                    dir="ltr"
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  />
                </div>
              ) : (
                <div>
                  <label className="label-luxe">رقم الجوال</label>
                  <div className="flex gap-2">
                    <select
                      value={dial}
                      onChange={(e) => setDial(e.target.value)}
                      className="input-luxe w-32 px-2"
                      dir="ltr"
                    >
                      {GCC.map((c) => (
                        <option key={c.dial} value={c.dial}>
                          {c.flag} {c.dial}
                        </option>
                      ))}
                    </select>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5000 0000"
                      className="input-luxe flex-1"
                      dir="ltr"
                      onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                    />
                  </div>
                </div>
              )}

              <button onClick={sendOtp} disabled={loading} className="btn-brand w-full">
                {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-black/10" />
                <span className="text-[11px] text-muted">أو سجل دخولك من خلال</span>
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <a
                href={`/api/auth/social?provider=google&redirect=${encodeURIComponent(pathname || "/")}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-2.5 text-sm font-semibold transition hover:border-brand hover:bg-cream"
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
                </svg>
                الدخول السريع عبر حساب Google
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/api/auth/social?provider=apple&redirect=${encodeURIComponent(pathname || "/")}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-black/10 py-2.5 text-sm font-semibold transition hover:border-brand hover:bg-cream"
                >
                   Apple
                </a>
                <a
                  href={`/api/auth/social?provider=facebook&redirect=${encodeURIComponent(pathname || "/")}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-black/10 py-2.5 text-sm font-semibold transition hover:border-brand hover:bg-cream"
                >
                   Facebook
                </a>
              </div>

              <p className="pt-1 text-center text-[10px] leading-5 text-muted">
                بالمتابعة أنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بكسيرات.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-brand-light p-3 text-center">
                <p className="text-xs text-ink/80">أدخل رمز التحقق المرسل إلى</p>
                <p className="mt-0.5 text-sm font-bold" dir="ltr">
                  {identifier}
                </p>
              </div>

              {devCode && (
                <div className="rounded-xl border border-dashed border-brand bg-white p-3 text-center">
                  <p className="text-[11px] font-semibold text-muted">رمز التحقق للتجربة (وضع التطوير)</p>
                  <p className="mt-1 font-cairo text-2xl font-extrabold tracking-[0.35em] text-brand" dir="ltr">
                    {devCode}
                  </p>
                </div>
              )}
              {notice && <p className="text-center text-xs font-semibold text-success">{notice}</p>}

              <div>
                <label className="label-luxe">رمز التحقق (6 أرقام)</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="input-luxe text-center font-cairo text-xl tracking-[0.4em]"
                  dir="ltr"
                  inputMode="numeric"
                  onKeyDown={(e) => e.key === "Enter" && verify()}
                  autoFocus
                />
              </div>

              <button onClick={verify} disabled={loading} className="btn-brand w-full">
                <ShieldCheck size={17} /> {loading ? "جاري التحقق..." : "تحقق ودخول"}
              </button>

              <div className="flex items-center justify-between text-[11px] text-muted">
                <button onClick={() => setStep("identifier")} className="font-semibold text-brand">
                  تغيير البيانات
                </button>
                <button onClick={sendOtp} disabled={loading} className="font-semibold hover:text-brand">
                  إعادة إرسال الرمز
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
