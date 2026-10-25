"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultCurrency, type CurrencyLite } from "@/lib/pricing";
import { dict } from "@/lib/i18n";

export type StoreLang = "ar" | "en";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  nameAr: string;
  nameEn?: string | null;
  image: string;
  variantId?: string | null;
  variantName?: string | null;
  unitPriceKwd: number;
  originalPriceKwd?: number | null;
  quantity: number;
  stock: number;
};

export type WishItem = {
  productId: string;
  slug: string;
  nameAr: string;
  nameEn?: string | null;
  image: string;
  priceKwd: number;
};

export type SessionUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  role: string;
  loyaltyPoints: number;
};

type StoreState = {
  currencies: CurrencyLite[];
  currencyCode: string;
  lang: StoreLang;
  cart: CartItem[];
  wishlist: WishItem[];
  lastAdded: { item: CartItem; ts: number } | null;
  user: SessionUser | null;
  authLoaded: boolean;
  setCurrencies: (currencies: CurrencyLite[]) => void;
  setCurrency: (code: string) => void;
  setLang: (lang: StoreLang) => void;
  addToCart: (item: Omit<CartItem, "key" | "quantity"> & { quantity?: number }) => void;
  removeFromCart: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (item: WishItem) => void;
  isWished: (productId: string) => boolean;
  dismissToast: () => void;
  setUser: (user: SessionUser | null) => void;
  setAuthLoaded: (v: boolean) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currencies: [defaultCurrency()],
      currencyCode: "KWD",
      lang: "ar",
      cart: [],
      wishlist: [],
      lastAdded: null,
      user: null,
      authLoaded: false,
      setCurrencies: (currencies) =>
        set((state) => {
          const exists = currencies.some((c) => c.code === state.currencyCode);
          return { currencies, currencyCode: exists ? state.currencyCode : currencies[0]?.code ?? "KWD" };
        }),
      setCurrency: (code) => set({ currencyCode: code }),
      setLang: (lang) => set({ lang }),
      addToCart: (item) => {
        const key = `${item.productId}:${item.variantId ?? "base"}`;
        const qty = Math.max(1, item.quantity ?? 1);
        const existing = get().cart.find((c) => c.key === key);
        let cart: CartItem[];
        if (existing) {
          cart = get().cart.map((c) =>
            c.key === key
              ? { ...c, quantity: Math.min(c.stock || 99, c.quantity + qty) }
              : c
          );
        } else {
          cart = [...get().cart, { ...item, key, quantity: Math.min(qty, item.stock || 99) }];
        }
        const added = cart.find((c) => c.key === key)!;
        set({ cart, lastAdded: { item: { ...added }, ts: Date.now() } });
      },
      removeFromCart: (key) => set({ cart: get().cart.filter((c) => c.key !== key) }),
      setQuantity: (key, quantity) =>
        set({
          cart: get().cart.map((c) =>
            c.key === key
              ? { ...c, quantity: Math.max(1, Math.min(quantity, c.stock || 99)) }
              : c
          ),
        }),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (item) => {
        const exists = get().wishlist.some((w) => w.productId === item.productId);
        set({
          wishlist: exists
            ? get().wishlist.filter((w) => w.productId !== item.productId)
            : [...get().wishlist, item],
        });
      },
      isWished: (productId) => get().wishlist.some((w) => w.productId === productId),
      dismissToast: () => set({ lastAdded: null }),
      setUser: (user) => set({ user }),
      setAuthLoaded: (v) => set({ authLoaded: v }),
    }),
    {
      name: "kseerat-store-v1",
      skipHydration: true,
      partialize: (state) => ({
        currencyCode: state.currencyCode,
        lang: state.lang,
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);

export function useCurrency(): CurrencyLite {
  return useStore(
    (s) => s.currencies.find((c) => c.code === s.currencyCode) ?? s.currencies[0] ?? defaultCurrency()
  );
}

export function useT() {
  const lang = useStore((s) => s.lang);
  return (key: keyof typeof dict, vars?: Record<string, string | number>) => {
    let value: string = dict[key]?.[lang] ?? dict[key]?.ar ?? String(key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) value = value.replaceAll(`{${k}}`, String(v));
    }
    return value;
  };
}
