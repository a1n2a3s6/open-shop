"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-brand flex-1 py-3 text-xs font-bold"
    >
      <Printer size={15} /> طباعة الفاتورة
    </button>
  );
}
