"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: { url: string; alt: string }[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const main = images[selectedIndex];
  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-element-gray-800 bg-element-black">
        <Image
          src={main.url}
          alt={main.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
          unoptimized={!main.url.startsWith("/")}
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition ${
                i === selectedIndex
                  ? "border-element-red bg-element-red/10"
                  : "border-element-gray-700 bg-element-gray-900 hover:border-element-gray-600"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={!img.url.startsWith("/")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
