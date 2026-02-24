"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type ChartDataPoint = {
  date: string;
  label: string;
  revenue: number;
  revenueDollars: number;
  orderCount: number;
};

const rangeLabels: Record<string, string> = {
  "1d": "Day",
  "7d": "Week",
  "30d": "Month",
  "90d": "90 days",
  all: "Lifetime",
};

export function RevenueOrdersChart({
  data,
  currentRange,
}: {
  data: ChartDataPoint[];
  currentRange: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">Revenue &amp; Orders</h2>
        <div className="flex flex-wrap gap-1">
          {(["1d", "7d", "30d", "90d", "all"] as const).map((r) => (
            <a
              key={r}
              href={r === "30d" ? "/admin" : `/admin?range=${r}`}
              aria-current={currentRange === r ? "true" : undefined}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                currentRange === r
                  ? "bg-element-red text-white"
                  : "bg-element-gray-800 text-gray-400 hover:bg-element-gray-700 hover:text-white"
              }`}
            >
              {rangeLabels[r]}
            </a>
          ))}
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={{ stroke: "#4b5563" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={{ stroke: "#4b5563" }}
              allowDecimals={false}
              label={{ value: "Orders", angle: -90, position: "insideLeft", fill: "#ef4444", fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
              tickLine={{ stroke: "#4b5563" }}
              label={{ value: "Revenue", angle: 90, position: "insideRight", fill: "#3b82f6", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#d1d5db" }}
              formatter={(value: number, name: string) => [
                name === "Revenue" ? `$${Number(value).toFixed(2)}` : value,
                name,
              ]}
              labelFormatter={(label) => label}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenueDollars"
              name="Revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 3 }}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="orderCount"
              name="Orders"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 3 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500">
        Revenue (blue, right axis) and order count (red, left axis). Day = today; Week = 7 days; Month = 30 days; Lifetime = all time.
      </p>
    </div>
  );
}
