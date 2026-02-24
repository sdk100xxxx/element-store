"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RetryKeysButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/retry-keys`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || data.message || "Failed" });
        return;
      }
      setMessage({ type: "ok", text: `Assigned ${data.assigned ?? 0} key(s). Refreshing…` });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded border border-amber-500/50 bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-50"
      >
        {loading ? "Assigning…" : "Retry key assignment"}
      </button>
      {message && (
        <span className={message.type === "ok" ? "text-sm text-green-400" : "text-sm text-red-400"}>
          {message.text}
        </span>
      )}
    </div>
  );
}
