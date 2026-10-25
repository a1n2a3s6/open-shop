"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

type Slide = {
  id: number;
  titleAr: string;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  buttonTextAr: string | null;
  buttonTextEn: string | null;
  buttonLink: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
};

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const lang = useStore((s) => s.lang);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  if (!slides.length) return null;
  const slide = slides[index];

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <section
      className="relative h-[62vh] min-h-[420px] w-full overflow-hidden bg-charcoal sm:h-[72vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <picture>
            {slide.mobileImageUrl && <source media="(max-width: 640px)" srcSet={slide.mobileImageUrl} />}
            <img src={slide.imageUrl} alt={slide.titleAr} className="h-full w-full object-cover" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/45 to-black/10" />
        </motion.div>
      </AnimatePresence>

      <div className="container-luxe relative flex h-full items-center">
        <motion.div
          key={`content-${slide.id}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-xl text-white"
        >
          <span className="mb-3 inline-block rounded-full border border-white/40 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/90">
            كسيرات | KSEERAT
          </span>
          <h1 className="font-amiri text-4xl font-bold leading-tight drop-shadow-sm sm:text-6xl">
            {lang === "ar" ? slide.titleAr : slide.titleEn || slide.titleAr}
          </h1>
          {(slide.subtitleAr || slide.subtitleEn) && (
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
              {lang === "ar" ? slide.subtitleAr : slide.subtitleEn || slide.subtitleAr}
            </p>
          )}
          {slide.buttonLink && (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={slide.buttonLink} className="btn-brand px-8">
                {lang === "ar" ? slide.buttonTextAr : slide.buttonTextEn || slide.buttonTextAr}
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="السابق"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur transition hover:bg-black/50 sm:grid"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={next}
            aria-label="التالي"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur transition hover:bg-black/50 sm:grid"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`شريحة ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-8 bg-brand" : "w-2.5 bg-white/50 hover:bg-white"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}