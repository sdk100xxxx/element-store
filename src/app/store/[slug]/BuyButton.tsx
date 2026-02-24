"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface BuyButtonProps {
  productId: string;
  price: number;
  name: string;
  acceptStripe: boolean;
  acceptCrypto: boolean;
}

const MIN_QTY = 1;
const MAX_QTY = 99;
const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export function BuyButton({
  productId,
  acceptStripe,
  acceptCrypto,
}: BuyButtonProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const isSignedIn = status === "authenticated" && !!session?.user;

  async function handlePurchase(paymentMethod: "card" | "crypto") {
    if (!isSignedIn && !isEmailValid(guestEmail)) {
      alert("Please enter your email to continue.");
      return;
    }
    setLoading(paymentMethod);
    try {
      const payload: Record<string, unknown> = {
        productId,
        quantity: Math.min(MAX_QTY, Math.max(MIN_QTY, quantity)),
        paymentMethod: paymentMethod === "card" ? "card" : "crypto",
      };
      if (couponCode.trim()) payload.couponCode = couponCode.trim();
      if (!isSignedIn && guestEmail.trim()) payload.email = guestEmail.trim();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Checkout failed.");
        setLoading(null);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong.");
      setLoading(null);
    }
  }

  const showCard = acceptStripe;
  const showCrypto = acceptCrypto;

  if (!showCard && !showCrypto) {
    return (
      <p className="text-sm text-gray-500">No payment methods enabled for this product.</p>
    );
  }

  const bevelRed = "rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.3)]";
  const bevelGray = "rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_4px_rgba(0,0,0,0.3)]";

  return (
    <>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(MIN_QTY, q - 1))}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-element-red text-white transition hover:bg-element-red-dark ${bevelRed}`}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          id="quantity"
          type="number"
          min={MIN_QTY}
          max={MAX_QTY}
          value={quantity}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!Number.isNaN(n)) setQuantity(Math.min(MAX_QTY, Math.max(MIN_QTY, n)));
          }}
          className="h-10 w-14 rounded-lg border border-element-gray-700 bg-element-black text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-element-red focus:outline-none focus:ring-1 focus:ring-element-red"
        />
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-element-red text-white transition hover:bg-element-red-dark ${bevelRed}`}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {!isSignedIn && (
          <div>
            <label htmlFor="guest-email" className="block text-xs font-medium text-gray-400">
              Your email <span className="text-element-red">*</span>
            </label>
            <input
              id="guest-email"
              type="email"
              required
              placeholder="you@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-element-red/50 focus:outline-none"
            />
            <p className="mt-0.5 text-xs text-gray-500">Required for purchase. Sign in to see orders under Manage Orders.</p>
          </div>
        )}
        <div>
          <label htmlFor="coupon" className="block text-xs font-medium text-gray-500">
            Coupon code
          </label>
          <input
            id="coupon"
            type="text"
            placeholder="Optional"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-element-red/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
        {showCard && (
          <button
            onClick={() => handlePurchase("card")}
            disabled={!!loading}
            className={`flex h-12 w-full items-center justify-center gap-2 font-semibold text-white transition hover:bg-element-red-dark disabled:opacity-50 bg-element-red ${bevelRed}`}
          >
            {loading === "card" ? (
              "Processing..."
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Buy Now
              </>
            )}
          </button>
        )}
        {showCrypto && (
          <button
            onClick={() => handlePurchase("crypto")}
            disabled={!!loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-element-red bg-transparent font-medium text-element-red transition hover:bg-element-red/10 disabled:opacity-50"
          >
            <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.4 1.25-2.1 1.25-1.61 0-2.08-.72-2.12-1.64H8.04c.06 1.64 1.12 2.42 2.92 2.83V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
            </svg>
            {loading === "crypto" ? "Processing..." : "Pay with Crypto"}
          </button>
        )}
        </div>
      </div>
    </>
  );
}
