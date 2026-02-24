"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  subtitle?: string | null;
  price: number;
  image?: string | null;
  imageDisplay?: string | null;
  isActive: boolean;
  groupId?: string | null;
  acceptStripe?: boolean;
  acceptCrypto?: boolean;
  deliveryType?: string;
}

interface Group {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product?: Product;
  groups: Group[];
}

export function ProductForm({ product, groups }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    subtitle: product?.subtitle ?? "",
    price: product ? (product.price / 100).toFixed(2) : "",
    image: product?.image ?? "",
    imageDisplay: product?.imageDisplay ?? "",
    isActive: product?.isActive ?? true,
    groupId: product?.groupId ?? "",
    acceptStripe: product?.acceptStripe ?? true,
    acceptCrypto: product?.acceptCrypto ?? false,
    deliveryType: product?.deliveryType ?? "SERIAL",
  });

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "imageDisplay"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(field);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }
      setForm((f) => ({ ...f, [field]: data.url }));
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const priceCents = Math.round(parseFloat(form.price) * 100);
      if (isNaN(priceCents) || priceCents < 0) {
        setError("Invalid price.");
        setLoading(false);
        return;
      }
      const res = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug || slugify(form.name),
            description: form.description || undefined,
            subtitle: form.subtitle || undefined,
            price: priceCents,
            image: form.image || undefined,
            imageDisplay: form.imageDisplay || undefined,
            isActive: form.isActive,
            groupId: form.groupId || null,
            acceptStripe: form.acceptStripe,
            acceptCrypto: form.acceptCrypto,
            deliveryType: form.deliveryType,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save.");
        setLoading(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
      {error && (
        <div className="rounded bg-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-400">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({
              ...f,
              name: e.target.value,
              slug: product ? f.slug : slugify(e.target.value),
            }));
          }}
          required
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-white focus:border-element-red focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
          placeholder="product-url-slug"
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-white focus:border-element-red focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Group</label>
        <select
          value={form.groupId}
          onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-white focus:border-element-red focus:outline-none"
        >
          <option value="">No group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Subtitle</label>
        <input
          type="text"
          value={form.subtitle}
          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          placeholder="Short description"
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-white focus:border-element-red focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-white focus:border-element-red focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Price (USD)</label>
        <input
          type="text"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="9.99"
          className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-white focus:border-element-red focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Cover image</label>
        <p className="mt-1 text-xs text-gray-500">Main product image — fills the top box on the product page (JPEG, PNG, WebP, GIF, max 5MB)</p>
        <div className="mt-2 flex items-center gap-4">
          <label className="cursor-pointer rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-sm text-gray-400 transition hover:bg-element-gray-800 hover:text-white">
            {uploading === "image" ? "Uploading..." : "Choose file"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => handleFileChange(e, "image")}
              disabled={!!uploading}
              className="hidden"
            />
          </label>
          {form.image && (
            <div className="relative h-16 w-16">
              <Image
                src={form.image}
                alt="Cover preview"
                fill
                className="rounded object-cover"
                unoptimized={!form.image.startsWith("/")}
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, image: "" }))}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Display image (optional)</label>
        <p className="mt-1 text-xs text-gray-500">Second image shown below the cover (e.g. box art, alternate view). Same formats, max 5MB.</p>
        <div className="mt-2 flex items-center gap-4">
          <label className="cursor-pointer rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-sm text-gray-400 transition hover:bg-element-gray-800 hover:text-white">
            {uploading === "imageDisplay" ? "Uploading..." : "Choose file"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => handleFileChange(e, "imageDisplay")}
              disabled={!!uploading}
              className="hidden"
            />
          </label>
          {form.imageDisplay && (
            <div className="relative h-16 w-16">
              <Image
                src={form.imageDisplay}
                alt="Display preview"
                fill
                className="rounded object-cover"
                unoptimized={!form.imageDisplay.startsWith("/")}
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, imageDisplay: "" }))}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="h-4 w-4 rounded border-element-gray-700 bg-element-gray-900 text-element-red focus:ring-element-red"
          />
          <label htmlFor="isActive" className="text-sm text-gray-400">
            Active (visible in store)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="acceptStripe"
            checked={form.acceptStripe}
            onChange={(e) => setForm((f) => ({ ...f, acceptStripe: e.target.checked }))}
            className="h-4 w-4 rounded border-element-gray-700 bg-element-gray-900 text-element-red focus:ring-element-red"
          />
          <label htmlFor="acceptStripe" className="text-sm text-gray-400">
            Accept card payments (Stripe)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="acceptCrypto"
            checked={form.acceptCrypto}
            onChange={(e) => setForm((f) => ({ ...f, acceptCrypto: e.target.checked }))}
            className="h-4 w-4 rounded border-element-gray-700 bg-element-gray-900 text-element-red focus:ring-element-red"
          />
          <label htmlFor="acceptCrypto" className="text-sm text-gray-400">
            Accept crypto payments
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-400">Delivery type</span>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="deliveryType"
                checked={form.deliveryType === "SERIAL"}
                onChange={() => setForm((f) => ({ ...f, deliveryType: "SERIAL" }))}
                className="h-4 w-4 border-element-gray-700 bg-element-gray-900 text-element-red focus:ring-element-red"
              />
              <span className="text-sm text-white">Serial</span>
              <span className="text-xs text-gray-500">(stocked keys; auto-delivered after payment)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="deliveryType"
                checked={form.deliveryType === "SERVICE"}
                onChange={() => setForm((f) => ({ ...f, deliveryType: "SERVICE" }))}
                className="h-4 w-4 border-element-gray-700 bg-element-gray-900 text-element-red focus:ring-element-red"
              />
              <span className="text-sm text-white">Service</span>
              <span className="text-xs text-gray-500">(customer opens Discord ticket to receive)</span>
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-element-red px-6 py-2 font-semibold text-white transition hover:bg-element-red-dark disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border border-element-gray-700 px-6 py-2 font-medium text-gray-400 transition hover:bg-element-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
