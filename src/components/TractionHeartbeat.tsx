"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 45 * 1000; // 45 seconds

export function TractionHeartbeat() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/traction/heartbeat", { method: "POST", credentials: "include" }).catch(() => {});
    };
    ping(); // once on mount
    const id = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  return null;
}
