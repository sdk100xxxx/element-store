import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RevenueOrdersChart } from "./RevenueOrdersChart";

export const dynamic = "force-dynamic";

function getTodayUTC() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
}

type RangeKey = "1d" | "7d" | "30d" | "90d" | "all";

function getDateBucketsForRange(range: RangeKey): { date: string; start: Date; end: Date }[] {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const days: { date: string; start: Date; end: Date }[] = [];
  let numDays = 7;
  if (range === "1d") numDays = 1;
  else if (range === "30d") numDays = 30;
  else if (range === "90d") numDays = 90;
  else if (range === "7d") numDays = 7;
  else numDays = 0; // all: will be filled after we know first order

  if (numDays > 0) {
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setUTCDate(d.getUTCDate() - i);
      const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      days.push({ date: start.toISOString().slice(0, 10), start, end });
    }
  }
  return days;
}

interface Props {
  searchParams?: Promise<{ range?: string }> | { range?: string };
}

export default async function AdminDashboard(props: Props) {
  const raw = props.searchParams;
  const searchParams = raw && typeof (raw as Promise<unknown>).then === "function" ? await (raw as Promise<{ range?: string }>) : (raw as { range?: string });
  const rangeParam = searchParams?.range;
  const range: RangeKey =
    rangeParam === "1d" || rangeParam === "7d" || rangeParam === "30d" || rangeParam === "90d" || rangeParam === "all"
      ? rangeParam
      : "30d";

  const { start: startOfToday, end: endOfToday } = getTodayUTC();
  let dateBuckets = getDateBucketsForRange(range);

  const [
    newOrdersToday,
    newCustomersToday,
    orderCount,
    licenseCount,
    recentOrdersToday,
    recentLicenses,
    revenueTodayResult,
    paidOrdersToday,
    ordersForChart,
    firstOrderDate,
  ] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: startOfToday, lte: endOfToday } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfToday, lte: endOfToday } },
    }),
    prisma.order.count(),
    prisma.licenseKey.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: startOfToday, lte: endOfToday } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { items: { include: { product: true } } },
    }),
    prisma.licenseKey.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { order: { include: { items: { include: { product: true } } } } },
    }),
    prisma.order.aggregate({
      where: {
        status: "paid",
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        status: "paid",
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
    }),
    range === "all"
      ? prisma.order.findMany({
          select: { createdAt: true, status: true, total: true },
        })
      : prisma.order.findMany({
          where: {
            createdAt: {
              gte: dateBuckets[0]?.start ?? new Date(0),
              lte: dateBuckets[dateBuckets.length - 1]?.end ?? new Date(),
            },
          },
          select: { createdAt: true, status: true, total: true },
        }),
    range === "all"
      ? prisma.order.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } })
      : Promise.resolve(null),
  ]);

  const todayRevenue = revenueTodayResult._sum.total || 0;

  // For "all", build buckets from first order to today
  if (range === "all" && firstOrderDate?.createdAt) {
    const first = new Date(firstOrderDate.createdAt);
    const firstStart = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate()));
    const todayStart = new Date(Date.UTC(startOfToday.getUTCFullYear(), startOfToday.getUTCMonth(), startOfToday.getUTCDate()));
    dateBuckets = [];
    for (let t = firstStart.getTime(); t <= todayStart.getTime(); t += 24 * 60 * 60 * 1000) {
      const start = new Date(t);
      const end = new Date(t + 24 * 60 * 60 * 1000 - 1);
      dateBuckets.push({ date: start.toISOString().slice(0, 10), start, end });
    }
    // Limit to last 365 days if too many points
    if (dateBuckets.length > 365) {
      dateBuckets = dateBuckets.slice(-365);
    }
  }

  const chartData = dateBuckets.map(({ date, start, end }) => {
    const dayOrders = ordersForChart.filter((o) => o.createdAt >= start && o.createdAt <= end);
    const revenue = dayOrders.filter((o) => o.status === "paid").reduce((sum, o) => sum + o.total, 0);
    return {
      date,
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: dateBuckets.length > 31 ? "2-digit" : undefined }),
      revenue,
      revenueDollars: Math.round((revenue / 100) * 100) / 100,
      orderCount: dayOrders.length,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">Overview of your store</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          href="/admin/orders"
          className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4 transition hover:border-element-red/50"
        >
          <p className="text-sm text-gray-400">New orders</p>
          <p className="text-2xl font-bold text-white">{newOrdersToday}</p>
          <p className="mt-2 text-sm text-element-red hover:underline">View all →</p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4 transition hover:border-element-red/50"
        >
          <p className="text-sm text-gray-400">New customers</p>
          <p className="text-2xl font-bold text-white">{newCustomersToday}</p>
          <p className="mt-2 text-sm text-element-red hover:underline">View orders →</p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4 transition hover:border-element-red/50"
        >
          <p className="text-sm text-gray-400">Orders</p>
          <p className="text-2xl font-bold text-white">{orderCount}</p>
          <p className="mt-2 text-sm text-element-red hover:underline">View all →</p>
        </Link>
        <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
          <p className="text-sm text-gray-400">Licenses</p>
          <p className="text-2xl font-bold text-white">{licenseCount}</p>
        </div>
        <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
          <p className="text-sm text-gray-400">Revenue</p>
          <p className="text-2xl font-bold text-element-red">
            ${(todayRevenue / 100).toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-500">{paidOrdersToday} paid orders today</p>
        </div>
      </div>

      {/* Revenue & orders line chart with date range */}
      <div className="rounded-lg border border-element-gray-800 bg-element-gray-900 p-4">
        <RevenueOrdersChart data={chartData} currentRange={range} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Today&apos;s orders</h2>
          <p className="text-sm text-gray-500">Click a row to see full order details</p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-element-gray-800">
            <table className="w-full text-left">
              <thead className="bg-element-gray-900">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400">Email</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400">Items</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400">Total</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrdersToday.length === 0 ? (
                  <tr className="border-t border-element-gray-800">
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                      No orders today yet
                    </td>
                  </tr>
                ) : (
                  recentOrdersToday.map((order) => (
                    <tr key={order.id} className="border-t border-element-gray-800">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="block text-sm text-gray-300 hover:text-element-red hover:underline"
                        >
                          {order.email}
                        </Link>
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-sm text-gray-400" title={order.items.map((i) => `${i.product.name} × ${i.quantity}`).join(", ")}>
                        {order.items.map((i) => `${i.product.name} × ${i.quantity}`).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
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
                      <td className="px-4 py-3 text-sm text-white">
                        ${(order.total / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {" · "}
                        <Link href={`/admin/orders/${order.id}`} className="text-element-red hover:underline">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Link
            href="/admin/orders"
            className="mt-2 block text-sm text-element-red hover:underline"
          >
            View all orders →
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">Recent Licenses</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-element-gray-800">
            <table className="w-full text-left">
              <thead className="bg-element-gray-900">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400">Key</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentLicenses.map((license) => (
                  <tr key={license.id} className="border-t border-element-gray-800">
                    <td className="px-4 py-3 font-mono text-sm text-gray-300">
                      {license.key.slice(0, 20)}...
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          license.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {license.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(license.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/groups/new"
          className="rounded bg-element-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-element-gray-700"
        >
          + Add Group
        </Link>
        <Link
          href="/admin/products/new"
          className="rounded bg-element-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-element-red-dark"
        >
          + Add Product
        </Link>
      </div>
    </div>
  );
}
