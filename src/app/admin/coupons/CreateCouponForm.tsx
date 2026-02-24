"use client";

import { useFormState } from "react-dom";
import { createCoupon } from "./actions";

type Product = { id: string; name: string; slug: string };

export function CreateCouponForm({ products }: { products: Product[] }) {
  const [state, formAction] = useFormState(
    async (_: string | null, formData: FormData) => {
      const result = await createCoupon(formData);
      if (result?.error) return result.error;
      return null;
    },
    null as string | null
  );

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-400">
          Code <span className="text-element-red">*</span>
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          placeholder="e.g. SAVE20"
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-element-red/50 focus:outline-none"
        />
        <p className="mt-0.5 text-xs text-gray-500">Customers enter this at checkout. Stored uppercase.</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-400">
          Name <span className="text-gray-500">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Summer sale"
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-element-red/50 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discountType" className="block text-sm font-medium text-gray-400">
            Discount type
          </label>
          <select
            id="discountType"
            name="discountType"
            required
            className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-white focus:border-element-red/50 focus:outline-none"
          >
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Fixed amount off</option>
          </select>
        </div>
        <div>
          <label htmlFor="discountValue" className="block text-sm font-medium text-gray-400">
            Amount
          </label>
          <input
            id="discountValue"
            name="discountValue"
            type="number"
            required
            min={0.01}
            step={0.01}
            placeholder="e.g. 20 or 5.00"
            className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-element-red/50 focus:outline-none"
          />
          <p className="mt-0.5 text-xs text-gray-500">Percent: 1–100. Fixed: dollars (e.g. 5 = $5 off).</p>
        </div>
      </div>

      <div>
        <label htmlFor="productId" className="block text-sm font-medium text-gray-400">
          Applies to
        </label>
        <select
          id="productId"
          name="productId"
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-white focus:border-element-red/50 focus:outline-none"
        >
          <option value="__all__">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="allowedEmails" className="block text-sm font-medium text-gray-400">
          Allowed emails <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          id="allowedEmails"
          name="allowedEmails"
          rows={2}
          placeholder="user@example.com, vip@site.com (comma-separated; leave empty for any email)"
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-element-red/50 focus:outline-none"
        />
        <p className="mt-0.5 text-xs text-gray-500">Only these emails can use this coupon. Empty = anyone.</p>
      </div>

      {state && (
        <p className="text-sm text-red-400">{state}</p>
      )}

      <button
        type="submit"
        className="rounded bg-element-red px-4 py-2 text-sm font-medium text-white transition hover:bg-element-red-dark"
      >
        Create coupon
      </button>
    </form>
  );
}
