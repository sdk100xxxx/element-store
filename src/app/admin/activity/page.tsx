import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const formatDate = (d: Date) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Activity log</h1>
      <p className="mt-1 text-sm text-gray-400">
        Trail of keys added, orders paid, and other important events. Use this to verify changes and recover context.
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-element-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-element-gray-900">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-400">When</th>
              <th className="px-4 py-3 font-medium text-gray-400">Action</th>
              <th className="px-4 py-3 font-medium text-gray-400">Entity</th>
              <th className="px-4 py-3 font-medium text-gray-400">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No activity yet. Adding serials and completing orders will show up here.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                let details = "";
                if (log.details) {
                  try {
                    const d = JSON.parse(log.details) as Record<string, unknown>;
                    details = Object.entries(d)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ");
                  } catch {
                    details = log.details;
                  }
                }
                const entityLink =
                  log.entityType === "order" && log.entityId && !log.entityId.startsWith("cs_")
                    ? `/admin/orders/${log.entityId}`
                    : null;
                return (
                  <tr key={log.id} className="border-t border-element-gray-800">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          log.action === "order_paid"
                            ? "bg-green-500/20 text-green-400"
                            : log.action === "serial_added"
                              ? "bg-blue-500/20 text-blue-400"
                              : log.action === "order_declined" || log.action === "order_expired"
                                ? "bg-gray-500/20 text-gray-400"
                                : "bg-element-gray-700 text-gray-300"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {entityLink ? (
                        <Link href={entityLink} className="text-element-red hover:underline">
                          {log.entityType} {log.entityId?.slice(0, 8)}…
                        </Link>
                      ) : (
                        `${log.entityType ?? "—"} ${log.entityId ?? ""}`
                      )}
                    </td>
                    <td className="max-w-md truncate px-4 py-3 text-gray-400" title={details}>
                      {details || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
