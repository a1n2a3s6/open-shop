"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import type { CurrencyLite } from "@/lib/pricing";
import { registerServiceWorker } from "@/lib/pushClient";

type BootstrapSettings = {
  id: number;
  storeNameAr: string;
  storeNameEn: string;
  logoUrl: string | null;
  primaryColor: string;
  announcementAr: string | null;
  phone: string | null;
  whatsapp: string | null;
  workingHoursAr: string | null;
} | null;

export default function StoreBootstrap({
  currencies,
  settings,
}: {
  currencies: CurrencyLite[];
  settings: BootstrapSettings;
}) {
  const setCurrencies = useStore((s) => s.setCurrencies);
  const setUser = useStore((s) => s.setUser);
  const setAuthLoaded = useStore((s) => s.setAuthLoaded);
  const lang = useStore((s) => s.lang);

  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (currencies?.length) setCurrencies(currencies);
  }, [currencies, setCurrencies]);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (settings?.primaryColor) {
      document.documentElement.style.setProperty("--brand", settings.primaryColor);
    }
  }, [settings?.primaryColor]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setUser(data.user ?? null);
        setAuthLoaded(true);
      })
      .catch(() => setAuthLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [setUser, setAuthLoaded]);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
