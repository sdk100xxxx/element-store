"use client";

import { useRouter } from "next/navigation";
import { toggleCouponActive } from "./actions";

type Coupon = {
  id: string;
  code: string;
  name: string | null;
  discountType: string;
  discountValue: number;
  productId: string | null;
  allowedEmails: string | null;
  isActive: boolean;
  product: { id: string; name: string; slug: string } | null;
};

export function CouponList({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();

  async function handleToggle(id: string, current: boolean) {
    await toggleCouponActive(id, !current);
    router.refresh();
  }

  return (
    <ul className="mt-4 space-y-3">
      {coupons.map((c) => (
        <li
          key={c.id}
          className={`flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 ${
            c.isActive ? "border-element-gray-700 bg-element-gray-800" : "border-element-gray-800 bg-element-gray-800/50 opacity-75"
          }`}
        >
          <div className="min-w-0">
            <span className="font-mono font-medium text-white">{c.code}</span>
            {c.name && <span className="ml-2 text-gray-500">({c.name})</span>}
            <p className="mt-0.5 text-xs text-gray-400">
              {c.discountType === "PERCENT"
                ? `${c.discountValue}% off`
                : `$${(c.discountValue / 100).toFixed(2)} off`}
              {" · "}
              {c.productId ? c.product?.name ?? "Product" : "All products"}
              {c.allowedEmails?.trim() && (
                <> · <span className="text-amber-400/90">Restricted to {c.allowedEmails.split(",").filter(Boolean).length} email(s)</span></>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle(c.id, c.isActive)}
            className={`rounded px-2 py-1 text-xs font-medium transition ${
              c.isActive
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            }`}
          >
            {c.isActive ? "Deactivate" : "Activate"}
          </button>
        </li>
      ))}
    </ul>
  );
}
