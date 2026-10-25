"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingBag,
  FolderTree,
  Tag,
  Coins,
  Layers,
  Truck,
  Users,
  Send,
  Settings,
  Bell,
  Sparkles,
  ExternalLink,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Search,
  Filter,
  ArrowUpRight,
  RefreshCw,
  Phone,
  MessageSquare,
  MapPin,
  Printer,
  Volume2,
  AlertTriangle,
  CreditCard,
  Percent,
} from "lucide-react";
import { playChime, enablePush } from "@/lib/pushClient";
import { formatPrice } from "@/lib/pricing";
import { GCC, ORDER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AdminSection =
  | "overview"
  | "products"
  | "orders"
  | "categories"
  | "coupons"
  | "currencies"
  | "hero"
  | "shipping"
  | "customers"
  | "broadcast"
  | "settings";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get("section") as AdminSection) || "overview";

  const [currentSection, setCurrentSection] = useState<AdminSection>(initialSection);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Notifications Bell
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  // Global Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  // Check auth
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user && data.user.role === "ADMIN") {
          setAuthed(true);
          setCurrentUser(data.user);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false));
  }, [refreshKey]);

  // Load stats/notifications
  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnreadCount((d.notifications || []).filter((n: any) => !n.isRead).length);
      })
      .catch(() => undefined);
  }, [authed, refreshKey]);

  // Quick 1-click admin login
  const handleQuickAdminLogin = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch("/api/admin/auth", { method: "POST" });
      if (res.ok) {
        setAuthed(true);
        refresh();
      } else {
        alert("تعذر تسجيل الدخول التلقائي");
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    router.push("/");
  };

  // Device push notification trigger for owner
  const handleEnableOwnerPush = async () => {
    setPushStatus("جاري التفعيل...");
    const res = await enablePush("ADMIN");
    if (res.ok) {
      setPushStatus("تم تفعيل الإشعارات بنجاح ✓");
      playChime();
      setTimeout(() => setPushStatus(null), 3000);
    } else {
      setPushStatus("تعذر التفعيل أو تم الرفض");
      setTimeout(() => setPushStatus(null), 3500);
    }
  };

  // Mark all notifications read
  const markAllRead = async () => {
    await fetch("/api/admin/notifications", { method: "PUT" });
    setUnreadCount(0);
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
  };

  // Gatekeeper: Not Admin Screen
  if (authed === false) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1C1C1C] p-8 text-center shadow-2xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-brand/40 bg-brand/10 text-brand">
            <Sparkles size={32} />
          </div>
          <h1 className="mt-4 font-cairo text-2xl font-bold text-white">
            لوحة تحكم المالك | كسيرات
          </h1>
          <p className="mt-2 text-xs leading-6 text-white/60">
            هذه المنطقة مخصصة لإدارة المتجر ومحمية بصلاحيات المشرف العام.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleQuickAdminLogin}
              disabled={authLoading}
              className="btn-brand w-full py-3.5 text-xs font-bold shadow-lg"
            >
              {authLoading ? "جاري التحقق والدخول..." : "⚡ الدخول الفوري بحساب المدير (admin@kseerat.com)"}
            </button>
            <Link
              href="/"
              className="block rounded-full border border-white/10 py-3 text-xs font-semibold text-white/80 transition hover:bg-white/5"
            >
              ← العودة لمتجر كسيرات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center text-xs text-white/60">
        جاري تهيئة لوحة التحكم...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full shrink-0 border-b border-white/10 bg-[#161616] p-4 lg:w-64 lg:border-b-0 lg:border-l lg:p-6">
        <div className="flex items-center justify-between lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-brand/50 bg-[#222] text-brand shadow">
              <Sparkles size={20} />
            </span>
            <div>
              <span className="block font-amiri text-xl font-bold text-white">كسيرات</span>
              <span className="block text-[8px] font-bold tracking-[0.3em] text-brand">OWNER CMS</span>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 text-[11px] font-bold text-brand hover:underline lg:hidden"
          >
            المتجر <ExternalLink size={12} />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 flex gap-1 overflow-x-auto pb-2 no-scrollbar lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {[
            { id: "overview", label: "لوحة الإحصائيات", icon: BarChart3 },
            { id: "products", label: "المنتجات والمخزون", icon: Package },
            { id: "orders", label: "الطلبات والشحنات", icon: ShoppingBag },
            { id: "categories", label: "الأقسام", icon: FolderTree },
            { id: "coupons", label: "كوبونات الخصم", icon: Tag },
            { id: "currencies", label: "العملات والأسعار", icon: Coins },
            { id: "hero", label: "بانرات الهيرو", icon: Layers },
            { id: "shipping", label: "شركات الشحن", icon: Truck },
            { id: "customers", label: "العملاء والولاء", icon: Users },
            { id: "broadcast", label: "إرسال الإشعارات", icon: Send },
            { id: "settings", label: "إعدادات المتجر", icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentSection(id as AdminSection)}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-bold transition",
                currentSection === id
                  ? "bg-brand text-charcoal shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Store Link & User */}
        <div className="mt-8 hidden border-t border-white/10 pt-6 lg:block">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-bold text-white transition hover:border-brand"
          >
            <span>زيارة المتجر الرئيسي</span>
            <ExternalLink size={14} className="text-brand" />
          </Link>

          <div className="mt-4 flex items-center justify-between text-xs text-white/60">
            <span className="truncate">{currentUser?.email || "مدير كسيرات"}</span>
            <button onClick={handleLogout} className="text-sale hover:underline" title="تسجيل خروج">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#111111] p-4 lg:p-8">
        {/* Top Action Header Bar */}
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-cairo text-2xl font-bold text-white">
              {currentSection === "overview" && "لوحة الإحصائيات والملخص"}
              {currentSection === "products" && "إدارة المنتجات والمخزون والخيارات"}
              {currentSection === "orders" && "إدارة الطلبات والشحنات الخليجية"}
              {currentSection === "categories" && "إدارة أقسام المتجر"}
              {currentSection === "coupons" && "إدارة كوبونات الخصم"}
              {currentSection === "currencies" && "العملات وأسعار الصرف وتحديث الأسعار"}
              {currentSection === "hero" && "بانرات الصفحة الرئيسية (Hero)"}
              {currentSection === "shipping" && "شركات وأسعار الشحن"}
              {currentSection === "customers" && "العملاء ونقاط الولاء"}
              {currentSection === "broadcast" && "مركز إرسال الإشعارات الفورية (Web Push)"}
              {currentSection === "settings" && "إعدادات المتجر وبوابة MyFatoorah"}
            </h1>
            <p className="mt-1 text-xs text-white/50">تحكم كامل ومباشر في جميع تفاصيل دار كسيرات</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Enable Push to Owner */}
            <button
              onClick={handleEnableOwnerPush}
              className="flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1.5 text-xs font-bold text-brand transition hover:bg-brand hover:text-charcoal"
              title="استقبل إشعارات بالطلبات الجديدة حتى عندما يكون المتصفح مغلقاً"
            >
              <Bell size={14} />
              <span>{pushStatus || "تفعيل إشعارات الجهاز للمالك"}</span>
            </button>

            {/* Sound chime test */}
            <button
              onClick={playChime}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-brand"
              title="تجربة رنة التنبيه الفاخرة للطلبات"
            >
              <Volume2 size={16} />
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover((v) => !v)}
                className="relative grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-sale px-1 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifPopover && (
                <div className="absolute left-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-white/15 bg-[#1C1C1C] p-3 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-cairo text-xs font-bold text-white">الإشعارات والتنبيهات</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] text-brand hover:underline">
                        تعيين الكل كمقروء
                      </button>
                    )}
                  </div>
                  <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pe-1">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-white/40">لا توجد إشعارات حالياً</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            "rounded-xl p-2.5 text-xs transition",
                            n.isRead ? "bg-white/5 text-white/60" : "border border-brand/30 bg-brand/10 text-white"
                          )}
                        >
                          <p className="font-bold text-brand">{n.title}</p>
                          <p className="mt-0.5 text-[11px] leading-5">{n.body}</p>
                          <span className="mt-1 block text-[9px] text-white/40">
                            {new Date(n.createdAt).toLocaleTimeString("ar-KW", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={refresh}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              title="تحديث البيانات"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </header>

        {/* SECTION 1: OVERVIEW */}
        {currentSection === "overview" && (
          <OverviewView onNavigate={setCurrentSection} refreshKey={refreshKey} />
        )}

        {/* SECTION 2: PRODUCTS */}
        {currentSection === "products" && <ProductsView refreshKey={refreshKey} />}

        {/* SECTION 3: ORDERS */}
        {currentSection === "orders" && <OrdersView refreshKey={refreshKey} />}

        {/* SECTION 4: CATEGORIES */}
        {currentSection === "categories" && <CategoriesView refreshKey={refreshKey} />}

        {/* SECTION 5: COUPONS */}
        {currentSection === "coupons" && <CouponsView refreshKey={refreshKey} />}

        {/* SECTION 6: CURRENCIES & BULK PRICING */}
        {currentSection === "currencies" && <CurrenciesView refreshKey={refreshKey} />}

        {/* SECTION 7: HERO SLIDES */}
        {currentSection === "hero" && <HeroView refreshKey={refreshKey} />}

        {/* SECTION 8: SHIPPING COMPANIES */}
        {currentSection === "shipping" && <ShippingView refreshKey={refreshKey} />}

        {/* SECTION 9: CUSTOMERS */}
        {currentSection === "customers" && <CustomersView refreshKey={refreshKey} />}

        {/* SECTION 10: BROADCAST WEB PUSH */}
        {currentSection === "broadcast" && <BroadcastView refreshKey={refreshKey} />}

        {/* SECTION 11: SETTINGS & GATEWAYS */}
        {currentSection === "settings" && <SettingsView refreshKey={refreshKey} />}
      </main>
    </div>
  );
}

// ==========================================
// 1. OVERVIEW VIEW
// ==========================================
function OverviewView({
  onNavigate,
  refreshKey,
}: {
  onNavigate: (s: AdminSection) => void;
  refreshKey: number;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <div className="py-12 text-center text-xs text-white/50">جاري تحميل الإحصائيات...</div>;
  if (!data) return <div className="text-xs text-sale">تعذر تحميل الإحصائيات</div>;

  return (
    <div className="space-y-8">
      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "إجمالي المبيعات المؤكدة",
            value: `${(data.totals?.paidRevenueKwd || 0).toFixed(3)} د.ك`,
            sub: "من الطلبات المدفوعة",
            accent: "border-brand/40 bg-brand/5 text-brand",
          },
          {
            title: "الطلبات الجديدة",
            value: data.totals?.newOrders || 0,
            sub: "تحتاج تجهيز وشحن",
            accent: "border-amber-500/40 bg-amber-500/5 text-amber-400",
          },
          {
            title: "إجمالي العملاء",
            value: data.totals?.customers || 0,
            sub: "مسجلون في النظام",
            accent: "border-blue-500/40 bg-blue-500/5 text-blue-400",
          },
          {
            title: "تنبيهات انخفاض المخزون",
            value: data.totals?.lowStockCount || 0,
            sub: "قطع قاربت على النفاد",
            accent: "border-sale/40 bg-sale/5 text-sale",
          },
        ].map((kpi, i) => (
          <div key={i} className={cn("rounded-2xl border p-5 shadow-lg", kpi.accent)}>
            <p className="text-xs font-semibold text-white/70">{kpi.title}</p>
            <p className="mt-2 font-cairo text-2xl font-extrabold text-white">{kpi.value}</p>
            <p className="mt-1 text-[11px] text-white/50">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* 7-day revenue chart */}
      <div className="rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-xl">
        <h2 className="font-cairo text-base font-bold text-white">حركة المبيعات خلال الـ 7 أيام الماضية (د.ك)</h2>
        <div className="mt-6 flex h-44 items-end gap-3 sm:gap-6 border-b border-white/10 pb-2">
          {(data.days || []).map((day: any) => {
            const max = Math.max(...(data.days || []).map((d: any) => d.total), 1);
            const height = Math.round((day.total / max) * 100);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-brand">{day.total > 0 ? `${day.total}` : ""}</span>
                <div
                  className="w-full max-w-[40px] rounded-t-lg bg-brand transition-all duration-500 hover:bg-brand-dark"
                  style={{ height: `${Math.max(8, height)}%` }}
                />
                <span className="text-[10px] text-white/50">{day.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-cairo text-base font-bold text-white">أحدث الطلبات</h2>
            <button
              onClick={() => onNavigate("orders")}
              className="text-xs font-bold text-brand hover:underline"
            >
              عرض الكل ←
            </button>
          </div>
          <div className="mt-4 divide-y divide-white/5">
            {(data.recentOrders || []).slice(0, 5).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <p className="font-bold text-white">#{o.orderNumber}</p>
                  <p className="text-[11px] text-white/50">
                    {o.customerFirstName} {o.customerLastName} · {o.country}
                  </p>
                </div>
                <div className="text-left">
                  <span className="font-bold text-brand">
                    {o.totalInSelectedCurrency.toFixed(2)} {o.currencyCode}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block rounded px-1.5 py-0.5 text-[9px] font-bold text-center",
                      o.orderStatus === "NEW" ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/80"
                    )}
                  >
                    {ORDER_STATUS[o.orderStatus as keyof typeof ORDER_STATUS] || o.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-cairo text-base font-bold text-white">تنبيهات انخفاض المخزون</h2>
            <button
              onClick={() => onNavigate("products")}
              className="text-xs font-bold text-brand hover:underline"
            >
              إدارة المنتجات ←
            </button>
          </div>
          <div className="mt-4 divide-y divide-white/5">
            {(data.lowStock || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-white/40">المخزون بوضع ممتاز لكافة المنتجات ✓</p>
            ) : (
              (data.lowStock || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3 text-xs">
                  <span className="font-bold text-white truncate max-w-[200px]">{p.nameAr}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 font-bold",
                        p.stock === 0 ? "bg-sale text-white" : "bg-amber-500/20 text-amber-300"
                      )}
                    >
                      متبقي {p.stock}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. PRODUCTS VIEW (CRUD, Variants, Currency)
// ==========================================
function ProductsView({ refreshKey }: { refreshKey: number }) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [shortDescAr, setShortDescAr] = useState("");
  const [fullDescAr, setFullDescAr] = useState("");
  const [basePriceKwd, setBasePriceKwd] = useState(30);
  const [discountPriceKwd, setDiscountPriceKwd] = useState<number | "">("");
  const [stock, setStock] = useState(15);
  const [imagesText, setImagesText] = useState("");

  // Fragrance notes
  const [topNotesAr, setTopNotesAr] = useState("");
  const [heartNotesAr, setHeartNotesAr] = useState("");
  const [baseNotesAr, setBaseNotesAr] = useState("");
  const [fragranceFamilyAr, setFragranceFamilyAr] = useState("شرقي فاخر");
  const [longevity, setLongevity] = useState(5);
  const [sillage, setSillage] = useState(4);
  const [gender, setGender] = useState("للجنسين");
  const [season, setSeason] = useState("جميع الفصول");
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);

  // Per-Currency Prices
  const [currencyPrices, setCurrencyPrices] = useState<Record<string, { base?: number; discount?: number }>>({});

  // Dynamic Variants Builder
  const [variants, setVariants] = useState<any[]>([
    { nameAr: "50 مل", sku: "", stock: 10, priceKwd: 30, discountPriceKwd: 25, isDefault: true },
    { nameAr: "100 مل", sku: "", stock: 5, priceKwd: 48, discountPriceKwd: 40, isDefault: false },
  ]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([pData, cData]) => {
        setProducts(pData.products || []);
        setCategories(cData.categories || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  // Auto calculate per-currency prices from exchange rates
  const autoFillCurrencies = () => {
    const rates: Record<string, number> = {
      SAR: 12.2,
      AED: 11.95,
      QAR: 11.85,
      BHD: 1.23,
      OMR: 1.25,
    };
    const clean: Record<string, any> = {};
    for (const [code, rate] of Object.entries(rates)) {
      clean[code] = {
        base: Math.round(basePriceKwd * rate * 100) / 100,
        discount: discountPriceKwd ? Math.round(Number(discountPriceKwd) * rate * 100) / 100 : undefined,
      };
    }
    setCurrencyPrices(clean);
  };

  const openAddModal = () => {
    setEditId(null);
    setNameAr("");
    setNameEn("");
    setSku(`KSR-PRF-${Date.now().toString().slice(-4)}`);
    setCategoryId(categories[0]?.id ?? "");
    setShortDescAr("");
    setFullDescAr("");
    setBasePriceKwd(35);
    setDiscountPriceKwd(28);
    setStock(20);
    setImagesText("https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80");
    setTopNotesAr("زعفران، لبان حوجري");
    setHeartNotesAr("عود كمبودي معتق، عنبر");
    setBaseNotesAr("مسك أبيض، صندل");
    setFragranceFamilyAr("شرقي خشبي");
    setLongevity(5);
    setSillage(5);
    setGender("للجنسين");
    setSeason("جميع الفصول");
    setIsBestSeller(true);
    setIsNewArrival(true);
    setIsSpecialOffer(false);
    setVariants([
      { nameAr: "50 مل", sku: "", stock: 15, priceKwd: 35, discountPriceKwd: 28, isDefault: true },
      { nameAr: "100 مل", sku: "", stock: 5, priceKwd: 55, discountPriceKwd: 45, isDefault: false },
    ]);
    autoFillCurrencies();
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditId(p.id);
    setNameAr(p.nameAr);
    setNameEn(p.nameEn || "");
    setSku(p.sku);
    setCategoryId(p.categoryId);
    setShortDescAr(p.shortDescAr || "");
    setFullDescAr(p.fullDescAr || "");
    setBasePriceKwd(p.basePriceKwd);
    setDiscountPriceKwd(p.discountPriceKwd ?? "");
    setStock(p.stock);
    try {
      const imgs = JSON.parse(p.imagesJson || "[]");
      setImagesText(imgs.join("\n"));
    } catch {
      setImagesText("");
    }
    setTopNotesAr(p.topNotesAr || "");
    setHeartNotesAr(p.heartNotesAr || "");
    setBaseNotesAr(p.baseNotesAr || "");
    setFragranceFamilyAr(p.fragranceFamilyAr || "");
    setLongevity(p.longevity || 4);
    setSillage(p.sillage || 4);
    setGender(p.gender || "للجنسين");
    setSeason(p.season || "جميع الفصول");
    setIsBestSeller(!!p.isBestSeller);
    setIsNewArrival(!!p.isNewArrival);
    setIsSpecialOffer(!!p.isSpecialOffer);
    try {
      setCurrencyPrices(JSON.parse(p.currencyPricesJson || "{}"));
    } catch {
      setCurrencyPrices({});
    }
    setVariants(
      (p.variants || []).map((v: any) => ({
        id: v.id,
        nameAr: v.nameAr,
        sku: v.sku || "",
        stock: v.stock,
        priceKwd: v.priceKwd,
        discountPriceKwd: v.discountPriceKwd ?? "",
        isDefault: v.isDefault,
      }))
    );
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      nameAr,
      nameEn: nameEn || null,
      sku,
      categoryId: Number(categoryId),
      shortDescAr: shortDescAr || null,
      fullDescAr: fullDescAr || null,
      basePriceKwd: Number(basePriceKwd),
      discountPriceKwd: discountPriceKwd !== "" ? Number(discountPriceKwd) : null,
      stock: Number(stock),
      images: imagesText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
      topNotesAr: topNotesAr || null,
      heartNotesAr: heartNotesAr || null,
      baseNotesAr: baseNotesAr || null,
      fragranceFamilyAr: fragranceFamilyAr || null,
      longevity: Number(longevity),
      sillage: Number(sillage),
      gender,
      season,
      isBestSeller,
      isNewArrival,
      isSpecialOffer,
      currencyPrices,
      variants,
    };

    try {
      const url = editId ? `/api/admin/products/${editId}` : "/api/admin/products";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "تعذر حفظ المنتج");
      }
    } catch {
      alert("خطأ أثناء الحفظ");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadData();
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.categoryId === Number(categoryFilter);
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو رمز SKU..."
              className="h-10 w-full rounded-xl border border-white/10 bg-[#1A1A1A] pr-9 pl-3 text-xs text-white outline-none focus:border-brand"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-[#1A1A1A] px-3 text-xs text-white outline-none"
          >
            <option value="">جميع الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr}
              </option>
            ))}
          </select>
        </div>

        <button onClick={openAddModal} className="btn-brand px-5 py-2.5 text-xs font-bold shadow-md">
          <Plus size={16} /> إضافة منتج جديد
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-white/60">
                <th className="p-4">المنتج</th>
                <th className="p-4">القسم</th>
                <th className="p-4">السعر (د.ك)</th>
                <th className="p-4">المخزون</th>
                <th className="p-4">الخيارات (الأحجام)</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filtered.map((p) => {
                let img = "/icons/icon-192.svg";
                try {
                  const arr = JSON.parse(p.imagesJson || "[]");
                  if (arr[0]) img = arr[0];
                } catch {}

                return (
                  <tr key={p.id} className="transition hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={img} alt={p.nameAr} className="h-11 w-11 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-white">{p.nameAr}</p>
                          <p className="text-[10px] text-white/50">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white/70">{p.category?.nameAr || "—"}</td>
                    <td className="p-4 font-bold text-brand">
                      {p.discountPriceKwd ? (
                        <span>
                          {p.discountPriceKwd} <span className="text-[10px] line-through text-white/40">{p.basePriceKwd}</span>
                        </span>
                      ) : (
                        p.basePriceKwd
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-bold",
                          p.stock <= 5 ? "bg-sale text-white" : "bg-emerald-500/20 text-emerald-300"
                        )}
                      >
                        {p.stock} قطعة
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/60">
                        {(p.variants || []).map((v: any) => v.nameAr).join(" · ") || "أساسي"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="rounded-lg p-1.5 text-brand transition hover:bg-brand/10"
                          title="تعديل"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nameAr)}
                          className="rounded-lg p-1.5 text-sale transition hover:bg-sale/10"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/15 bg-[#1C1C1C] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-cairo text-lg font-bold text-white">
                {editId ? "تعديل المنتج" : "إضافة منتج جديد لدار كسيرات"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-6 text-xs text-white">
              {/* Basic Details */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-white/70">اسم المنتج بالعربية *</label>
                  <input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#252525] px-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70">الرمز التسلسلي (SKU) *</label>
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#252525] px-3 font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-white/70">الاسم بالإنجليزية</label>
                  <input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#252525] px-3 text-white outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70">القسم *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    required
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#252525] px-3 text-white outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-white/70">المخزون الكلي *</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#252525] px-3 text-white outline-none"
                  />
                </div>
              </div>

              {/* Pricing (Base KWD + Discount) */}
              <div className="rounded-2xl border border-white/10 bg-[#222222] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-cairo text-xs font-bold text-brand">التسعير الأساسي بالدينار الكويتي (KWD)</h3>
                  <button
                    type="button"
                    onClick={autoFillCurrencies}
                    className="flex items-center gap-1 rounded bg-brand/20 px-2 py-1 text-[11px] font-bold text-brand hover:bg-brand/30"
                  >
                    <Percent size={12} /> حساب تلقائي لعملات الخليج حسب سعر الصرف
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-white/70">السعر الأساسي (د.ك) *</label>
                    <input
                      type="number"
                      step="0.001"
                      value={basePriceKwd}
                      onChange={(e) => setBasePriceKwd(Number(e.target.value))}
                      required
                      className="h-10 w-full rounded-xl border border-white/10 bg-[#292929] px-3 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-white/70">سعر الخصم / العرض (اختياري)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={discountPriceKwd}
                      onChange={(e) => setDiscountPriceKwd(e.target.value ? Number(e.target.value) : "")}
                      className="h-10 w-full rounded-xl border border-white/10 bg-[#292929] px-3 text-white outline-none"
                    />
                  </div>
                </div>

                {/* GCC Per-Currency Inputs */}
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="mb-2 text-[11px] font-bold text-white/60">أسعار العملات الخليجية المخصصة (أو المحسوبة تلقائياً)</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {["SAR", "AED", "QAR", "BHD", "OMR"].map((code) => (
                      <div key={code} className="rounded-xl border border-white/10 bg-[#1A1A1A] p-2">
                        <span className="block font-bold text-brand">{code}</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="الأساسي"
                          value={currencyPrices[code]?.base || ""}
                          onChange={(e) =>
                            setCurrencyPrices({
                              ...currencyPrices,
                              [code]: { ...currencyPrices[code], base: Number(e.target.value) || undefined },
                            })
                          }
                          className="mt-1 h-7 w-full rounded bg-[#252525] px-2 text-[11px] text-white outline-none"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="الخصم"
                          value={currencyPrices[code]?.discount || ""}
                          onChange={(e) =>
                            setCurrencyPrices({
                              ...currencyPrices,
                              [code]: { ...currencyPrices[code], discount: Number(e.target.value) || undefined },
                            })
                          }
                          className="mt-1 h-7 w-full rounded bg-[#252525] px-2 text-[11px] text-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Variants Builder */}
              <div className="rounded-2xl border border-white/10 bg-[#222222] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-cairo text-xs font-bold text-brand">خيارات المنتج والأحجام (Variants)</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setVariants([
                        ...variants,
                        { nameAr: "حجم جديد", sku: "", stock: 10, priceKwd: basePriceKwd, isDefault: false },
                      ])
                    }
                    className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] font-bold text-white hover:bg-white/20"
                  >
                    <Plus size={12} /> إضافة خيار
                  </button>
                </div>
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#1A1A1A] p-2">
                      <input
                        value={v.nameAr}
                        onChange={(e) => {
                          const arr = [...variants];
                          arr[i].nameAr = e.target.value;
                          setVariants(arr);
                        }}
                        placeholder="اسم الخيار (مثال: 100 مل)"
                        className="h-8 flex-1 min-w-[100px] rounded bg-[#252525] px-2 text-xs text-white outline-none"
                      />
                      <input
                        type="number"
                        value={v.priceKwd}
                        onChange={(e) => {
                          const arr = [...variants];
                          arr[i].priceKwd = Number(e.target.value);
                          setVariants(arr);
                        }}
                        placeholder="السعر د.ك"
                        className="h-8 w-24 rounded bg-[#252525] px-2 text-xs text-white outline-none"
                      />
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const arr = [...variants];
                          arr[i].stock = Number(e.target.value);
                          setVariants(arr);
                        }}
                        placeholder="المخزون"
                        className="h-8 w-20 rounded bg-[#252525] px-2 text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const arr = variants.map((item, idx) => ({ ...item, isDefault: idx === i }));
                          setVariants(arr);
                        }}
                        className={cn(
                          "rounded px-2 py-1 text-[10px] font-bold",
                          v.isDefault ? "bg-brand text-charcoal" : "bg-white/10 text-white/60"
                        )}
                      >
                        {v.isDefault ? "الافتراضي ✓" : "تعيين كافتراضي"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                        className="text-sale p-1 hover:bg-sale/20 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fragrance Pyramid */}
              <div className="rounded-2xl border border-white/10 bg-[#222222] p-4">
                <h3 className="font-cairo text-xs font-bold text-brand mb-3">الهرم العطري والمواصفات الفاخرة</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-white/70">قمة العطر (Top Notes)</label>
                    <input
                      value={topNotesAr}
                      onChange={(e) => setTopNotesAr(e.target.value)}
                      placeholder="زعفران، برغموت"
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#292929] px-3 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-white/70">قلب العطر (Heart Notes)</label>
                    <input
                      value={heartNotesAr}
                      onChange={(e) => setHeartNotesAr(e.target.value)}
                      placeholder="عود كمبودي، عنبر"
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#292929] px-3 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-white/70">قاعدة العطر (Base Notes)</label>
                    <input
                      value={baseNotesAr}
                      onChange={(e) => setBaseNotesAr(e.target.value)}
                      placeholder="مسك أبيض، خشب الصندل"
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#292929] px-3 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-white/70">العائلة العطرية</label>
                    <input
                      value={fragranceFamilyAr}
                      onChange={(e) => setFragranceFamilyAr(e.target.value)}
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#292929] px-3 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-white/70">الثبات (1 إلى 5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={longevity}
                      onChange={(e) => setLongevity(Number(e.target.value))}
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#292929] px-3 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-white/70">الفوحان (1 إلى 5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={sillage}
                      onChange={(e) => setSillage(Number(e.target.value))}
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#292929] px-3 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Images URLs */}
              <div>
                <label className="block mb-1 text-white/70">روابط الصور (رابط بكل سطر)</label>
                <textarea
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="h-20 w-full rounded-xl border border-white/10 bg-[#252525] p-3 text-white outline-none"
                />
              </div>

              {/* Descriptions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-white/70">الوصف المختصر</label>
                  <textarea
                    value={shortDescAr}
                    onChange={(e) => setShortDescAr(e.target.value)}
                    className="h-20 w-full rounded-xl border border-white/10 bg-[#252525] p-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70">الوصف الكامل</label>
                  <textarea
                    value={fullDescAr}
                    onChange={(e) => setFullDescAr(e.target.value)}
                    className="h-20 w-full rounded-xl border border-white/10 bg-[#252525] p-3 text-white outline-none"
                  />
                </div>
              </div>

              {/* Promotional Flags */}
              <div className="flex flex-wrap gap-4 border-t border-white/10 pt-4">
                {[
                  { label: "الأكثر مبيعاً", checked: isBestSeller, set: setIsBestSeller },
                  { label: "وصل حديثاً", checked: isNewArrival, set: setIsNewArrival },
                  { label: "عرض خاص", checked: isSpecialOffer, set: setIsSpecialOffer },
                ].map((flag) => (
                  <label key={flag.label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flag.checked}
                      onChange={(e) => flag.set(e.target.checked)}
                      className="accent-brand"
                    />
                    <span>{flag.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-xs text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-brand px-7 py-2.5 text-xs font-bold"
                >
                  {formLoading ? "جاري الحفظ..." : "حفظ المنتج ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. ORDERS VIEW (Status Changer, Google Maps, WhatsApp)
// ==========================================
function OrdersView({ refreshKey }: { refreshKey: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadOrders = () => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [refreshKey]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        loadOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch {
      alert("تعذر تحديث حالة الطلب");
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.orderStatus === statusFilter;
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      `${o.customerFirstName} ${o.customerLastName}`.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Status Filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم الطلب، اسم العميل، أو الهاتف..."
              className="h-10 w-full rounded-xl border border-white/10 bg-[#1A1A1A] pr-9 pl-3 text-xs text-white outline-none focus:border-brand"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-[#1A1A1A] px-3 text-xs text-white outline-none"
          >
            <option value="ALL">جميع الحالات</option>
            {Object.entries(ORDER_STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-white/60">
                <th className="p-4">رقم الطلب</th>
                <th className="p-4">العميل</th>
                <th className="p-4">الدولة / المدينة</th>
                <th className="p-4">الإجمالي</th>
                <th className="p-4">الدفع</th>
                <th className="p-4">حالة الطلب</th>
                <th className="p-4 text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filtered.map((o) => (
                <tr key={o.id} className="transition hover:bg-white/[0.02]">
                  <td className="p-4 font-mono font-bold text-brand">#{o.orderNumber}</td>
                  <td className="p-4">
                    <p className="font-bold text-white">
                      {o.customerFirstName} {o.customerLastName}
                    </p>
                    <p className="text-[10px] text-white/50" dir="ltr">
                      {o.customerPhoneCode} {o.customerPhone}
                    </p>
                  </td>
                  <td className="p-4 text-white/70">
                    {o.country} - {o.cityArea}
                  </td>
                  <td className="p-4 font-bold text-white">
                    {o.totalInSelectedCurrency.toFixed(2)} {o.currencyCode}
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold",
                        o.paymentStatus === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      )}
                    >
                      {PAYMENT_STATUS[o.paymentStatus as keyof typeof PAYMENT_STATUS] || o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#252525] px-2 py-1 text-xs text-white outline-none"
                    >
                      {Object.entries(ORDER_STATUS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="rounded-lg bg-brand/20 px-3 py-1 text-xs font-bold text-brand hover:bg-brand/30"
                    >
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-[#1C1C1C] p-6 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-cairo text-base font-bold text-white">تفاصيل الطلب #{selectedOrder.orderNumber}</span>
                <span className="mr-3 text-white/50">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("ar-KW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Customer Info & WhatsApp Button */}
              <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-[#242424] p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold text-sm text-white">
                    {selectedOrder.customerFirstName} {selectedOrder.customerLastName}
                  </p>
                  <p className="mt-0.5 text-white/60" dir="ltr">
                    {selectedOrder.customerPhoneCode} {selectedOrder.customerPhone}
                  </p>
                  {selectedOrder.customerEmail && <p className="text-white/50">{selectedOrder.customerEmail}</p>}
                </div>

                <a
                  href={`https://wa.me/${(selectedOrder.customerPhoneCode + selectedOrder.customerPhone).replace(/\D/g, "")}?text=${encodeURIComponent(`مرحباً ${selectedOrder.customerFirstName}، نتواصل معك بخصوص طلبك #${selectedOrder.orderNumber} من كسيرات للعطور.`)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 font-bold text-white shadow hover:opacity-90"
                >
                  <MessageSquare size={14} /> مراسلة واتساب 💬
                </a>
              </div>

              {/* Structured Address & Google Maps Button */}
              <div className="rounded-2xl border border-white/10 bg-[#242424] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-brand">عنوان التوصيل المعتمد</span>
                  {selectedOrder.googleMapsUrl && (
                    <a
                      href={selectedOrder.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-1 text-brand hover:underline font-bold"
                    >
                      <MapPin size={13} /> فتح الموقع على Google Maps 📍
                    </a>
                  )}
                </div>
                <p className="text-white/80">
                  {selectedOrder.country} · {selectedOrder.governorate} · {selectedOrder.cityArea}
                </p>
                <p className="text-white/60 mt-0.5">
                  {selectedOrder.blockStreet}، مبنى {selectedOrder.houseBuilding} {selectedOrder.floorApartment ? `، ${selectedOrder.floorApartment}` : ""}
                </p>
                {selectedOrder.addressNotes && (
                  <p className="mt-2 text-white/50 italic">ملاحظات التوصيل: {selectedOrder.addressNotes}</p>
                )}
              </div>

              {/* Items List */}
              <div className="rounded-2xl border border-white/10 bg-[#242424] p-4">
                <span className="font-bold text-brand block mb-3">المنتجات المطلوبة</span>
                <div className="divide-y divide-white/5">
                  {(selectedOrder.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="font-bold text-white">{item.nameAr}</p>
                        {item.variantNameAr && <p className="text-[10px] text-white/50">{item.variantNameAr}</p>}
                      </div>
                      <div className="text-left">
                        <span className="text-white/60 font-mono">× {item.quantity}</span>
                        <span className="mr-3 font-bold text-brand">
                          {(item.totalPriceKwd * selectedOrder.exchangeRateUsed).toFixed(2)} {selectedOrder.currencyCode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="rounded-2xl border border-white/10 bg-[#242424] p-4 space-y-1.5">
                <div className="flex justify-between text-white/60">
                  <span>المجموع</span>
                  <span>
                    {(selectedOrder.subtotalKwd * selectedOrder.exchangeRateUsed).toFixed(2)} {selectedOrder.currencyCode}
                  </span>
                </div>
                {selectedOrder.discountKwd > 0 && (
                  <div className="flex justify-between text-sale font-bold">
                    <span>الخصم ({selectedOrder.couponCode})</span>
                    <span>
                      -{(selectedOrder.discountKwd * selectedOrder.exchangeRateUsed).toFixed(2)} {selectedOrder.currencyCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-white/60">
                  <span>رسوم الشحن ({selectedOrder.shippingCompanyName || "الشحن"})</span>
                  <span>
                    {selectedOrder.shippingCostKwd === 0
                      ? "مجاني"
                      : `${(selectedOrder.shippingCostKwd * selectedOrder.exchangeRateUsed).toFixed(2)} ${selectedOrder.currencyCode}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm text-white">
                  <span>الإجمالي النهائي</span>
                  <span className="text-brand">
                    {selectedOrder.totalInSelectedCurrency.toFixed(2)} {selectedOrder.currencyCode}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">تغيير حالة الطلب:</span>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="rounded-xl border border-brand/40 bg-[#292929] px-3 py-1.5 text-xs font-bold text-brand outline-none"
                  >
                    {Object.entries(ORDER_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <a
                  href={`/order-success/${selectedOrder.orderNumber}`}
                  target="_blank"
                  className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                >
                  <Printer size={14} /> فتح وطباعة الفاتورة ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. CATEGORIES VIEW
// ==========================================
function CategoriesView({ refreshKey }: { refreshKey: number }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showInNavbar, setShowInNavbar] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameAr, nameEn: nameEn || null, slug, imageUrl: imageUrl || null, showInNavbar }),
    });
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${name}"؟`)) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-white/60">أقسام المتجر المتاحة في القائمة الرئيسية وشاشات التصفح</p>
        <button onClick={() => setModalOpen(true)} className="btn-brand px-5 py-2.5 text-xs font-bold">
          <Plus size={16} /> إضافة قسم جديد
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/10 bg-[#161616] p-4 shadow-lg">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-white/5">
              {c.imageUrl && <img src={c.imageUrl} alt={c.nameAr} className="h-full w-full object-cover" />}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-cairo text-sm font-bold text-white">{c.nameAr}</p>
                <p className="text-[10px] text-white/50">{c.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(c.id, c.nameAr)}
                className="text-sale hover:bg-sale/20 rounded p-1.5"
                title="حذف القسم"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#1C1C1C] p-6 shadow-2xl text-xs text-white">
            <h2 className="font-cairo text-base font-bold text-white mb-4">إضافة قسم جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block mb-1 text-white/70">اسم القسم بالعربية *</label>
                <input
                  value={nameAr}
                  onChange={(e) => {
                    setNameAr(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  required
                  className="input-luxe bg-[#252525] text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-white/70">الرابط اللطيف (Slug) *</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="input-luxe bg-[#252525] text-white font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block mb-1 text-white/70">رابط صورة القسم</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input-luxe bg-[#252525] text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-white/20 px-4 py-2"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-brand px-6 py-2 font-bold">
                  إضافة القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. COUPONS VIEW
// ==========================================
function CouponsView({ refreshKey }: { refreshKey: number }) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderKwd, setMinOrderKwd] = useState(20);
  const [maxUses, setMaxUses] = useState(100);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, discountType, discountValue: Number(discountValue), minOrderKwd: Number(minOrderKwd), maxUses: Number(maxUses) }),
    });
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-white/60">إدارة رموز الخصم ونسب الخصم والحد الأدنى للطلب</p>
        <button onClick={() => setModalOpen(true)} className="btn-brand px-5 py-2.5 text-xs font-bold">
          <Plus size={16} /> إنشاء كوبون جديد
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-xl">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-white/60">
              <th className="p-4">رمز الكوبون</th>
              <th className="p-4">نوع الخصم</th>
              <th className="p-4">القيمة</th>
              <th className="p-4">الحد الأدنى للطلب</th>
              <th className="p-4">مرات الاستخدام</th>
              <th className="p-4 text-center">حذف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-mono font-bold text-brand uppercase">{c.code}</td>
                <td className="p-4">{c.discountType === "PERCENTAGE" ? "نسبة مئوية (%)" : "مبلغ ثابت (د.ك)"}</td>
                <td className="p-4 font-bold text-white">
                  {c.discountValue} {c.discountType === "PERCENTAGE" ? "%" : "د.ك"}
                </td>
                <td className="p-4">{c.minOrderKwd} د.ك</td>
                <td className="p-4">
                  {c.usedCount} / {c.maxUses === 0 ? "غير محدود" : c.maxUses}
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(c.id)} className="text-sale hover:bg-sale/20 rounded p-1.5">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#1C1C1C] p-6 shadow-2xl text-xs text-white">
            <h2 className="font-cairo text-base font-bold text-white mb-4">إنشاء كوبون خصم جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block mb-1 text-white/70">رمز الكوبون *</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="KSEERAT20"
                  className="input-luxe bg-[#252525] text-white uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-white/70">نوع الخصم</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="input-luxe bg-[#252525] text-white"
                  >
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED_KWD">مبلغ ثابت (د.ك)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-white/70">قيمة الخصم *</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                    className="input-luxe bg-[#252525] text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-white/70">الحد الأدنى للطلب (د.ك)</label>
                  <input
                    type="number"
                    value={minOrderKwd}
                    onChange={(e) => setMinOrderKwd(Number(e.target.value))}
                    className="input-luxe bg-[#252525] text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70">أقصى استخدامات</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="input-luxe bg-[#252525] text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-white/20 px-4 py-2"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-brand px-6 py-2 font-bold">
                  إنشاء الكوبون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. CURRENCIES & BULK PRICING VIEW
// ==========================================
function CurrenciesView({ refreshKey }: { refreshKey: number }) {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [percentDelta, setPercentDelta] = useState(0);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/currencies")
      .then((r) => r.json())
      .then((d) => setCurrencies(d.currencies || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleUpdateCurrency = async (curr: any) => {
    await fetch("/api/admin/currencies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(curr),
    });
    alert(`تم حفظ عملة ${curr.countryAr} بنجاح`);
    loadData();
  };

  // Master Bulk Price Controller: Recalculate all products
  const handleBulkRecalculate = async () => {
    if (!confirm("هل أنت متأكد من إعادة احتساب جميع أسعار منتجات المتجر حسب أسعار الصرف الحالية؟")) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/currencies/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "AUTO_EXCHANGE", percentDelta: Number(percentDelta) || 0 }),
      });
      const d = await res.json();
      if (res.ok) {
        alert(d.message || "تم تحديث جميع أسعار المتجر بنجاح ✓");
      }
    } catch {
      alert("خطأ أثناء التحديث الشامل");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Master Controller Box */}
      <div className="rounded-3xl border border-brand/40 bg-brand/5 p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-cairo text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-brand" />
              المتحكم الشامل بأسعار المتجر (Master Bulk Price Controller)
            </span>
            <p className="mt-1 text-xs text-white/60">
              تحديث وحساب أسعار جميع المنتجات والخيارات بكافة عملات الخليج بضغطة زر واحدة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="+/- %"
              value={percentDelta}
              onChange={(e) => setPercentDelta(Number(e.target.value))}
              className="h-10 w-24 rounded-xl border border-white/20 bg-[#252525] px-3 text-xs text-center text-white"
            />
            <button
              onClick={handleBulkRecalculate}
              disabled={bulkLoading}
              className="btn-brand px-6 py-2.5 text-xs font-bold shadow-lg"
            >
              {bulkLoading ? "جاري التحديث..." : "⚡ تحديث شامل لكافة أسعار المتجر"}
            </button>
          </div>
        </div>
      </div>

      {/* Currencies Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-xl">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-white/60">
              <th className="p-4">الدولة والعملة</th>
              <th className="p-4">الرمز</th>
              <th className="p-4">سعر الصرف مقابل الدينار الكويتي</th>
              <th className="p-4">الحد الأدنى للشحن المجاني</th>
              <th className="p-4">رسوم الشحن الافتراضية</th>
              <th className="p-4 text-center">حفظ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {currencies.map((c) => (
              <tr key={c.code}>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <span className="font-bold text-white">{c.countryAr}</span>
                    <span className="text-white/50">({c.code})</span>
                  </div>
                </td>
                <td className="p-4 font-bold text-brand">{c.symbolAr}</td>
                <td className="p-4">
                  <input
                    type="number"
                    step="0.001"
                    disabled={c.code === "KWD"}
                    value={c.exchangeRateFromKwd}
                    onChange={(e) => {
                      const arr = [...currencies];
                      const item = arr.find((x) => x.code === c.code);
                      if (item) item.exchangeRateFromKwd = Number(e.target.value);
                      setCurrencies(arr);
                    }}
                    className="h-8 w-28 rounded-lg border border-white/10 bg-[#252525] px-2 text-white outline-none"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    value={c.freeShippingThreshold}
                    onChange={(e) => {
                      const arr = [...currencies];
                      const item = arr.find((x) => x.code === c.code);
                      if (item) item.freeShippingThreshold = Number(e.target.value);
                      setCurrencies(arr);
                    }}
                    className="h-8 w-28 rounded-lg border border-white/10 bg-[#252525] px-2 text-white outline-none"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    value={c.defaultShippingCost}
                    onChange={(e) => {
                      const arr = [...currencies];
                      const item = arr.find((x) => x.code === c.code);
                      if (item) item.defaultShippingCost = Number(e.target.value);
                      setCurrencies(arr);
                    }}
                    className="h-8 w-28 rounded-lg border border-white/10 bg-[#252525] px-2 text-white outline-none"
                  />
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleUpdateCurrency(c)}
                    className="rounded-lg bg-brand/20 px-3 py-1 font-bold text-brand hover:bg-brand/30"
                  >
                    حفظ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 7. HERO SLIDES VIEW
// ==========================================
function HeroView({ refreshKey }: { refreshKey: number }) {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [titleAr, setTitleAr] = useState("");
  const [subtitleAr, setSubtitleAr] = useState("");
  const [buttonTextAr, setButtonTextAr] = useState("تسوق الآن");
  const [buttonLink, setButtonLink] = useState("/category/perfumes");
  const [imageUrl, setImageUrl] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then((d) => setSlides(d.slides || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleAr, subtitleAr, buttonTextAr, buttonLink, imageUrl }),
    });
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا البانر؟")) return;
    await fetch(`/api/admin/hero/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-white/60">بانرات العرض الترويجي الكبرى في أعلى الصفحة الرئيسية للمتجر</p>
        <button onClick={() => setModalOpen(true)} className="btn-brand px-5 py-2.5 text-xs font-bold">
          <Plus size={16} /> إضافة بانر جديد
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {slides.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616] p-4 shadow-xl">
            <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-black/40">
              <img src={s.imageUrl} alt={s.titleAr} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end">
                <p className="font-cairo text-sm font-bold text-white">{s.titleAr}</p>
                <p className="text-[11px] text-white/80">{s.subtitleAr}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-brand font-mono">{s.buttonLink}</span>
              <button onClick={() => handleDelete(s.id)} className="text-sale p-1 hover:bg-sale/20 rounded">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#1C1C1C] p-6 shadow-2xl text-xs text-white">
            <h2 className="font-cairo text-base font-bold text-white mb-4">إضافة بانر هيرو جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block mb-1 text-white/70">العنوان الرئيسي بالعربية *</label>
                <input
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  required
                  placeholder="مجموعة كسيرات الملكية"
                  className="input-luxe bg-[#252525] text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-white/70">العنوان الفرعي</label>
                <input
                  value={subtitleAr}
                  onChange={(e) => setSubtitleAr(e.target.value)}
                  placeholder="عطور ودهن عود أصيل من قلب الكويت"
                  className="input-luxe bg-[#252525] text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-white/70">رابط الصورة *</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  placeholder="https://..."
                  className="input-luxe bg-[#252525] text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-white/70">نص الزر</label>
                  <input
                    value={buttonTextAr}
                    onChange={(e) => setButtonTextAr(e.target.value)}
                    className="input-luxe bg-[#252525] text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70">رابط التوجيه</label>
                  <input
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="input-luxe bg-[#252525] text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-white/20 px-4 py-2"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-brand px-6 py-2 font-bold">
                  إضافة البانر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. SHIPPING VIEW
// ==========================================
function ShippingView({ refreshKey }: { refreshKey: number }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [deliveryTimeAr, setDeliveryTimeAr] = useState("خلال 24-48 ساعة");
  const [baseCostKwd, setBaseCostKwd] = useState(2);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/shipping")
      .then((r) => r.json())
      .then((d) => setCompanies(d.companies || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameAr, deliveryTimeAr, baseCostKwd: Number(baseCostKwd), supportedCountries: [] }),
    });
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف شركة الشحن؟")) return;
    await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-white/60">شركات التوصيل السريع لطلبات الكويت ودول الخليج العربي</p>
        <button onClick={() => setModalOpen(true)} className="btn-brand px-5 py-2.5 text-xs font-bold">
          <Plus size={16} /> إضافة شركة شحن
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-xl">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-white/60">
              <th className="p-4">اسم الشركة</th>
              <th className="p-4">مدة التوصيل التقديرية</th>
              <th className="p-4">التكلفة الأساسية (د.ك)</th>
              <th className="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {companies.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-bold text-white">{c.nameAr}</td>
                <td className="p-4 text-white/70">{c.deliveryTimeAr}</td>
                <td className="p-4 font-bold text-brand">{c.baseCostKwd} د.ك</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(c.id)} className="text-sale p-1 hover:bg-sale/20 rounded">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#1C1C1C] p-6 shadow-2xl text-xs text-white">
            <h2 className="font-cairo text-base font-bold text-white mb-4">إضافة شركة شحن جديدة</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block mb-1 text-white/70">اسم شركة الشحن *</label>
                <input
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  required
                  placeholder="الشحن السريع - أرامكس"
                  className="input-luxe bg-[#252525] text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-white/70">مدة التوصيل التقديرية</label>
                <input
                  value={deliveryTimeAr}
                  onChange={(e) => setDeliveryTimeAr(e.target.value)}
                  className="input-luxe bg-[#252525] text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-white/70">التكلفة الأساسية (د.ك) *</label>
                <input
                  type="number"
                  step="0.001"
                  value={baseCostKwd}
                  onChange={(e) => setBaseCostKwd(Number(e.target.value))}
                  required
                  className="input-luxe bg-[#252525] text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-white/20 px-4 py-2"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-brand px-6 py-2 font-bold">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 9. CUSTOMERS VIEW (Loyalty Points)
// ==========================================
function CustomersView({ refreshKey }: { refreshKey: number }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const adjustPoints = async (userId: string, currentPoints: number) => {
    const val = prompt("أدخل رصيد نقاط الولاء الجديد لهذا العميل:", String(currentPoints));
    if (val === null) return;
    const points = Number(val);
    if (isNaN(points)) return;
    await fetch("/api/admin/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, loyaltyPoints: points }),
    });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-xl">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-white/60">
              <th className="p-4">العميل</th>
              <th className="p-4">الهاتف</th>
              <th className="p-4">البريد الإلكتروني</th>
              <th className="p-4">عدد الطلبات</th>
              <th className="p-4">نقاط الولاء</th>
              <th className="p-4 text-center">تعديل النقاط</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {customers.map((u) => (
              <tr key={u.id}>
                <td className="p-4 font-bold text-white">
                  {u.firstName} {u.lastName}
                </td>
                <td className="p-4 font-mono text-white/70" dir="ltr">
                  {u.phoneCountryCode} {u.phoneNumber || "—"}
                </td>
                <td className="p-4 text-white/70">{u.email || "—"}</td>
                <td className="p-4">{u._count?.orders || 0}</td>
                <td className="p-4 font-bold text-brand">{u.loyaltyPoints || 0} نقطة</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => adjustPoints(u.id, u.loyaltyPoints || 0)}
                    className="rounded bg-brand/20 px-3 py-1 font-bold text-brand hover:bg-brand/30"
                  >
                    تعديل النقاط
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 10. BROADCAST VIEW (Web Push to all devices)
// ==========================================
function BroadcastView({ refreshKey }: { refreshKey: number }) {
  const [title, setTitle] = useState("خصم خاص 30% الليلة من كسيرات ✨");
  const [body, setBody] = useState("عطور ودهن عود كمبودي فاخر بانتظارك. استفد من الخصم الآن مع شحن مجاني!");
  const [url, setUrl] = useState("/category/offers");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = () => {
    fetch("/api/admin/broadcast")
      .then((r) => r.json())
      .then((d) => setHistory(d.notifications || []))
      .catch(() => undefined);
  };

  useEffect(() => {
    loadHistory();
  }, [refreshKey]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const d = await res.json();
      if (res.ok) {
        alert(d.message || "تم إرسال الإشعار الفوري بنجاح لجميع الأجهزة ✓");
        loadHistory();
      } else {
        alert(d.error || "تعذر إرسال الإشعار");
      }
    } catch {
      alert("خطأ أثناء الإرسال");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-brand/40 bg-brand/5 p-6 shadow-xl">
        <h2 className="font-cairo text-base font-bold text-white flex items-center gap-2">
          <Send size={18} className="text-brand" />
          إرسال إشعار فوري جماعي (Web Push Broadcast)
        </h2>
        <p className="mt-1 text-xs text-white/60">
          يصل الإشعار مباشرة إلى هواتف وأجهزة الكمبيوتر الخاصة بجميع العملاء المشتركين حتى ولو كان الموقع أو المتصفح مغلقاً!
        </p>

        <form onSubmit={handleBroadcast} className="mt-6 space-y-4 text-xs text-white">
          <div>
            <label className="block mb-1 text-white/70">عنوان الإشعار *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 w-full rounded-xl border border-white/15 bg-[#1C1C1C] px-3 text-white outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 text-white/70">نص الرسالة *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className="h-20 w-full rounded-xl border border-white/15 bg-[#1C1C1C] p-3 text-white outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 text-white/70">الرابط المستهدف عند النقر</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-[#1C1C1C] px-3 text-white outline-none font-mono"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="btn-brand px-8 py-3 text-xs font-bold shadow-lg"
          >
            {sending ? "جاري الإرسال عبر خوادم Push..." : "🚀 إرسال الإشعار الفوري الآن"}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-xl">
        <h3 className="font-cairo text-sm font-bold text-white mb-4">سجل الإشعارات المرسلة سابقاً</h3>
        <div className="divide-y divide-white/5 text-xs text-white/80">
          {history.length === 0 ? (
            <p className="py-4 text-center text-white/40">لم يتم إرسال أي إشعارات بعد</p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-brand">{h.title}</p>
                  <p className="text-[11px] text-white/60">{h.body}</p>
                </div>
                <span className="text-[10px] text-white/40 font-mono">
                  {new Date(h.createdAt).toLocaleDateString("ar-KW")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. SETTINGS & MYFATOORAH GATEWAY VIEW
// ==========================================
function SettingsView({ refreshKey }: { refreshKey: number }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("تم حفظ إعدادات المتجر بنجاح ✓");
      }
    } catch {
      alert("تعذر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <div className="text-xs text-white/50">جاري تحميل الإعدادات...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 text-xs text-white">
      {/* MyFatoorah Gateway Settings */}
      <div className="rounded-3xl border border-brand/40 bg-brand/5 p-6 shadow-xl">
        <h2 className="font-cairo text-base font-bold text-white flex items-center gap-2">
          <CreditCard size={18} className="text-brand" />
          إعدادات بوابة الدفع الإلكتروني (MyFatoorah Gateway)
        </h2>
        <p className="mt-1 text-xs text-white/60">
          التبديل بين وضع المحاكاة التجريبي (Mock Mode) والوضع الفعلي الحي لربط بطاقات KNET و Apple Pay.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-white/70">وضع بوابة الدفع</label>
            <select
              value={settings.myfatoorahMode || "MOCK"}
              onChange={(e) => setSettings({ ...settings, myfatoorahMode: e.target.value })}
              className="h-10 w-full rounded-xl border border-white/20 bg-[#252525] px-3 font-bold text-brand"
            >
              <option value="MOCK">وضع المحاكاة التجريبي المدمج (Mock Mode)</option>
              <option value="LIVE">الوضع الفعلي الحي (Live MyFatoorah API)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-white/70">رابط البوابة (Base URL)</label>
            <input
              value={settings.myfatoorahBaseUrl || "https://apitest.myfatoorah.com"}
              onChange={(e) => setSettings({ ...settings, myfatoorahBaseUrl: e.target.value })}
              className="h-10 w-full rounded-xl border border-white/15 bg-[#252525] px-3 text-white font-mono"
              dir="ltr"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block mb-1 text-white/70">مفتاح الربط الحي (API Token)</label>
            <input
              type="password"
              value={settings.myfatoorahApiKey || ""}
              onChange={(e) => setSettings({ ...settings, myfatoorahApiKey: e.target.value })}
              placeholder="ضع مفتاح MyFatoorah Token هنا عند التحويل للوضع الفعلي..."
              className="h-10 w-full rounded-xl border border-white/15 bg-[#252525] px-3 text-white font-mono"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Brand & Story */}
      <div className="rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-xl space-y-4">
        <h3 className="font-cairo text-sm font-bold text-white">هوية المتجر وقصة البراند</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-white/70">اسم المتجر بالعربية</label>
            <input
              value={settings.storeNameAr || "كسيرات"}
              onChange={(e) => setSettings({ ...settings, storeNameAr: e.target.value })}
              className="input-luxe bg-[#252525] text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-white/70">شريط الإعلانات أعلى المتجر</label>
            <input
              value={settings.announcementAr || ""}
              onChange={(e) => setSettings({ ...settings, announcementAr: e.target.value })}
              className="input-luxe bg-[#252525] text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1 text-white/70">مقولة قصة البراند (Story Quote)</label>
            <textarea
              value={settings.storyQuoteAr || ""}
              onChange={(e) => setSettings({ ...settings, storyQuoteAr: e.target.value })}
              className="input-luxe bg-[#252525] text-white h-20"
            />
          </div>
        </div>
      </div>

      {/* Contact & Legal */}
      <div className="rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-xl space-y-4">
        <h3 className="font-cairo text-sm font-bold text-white">بيانات التواصل والترخيص</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block mb-1 text-white/70">رقم الهاتف</label>
            <input
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="input-luxe bg-[#252525] text-white"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block mb-1 text-white/70">رقم الواتساب للزر العائم</label>
            <input
              value={settings.whatsapp || ""}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="input-luxe bg-[#252525] text-white"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block mb-1 text-white/70">ساعات العمل</label>
            <input
              value={settings.workingHoursAr || ""}
              onChange={(e) => setSettings({ ...settings, workingHoursAr: e.target.value })}
              className="input-luxe bg-[#252525] text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-white/70">رقم السجل التجاري</label>
            <input
              value={settings.commercialRegistration || ""}
              onChange={(e) => setSettings({ ...settings, commercialRegistration: e.target.value })}
              className="input-luxe bg-[#252525] text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-white/70">الرقم الضريبي</label>
            <input
              value={settings.taxNumber || ""}
              onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
              className="input-luxe bg-[#252525] text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-brand px-10 py-3.5 text-xs font-bold shadow-xl"
        >
          {saving ? "جاري حفظ الإعدادات..." : "حفظ التغييرات الشاملة ✓"}
        </button>
      </div>
    </form>
  );
}
