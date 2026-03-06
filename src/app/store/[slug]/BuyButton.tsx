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
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay with Card
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
            {loading === "crypto" ? (
              "Processing..."
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 14.5v1.5h-1.5v-1.5H9.5v-1h1.5v-4H9.5v-1h2.5V7h1v1.5h.5c.83 0 1.5.67 1.5 1.5 0 .55-.3 1.03-.74 1.29.44.26.74.74.74 1.29 0 .83-.67 1.5-1.5 1.5h-.5v1.5h-1v-1.5zm.5-5.5h.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-.5v1zm0 3h.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-.5v1z" />
                </svg>
                Pay with Crypto
              </>
            )}
          </button>
        )}
        </div>
      </div>
    </>
  );
}
