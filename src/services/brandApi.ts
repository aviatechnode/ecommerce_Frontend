import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

/* =========================================================
TYPES
========================================================= */

export interface Brand {
  id: string;
  name: string;
  slug: string;

  logoUrl?: string | null;
  description?: string | null;

  isFeatured: boolean;

  _count?: {
    products: number;
  };
}

export interface BrandPayload {
  name: string;
}

/* =========================================================
API
========================================================= */

export const brandApi = createApi({
  reducerPath: "brandApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Brand"],

  endpoints: (builder) => ({
    /* ================= GET ================= */

    getBrands: builder.query<Brand[], void>({
      query: () => ({
        url: "/api/brands",
        method: "GET",
      }),

      providesTags: ["Brand"],
    }),

    /* ================= CREATE ================= */

    createBrand: builder.mutation<
      Brand,
      BrandPayload
    >({
      query: (data) => ({
        url: "/api/brands",
        method: "POST",
        data,
      }),

      invalidatesTags: ["Brand"],
    }),

    /* ================= UPDATE ================= */

    updateBrand: builder.mutation<
      Brand,
      {
        id: string;
        data: BrandPayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/brands/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: ["Brand"],
    }),

    /* ================= DELETE ================= */

    deleteBrand: builder.mutation<
      void,
      string
    >({
      query: (id) => ({
        url: `/api/brands/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;