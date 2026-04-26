import { create } from "zustand";
import { api } from "../../api/axios";

/* ================= TYPES ================= */
type Stats = {
  overview: {
    users: number;
    orders: number;
    products: number;
    revenue: number;
  };
  today: {
    users: number;
    orders: number;
    revenue: number;
  };
  operations: {
    pendingOrders: number;
    lowStockProducts: number;
    activeCarts: number;
  };
  engagement: {
    unreadMessages: number;
    unreadNotifications: number;
  };
};

type ChartPoint = {
  date: string;
  revenue: number;
  orders: number;
  users: number;
};

type State = {
  stats: Stats | null;
  chart: ChartPoint[];
  loading: boolean;
  socket?: WebSocket;

  fetchDashboard: () => Promise<void>;
  connectRealtime: () => void;
};

/* ================= STORE ================= */
export const useDashboardStore = create<State>((set, get) => ({
  stats: null,
  chart: [],
  loading: false,
  socket: undefined,

  /* ================= FETCH ================= */
  fetchDashboard: async () => {
    set({ loading: true });

    try {
      const [statsRes, chartRes] = await Promise.all([
        api.get("/api/admin/dashboard"),
        api.get("/api/admin/dashboard/chart"),
      ]);

      set({
        stats: statsRes.data.data,
        chart: chartRes.data.data,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      set({ loading: false });
    }
  },

  /* ================= REALTIME ================= */
  connectRealtime: () => {
    // prevent duplicate sockets
    const existing = get().socket;
    if (existing && existing.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket("ws://localhost:8080");

    set({ socket });

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "DASHBOARD_UPDATE") {
          set({
            stats: data.payload.stats,
            chart: data.payload.chart,
          });
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected, retrying...");

      setTimeout(() => {
        get().connectRealtime();
      }, 3000);
    };
  },
}));