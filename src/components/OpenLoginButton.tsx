"use client";

import { UserCircle2 } from "lucide-react";

export default function OpenLoginButton({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("kseerat:open-login"))}
      className={className || "btn-brand"}
    >
      {children || (
        <>
          <UserCircle2 size={17} /> تسجيل الدخول
        </>
      )}
    </button>
  );
}