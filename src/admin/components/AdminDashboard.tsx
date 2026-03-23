import { useEffect, useState } from "react";
import { api } from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => {
      setStats(res.data);
    });
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-6">
      <Card title="Users" value={stats.users} />
      <Card title="Orders" value={stats.orders} />
      <Card title="Revenue" value={`₦${stats.revenue}`} />
      <Card title="Products" value={stats.products} />
      <Card
        title="Pending Orders"
        value={stats.pendingOrders}
      />
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-gray-500">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}