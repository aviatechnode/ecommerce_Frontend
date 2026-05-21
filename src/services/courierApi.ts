import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

import type {
  Courier,
  CreateCourierInput,
  UpdateCourierInput,
} from "../types/courier.types";

export const courierApi = createApi({
  reducerPath: "courierApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Courier"],

  endpoints: (builder) => ({
    /* =========================================================
       CREATE COURIER
    ========================================================= */
    createCourier: builder.mutation<
      Courier,
      CreateCourierInput
    >({
      query: (data) => ({
        url: "/api/couriers",
        method: "POST",
        data,
      }),

      invalidatesTags: ["Courier"],
    }),

    /* =========================================================
       GET ALL COURIERS
    ========================================================= */
    getAllCouriers: builder.query<
      Courier[],
      void
    >({
      query: () => ({
        url: "/api/couriers",
        method: "GET",
      }),

      providesTags: ["Courier"],
    }),

    /* =========================================================
       GET COURIER BY ID
    ========================================================= */
    getCourierById: builder.query<
      Courier,
      string
    >({
      query: (id) => ({
        url: `/api/couriers/${id}`,
        method: "GET",
      }),

      providesTags: (_result, _error, id) => [
        { type: "Courier", id },
      ],
    }),

    /* =========================================================
       UPDATE COURIER
    ========================================================= */
    updateCourier: builder.mutation<
      Courier,
      {
        id: string;
        data: UpdateCourierInput;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/couriers/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: (_result, _error, { id }) => [
        { type: "Courier", id },
        "Courier",
      ],
    }),

    /* =========================================================
       TOGGLE COURIER STATUS
    ========================================================= */
    toggleCourierStatus: builder.mutation<
      Courier,
      string
    >({
      query: (id) => ({
        url: `/api/couriers/${id}/toggle`,
        method: "PATCH",
      }),

      invalidatesTags: (_result, _error, id) => [
        { type: "Courier", id },
        "Courier",
      ],
    }),

    /* =========================================================
       DELETE COURIER
    ========================================================= */
    deleteCourier: builder.mutation<
      {
        message: string;
      },
      string
    >({
      query: (id) => ({
        url: `/api/couriers/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Courier"],
    }),
  }),
});

export const {
  useCreateCourierMutation,
  useGetAllCouriersQuery,
  useGetCourierByIdQuery,
  useUpdateCourierMutation,
  useToggleCourierStatusMutation,
  useDeleteCourierMutation,
} = courierApi;