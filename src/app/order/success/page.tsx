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
  const [keysPending, setKeysPending] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyAllKeys() {
    if (licenseKeys.length === 0) return;
    try {
      await navigator.clipboard.writeText(licenseKeys.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: no clipboard API
    }
  }

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 60; // 30s total (webhook can take a few seconds; poll every 500ms)

    function fetchKeys() {
      if (cancelled) return;
      fetch(`/api/order/keys?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          setLicenseKeys(data.keys || []);
          setServiceItems(!!data.serviceItems);
          setKeysPending(!!data.keysPending);
          setOrderId(data.orderId ?? null);
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
    <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:py-16">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 sm:h-16 sm:w-16">
        <svg
          className="h-7 w-7 text-green-500 sm:h-8 sm:w-8"
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
      <h1 className="mt-4 text-xl font-bold text-white sm:mt-6 sm:text-2xl">Thank You for Your Purchase</h1>
      <p className="mt-2 text-sm text-gray-400 sm:text-base">
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
        <div className="mt-6 rounded-lg border border-element-gray-800 bg-element-gray-900 p-4 text-left sm:mt-8 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-white">Your License Keys</h2>
            <button
              type="button"
              onClick={copyAllKeys}
              className="rounded border border-element-gray-600 bg-element-gray-800 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-element-gray-700"
            >
              {copied ? "Copied!" : "Copy all"}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400 sm:text-sm">
            Save these keys. You can also access them from your account.
          </p>
          <ul className="mt-4 space-y-2">
            {licenseKeys.map((key) => (
              <li
                key={key}
                className="break-all font-mono rounded bg-element-black px-3 py-2 text-xs text-element-red sm:text-sm"
              >
                {key}
              </li>
            ))}
          </ul>
        </div>
      ) : sessionId && !serviceItems ? (
        <div className="mt-6 space-y-2">
          {keysPending ? (
            <>
              <p className="text-amber-400">Payment confirmed. Keys are being prepared.</p>
              <p className="text-sm text-gray-500">
                Check &quot;Manage Orders&quot; in a moment or contact support with order ref: {orderId ?? "—"}
              </p>
            </>
          ) : (
            <p className="text-gray-500">No license keys found for this order.</p>
          )}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
        {orderId && (
          <Link
            href={`/orders/${orderId}`}
            className="inline-block min-h-[2.75rem] rounded-lg border border-element-gray-600 bg-element-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-element-gray-700"
          >
            View invoice
          </Link>
        )}
        <Link
          href="/store"
          className="inline-block min-h-[2.75rem] rounded-lg bg-element-red px-6 py-3 font-semibold text-white transition hover:bg-element-red-dark active:bg-element-red-dark"
        >
          Back to Store
        </Link>
      </div>
    </div>
  );
}
