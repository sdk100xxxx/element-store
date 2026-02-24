"use client";

import { useState } from "react";

export function CopyAllKeysButton({ keys }: { keys: string[] }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(keys.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (keys.length === 0) return null;

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded border border-element-red/60 bg-transparent px-2 py-1 text-xs font-medium text-element-red transition hover:bg-element-red/10"
    >
      {copied ? "Copied" : "Copy all keys"}
    </button>
  );
}
