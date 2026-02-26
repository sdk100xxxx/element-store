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
          className="overflow-hidden rounded-xl border border-element-gray-700 bg-element-gray-900 shadow"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-element-gray-700 bg-element-gray-800/50 px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Invoice</p>
              <p className="mt-0.5 font-mono text-sm text-white">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{formattedDate(order.createdAt)}</p>
              <span
                className={`mt-1.5 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${
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
            <Link
              href={`/orders/${order.id}`}
              className="ml-auto flex min-h-[2.25rem] items-center rounded border border-element-red/60 bg-transparent px-3 py-1.5 text-xs font-medium text-element-red transition hover:bg-element-red/10 sm:text-sm"
            >
              View invoice
            </Link>
          </div>
          <div className="px-4 py-3 sm:px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="text-left">Item</th>
                  <th className="w-14 text-center">Qty</th>
                  <th className="w-20 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-element-gray-800">
                    <td className="py-1.5 text-gray-300">{item.product.name}</td>
                    <td className="py-1.5 text-center text-gray-400">{item.quantity}</td>
                    <td className="py-1.5 text-right text-white">{formattedPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex justify-end border-t border-element-gray-700 pt-3">
              <span className="text-sm font-bold text-element-red">Total {formattedPrice(order.total)}</span>
            </div>
            {order.status === "paid" && order.licenses.length > 0 && (
              <div className="mt-4 border-t border-element-gray-700 pt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                        <code className="min-w-0 flex-1 break-all rounded bg-element-gray-800 px-2 py-1 font-mono text-xs text-gray-300 sm:text-sm">
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

