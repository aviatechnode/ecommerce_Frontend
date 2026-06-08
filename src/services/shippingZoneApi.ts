import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

/* =========================================================
TYPES
========================================================= */

export interface State {
  id: string;
  name: string;
}

export interface LGA {
  id: string;
  name: string;
  stateId: string;
}

export interface ShippingRate {
  id: string;
  zoneId: string;
  name: string;
  deliveryMethod: string;

  baseFee: string;
  currency: string;

  minWeight?: number | null;
  maxWeight?: number | null;
  weightFee?: string | null;

  minDistanceKm?: number | null;
  maxDistanceKm?: number | null;
  distanceFeeKm?: string | null;

  minOrderValue?: string | null;
  maxOrderValue?: string | null;

  estimatedDaysMin?: number | null;
  estimatedDaysMax?: number | null;

  priority: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  isActive: boolean;

  states: State[];
  lgas: LGA[];

  rates?: ShippingRate[];

  createdAt: string;
  updatedAt: string;
}

/* =========================================================
REQUEST DTOs
========================================================= */

export interface CreateShippingZoneDto {
  name: string;
  stateIds?: string[];
  lgaIds?: string[];
}

export interface UpdateShippingZoneDto {
  name?: string;
  stateIds?: string[];
  lgaIds?: string[];
  isActive?: boolean;
}

export interface ToggleZoneStatusDto {
  isActive: boolean;
}

/* =========================================================
RESPONSE TYPES
========================================================= */

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ApiMessageResponse {
  success: boolean;
  message: string;
}

/* =========================================================
API
========================================================= */

export const shippingZoneApi = createApi({
  reducerPath: "shippingZoneApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["ShippingZone"],

  endpoints: (builder) => ({
    /* ================= GET ALL ================= */

    getShippingZones: builder.query<
      ShippingZone[],
      void
    >({
      query: () => ({
        url: "/api/shipping-zones",
        method: "GET",
      }),

      transformResponse: (
        response: ApiResponse<ShippingZone[]>
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map((zone) => ({
                type: "ShippingZone" as const,
                id: zone.id,
              })),
              {
                type: "ShippingZone",
                id: "LIST",
              },
            ]
          : [
              {
                type: "ShippingZone",
                id: "LIST",
              },
            ],
    }),

    /* ================= GET BY ID ================= */

    getShippingZoneById: builder.query<
      ShippingZone,
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/${id}`,
        method: "GET",
      }),

      transformResponse: (
        response: ApiResponse<ShippingZone>
      ) => response.data,

      providesTags: (_, __, id) => [
        {
          type: "ShippingZone",
          id,
        },
      ],
    }),

    /* ================= CREATE ================= */

    createShippingZone: builder.mutation<
      ShippingZone,
      CreateShippingZoneDto
    >({
      query: (body) => ({
        url: "/api/shipping-zones",
        method: "POST",
        data: body,
      }),

      transformResponse: (
        response: ApiResponse<ShippingZone>
      ) => response.data,

      invalidatesTags: [
        {
          type: "ShippingZone",
          id: "LIST",
        },
      ],
    }),

    /* ================= UPDATE ================= */

    updateShippingZone: builder.mutation<
      ShippingZone,
      {
        id: string;
        data: UpdateShippingZoneDto;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/shipping-zones/${id}`,
        method: "PATCH",
        data,
      }),

      transformResponse: (
        response: ApiResponse<ShippingZone>
      ) => response.data,

      invalidatesTags: (_, __, { id }) => [
        {
          type: "ShippingZone",
          id,
        },
        {
          type: "ShippingZone",
          id: "LIST",
        },
      ],
    }),

    /* ================= TOGGLE STATUS ================= */

    toggleShippingZoneStatus: builder.mutation<
      ShippingZone,
      {
        id: string;
        isActive: boolean;
      }
    >({
      query: ({
        id,
        isActive,
      }) => ({
        url: `/api/shipping-zones/${id}/status`,
        method: "PATCH",
        data: {
          isActive,
        },
      }),

      transformResponse: (
        response: ApiResponse<ShippingZone>
      ) => response.data,

      invalidatesTags: (_, __, { id }) => [
        {
          type: "ShippingZone",
          id,
        },
        {
          type: "ShippingZone",
          id: "LIST",
        },
      ],
    }),

    /* ================= DELETE ================= */

    deleteShippingZone: builder.mutation<
      ApiMessageResponse,
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/${id}`,
        method: "DELETE",
      }),

      transformResponse: (
        response: ApiMessageResponse
      ) => response,

      invalidatesTags: [
        {
          type: "ShippingZone",
          id: "LIST",
        },
      ],
    }),
  }),
});

/* =========================================================
HOOKS
========================================================= */

export const {
  useGetShippingZonesQuery,
  useGetShippingZoneByIdQuery,

  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useToggleShippingZoneStatusMutation,
  useDeleteShippingZoneMutation,
} = shippingZoneApi;