"use client";

import Image from "next/image";
import { useState } from "react";

const HERO_SRC = "/hero-1.png";

export function HeroImage() {
  const [error, setError] = useState(false);

  return (
    <div className="relative flex justify-center lg:justify-end">
      <div className="relative h-56 w-48 shrink-0 sm:h-64 sm:w-56 lg:h-80 lg:w-64">
        {error ? (
          <div
            className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-element-gray-700 bg-element-gray-900/80 p-4 text-center"
            role="img"
            aria-label="Hero image placeholder"
          >
            <span className="text-4xl text-element-gray-600">🖼</span>
            <p className="mt-2 text-sm text-gray-500">Add your image as</p>
            <p className="font-mono text-element-red">public/hero-1.png</p>
          </div>
        ) : (
          <Image
            src={HERO_SRC}
            alt=""
            fill
            className="animate-hero-pulse object-contain"
            sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 320px"
            unoptimized
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
}
