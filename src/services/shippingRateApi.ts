import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

export const DeliveryMethod = {
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
  SAME_DAY: "SAME_DAY",
  PICKUP: "PICKUP",
} as const;

export type DeliveryMethod =(typeof DeliveryMethod)[keyof typeof DeliveryMethod];

/* =========================================================
TYPES
========================================================= */

export interface ShippingRate {
  id: string;
  zoneId: string;

  name: string;
  deliveryMethod: DeliveryMethod;

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

export interface ShippingFeeResult {
  fee: number;
  currency: string;
  rate: ShippingRate;
}

export interface CreateShippingRateDto {
  zoneId: string;

  name: string;
  deliveryMethod: DeliveryMethod;

  baseFee: number;
  currency?: string;

  minWeight?: number;
  maxWeight?: number;
  weightFee?: number;

  minDistanceKm?: number;
  maxDistanceKm?: number;
  distanceFeeKm?: number;

  minOrderValue?: number;
  maxOrderValue?: number;

  estimatedDaysMin?: number;
  estimatedDaysMax?: number;

  priority?: number;
}

export interface CalculateShippingRateDto {
  zoneId: string;

  deliveryMethod?: DeliveryMethod;

  weight?: number;
  distanceKm?: number;
  orderValue?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/* =========================================================
API
========================================================= */

export const shippingRateApi = createApi({
  reducerPath: "shippingRateApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["ShippingRate"],

  endpoints: (builder) => ({
    /* ============================
       GET ZONE RATES
    ============================ */
    getZoneRates: builder.query<
      ShippingRate[],
      string
    >({
      query: (zoneId) => ({
        url: `/api/shipping/zones/${zoneId}/rates`,
        method: "GET",
      }),

      transformResponse: (
        response: ApiResponse<ShippingRate[]>
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map((rate) => ({
                type: "ShippingRate" as const,
                id: rate.id,
              })),
              {
                type: "ShippingRate",
                id: "LIST",
              },
            ]
          : [
              {
                type: "ShippingRate",
                id: "LIST",
              },
            ],
    }),

    /* ============================
       CALCULATE BEST RATE
    ============================ */
    calculateShippingRate: builder.mutation<
      ShippingFeeResult,
      CalculateShippingRateDto
    >({
      query: (body) => ({
        url: "/api/shipping/rates/calculate",
        method: "POST",
        data: body,
      }),

      transformResponse: (
        response: ApiResponse<ShippingFeeResult>
      ) => response.data,
    }),

    /* ============================
       CREATE RATE
    ============================ */
    createShippingRate: builder.mutation<
      ShippingRate,
      CreateShippingRateDto
    >({
      query: (body) => ({
        url: "/api/shipping/rates",
        method: "POST",
        data: body,
      }),

      transformResponse: (
        response: ApiResponse<ShippingRate>
      ) => response.data,

      invalidatesTags: [
        {
          type: "ShippingRate",
          id: "LIST",
        },
      ],
    }),

    /* ============================
       TOGGLE RATE
    ============================ */
    toggleShippingRate: builder.mutation<
      ShippingRate,
      {
        id: string;
        isActive: boolean;
      }
    >({
      query: ({ id, isActive }) => ({
        url: `/api/shipping/rates/${id}/toggle`,
        method: "PATCH",
        data: {
          isActive,
        },
      }),

      transformResponse: (
        response: ApiResponse<ShippingRate>
      ) => response.data,

      invalidatesTags: (_, __, arg) => [
        {
          type: "ShippingRate",
          id: arg.id,
        },
        {
          type: "ShippingRate",
          id: "LIST",
        },
      ],
    }),

    /* ============================
       DELETE RATE
    ============================ */
    deleteShippingRate: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      string
    >({
      query: (id) => ({
        url: `/api/shipping/rates/${id}`,
        method: "DELETE",
      }),

      transformResponse: (
        response: {
          success: boolean;
          message: string;
        }
      ) => response,

      invalidatesTags: [
        {
          type: "ShippingRate",
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
  useGetZoneRatesQuery,

  useCalculateShippingRateMutation,

  useCreateShippingRateMutation,

  useToggleShippingRateMutation,
  useDeleteShippingRateMutation,
} = shippingRateApi;