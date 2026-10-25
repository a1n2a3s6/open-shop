import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#B39A7B",
          dark: "#9D8364",
          light: "#F5EFE8",
        },
        cream: "#FAF8F5",
        charcoal: "#1A1A1A",
        ink: "#1F1F1F",
        muted: "#6B6B6B",
        sale: "#DC2626",
        success: "#10B981",
      },
      fontFamily: {
        sans: ["Tajawal", "Cairo", "system-ui", "sans-serif"],
        cairo: ["Cairo", "sans-serif"],
        amiri: ["Amiri", "serif"],
      },
      boxShadow: {
        luxe: "0 10px 40px -12px rgba(80, 60, 35, 0.25)",
        card: "0 4px 24px -8px rgba(60, 45, 25, 0.12)",
      },
      keyframes: {
        "toast-progress": {
          from: { width: "100%" },
          to: { width: "0%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "toast-progress": "toast-progress 6s linear forwards",
        "fade-up": "fade-up .5s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
