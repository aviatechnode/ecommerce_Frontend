// import { create } from "zustand";
// import { api } from "../../api/axios";

// export type SidebarItem = {
//   label: string;
//   path: string;
//   icon?: string;
// };

// export type SidebarSection = {
//   title: string;
//   items: SidebarItem[];
// };

// type AdminState = {
//   sidebar: SidebarSection[];
//   loading: boolean;
//   fetchSidebar: () => Promise<void>;
// };

// export const useAdminStore = create<AdminState>((set) => ({
//   sidebar: [],
//   loading: false,

//   fetchSidebar: async () => {
//     try {
//       set({ loading: true });

//       // Use your api instance with CSRF handling
//       const res = await api.get("/api/admin/sidebar");

//       set({
//         sidebar: res.data,
//         loading: false,
//       });
//     } catch (error) {
//       console.error("Sidebar fetch failed:", error);
//       set({ loading: false });
//     }
//   },
// }));