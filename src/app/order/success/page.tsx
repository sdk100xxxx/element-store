"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [licenseKeys, setLicenseKeys] = useState<string[]>([]);
  const [serviceItems, setServiceItems] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12; // ~6s total (webhook often completes in 1–3s)

    function fetchKeys() {
      if (cancelled) return;
      fetch(`/api/order/keys?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          setLicenseKeys(data.keys || []);
          setServiceItems(!!data.serviceItems);
          if ((data.keys?.length ?? 0) > 0 || !!data.serviceItems) {
            setLoading(false);
            return;
          }
          attempts += 1;
          if (attempts < maxAttempts) {
            setTimeout(fetchKeys, 500);
          } else {
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    }

    fetchKeys();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
        <svg
          className="h-8 w-8 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-white">Thank You for Your Purchase</h1>
      <p className="mt-2 text-gray-400">
        Your order has been confirmed.
        {!serviceItems && " Your license keys are ready below."}
      </p>
      {serviceItems && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-left">
          <h2 className="font-semibold text-amber-400">Service items</h2>
          <p className="mt-1 text-sm text-gray-300">
            Open a ticket in our Discord with your order email to receive your product. No key is shown here for service items.
          </p>
        </div>
      )}
      {loading ? (
        <p className="mt-6 text-gray-500">Loading your licenses...</p>
      ) : licenseKeys.length > 0 ? (
        <div className="mt-8 rounded-lg border border-element-gray-800 bg-element-gray-900 p-6 text-left">
          <h2 className="font-semibold text-white">Your License Keys</h2>
          <p className="mt-2 text-sm text-gray-400">
            Save these keys. You can also access them from your account.
          </p>
          <ul className="mt-4 space-y-2">
            {licenseKeys.map((key) => (
              <li
                key={key}
                className="font-mono rounded bg-element-black px-3 py-2 text-sm text-element-red"
              >
                {key}
              </li>
            ))}
          </ul>
        </div>
      ) : sessionId && !serviceItems ? (
        <p className="mt-6 text-gray-500">No license keys found for this order.</p>
      ) : null}
      <Link
        href="/store"
        className="mt-8 inline-block rounded bg-element-red px-6 py-3 font-semibold text-white transition hover:bg-element-red-dark"
      >
        Back to Store
      </Link>
    </div>
  );
}
