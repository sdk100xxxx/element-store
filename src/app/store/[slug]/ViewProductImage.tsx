"use client";

import { useState } from "react";
import Image from "next/image";

interface ViewProductImageProps {
  imageUrl: string;
  productName: string;
  className?: string;
}

export function ViewProductImage({ imageUrl, productName, className = "" }: ViewProductImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-element-red bg-transparent text-sm font-medium text-element-red transition hover:bg-element-red/10 ${className}`}
      >
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        View product image
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Product image"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-element-gray-800 p-2 text-white hover:bg-element-gray-700"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt={`${productName} - product image`}
              width={800}
              height={800}
              className="max-h-[90vh] w-auto rounded-lg object-contain"
              unoptimized={!imageUrl.startsWith("/")}
            />
          </div>
        </div>
      )}
    </>
  );
}
