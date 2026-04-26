import { useEffect } from "react";
import { useDashboardStore } from "../store/dashboardStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= FORMATTERS ================= */
const formatCurrency = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(value || 0);
  return `₦${num.toLocaleString()}`;
};

/* Recharts passes ReactNode label + payload */
const formatDateLabel = (label: unknown) => {
  if (!label) return "";
  const date = new Date(label as string);
  if (isNaN(date.getTime())) return String(label);
  return date.toLocaleDateString();
};

/* ================= PAGE ================= */
export default function DashboardPage() {
  const { stats, chart, fetchDashboard, connectRealtime, loading } =
    useDashboardStore();

  useEffect(() => {
    fetchDashboard();
    connectRealtime();
  }, []);

  if (loading || !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Overview of your business performance
        </p>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <Card title="Users" value={stats.overview.users} />
        <Card title="Orders" value={stats.overview.orders} />
        <Card title="Revenue" value={formatCurrency(stats.overview.revenue)} />
        <Card title="Products" value={stats.overview.products} />

        <Card title="Today Orders" value={stats.today.orders} />
        <Card title="Today Revenue" value={formatCurrency(stats.today.revenue)} />
        <Card title="Pending Orders" value={stats.operations.pendingOrders} />
        <Card title="Low Stock" value={stats.operations.lowStockProducts} />

      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="mb-4 font-semibold text-gray-700">
          Revenue Trend
        </h2>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chart}>
            <XAxis
              dataKey="date"
              tickFormatter={(v) =>
                new Date(v as string).toLocaleDateString()
              }
              stroke="#9CA3AF"
            />

            <YAxis
              tickFormatter={(v) =>
                `₦${Number(v || 0) / 1000}k`
              }
              stroke="#9CA3AF"
            />

            <Tooltip
              formatter={(value: unknown) => formatCurrency(value)}
              labelFormatter={(label: unknown) => formatDateLabel(label)}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#16a34a"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================= CARD ================= */
function Card({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h2 className="text-2xl font-semibold text-gray-800">
        {value}
      </h2>
    </div>
  );
}

/* ================= SKELETON ================= */
function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">

      <div className="h-6 w-48 bg-gray-200 rounded" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>

      <div className="h-80 bg-gray-200 rounded-xl" />
    </div>
  );
}