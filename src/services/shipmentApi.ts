import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

import type {
  CreateShipmentInput,
  DeleteShipmentResponse,
  GetShipmentsResponse,
  ShipmentResponse,
  ShipmentStatus,
  UpdateShipmentInput,
  UpdateShipmentStatusInput,
} from "../types/shipment.types";


/* =========================================================
QUERY PARAMS
========================================================= */

export interface GetShipmentsQuery {
  page?: number;

  limit?: number;

  status?: ShipmentStatus;

  courierId?: string;

  search?: string;
}

/* =========================================================
API
========================================================= */

export const shipmentApi = createApi({
  reducerPath: "shipmentApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Shipment"],

  endpoints: (builder) => ({
    /* =========================================================
    CREATE SHIPMENT
    ========================================================= */
    createShipment: builder.mutation<
      ShipmentResponse,
      CreateShipmentInput
    >({
      query: (data) => ({
        url: "/shipments",

        method: "POST",

        data,
      }),

      invalidatesTags: ["Shipment"],
    }),

    /* =========================================================
    GET ALL SHIPMENTS
    ========================================================= */
    getShipments: builder.query<
      GetShipmentsResponse,
      GetShipmentsQuery | void
    >({
      query: (params) => ({
        url: "/shipments",

        method: "GET",

        params,
      }),

      providesTags: ["Shipment"],
    }),

    /* =========================================================
    GET SHIPMENT BY ID
    ========================================================= */
    getShipmentById: builder.query<
      ShipmentResponse,
      string
    >({
      query: (id) => ({
        url: `/shipments/${id}`,

        method: "GET",
      }),

      providesTags: (_result, _error, id) => [
        { type: "Shipment", id },
      ],
    }),

    /* =========================================================
    UPDATE SHIPMENT
    ========================================================= */
    updateShipment: builder.mutation<
      ShipmentResponse,
      {
        id: string;

        data: UpdateShipmentInput;
      }
    >({
      query: ({ id, data }) => ({
        url: `/shipments/${id}`,

        method: "PATCH",

        data,
      }),

      invalidatesTags: (_result, _error, arg) => [
        { type: "Shipment", id: arg.id },
        "Shipment",
      ],
    }),

    /* =========================================================
    UPDATE SHIPMENT STATUS
    ========================================================= */
    updateShipmentStatus: builder.mutation<
      ShipmentResponse,
      {
        id: string;

        data: UpdateShipmentStatusInput;
      }
    >({
      query: ({ id, data }) => ({
        url: `/shipments/${id}/status`,

        method: "PATCH",

        data,
      }),

      invalidatesTags: (_result, _error, arg) => [
        { type: "Shipment", id: arg.id },
        "Shipment",
      ],
    }),

    /* =========================================================
    DELETE SHIPMENT
    ========================================================= */
    deleteShipment: builder.mutation<
      DeleteShipmentResponse,
      string
    >({
      query: (id) => ({
        url: `/shipments/${id}`,

        method: "DELETE",
      }),

      invalidatesTags: ["Shipment"],
    }),

    /* =========================================================
    TRACK SHIPMENT
    ========================================================= */
    trackShipment: builder.query<
      ShipmentResponse,
      string
    >({
      query: (trackingNumber) => ({
        url: `/shipments/track/${trackingNumber}`,

        method: "GET",
      }),

      providesTags: ["Shipment"],
    }),
  }),
});

/* =========================================================
EXPORT HOOKS
========================================================= */

export const {
  useCreateShipmentMutation,
  useGetShipmentsQuery,
  useGetShipmentByIdQuery,
  useUpdateShipmentMutation,
  useUpdateShipmentStatusMutation,
  useDeleteShipmentMutation,
  useTrackShipmentQuery,
} = shipmentApi;