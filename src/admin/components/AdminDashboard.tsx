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
const formatCurrency = (value: unknown): string => {
  const num = typeof value === "number" ? value : Number(value || 0);
  return `₦${num.toLocaleString()}`;
};

const formatDateLabel = (label: unknown): string => {
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
  }, [fetchDashboard, connectRealtime]);

  if (loading || !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              📊 Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your business performance
            </p>
          </div>
          <div className="text-sm text-gray-400">
            Real-time updates active
          </div>
        </div>

        {/* STATS CARDS GRID */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Users" value={stats.overview.users} icon="👥" />
          <Card title="Orders" value={stats.overview.orders} icon="🛒" />
          <Card
            title="Revenue"
            value={formatCurrency(stats.overview.revenue)}
            icon="💰"
          />
          <Card title="Products" value={stats.overview.products} icon="📦" />
          <Card
            title="Today Orders"
            value={stats.today.orders}
            icon="📅"
            trend="+12%"
          />
          <Card
            title="Today Revenue"
            value={formatCurrency(stats.today.revenue)}
            icon="💵"
          />
          <Card
            title="Pending Orders"
            value={stats.operations.pendingOrders}
            icon="⏳"
          />
          <Card
            title="Low Stock"
            value={stats.operations.lowStockProducts}
            icon="⚠️"
          />
        </div>

        {/* CHART SECTION */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              📈 Revenue Trend
            </h2>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              Last 7 days
            </span>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chart}>
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v as string).toLocaleDateString()}
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v) => `₦${Number(v || 0) / 1000}k`}
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: unknown) => formatCurrency(value)}
                labelFormatter={(label: unknown) => formatDateLabel(label)}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= CARD COMPONENT ================= */
interface CardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: string;
}

function Card({ title, value, icon, trend }: CardProps) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-gray-800">{value}</h3>
          {trend && (
            <p className="mt-2 text-xs font-medium text-green-600">{trend}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-gray-50 p-2 text-xl transition-colors group-hover:bg-green-50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= SKELETON LOADER ================= */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header skeleton */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-gray-100" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="mt-3 h-6 w-24 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-80 w-full animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}