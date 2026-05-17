import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

export interface Warehouse {
  id: string;
  name: string;
  stateId: string;
  city: string;

  state?: {
    id: string;
    name: string;
  };
}

export interface WarehousePayload {
  name: string;
  stateId: string;
  city: string;
}

export const warehouseApi = createApi({
  reducerPath: "warehouseApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Warehouse"],

  endpoints: (builder) => ({
    /* ================= GET ================= */

    getWarehouses: builder.query<
      Warehouse[],
      void
    >({
      query: () => ({
        url: "/api/warehouses",
        method: "GET",
      }),

      providesTags: ["Warehouse"],
    }),

    /* ================= CREATE ================= */

    createWarehouse: builder.mutation<
      Warehouse,
      WarehousePayload
    >({
      query: (data) => ({
        url: "/api/warehouses",
        method: "POST",
        data,
      }),

      invalidatesTags: ["Warehouse"],
    }),

    /* ================= UPDATE ================= */

    updateWarehouse: builder.mutation<
      Warehouse,
      {
        id: string;
        data: WarehousePayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/warehouses/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: ["Warehouse"],
    }),

    /* ================= DELETE ================= */

    deleteWarehouse: builder.mutation<
      void,
      string
    >({
      query: (id) => ({
        url: `/api/warehouses/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Warehouse"],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;