import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة تحكم المالك | كسيرات Kseerat",
  description: "لوحة الإدارة والتحكم الشامل لمتجر كسيرات للعطور والعود",
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111111] text-white" dir="rtl">
      {children}
    </div>
  );
}
