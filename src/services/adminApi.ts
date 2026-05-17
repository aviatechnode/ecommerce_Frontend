import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCsrfToken } from "../lib/csrf";

export type SidebarItem = {
  label: string;
  path: string;
  icon?: string;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const csrf = getCsrfToken();
    if (csrf) headers.set("x-csrf-token", csrf);
    return headers;
  },
});

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery,
  tagTypes: ["Sidebar", "Header"],

  endpoints: (builder) => ({
    /* ================= SIDEBAR ================= */
    getSidebar: builder.query<SidebarSection[], void>({
      query: () => "/api/admin/sidebar",
      providesTags: ["Sidebar"],
    }),

    /* ================= HEADER ================= */
    getHeaderData: builder.query<
      {
        unreadNotifications: number;
        unreadMessages: number;
        notifications: any[];
      },
      void
    >({
      query: () => "/api/admin/header",
      providesTags: ["Header"],
    }),
  }),
});

export const {
  useGetSidebarQuery,
  useGetHeaderDataQuery,
} = adminApi;