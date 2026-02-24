"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", slug: "", image: "" });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Upload failed (${res.status}).`);
        return;
      }
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || slugify(form.name),
          image: form.image || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create.");
        setLoading(false);
        return;
      }
      router.push("/admin/groups");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Add Group</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        {error && (
          <div className="rounded bg-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-400">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                name: e.target.value,
                slug: slugify(e.target.value),
              }))
            }
            required
            placeholder="e.g. Lua Scripts"
            className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-white focus:border-element-red focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            placeholder="lua-scripts"
            className="mt-1 w-full rounded border border-element-gray-700 bg-element-gray-900 px-4 py-2 text-white focus:border-element-red focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Group image (optional)</label>
          {form.image ? (
            <div className="mt-2 flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded border border-element-gray-700 bg-element-black">
                <Image
                  src={form.image}
                  alt="Group"
                  fill
                  className="object-cover"
                  unoptimized={!form.image.startsWith("/")}
                />
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer rounded border border-element-gray-600 bg-element-gray-800 px-4 py-2 text-sm text-white hover:bg-element-gray-700">
                  {uploading ? "Uploading..." : "Change"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!!uploading}
                    onChange={handleFileChange}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image: "" }))}
                  className="rounded border border-element-gray-600 px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="mt-2 inline-block cursor-pointer rounded border border-element-gray-600 bg-element-gray-800 px-4 py-2 text-sm text-white hover:bg-element-gray-700">
              {uploading ? "Uploading..." : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!!uploading}
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-element-red px-6 py-2 font-semibold text-white transition hover:bg-element-red-dark disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
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
    </div>
  );
}
