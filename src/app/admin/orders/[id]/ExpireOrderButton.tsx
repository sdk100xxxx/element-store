"use client";

import { useTransition } from "react";
import { expireOrder } from "../actions";

export function ExpireOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => expireOrder(formData));
      }}
      className="inline-block"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded border border-gray-500 bg-gray-500/20 px-3 py-1.5 text-sm font-medium text-gray-300 transition hover:bg-gray-500/30 disabled:opacity-50"
      >
        {isPending ? "Expiring…" : "Mark as expired"}
      </button>
    </form>
  );
}
