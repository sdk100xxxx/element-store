"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function ChangeAccountForm() {
  const { data: session, update: updateSession } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!currentPassword.trim()) {
      setMessage({ type: "err", text: "Current password is required." });
      return;
    }
    if (!newEmail.trim() && !newPassword.trim()) {
      setMessage({ type: "err", text: "Enter a new email and/or new password." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Failed to update." });
        setLoading(false);
        return;
      }
      setMessage({ type: "ok", text: "Account updated. If you changed your email, sign in again with the new email." });
      setCurrentPassword("");
      setNewEmail("");
      setNewPassword("");
      if (newEmail.trim() && typeof updateSession === "function") await updateSession();
    } catch {
      setMessage({ type: "err", text: "Something went wrong." });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full max-w-md rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-element-red focus:outline-none focus:ring-1 focus:ring-element-red"
          placeholder="Required to confirm changes"
          autoComplete="current-password"
        />
      </div>
      <div>
        <label htmlFor="newEmail" className="block text-sm font-medium text-gray-400">
          New email
        </label>
        <input
          id="newEmail"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="mt-1 w-full max-w-md rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-element-red focus:outline-none focus:ring-1 focus:ring-element-red"
          placeholder="Enter new email"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full max-w-md rounded border border-element-gray-700 bg-element-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-element-red focus:outline-none focus:ring-1 focus:ring-element-red"
          placeholder="Leave blank to keep current"
          autoComplete="new-password"
          minLength={8}
        />
        <p className="mt-1 text-xs text-gray-500">Min 8 characters. Leave blank to keep current password.</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-element-red px-4 py-2 text-sm font-medium text-white transition hover:bg-element-red-dark disabled:opacity-50"
      >
        {loading ? "Updating…" : "Update email / password"}
      </button>
    </form>
  );
}
