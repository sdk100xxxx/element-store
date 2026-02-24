"use client";

import Image from "next/image";
import { useState } from "react";

const HERO_SRC = "/hero-1.png";

const cardGlow = "shadow-[0_0_20px_rgba(220,38,38,0.25)]";
const cardBase =
  "rounded-2xl border border-element-red/30 bg-element-gray-900/80 backdrop-blur-sm";

export function HeroCards() {
  const [imgError, setImgError] = useState(false);

  /* Same card widths across breakpoints so mobile matches desktop column look */
  const cardWidth = "w-full max-w-[14rem] sm:max-w-[16rem] sm:w-64 md:w-64 lg:w-72";
  const pulseClass = "animate-hero-pulse";

  return (
    <div className="flex flex-col items-center gap-4 md:items-end md:gap-5">
      {/* 1. Delivery card */}
      <div
        className={`${cardWidth} ${pulseClass} shrink-0 rounded-2xl border border-element-red/20 bg-element-gray-900/70 p-4 backdrop-blur-sm ${cardGlow}`}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Delivery
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-element-gray-800">
          <div className="h-full w-full rounded-full bg-element-red" />
        </div>
        <p className="mt-2 text-xl font-bold text-white">&lt;24/7</p>
        <p className="text-xs text-gray-500">Pay · receive in minutes</p>
      </div>

      {/* 2. Hero / loader image card */}
      <div
        className={`relative ${cardWidth} ${pulseClass} flex aspect-[4/3] min-h-[10rem] items-stretch justify-center overflow-hidden sm:min-h-0 sm:aspect-[5/4] md:aspect-[3/2] ${cardBase} ${cardGlow}`}
      >
        <div className="relative h-full w-full">
          {imgError ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-2xl text-element-gray-600">🖼</span>
              <p className="mt-1 text-xs text-gray-500">public/hero-1.png</p>
            </div>
          ) : (
            <Image
              src={HERO_SRC}
              alt=""
              fill
              className="object-cover object-center scale-110"
              sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 288px"
              unoptimized
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>

      {/* 3. Customers / vouches card with red checkmark */}
      <div
        className={`${cardWidth} ${pulseClass} shrink-0 rounded-2xl border border-element-red/25 bg-element-gray-900/75 p-4 backdrop-blur-sm ${cardGlow}`}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-element-red" aria-hidden>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div className="space-y-0.5 font-nunito">
            <p className="text-base font-semibold text-white">5K+ Customers</p>
            <p className="text-base font-semibold text-white">1K+ Vouches</p>
          </div>
        </div>
      </div>
    </div>
  );
}
