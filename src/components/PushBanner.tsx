"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, X } from "lucide-react";
import { enablePush } from "@/lib/pushClient";

export default function PushBanner() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") return;
    if (localStorage.getItem("kseerat-push-dismissed") === "1") return;
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem("kseerat-push-dismissed", "1");
    setVisible(false);
  };

  const enable = async () => {
    setStatus("loading");
    const res = await enablePush("CUSTOMER");
    if (res.ok) {
      setStatus("done");
      setTimeout(() => setVisible(false), 2500);
    } else {
      setStatus("error");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-brand/30 bg-white p-4 shadow-luxe">
      <button onClick={dismiss} className="absolute left-3 top-3 rounded-full p-1 text-muted transition hover:bg-cream">
        <X size={15} />
      </button>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-brand">
          <BellRing size={22} />
        </span>
        <div className="flex-1 pe-1">
          <p className="text-sm font-bold leading-6 text-ink">
            فعّل الإشعارات لتصلك أحدث العروض وحالة طلبك فوراً
          </p>
          {status === "done" ? (
            <p className="mt-2 text-xs font-bold text-success">تم تفعيل الإشعارات بنجاح ✓</p>
          ) : (
            <>
              <p className="mt-1 text-[11px] text-muted">
                {status === "error"
                  ? "لم يتم منح الإذن، يمكنك تفعيله من إعدادات المتصفح."
                  : "تصلك إشعارات فورية حتى لو كان المتصفح مغلقاً."}
              </p>
              <button onClick={enable} disabled={status === "loading"} className="btn-brand mt-3 py-2 text-xs">
                <Bell size={14} /> {status === "loading" ? "جاري التفعيل..." : "تفعيل الإشعارات"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}