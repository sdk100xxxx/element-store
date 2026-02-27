"use client";

import { useEffect, useState } from "react";

export default function AdminTractionPage() {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchTraction() {
    try {
      const res = await fetch("/api/admin/traction");
      if (!res.ok) {
        setError("Failed to load");
        return;
      }
      const data = await res.json();
      setOnlineCount(data.onlineCount ?? 0);
      setTotalVisitors(data.totalVisitors ?? 0);
      setError(null);
    } catch {
      setError("Failed to load");
    }
  }

  useEffect(() => {
    fetchTraction();
    const id = setInterval(fetchTraction, 30 * 1000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Traction</h1>
        <p className="mt-1 text-sm text-gray-400">
          Visitors on the site right now and total unique visitors. Updates every 30s.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-6">
          <p className="text-sm font-medium text-gray-400">Online now</p>
          <p className="mt-2 text-3xl font-bold text-green-400">
            {onlineCount === null ? "—" : onlineCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">Active in the last 2 minutes</p>
        </div>
        <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-6">
          <p className="text-sm font-medium text-gray-400">Total visitors</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {totalVisitors === null ? "—" : totalVisitors.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">Unique visitors ever</p>
        </div>
      </div>
    </div>
  );
}
