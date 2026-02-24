import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } }, licenses: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-element-gray-800">
        <table className="w-full">
          <thead className="bg-element-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Items</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-element-gray-800">
                <td className="px-4 py-3 font-mono text-sm text-gray-300">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{order.email}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {order.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ")}
                </td>
                <td className="px-4 py-3 text-element-red font-medium">
                  ${(order.total / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      order.status === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : order.status === "pending_crypto"
                        ? "bg-purple-500/20 text-purple-400"
                        : order.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : order.status === "declined"
                        ? "bg-red-500/20 text-red-400"
                        : order.status === "expired"
                        ? "bg-gray-500/20 text-gray-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
