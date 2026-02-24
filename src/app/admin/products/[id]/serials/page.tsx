"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface SerialRow {
  id: string;
  serial: string;
  orderId: string | null;
  createdAt: string;
}

export default function ProductSerialsPage() {
  const params = useParams();
  const id = params.id as string;
  const [productName, setProductName] = useState("");
  const [serials, setSerials] = useState<SerialRow[]>([]);
  const [inStock, setInStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addOne, setAddOne] = useState("");
  const [bulkAdd, setBulkAdd] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch(`/api/admin/products/${id}/serials`).then((r) => r.json()),
    ])
      .then(([productRes, serialsRes]) => {
        if (productRes.name) setProductName(productRes.name);
        if (serialsRes.serials) setSerials(serialsRes.serials);
        if (typeof serialsRes.inStock === "number") setInStock(serialsRes.inStock);
      })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  async function fetchProductSerials() {
    const r = await fetch(`/api/admin/products/${id}/serials`);
    const data = await r.json();
    if (data.serials) setSerials(data.serials);
    if (typeof data.inStock === "number") setInStock(data.inStock);
  }

  async function handleAddOne(e: React.FormEvent) {
    e.preventDefault();
    const serial = addOne.trim();
    if (!serial) return;
    setError("");
    setAdding(true);
    try {
      const res = await fetch(`/api/admin/products/${id}/serials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add.");
        return;
      }
      setAddOne("");
      await fetchProductSerials();
    } catch {
      setError("Failed to add.");
    } finally {
      setAdding(false);
    }
  }

  async function handleBulkAdd(e: React.FormEvent) {
    e.preventDefault();
    const lines = bulkAdd
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setError("");
    setAdding(true);
    try {
      const res = await fetch(`/api/admin/products/${id}/serials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serials: lines }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add.");
        return;
      }
      setBulkAdd("");
      await fetchProductSerials();
    } catch {
      setError("Failed to add.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(serialId: string) {
    if (!confirm("Remove this serial from stock? This cannot be undone.")) return;
    setError("");
    setRemovingId(serialId);
    try {
      const res = await fetch(`/api/admin/products/${id}/serials`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serialId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to remove.");
        return;
      }
      await fetchProductSerials();
    } catch {
      setError("Failed to remove.");
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/products/${id}/edit`}
          className="text-gray-400 transition hover:text-white"
        >
          ← Edit product
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-white">
        Stock (serials) — {productName || "Product"}
      </h1>
      <p className="text-gray-400">
        In stock: <span className="font-semibold text-white">{inStock}</span> serials
      </p>

      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <form onSubmit={handleAddOne} className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
          <h2 className="font-semibold text-white">Add one serial</h2>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={addOne}
              onChange={(e) => setAddOne(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              className="flex-1 rounded border border-element-gray-700 bg-element-black px-3 py-2 text-white placeholder-gray-500 focus:border-element-red focus:outline-none"
            />
            <button
              type="submit"
              disabled={adding || !addOne.trim()}
              className="rounded bg-element-red px-4 py-2 font-medium text-white transition hover:bg-element-red-dark disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>

        <form onSubmit={handleBulkAdd} className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
          <h2 className="font-semibold text-white">Bulk add (one per line or comma-separated)</h2>
          <textarea
            value={bulkAdd}
            onChange={(e) => setBulkAdd(e.target.value)}
            placeholder="Key 1&#10;Key 2&#10;Key 3"
            rows={3}
            className="mt-2 w-full rounded border border-element-gray-700 bg-element-black px-3 py-2 text-white placeholder-gray-500 focus:border-element-red focus:outline-none"
          />
          <button
            type="submit"
            disabled={adding || !bulkAdd.trim()}
            className="mt-2 rounded bg-element-red px-4 py-2 font-medium text-white transition hover:bg-element-red-dark disabled:opacity-50"
          >
            Add all
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
        <h2 className="font-semibold text-white">All serials ({serials.length})</h2>
        <p className="mt-1 text-xs text-gray-500">In stock = not yet sold. Assigned = delivered to an order.</p>
        <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto font-mono text-sm">
          {serials.length === 0 ? (
            <li className="text-gray-500">No serials yet. Add some above.</li>
          ) : (
            serials.map((s) => (
              <li
                key={s.id}
                className={`flex items-center justify-between gap-2 rounded px-2 py-1.5 ${s.orderId ? "text-gray-500" : "text-element-red"}`}
              >
                <span className="min-w-0 truncate font-mono">{s.serial}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {s.orderId ? "Assigned" : "In stock"}
                  </span>
                  {!s.orderId && (
                    <button
                      type="button"
                      onClick={() => handleRemove(s.id)}
                      disabled={removingId === s.id}
                      className="rounded px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                    >
                      {removingId === s.id ? "Removing…" : "Remove"}
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
