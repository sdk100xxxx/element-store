"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteGroupButtonProps {
  groupId: string;
  groupName: string;
  productCount: number;
}

export function DeleteGroupButton({ groupId, groupName, productCount }: DeleteGroupButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const message =
      productCount > 0
        ? `Delete group "${groupName}"? It has ${productCount} product(s); they will be unassigned from this group. This cannot be undone.`
        : `Delete group "${groupName}"? This cannot be undone.`;
    if (!confirm(message)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete.");
        return;
      }
      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="ml-4 text-sm text-red-400 hover:text-red-300 hover:underline disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
