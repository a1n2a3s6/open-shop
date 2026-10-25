"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Mic,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
  LayoutDashboard,
  Globe2,
} from "lucide-react";
import { useStore, useCurrency } from "@/store/useStore";
import { formatPrice, resolvePrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type CategoryLite = {
  id: number;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  showInNavbar: boolean;
};

type HeaderSettings = {
  announcementAr: string | null;
  phone: string | null;
} | null;

type Suggestion = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  basePriceKwd: number;
  discountPriceKwd: number | null;
  currencyPricesJson: string;
  images: string[];
};

export function openLogin() {
  window.dispatchEvent(new CustomEvent("kseerat:open-login"));
}

export default function Header({
  categories,
  settings,
}: {
  categories: CategoryLite[];
  settings: HeaderSettings;
}) {
  const router = useRouter();
  const currency = useCurrency();
  const currencies = useStore((s) => s.currencies);
  const currencyCode = useStore((s) => s.currencyCode);
  const setCurrency = useStore((s) => s.setCurrency);
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [listening, setListening] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setResults(data.products ?? []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const startVoice = () => {
    const SR =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      alert("البحث الصوتي غير مدعوم في هذا المتصفح");
      return;
    }
    try {
      const rec = new SR();
      rec.lang = lang === "ar" ? "ar-SA" : "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      rec.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        if (transcript) {
          setQuery(transcript);
          setShowResults(true);
        }
      };
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserOpen(false);
    router.refresh();
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (results.length === 1) {
      router.push(`/product/${results[0].slug}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    setShowResults(false);
  };

  return (
    <>
      <div className="bg-brand text-white">
        <div className="container-luxe flex items-center justify-between gap-4 py-2 text-[12px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrencyOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-semibold transition hover:bg-white/20"
            >
              <span className="text-base leading-none">{currency.flag}</span>
              <span>{lang === "ar" ? currency.countryAr : currency.code}</span>
              <span className="opacity-80">({currency.symbolAr})</span>
              <ChevronDown size={13} />
            </button>
            <div className="flex items-center gap-1 text-white/90">
              <button
                onClick={() => setLang("ar")}
                className={cn("rounded px-1.5 py-0.5 transition", lang === "ar" && "bg-white/20 font-bold")}
              >
                العربية
              </button>
              <span className="opacity-50">|</span>
              <button
                onClick={() => setLang("en")}
                className={cn("rounded px-1.5 py-0.5 transition", lang === "en" && "bg-white/20 font-bold")}
              >
                EN
              </button>
            </div>
          </div>

          <p className="hidden max-w-xl truncate text-center text-white/90 md:block">
            {settings?.announcementAr ||
              "شحن مجاني لجميع دول الخليج للطلبات فوق الحد الأدنى • عطور ودهن عود فاخر من قلب الكويت"}
          </p>

          <a
            href={`tel:${(settings?.phone || "").replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 font-semibold transition hover:opacity-80"
          >
            <Phone size={13} />
            <span className="hidden sm:inline">تواصل معنا</span>
            <span className="hidden lg:inline opacity-90" dir="ltr">{settings?.phone}</span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95 backdrop-blur">
        <div className="container-luxe py-3.5">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-brand/50 bg-charcoal text-brand">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
                  <path d="M12 3c2.2 2.6 3.4 5.3 3.4 8.2 0 2.8-1.4 5.2-3.4 7.2-2-2-3.4-4.4-3.4-7.2C8.6 8.3 9.8 5.6 12 3Z" fill="currentColor" opacity=".85" />
                  <path d="M12 8v11M9 13.5c1.2.4 2.2 1.4 3 3M15 13.5c-1.2.4-2.2 1.4-3 3" stroke="#FAF8F5" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block font-amiri text-[22px] font-bold tracking-tight text-ink">كسيرات</span>
                <span className="block text-[9px] font-semibold tracking-[0.32em] text-brand">KSEERAT</span>
              </span>
            </Link>

            <div ref={searchRef} className="relative hidden md:block">
              <form onSubmit={submitSearch}>
                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setShowResults(true)}
                    placeholder="ابحث في المتجر..."
                    className="h-11 w-full rounded-full border border-black/10 bg-cream/70 pr-11 pl-12 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
                  />
                  <button
                    type="button"
                    onClick={startVoice}
                    title="البحث الصوتي"
                    className={cn(
                      "absolute left-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark",
                      listening && "animate-pulse bg-sale"
                    )}
                  >
                    <Mic size={15} />
                  </button>
                </div>
              </form>
              {showResults && query.trim() && (
                <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-luxe">
                  {searching ? (
                    <div className="p-4 text-center text-sm text-muted">جاري البحث...</div>
                  ) : results.length ? (
                    results.map((p) => {
                      const price = resolvePrice(
                        {
                          priceKwd: p.basePriceKwd,
                          discountPriceKwd: p.discountPriceKwd,
                          currencyPricesJson: p.currencyPricesJson,
                        },
                        currency
                      );
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center gap-3 border-b border-black/5 p-2.5 transition hover:bg-cream"
                        >
                          <img
                            src={p.images[0] || "/icons/icon-192.svg"}
                            alt={p.nameAr}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {lang === "ar" ? p.nameAr : p.nameEn || p.nameAr}
                            </span>
                            <span className="block text-xs font-bold text-sale">
                              {formatPrice(price.price, currency)}
                            </span>
                          </span>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-sm text-muted">لا توجد نتائج مطابقة</div>
                  )}
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => setShowResults(false)}
                    className="block bg-cream/70 p-2.5 text-center text-xs font-bold text-brand"
                  >
                    عرض جميع النتائج
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/wishlist"
                className="hidden h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-light hover:text-brand sm:grid"
                title="المفضلة"
              >
                <span className="relative">
                  <Heart size={20} />
                  {wishlist.length > 0 && (
                    <span className="absolute -left-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                      {wishlist.length}
                    </span>
                  )}
                </span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => (user ? setUserOpen((v) => !v) : openLogin())}
                  className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-light hover:text-brand"
                  title="حسابي"
                >
                  <User size={21} />
                </button>
                {user && userOpen && (
                  <div className="absolute left-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-luxe">
                    <div className="border-b border-black/5 px-2 pb-2">
                      <p className="text-sm font-bold">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-muted">{user.email || user.phoneNumber}</p>
                      <p className="mt-1 text-[11px] font-semibold text-brand">
                        نقاط الولاء: {user.loyaltyPoints}
                      </p>
                    </div>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-cream"
                      >
                        <LayoutDashboard size={15} /> لوحة الإدارة
                      </Link>
                    )}
                    <Link
                      href="/wishlist"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-cream"
                    >
                      <Heart size={15} /> المفضلة
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-right text-sm text-sale transition hover:bg-red-50"
                    >
                      <LogOut size={15} /> تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>

              <Link
                href="/cart"
                className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-light hover:text-brand"
                title="سلة التسوق"
              >
                <ShoppingBag size={21} />
                {cartCount > 0 && (
                  <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-light md:hidden"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          <div className="mt-3 md:hidden">
            <form onSubmit={submitSearch}>
              <div className="relative">
                <Search size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في المتجر..."
                  className="h-11 w-full rounded-full border border-black/10 bg-cream/70 pr-11 pl-12 text-sm outline-none focus:border-brand focus:bg-white"
                />
                <button
                  type="button"
                  onClick={startVoice}
                  className={cn(
                    "absolute left-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-brand text-white",
                    listening && "animate-pulse bg-sale"
                  )}
                >
                  <Mic size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <nav className="hidden border-t border-black/5 bg-white md:block">
          <div className="container-luxe flex items-center justify-center gap-6 overflow-x-auto py-2.5 no-scrollbar">
            {categories
              .filter((c) => c.showInNavbar)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className={cn(
                    "whitespace-nowrap text-[13px] font-semibold text-ink/80 transition hover:text-brand",
                    c.slug === "offers" && "text-sale hover:text-sale/80"
                  )}
                >
                  {lang === "ar" ? c.nameAr : c.nameEn || c.nameAr}
                </Link>
              ))}
          </div>
        </nav>

        {mobileOpen && (
          <div className="border-t border-black/5 bg-white p-3 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {categories
                .filter((c) => c.showInNavbar)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl border border-black/5 px-3 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand"
                  >
                    {lang === "ar" ? c.nameAr : c.nameEn || c.nameAr}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </header>

      {currencyOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setCurrencyOpen(false)}>
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-luxe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <Globe2 size={19} className="text-brand" />
                <h3 className="font-bold">اختر الدولة والعملة</h3>
              </div>
              <button onClick={() => setCurrencyOpen(false)} className="rounded-full p-1 text-muted hover:bg-cream">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-2">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setCurrencyOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right transition hover:bg-cream",
                    currencyCode === c.code && "bg-brand-light ring-1 ring-brand/40"
                  )}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{c.countryAr}</span>
                    <span className="block text-xs text-muted">
                      {c.nameAr} · {c.code}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-brand">{c.symbolAr}</span>
                  {currencyCode === c.code && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-black/5 px-5 py-3 text-[11px] text-muted">
              الأسعار وشروط الشحن تتحدّث فوراً حسب الدولة المختارة.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
