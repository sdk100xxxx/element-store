"use client";

import { useState } from "react";
import Link from "next/link";
import { CopyAllKeysButton } from "./CopyAllKeysButton";

type Order = {
  id: string;
  status: string;
  total: number;
  stripeSessionId: string | null;
  createdAt: Date | string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: { name: string; slug: string; deliveryType: string };
  }[];
  licenses: { id: string; key: string; productId: string }[];
};

export function OrderList({ orders }: { orders: Order[] }) {
  const formattedDate = (d: Date | string | null | undefined) => {
    if (d == null) return "—";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  const formattedPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  return (
    <ul className="mt-6 space-y-6">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-lg border border-element-gray-800 bg-element-gray-900 overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-element-gray-800 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400">{formattedDate(order.createdAt)}</span>
              {order.stripeSessionId && (
                <span className="text-xs text-gray-500 font-mono">
                  Ref: {order.stripeSessionId.slice(0, 20)}…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
            <Link
              href={`/orders/${order.id}`}
              className="text-xs font-medium text-element-red hover:underline"
            >
              View details
            </Link>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${
                order.status === "paid"
                  ? "bg-green-500/20 text-green-400"
                  : order.status === "pending"
                    ? "bg-amber-500/20 text-amber-400"
                    : order.status === "declined"
                      ? "bg-red-500/20 text-red-400"
                      : order.status === "expired"
                        ? "bg-gray-500/20 text-gray-400"
                        : "bg-element-gray-700 text-gray-400"
              }`}
            >
              {order.status}
            </span>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="space-y-1 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-300">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>{formattedPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 border-t border-element-gray-800 pt-2 text-right font-medium text-white">
              Total: {formattedPrice(order.total)}
            </div>
            {order.status === "paid" && order.licenses.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    License keys
                  </p>
                  {order.licenses.length > 1 && (
                    <CopyAllKeysButton keys={order.licenses.map((l) => l.key)} />
                  )}
                </div>
                <ul className="space-y-2">
                  {order.licenses.map((lic) => {
                    const productName =
                      order.items.find((i) => i.productId === lic.productId)?.product.name ?? "Product";
                    return (
                      <li key={lic.id} className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-400">{productName}:</span>
                        <code className="flex-1 rounded bg-element-gray-800 px-2 py-1 font-mono text-sm text-gray-300">
                          {lic.key}
                        </code>
                        <CopyButton text={lic.key} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {order.status === "paid" &&
              order.items.some((i) => i.product.deliveryType === "SERVICE") &&
              order.licenses.length === 0 && (
                <p className="mt-4 text-sm text-gray-500">
                  Service items: open a Discord ticket to receive your product.
                </p>
              )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded border border-element-red/60 bg-transparent px-2 py-1 text-xs font-medium text-element-red transition hover:bg-element-red/10"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

