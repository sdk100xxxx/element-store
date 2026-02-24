"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DownloadItem {
  id: string;
  name: string;
  slug: string;
  fileUrl: string | null;
}

interface DownloadsContentProps {
  items: DownloadItem[];
}

export function DownloadsContent({ items: initialItems }: DownloadsContentProps) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingUrl, setSavingUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const isAdmin = ["ADMIN", "PARTNER"].includes((session?.user as { role?: string })?.role ?? "");

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleUpload(itemId: string, file: File) {
    setUploading(itemId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-download", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Upload failed.");
        setUploading(null);
        return;
      }
      const patchRes = await fetch(`/api/admin/downloads/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: data.url }),
      });
      if (!patchRes.ok) {
        alert("Failed to save.");
        setUploading(null);
        return;
      }
      const updated = await patchRes.json();
      setItems((prev) => prev.map((p) => (p.id === itemId ? updated : p)));
      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setUploading(null);
    }
  }

  async function handleAdd() {
    const name = newName.trim();
    const slug = (newSlug.trim() || slugify(newName)).trim();
    if (!name || !slug) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to add.");
        return;
      }
      setItems((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewSlug("");
      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(itemId: string, itemName: string) {
    if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return;
    setDeleting(itemId);
    try {
      const res = await fetch(`/api/admin/downloads/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete.");
        return;
      }
      setItems((prev) => prev.filter((p) => p.id !== itemId));
      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setDeleting(null);
    }
  }

  async function handleSetUrl(itemId: string, url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setSavingUrl(itemId);
    try {
      const res = await fetch(`/api/admin/downloads/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: trimmed }),
      });
      if (!res.ok) {
        alert("Failed to save link.");
        return;
      }
      const updated = await res.json();
      setItems((prev) => prev.map((p) => (p.id === itemId ? updated : p)));
      setUrlInput((prev) => ({ ...prev, [itemId]: "" }));
      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setSavingUrl(null);
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Downloads</h1>
      <p className="mt-2 text-gray-400">
        {isAdmin
          ? "Upload files (APK, ZIP, etc.) or paste a download link. Add or remove items below."
          : "Download files for your products below."}
      </p>
      {isAdmin && (
        <div className="mt-6 rounded-lg border border-element-gray-800 bg-element-gray-900/50 p-4">
          <h2 className="text-sm font-medium text-gray-400">Add download item</h2>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug || newSlug === slugify(newName)) setNewSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Temp HWID"
                className="mt-1 rounded border border-element-gray-600 bg-element-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-element-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Slug</label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="temp-hwid"
                className="mt-1 w-40 rounded border border-element-gray-600 bg-element-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-element-red focus:outline-none"
              />
            </div>
            <button
              type="button"
              disabled={adding || !newName.trim()}
              onClick={handleAdd}
              className="rounded bg-element-red px-4 py-2 text-sm font-medium text-white transition hover:bg-element-red-dark disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}
      <ul className="mt-8 space-y-3">
        {items.length === 0 ? (
          <li className="rounded-lg border border-element-gray-800 bg-element-gray-900/50 p-6 text-center text-gray-500">
            {isAdmin ? "No download items yet. Add one above." : "No download items yet."}
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border border-element-gray-800 bg-element-gray-900/50 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
            >
              <span className="font-medium text-white">{item.name}</span>
              <div className="flex flex-wrap items-center gap-3">
                {item.fileUrl ? (
                  <a
                    href={item.fileUrl}
                    target={item.fileUrl.startsWith("http") ? "_blank" : undefined}
                    rel={item.fileUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                    download={!item.fileUrl.startsWith("http")}
                    className="inline-flex items-center gap-2 rounded bg-element-red px-4 py-2 text-sm font-medium text-white transition hover:bg-element-red-dark"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">No file or link</span>
                )}
                {isAdmin && (
                  <>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-element-gray-600 bg-element-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-element-gray-700">
                      {uploading === item.id ? "Uploading..." : item.fileUrl ? "Replace file" : "Upload"}
                      <input
                        type="file"
                        accept=".zip,.rar,.7z,.exe,.msi,.pdf,.txt,.apk"
                        className="hidden"
                        disabled={!!uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(item.id, f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Or paste link (e.g. GoFile)"
                        value={urlInput[item.id] ?? ""}
                        onChange={(e) => setUrlInput((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        className="min-w-[200px] rounded border border-element-gray-600 bg-element-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-element-red focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={savingUrl === item.id || !(urlInput[item.id]?.trim())}
                        onClick={() => handleSetUrl(item.id, urlInput[item.id] ?? "")}
                        className="rounded border border-element-gray-600 bg-element-gray-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-element-gray-700 disabled:opacity-50"
                      >
                        {savingUrl === item.id ? "Saving..." : "Set link"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={!!deleting}
                      className="text-sm text-red-400 hover:text-red-300 hover:underline disabled:opacity-50"
                    >
                      {deleting === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
