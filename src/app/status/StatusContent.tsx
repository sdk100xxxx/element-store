"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "UNDETECTED", label: "Undetected", color: "bg-green-500/20 text-green-400 border-green-500/50", glow: "shadow-[0_0_12px_rgba(34,197,94,0.4)]" },
  { value: "DETECTED", label: "Detected", color: "bg-red-500/20 text-red-400 border-red-500/50", glow: "shadow-[0_0_12px_rgba(239,68,68,0.4)]" },
  { value: "FROZEN", label: "Frozen", color: "bg-blue-500/20 text-blue-400 border-blue-500/50", glow: "shadow-[0_0_12px_rgba(59,130,246,0.4)]" },
  { value: "TESTING", label: "Testing", color: "bg-purple-500/20 text-purple-400 border-purple-500/50", glow: "shadow-[0_0_12px_rgba(168,85,247,0.4)]" },
] as const;

type Status = (typeof STATUS_OPTIONS)[number]["value"];

interface StatusItem {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface StatusContentProps {
  items: StatusItem[];
}

export function StatusContent({ items: initialItems }: StatusContentProps) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [updating, setUpdating] = useState<string | null>(null);
  const isAdmin = ["ADMIN", "PARTNER"].includes((session?.user as { role?: string })?.role ?? "");

  async function handleStatusChange(itemId: string, status: Status) {
    setUpdating(itemId);
    try {
      const res = await fetch(`/api/admin/status/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update");
        return;
      }
      const updated = await res.json();
      setItems((prev) => prev.map((p) => (p.id === itemId ? updated : p)));
      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setUpdating(null);
    }
  }

  const getStatusStyle = (status: string) => {
    const opt = STATUS_OPTIONS.find((o) => o.value === status);
    return opt ? `${opt.color} ${opt.glow}` : "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
  };

  if (sessionStatus === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Status</h1>
      <p className="mt-2 text-gray-400">
        Detection status per game. {isAdmin && "You can change status from the dropdown."}
      </p>
      <ul className="mt-8 space-y-3">
        {items.length === 0 ? (
          <li className="rounded-lg border border-element-gray-800 bg-element-gray-900/50 p-6 text-center text-gray-500">
            No status items yet. Run the seed.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-element-gray-800 bg-element-gray-900/50 px-4 py-3"
            >
              <span className="font-medium text-white">{item.name}</span>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <select
                    value={item.status}
                    disabled={!!updating}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value as Status)
                    }
                    className={`rounded border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-element-red ${getStatusStyle(item.status)} border`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {updating === item.id && (
                    <span className="text-xs text-gray-500">Saving...</span>
                  )}
                </div>
              ) : (
                <span
                  className={`rounded border px-3 py-1 text-sm font-medium ${getStatusStyle(item.status)}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
